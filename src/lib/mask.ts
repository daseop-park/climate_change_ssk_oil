/**
 * 개인정보 마스킹.
 *
 * ⚠️ **서버에서만 부르세요.** 클라이언트에서 마스킹하면 아무 의미가 없습니다 —
 *    평문이 이미 네트워크를 건너온 뒤라 개발자 도구 네트워크 탭에 그대로 남습니다.
 *    가리는 시점은 화면이 아니라 **응답을 만드는 순간**이어야 합니다.
 *
 * 관리자 콘솔의 목록은 전부 이걸 거친 값만 받습니다. 본인 확인은 "보고 맞추기"가 아니라
 * **"입력해서 맞추기"** 로 합니다 — 운영자가 고객에게 이름·번호를 물어 입력하면
 * 서버가 해시로 대조합니다. 그래서 화면에 평문이 있을 이유가 없습니다.
 * (`docs/phase5-admin-estimate.md` §6 B안)
 */

const MASK_CHAR = "O";

/**
 * 성함 — 첫 글자와 끝 글자만 남기고 가운데를 가립니다.
 *
 * | 입력 | 출력 |
 * |---|---|
 * | `김은서` | `김O서` |
 * | `김철` | `김O` — 2글자는 끝 글자를 가립니다 |
 * | `남궁민수` | `남OO수` |
 * | `김` | `O` — 1글자는 남길 것이 없습니다 |
 *
 * `Array.from` 으로 쪼개는 이유: `String.length` 는 UTF-16 코드 유닛 수라
 * 서로게이트 페어(이모지 등)가 섞이면 글자 하나를 둘로 세어 마스킹이 깨집니다.
 */
export function maskName(name: string | null | undefined): string {
  const chars = Array.from((name ?? "").trim());

  if (chars.length === 0) return "";
  if (chars.length === 1) return MASK_CHAR;
  if (chars.length === 2) return `${chars[0]}${MASK_CHAR}`;

  return chars[0] + MASK_CHAR.repeat(chars.length - 2) + chars[chars.length - 1];
}

/**
 * 전화번호 — 앞 3자리와 뒤 4자리만 남깁니다.
 *
 * | 입력 | 출력 |
 * |---|---|
 * | `01048214821` | `010-****-4821` |
 * | `010-4821-4821` | `010-****-4821` — 하이픈이 있어도 같습니다 |
 * | `0101234567` (10자리) | `010-***-4567` |
 *
 * 가운데를 **원래 자릿수만큼** 별표로 채웁니다. 항상 4개로 고정하면
 * 10자리 번호가 11자리처럼 보여 운영자가 대조할 때 헷갈립니다.
 */
export function maskPhone(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");

  // 앞 3 + 뒤 4 를 떼고도 가릴 자리가 남아야 마스킹입니다.
  if (digits.length < 8) return "*".repeat(Math.max(digits.length, 1));

  const head = digits.slice(0, 3);
  const tail = digits.slice(-4);
  const middle = "*".repeat(digits.length - 7);

  return `${head}-${middle}-${tail}`;
}
