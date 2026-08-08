/**
 * 요청 빈도 제한 (슬라이딩 윈도우, 인메모리).
 *
 * 대상은 **전화번호로 남의 경품함을 열거하는 시도**입니다.
 * `POST /api/reward/lookup` 은 전화번호만 맞으면 그 사람의 리워드 목록을 돌려주는데,
 * 010-XXXX-XXXX 는 추측 가능한 공간이라 제한이 없으면 순회가 가능합니다.
 *
 * ⚠️ 프로세스 메모리에만 쌓입니다.
 *    인스턴스를 여러 개 띄우면 각자 따로 셉니다(= 실질 한도가 인스턴스 수만큼 늘어남).
 *    시연 규모에서는 충분하지만, 다중 인스턴스로 가면 Redis 같은 공유 저장소로 옮겨야 합니다.
 */

export type RateLimitRule = {
  /** 윈도우 동안 허용할 요청 수 */
  limit: number;
  /** 윈도우 길이(ms) */
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  /** 남은 허용 횟수 */
  remaining: number;
  /** 거절됐을 때 몇 초 뒤에 다시 시도할 수 있는지 */
  retryAfterSec: number;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/**
 * 경품함 조회 제한값.
 *
 * 정상 사용자는 경품함을 분당 한두 번 이상 열 일이 없습니다.
 * IP 시간당 60회면 열거 속도가 하루 1,440건까지 떨어져, 휴대폰 번호 공간에 비해
 * 사실상 무의미해집니다. 전화번호 기준 제한은 여러 IP를 돌려쓰는 경우를 위한 2차 방어입니다.
 */
export const LOOKUP_LIMITS = {
  /** IP 기준 — 열거 공격은 한 IP에서 여러 번호를 시도하므로 이쪽이 주 방어선입니다. */
  ipPerMinute: { limit: 10, windowMs: MINUTE } satisfies RateLimitRule,
  ipPerHour: { limit: 60, windowMs: HOUR } satisfies RateLimitRule,
  /** 전화번호(phoneHash) 기준 — 같은 번호를 반복 조회하는 경우 */
  phonePerMinute: { limit: 5, windowMs: MINUTE } satisfies RateLimitRule,
} as const;

/**
 * 코드 등록 제한값 — **실패한 시도만** 셉니다.
 *
 * 성공한 등록까지 세면 정상 참여자가 서로의 몫을 깎아먹습니다. 무작위 대입은 사실상
 * 전부 실패이므로, 실패만 세면 공격자만 걸립니다.
 *
 * **전역 카운터가 주 방어선입니다.** IP 기준만으로는 IP 를 여러 개 돌리면 뚫리는데,
 * 이 행사는 참여자가 10명 안팎이라 정상 실패(오타)가 행사 전체에서 수십 건을 넘지 않습니다.
 * 그래서 전역 한도를 시간당 20건처럼 낮게 잡아도 정상 사용자는 걸리지 않습니다.
 * 코드 공간이 7,077,888 이고 유효 코드가 100개이므로 적중까지 기대 시도는 약 70,779회 —
 * 시간당 20건이면 7일간 3,360회로, 1등(1장) 적중 확률은 0.05% 수준입니다.
 *
 * ⚠️ **전역 카운터는 서비스 거부와 맞바꾼 것입니다.** 공격자가 한도를 채우면 정상 참여자도
 *    그 창(window) 동안 등록할 수 없습니다. 사이트 게이트(`site-gate.ts`)가 켜져 있으면
 *    외부에서 이 한도를 채울 수 없으므로, **게이트가 주 방어선이고 이 카운터는 게이트를
 *    통과한 뒤의 이상 트래픽을 잡는 backstop** 입니다. 게이트를 끈 채로 배포한다면
 *    이 값들을 다시 검토하세요.
 */
export const REGISTER_LIMITS = {
  /** 버스트 차단 — 시간당 한도가 차기 전에 먼저 걸립니다. */
  globalPerMinute: { limit: 5, windowMs: MINUTE } satisfies RateLimitRule,
  globalPerHour: { limit: 20, windowMs: HOUR } satisfies RateLimitRule,
  /** 한 IP 가 전역 한도를 혼자 소진하는 것을 늦춥니다. */
  ipPerMinute: { limit: 5, windowMs: MINUTE } satisfies RateLimitRule,
} as const;

/** key → 요청 시각 목록 */
const hits = new Map<string, number[]>();

/** 마지막 청소 시각. 요청이 들어올 때 가끔 훑어 오래된 key 를 버립니다. */
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 5 * MINUTE;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  // 가장 긴 윈도우보다 오래된 기록만 남은 key 는 통째로 버립니다.
  // 이걸 안 하면 조회된 전화번호 수만큼 Map 이 영원히 자랍니다.
  for (const [key, times] of hits) {
    const alive = times.filter((t) => now - t < HOUR);
    if (alive.length === 0) hits.delete(key);
    else hits.set(key, alive);
  }
}

