/**
 * API 입력 검증 스키마 (Zod).
 *
 * 여기는 **형식**만 봅니다. "코드가 존재하는가", "이미 사용됐는가" 같은 판단은
 * Service 의 몫입니다. 형식 검증을 통과했다고 유효한 요청이 되는 것은 아닙니다.
 *
 * 서비스 쪽에도 같은 성격의 방어가 한 겹 더 있습니다(`derivePhoneFields` 의 번호 형식 검사 등).
 * 서비스는 스크립트나 관리자 경로에서도 직접 호출되기 때문에, 라우트에만 검증을 두면
 * 그 경로들이 무방비가 됩니다.
 */
import { z } from "zod";
import { CODE_PATTERN, normalizeCode } from "./reward-code";

/* ── 공통 필드 ───────────────────────────────────────────── */

const NAME_MAX = 20;

/**
 * 이름. 공백을 정리하고 길이만 봅니다.
 *
 * 문자 종류를 제한하지 않는 이유: 외국인 이름, 가운뎃점, 영문 표기가 전부 정상 입력입니다.
 * 한글만 허용하면 실제 참가자를 막게 됩니다.
 */
export const nameField = z
  .string()
  .trim()
  .min(1, "이름을 입력해 주세요")
  .max(NAME_MAX, `이름은 ${NAME_MAX}자 이하로 입력해 주세요`);

/**
 * 전화번호. 하이픈·공백을 지운 뒤 국내 번호 형식을 봅니다.
 *
 * 국가번호(+82) 표기는 일부러 거절합니다. 허용해 버리면 `+821012345678` 과
 * `01012345678` 이 서로 다른 phoneHash 가 되어, 같은 사람이 두 명으로 갈립니다.
 */
export const phoneField = z
  .string()
  .trim()
  .transform((v) => v.replace(/[-\s]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^0\d{9,10}$/, "전화번호를 확인해 주세요 (예: 010-1234-5678)"),
  );

/** 리워드 코드. 대문자화하고 하이픈을 채운 뒤 형식을 봅니다. (abc123 → ABC-123) */
export const codeField = z
  .string()
  .trim()
  .min(1, "리워드 코드를 입력해 주세요")
  .transform(normalizeCode)
  .pipe(z.string().regex(CODE_PATTERN, "코드 형식을 확인해 주세요 (예: ABC-123)"));

/* ── 사용자 ──────────────────────────────────────────────── */

export const registerRewardSchema = z.object({
  name: nameField,
  phone: phoneField,
  code: codeField,
});

/** 경품함 조회 — 전화번호만으로는 열리지 않도록 이름도 받습니다. */
export const lookupRewardsSchema = z.object({
  name: nameField,
  phone: phoneField,
});

/**
 * 실물 지급 처리.
 *
 * **이름을 함께 받습니다.** 관리자 목록에 성함이 마스킹되어 나가면서(§6 B안)
 * "화면을 보고 대조" 하는 방식이 성립하지 않게 됐습니다. 대신 운영자가 고객에게
 * 이름을 물어 입력하면 서버가 대조합니다 — 확인 수단을 화면에서 입력으로 옮긴 것입니다.
 * 이름 없이 번호만으로 지급되면 번호를 아는 사람이 남의 경품을 소각할 수 있습니다.
 */
export const receiveRewardsSchema = z.object({
  name: nameField,
  phone: phoneField,
  rewardIds: z
    .array(z.string().min(1))
    .min(1, "지급할 리워드를 선택해 주세요")
    // 한 사람이 가진 리워드가 이 수를 넘을 일은 없습니다. 비정상적으로 큰 배열로
    // 트랜잭션을 오래 붙잡는 것을 막습니다.
    .max(100, "한 번에 처리할 수 있는 리워드 수를 초과했습니다"),
});

/* ── 관리자 ──────────────────────────────────────────────── */

export const adminLoginSchema = z.object({
  // 길이 제한을 두지 않습니다. 로그인 화면에서 형식을 알려줄 이유가 없고,
  // 어차피 scrypt 비교에서 걸립니다.
  password: z.string().min(1, "비밀번호를 입력해 주세요"),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "상품명을 입력해 주세요").max(60),
  description: z.string().trim().max(500).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().min(1, "분류를 입력해 주세요").max(20),
  rank: z.string().trim().min(1, "등급을 입력해 주세요").max(20),
  hue: z.number().int().min(0).max(360).optional(),
  sortOrder: z.number().int().min(0).optional(),
  oddsLabel: z.string().trim().max(20).nullable().optional(),
});

/** 수정은 전부 선택 항목이지만, 빈 객체는 의미가 없으므로 거절합니다. */
export const updateProductSchema = createProductSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "변경할 내용이 없습니다");

export const issueCodesSchema = z.object({
  batch: z
    .string()
    .trim()
    .min(1, "배치 이름을 입력해 주세요")
    .max(40)
    // 배치명은 파일명·CSV 헤더로도 쓰입니다. 공백이나 따옴표가 섞이면 다루기 번거로워집니다.
    .regex(/^[A-Za-z0-9._-]+$/, "배치 이름은 영문·숫자·`.`·`_`·`-` 만 쓸 수 있습니다"),
  plan: z.record(z.string(), z.number().int().min(0)).optional(),
  dryRun: z.boolean().optional(),
});

/** 관리자 사용자 조회 — 전화번호로 찾습니다. */
export const adminUserQuerySchema = z.object({
  phone: phoneField,
});

/* ── 추론 타입 ───────────────────────────────────────────── */

export type RegisterRewardInput = z.infer<typeof registerRewardSchema>;
export type LookupRewardsInput = z.infer<typeof lookupRewardsSchema>;
export type ReceiveRewardsInput = z.infer<typeof receiveRewardsSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type IssueCodesInput = z.infer<typeof issueCodesSchema>;
