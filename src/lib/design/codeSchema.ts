import { z } from "zod";
import { CODE_PATTERN, normalizeCode } from "@/lib/reward-code";

/**
 * 화면 입력용 코드 스키마.
 *
 * 형식 규칙 자체는 `src/lib/reward-code.ts` 에 있습니다 (서버와 공유).
 * 여기서는 그 규칙을 폼 검증용 zod 스키마로 감싸기만 합니다.
 */
export { CODE_PATTERN, normalizeCode };

export const codeSchema = z.object({
  code: z
    .string()
    .transform(normalizeCode)
    .pipe(z.string().regex(CODE_PATTERN, "코드 형식을 확인해 주세요")),
});

export type CodeInput = z.infer<typeof codeSchema>;
