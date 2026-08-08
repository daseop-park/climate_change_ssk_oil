/**
 * 날짜 구간 계산.
 *
 * 서버는 UTC 로 도는 경우가 많은데(Railway 기본값), 관리자가 보는 "오늘 등록 수"는
 * 한국 시간 기준이어야 합니다. UTC 로 계산하면 매일 오전 9시에 카운터가 초기화되어
 * 현장 운영자가 보는 숫자가 어긋납니다. 한국은 서머타임이 없어 고정 +09:00 로 충분합니다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 기준 '오늘' 의 [시작, 끝) 구간을 UTC Date 로 돌려줍니다. */
export function kstDayRange(now: Date = new Date()): { from: Date; to: Date } {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const kstMidnight = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  );
  const from = new Date(kstMidnight - KST_OFFSET_MS);
  return { from, to: new Date(from.getTime() + 24 * 60 * 60 * 1000) };
}
