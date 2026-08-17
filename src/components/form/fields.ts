/**
 * 폼 필드 선언.
 *
 * 라벨·플레이스홀더·입력 방식 같은 **필드의 성질**을 화면이 아니라 여기에 둡니다.
 * 폼 컴포넌트는 이 배열을 훑어 렌더링만 하므로,
 *
 *   - 문구를 바꾸려면 → 이 파일만
 *   - 필드를 추가·제거·순서 변경하려면 → 아래 `*_FIELDS` 배열만
 *   - 생김새를 바꾸려면 → `Field.tsx` 의 `SKIN` 만
 *
 * 을 고치면 됩니다. 등록 폼과 조회 폼이 이름·전화번호를 공유하는 것도 이 구조 덕분입니다.
 */
import { formatPhone } from "@/lib/phone-format";
import { normalizeCode } from "@/lib/reward-code";

export type FieldName = "name" | "phone" | "code";

export type FieldConfig = {
  name: FieldName;
  label: string;
  placeholder: string;
  autoComplete: string;
  inputMode?: "text" | "numeric" | "tel";
  maxLength?: number;
  /** 고정폭 글꼴 + 대문자 표시 */
  mono?: boolean;
  hint?: string;
  /** 입력 중 화면에 보이는 값 변환. 서버 전송값은 Zod 가 다시 정규화합니다. */
  format?: (value: string) => string;
};

const FIELDS: Record<FieldName, FieldConfig> = {
  name: {
    name: "name",
    label: "이름",
    placeholder: "실명을 입력하세요",
    autoComplete: "name",
    inputMode: "text",
    maxLength: 20,
  },
  phone: {
    name: "phone",
    label: "전화번호",
    placeholder: "010-1234-5678",
    autoComplete: "tel",
    inputMode: "numeric",
    // 하이픈 2개 포함 최대 13자
    maxLength: 13,
    format: formatPhone,
  },
  code: {
    name: "code",
    label: "패드 코드",
    // 예시 코드를 두지 않습니다. 시연에 참여하지 않은 사람에게 코드 형식을 알려주는 셈이라,
    // 형식을 알고 무작위로 돌려보는 시도의 출발점이 됩니다.
    placeholder: "",
    autoComplete: "off",
    inputMode: "text",
    maxLength: 7,
    mono: true,
    // 화면에는 하이픈이 채워진 형태로 보여주되, 6자를 다 치기 전에는 건드리지 않습니다.
    format: (v) => normalizeCode(v),
  },
};

/** 코드 등록 폼 — 이름 · 전화번호 · 코드 */
export const REGISTER_FIELDS: FieldConfig[] = [FIELDS.name, FIELDS.phone, FIELDS.code];

/** 경품함 조회 폼 — 이름 · 전화번호 (로그인이 없어 매번 입력합니다) */
export const LOOKUP_FIELDS: FieldConfig[] = [FIELDS.name, FIELDS.phone];

export { FIELDS };
