/**
 * PATCH /api/reward/receive — 실물 지급 처리 (USED → RECEIVED)
 *
 * 선택된 리워드가 하나라도 처리 불가능하면 **전부 롤백**합니다.
 * 일부만 처리하고 "3개 중 2개 완료"를 돌려주면, 현장에서 실물을 건네는 사람이
 * 무엇을 이미 줬는지 알 수 없게 됩니다. 목록을 새로고침해 다시 선택하도록 유도합니다.
 *
 * ⚠️ 이 경로는 `/api/admin/` 아래가 아니라서 proxy 인증을 거치지 않습니다.
 *    전화번호를 아는 사람이 남의 리워드를 수령 완료로 만들 수 있습니다(경품 소각).
 *    시연 범위에서 감수하기로 한 사항입니다. 실운영으로 갈 때는 이 파일을
 *    `src/app/api/admin/reward/receive/route.ts` 로 옮기기만 하면 보호됩니다.
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
