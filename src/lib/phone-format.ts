/**
 * 전화번호 표시 포맷.
 *
 * 서버로 보낼 때는 하이픈이 있든 없든 상관없습니다(Zod 가 정규화합니다).
 * 이 파일은 **입력 중 화면에 보이는 모양**만 담당합니다.
 */

/** 숫자만 남깁니다. 최대 11자리(01012345678). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/**
 * 입력 중 자동 하이픈. `01012345678` → `010-1234-5678`
 *
 * 10자리(`0212345678`)와 11자리를 모두 다룹니다.
 * 자리 수가 모자란 중간 상태에서도 어색하지 않게 끊습니다.
 */
export function formatPhone(value: string): string {
  const d = digitsOnly(value);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
