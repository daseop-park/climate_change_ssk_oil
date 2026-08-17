/**
 * 리워드 코드의 표기 규칙. 서버와 클라이언트가 **같은 정규화**를 쓰도록 여기 한 곳에 둡니다.
 *
 * ⚠️ 이 파일은 클라이언트 컴포넌트에서도 import 됩니다.
 *    node:crypto 를 쓰는 생성 로직은 `code-generator.ts` 에 따로 두세요.
 */

/**
 * 패드 코드 형식: 영문 3 + 숫자 3 (예: ABC-123).
 *
 * 발급 시에는 오독을 피하려고 영문 I·O 와 숫자 0·1 을 제외하지만,
 * 입력 검증은 그보다 느슨하게 A-Z / 0-9 를 모두 허용합니다.
 * 사용자가 O 를 0 으로 잘못 읽었을 때 "형식 오류" 대신 "등록되지 않은 코드"를 보는 편이
 * 덜 혼란스럽기 때문입니다. 유효성의 최종 판단은 어차피 서버입니다.
 */
export const CODE_PATTERN = /^[A-Z]{3}-[0-9]{3}$/;

/** 대문자화하고 하이픈이 없으면 채워 넣습니다. (abc123 → ABC-123) */
export function normalizeCode(input: string): string {
  const compact = input.trim().toUpperCase().replace(/[\s-]/g, "");
  return compact.length === 6 ? `${compact.slice(0, 3)}-${compact.slice(3)}` : compact;
}
