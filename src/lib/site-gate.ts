/**
 * 사이트 접근 게이트 — QR 토큰을 가진 요청만 들여보냅니다.
 *
 * 패드에 인쇄하는 QR 을 `https://<사이트>/?k=<토큰>` 형태로 만들고, 그 토큰을 아는 요청만
 * 통과시킵니다. 비밀번호 입력 화면을 세우지 않은 이유는 **진입 경로가 QR 이기 때문**입니다 —
 * 현장에서 운영자가 매번 비밀번호를 불러주면 옆에서 듣는 사람에게 그대로 새어 나가고,
 * "코드를 치면 그 자리에서 당첨 공개" 라는 흐름 앞에 마찰이 하나 붙습니다.
 *
 * 관리자 인증(`admin-auth.ts`)과 달리 JWT 를 쓰지 않습니다. 담을 클레임이 없고,
 * 만료는 쿠키 수명으로 충분하며, 관리자 토큰과 혼동될 두 번째 JWT 용도를 만들지 않는
 * 편이 낫기 때문입니다.
 */
import crypto from "crypto";
import type { NextResponse } from "next/server";

/** QR URL 에 붙는 쿼리 파라미터 이름 (`/?k=...`) */
export const GATE_PARAM = "k";
export const GATE_COOKIE = "site_access";

/** 쿠키 수명. 시연 기간(약 1주)을 한 번에 덮습니다. */
const GATE_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * 게이트를 켤지 여부.
 *
 * **기본값은 꺼짐입니다.** 환경변수를 빠뜨렸을 때 사이트가 통째로 잠기는 것보다
 * 열려 있는 편이 복구가 쉽기 때문입니다 — 공모전 심사처럼 접근이 막히면 곤란한 상황이
 * 실제로 있습니다.
 *
 * 대신 **켜 놓고 토큰을 빠뜨린 경우는 실패시킵니다**(`requireToken`).
 * 켜 달라고 해 놓고 조용히 전원 통과되는 것이 가장 나쁜 결과입니다.
 */
export function isGateEnabled(): boolean {
  const value = process.env.SITE_GATE_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1";
}

function requireToken(): string {
  const token = process.env.SITE_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "[site-gate] SITE_GATE_ENABLED 가 켜져 있는데 SITE_ACCESS_TOKEN 이 비어 있습니다. " +
        ".env.example 을 참고해 값을 채우거나 SITE_GATE_ENABLED 를 꺼주세요.",
    );
  }
  return token;
}

/**
 * 길이가 달라도 안전하게 비교합니다.
 *
 * `timingSafeEqual` 은 길이가 다르면 예외를 던지는데, 그 예외를 잡아 false 로 바꾸면
 * "길이가 틀렸다"는 사실이 응답 시간으로 새어 나갑니다. 먼저 해시로 길이를 맞춥니다.
 */
function safeEqual(a: string, b: string): boolean {
  const left = crypto.createHash("sha256").update(a).digest();
  const right = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

/**
 * 쿠키에 담을 값.
 *
 * 원문 토큰을 그대로 굽지 않습니다 — 공유된 기기나 확장 프로그램에서 쿠키를 들여다봐도
 * QR 에 인쇄된 토큰을 복원할 수 없게 합니다. (쿠키 값 자체는 여전히 출입증이지만,
 * 그건 만료되고 폐기할 수 있는 반면 인쇄된 토큰은 그럴 수 없습니다.)
 */
function cookieValue(): string {
  return crypto.createHash("sha256").update(`site-gate:v1:${requireToken()}`).digest("hex");
}

/** `?k=` 로 들어온 토큰이 맞는지 */
export function isValidGateToken(candidate: string | null): boolean {
  if (!candidate) return false;
  return safeEqual(candidate, requireToken());
}

/** 이미 게이트를 통과한 요청인지 */
export function hasGateCookie(value: string | undefined): boolean {
  if (!value) return false;
  return safeEqual(value, cookieValue());
}

/**
 * 게이트 통과 쿠키를 굽습니다.
 *
 * 관리자 쿠키와 달리 `SameSite=Lax` 입니다. `Strict` 로 두면 메신저·메일에 공유된 링크로
 * 들어온 최초 내비게이션에 쿠키가 붙지 않아, 이미 통과한 참여자가 다시 막힙니다.
 * `Lax` 는 최상위 GET 이동에만 쿠키를 실으므로 다른 사이트에서 시작된 POST
 * (= 상태를 바꾸는 요청)에는 여전히 붙지 않습니다.
 */
export function setGateCookie(res: NextResponse): NextResponse {
  res.cookies.set(GATE_COOKIE, cookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    // 로컬 개발은 http 라 secure 를 켜면 쿠키가 저장되지 않습니다.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GATE_TTL_SECONDS,
  });
  return res;
}
