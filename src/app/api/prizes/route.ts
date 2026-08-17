/**
 * GET /api/prizes — 공개 경품 목록
 *
 * 당첨 확률은 발급 비율에서 계산해 내려줍니다. 프론트에 하드코딩하면
 * 발급 계획을 바꿀 때마다 표기가 틀어집니다.
 *
 * 재고 수치는 포함하지 않습니다 — `prizeService.listPublic` 주석 참고.
 */
import { handle, ok } from "@/lib/api-handler";
import { prizeService } from "@/services/prize.service";

export function GET() {
  return handle(async () => {
    const data = await prizeService.listPublic();
    return ok(data, "경품 목록입니다.");
  });
}
