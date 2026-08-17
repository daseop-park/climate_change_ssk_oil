/**
 * PATCH /api/admin/reward/receive — 실물 지급 처리 (USED → RECEIVED)
 *
 * 선택된 리워드가 하나라도 처리 불가능하면 **전부 롤백**합니다.
 * 일부만 처리하고 "3개 중 2개 완료"를 돌려주면, 현장에서 실물을 건네는 사람이
 * 무엇을 이미 줬는지 알 수 없게 됩니다. 목록을 새로고침해 다시 선택하도록 유도합니다.
 *
 * ✅ **2026-08-10 — `/api/reward/receive` 에서 이 경로로 옮겼습니다.**
 *    `/api/admin/` 아래로 들어오면서 proxy 인증을 거치게 됐습니다. 예전에는 인증 밖이라
 *    **전화번호를 아는 사람이 남의 리워드를 수령 완료로 만들 수 있었습니다**(경품 소각).
 *    시연 범위에서 감수하기로 했던 사항이고, 파일을 옮기는 것으로 해소됩니다.
 *
 * 여기에 더해 서비스가 **이름까지 대조**합니다 — 관리자 목록에 성함이 마스킹되어
 * 나가면서 "보고 맞추기" 가 성립하지 않게 됐기 때문입니다 (§6 B안).
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { receiveRewardsSchema } from "@/lib/validation";
import { rewardService } from "@/services/reward.service";

export function PATCH(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, receiveRewardsSchema);
    const data = await rewardService.receive(input);
    return ok(data, `${data.receivedCount}건을 지급 완료 처리했습니다.`);
  });
}
