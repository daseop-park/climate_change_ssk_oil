/**
 * POST /api/admin/reward/lookup — 지급 대상 조회 (관리자 전용)
 *
 * 공개 `POST /api/reward/lookup` 과 입력은 같지만 셋이 다릅니다.
 *
 *   1. **응답이 마스킹됩니다** — 성함 `김O서`, 연락처 `010-****-4821` (§6 B안)
 *   2. **레이트 리밋이 없습니다** — 공개 조회는 전화번호 순회를 막아야 하지만,
 *      여기는 이미 관리자 인증을 통과한 뒤이고 현장에서 연달아 조회하는 것이 정상입니다.
 *      공개 쪽 제한(IP 10/분)에 운영자가 걸리면 줄이 멈춥니다.
 *   3. proxy 가 `/api/admin/` 을 막아 줍니다.
 *
 * 조회인데 POST 인 이유는 공개 쪽과 같습니다 — 전화번호를 URL 에 남기지 않기 위해서입니다.
 * GET 이면 쿼리스트링이 접근 로그·브라우저 히스토리·리퍼러에 그대로 남습니다.
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { lookupRewardsSchema } from "@/lib/validation";
import { rewardService } from "@/services/reward.service";

export function POST(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, lookupRewardsSchema);
    const data = await rewardService.lookupForAdmin(input);
    return ok(data, `${data.userNameMasked}님의 리워드입니다.`);
  });
}