/**
 * 요청 1건을 기록하고 허용 여부를 돌려줍니다.
 *
 * 거절된 요청은 기록하지 않습니다 — 거절당한 시도가 윈도우를 계속 밀어내면
 * 차단이 무한정 연장되어, 실수로 한도를 넘긴 정상 사용자가 영영 풀리지 않습니다.
 */
export function consume(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  sweep(now);

  const cutoff = now - rule.windowMs;
  const times = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (times.length >= rule.limit) {
    const oldest = times[0];
    hits.set(key, times);
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((oldest + rule.windowMs - now) / SECOND)),
    };
  }

  times.push(now);
  hits.set(key, times);
  return { ok: true, remaining: rule.limit - times.length, retryAfterSec: 0 };
}

/**
 * 기록하지 않고 현재 한도 상태만 봅니다.
 *
 * **실패한 시도만 세는 카운터**에서 씁니다. 요청이 성공할지 실패할지는 처리해 봐야 알기
 * 때문에, 시작할 때는 이것으로 "이미 막혔는지" 만 확인하고 실제 기록은 실패가 확정된 뒤에
 * `consume()` 으로 합니다.
 */
export function peek(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  const cutoff = now - rule.windowMs;
  const times = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (times.length >= rule.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((times[0] + rule.windowMs - now) / SECOND)),
    };
  }
  return { ok: true, remaining: rule.limit - times.length, retryAfterSec: 0 };
}

/** `peek` 의 여러 규칙 버전. 하나라도 막혀 있으면 거절합니다. */
export function peekAll(
  entries: Array<{ key: string; rule: RateLimitRule }>,
  now = Date.now(),
): RateLimitResult {
  let worst: RateLimitResult = { ok: true, remaining: Number.MAX_SAFE_INTEGER, retryAfterSec: 0 };

  for (const { key, rule } of entries) {
    const result = peek(key, rule, now);
    if (!result.ok) return result;
    if (result.remaining < worst.remaining) worst = result;
  }

  return worst;
}

/**
 * 여러 규칙을 한 번에 확인합니다. 하나라도 걸리면 거절합니다.
 * 앞선 규칙이 통과해도 뒤에서 걸리면 앞 규칙의 카운트는 이미 올라간 상태인데,
 * 어차피 거절된 요청이라 다음 시도에서 조금 더 빨리 막히는 정도의 차이입니다.
 */
export function consumeAll(
  entries: Array<{ key: string; rule: RateLimitRule }>,
  now = Date.now(),
): RateLimitResult {
  let worst: RateLimitResult = { ok: true, remaining: Number.MAX_SAFE_INTEGER, retryAfterSec: 0 };

  for (const { key, rule } of entries) {
    const result = consume(key, rule, now);
    if (!result.ok) return result;
    if (result.remaining < worst.remaining) worst = result;
  }

  return worst;
}

/**
 * 프록시 뒤에서 실제 클라이언트 IP 를 추정합니다.
 *
 * Railway·Vercel 등은 원본 IP 를 `x-forwarded-for` 맨 앞에 넣습니다.
 * 헤더는 위조가 가능하므로 이 값은 **차단 기준**으로만 쓰고 신원 확인에는 쓰지 마세요.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** 테스트용 — 누적된 카운터를 비웁니다. */
export function resetRateLimits(): void {
  hits.clear();
  lastSweep = 0;
}
