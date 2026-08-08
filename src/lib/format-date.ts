/**
 * 날짜 표시 포맷.
 *
 * 서버는 UTC 로 저장하고 ISO 문자열로 내려줍니다. 화면에는 **항상 한국 시간**으로 보여줍니다.
 * `new Date().getFullYear()` 처럼 실행 환경의 로컬 시간에 기대면
 * 서버 렌더와 브라우저 렌더가 달라져 하이드레이션 불일치가 납니다.
 * 표시 포맷이 필요하면 반드시 이 파일을 거치세요.
 */

const KST = "Asia/Seoul";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** `2026-08-07T…` → `2026.08.07` */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  // ko-KR 은 "2026. 08. 07." 로 내보내므로 점 표기로 다듬습니다.
  return dateFormatter.format(new Date(iso)).replace(/\.\s?/g, ".").replace(/\.$/, "");
}

/** `2026-08-07T…` → `2026.08.07 14:30` */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return dateTimeFormatter
    .format(new Date(iso))
    .replace(/\.\s?/g, ".")
    .replace(/\.\s*(\d{2}:\d{2})/, " $1");
}
