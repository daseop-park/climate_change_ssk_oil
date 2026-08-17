/**
 * 날짜 구간 계산.
 *
 * 서버는 UTC 로 도는 경우가 많은데(Railway 기본값), 관리자가 보는 "오늘 등록 수"는
 * 한국 시간 기준이어야 합니다. UTC 로 계산하면 매일 오전 9시에 카운터가 초기화되어
 * 현장 운영자가 보는 숫자가 어긋납니다. 한국은 서머타임이 없어 고정 +09:00 로 충분합니다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 한국 시간 기준 '오늘' 의 [시작, 끝) 구간을 UTC Date 로 돌려줍니다. */
export function kstDayRange(now: Date = new Date()): { from: Date; to: Date } {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const kstMidnight = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  );
  const from = new Date(kstMidnight - KST_OFFSET_MS);
  return { from, to: new Date(from.getTime() + DAY_MS) };
}

/**
 * UTC 시각이 한국 시간으로 며칠인지 — `2026-08-10`.
 *
 * 차트의 막대 하나가 이 키 하나입니다. 대시보드의 "오늘 등록 수"(`kstDayRange`)와
 * **같은 기준**을 써야 합니다. 어긋나면 KPI 숫자와 차트 마지막 막대가 달라지는데,
 * 둘이 나란히 놓여 있어서 바로 눈에 띕니다.
 */
export function kstDateKey(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * 오늘까지의 최근 `days` 일 키를 **오래된 것부터** 돌려줍니다.
 *
 * 집계 결과에 없는 날짜를 0 으로 채우는 데 씁니다. `groupBy` 결과만 그리면
 * 아무도 등록하지 않은 날이 막대에서 통째로 빠져, 14일 차트가 실제보다
 * 촘촘해 보이고 날짜 축이 어긋납니다.
 */
export function kstRecentDayKeys(days: number, now: Date = new Date()): string[] {
  const { from } = kstDayRange(now);
  return Array.from({ length: days }, (_, i) =>
    kstDateKey(new Date(from.getTime() - (days - 1 - i) * DAY_MS)),
  );
}

/** 최근 `days` 일 구간의 시작 시각 (UTC Date). 조회 `where` 절에 씁니다. */
export function kstRecentDaysFrom(days: number, now: Date = new Date()): Date {
  return new Date(kstDayRange(now).from.getTime() - (days - 1) * DAY_MS);
}
