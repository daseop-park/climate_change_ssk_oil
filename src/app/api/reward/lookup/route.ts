/**
 * POST /api/reward/lookup — 내 경품함 조회
 *
 * 조회인데 POST 인 이유: 전화번호를 URL 에 남기지 않기 위해서입니다.
 * GET 으로 바꾸면 쿼리스트링이 접근 로그·브라우저 히스토리·리퍼러 헤더에 그대로 남습니다.
 *
 * 이름을 함께 대조하고(서비스), 여기에 레이트 리밋을 겁니다 —
 * 전화번호는 추측 가능한 공간이라 제한이 없으면 순회가 가능합니다.
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { clientIp, consumeAll, LOOKUP_LIMITS } from "@/lib/rate-limit";
import { lookupRewardsSchema } from "@/lib/validation";
import { derivePhoneHash } from "@/services/user.service";
import { rewardService } from "@/services/reward.service";

export function POST(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, lookupRewardsSchema);

    const ip = clientIp(req.headers);
    // 번호 자체를 키로 쓰면 카운터에 전화번호가 남습니다. 해시를 씁니다.
    const phoneKey = derivePhoneHash(input.phone);

    const limit = consumeAll([
      { key: `lookup:ip:${ip}`, rule: LOOKUP_LIMITS.ipPerMinute },
      { key: `lookup:ip:h:${ip}`, rule: LOOKUP_LIMITS.ipPerHour },
      { key: `lookup:phone:${phoneKey}`, rule: LOOKUP_LIMITS.phonePerMinute },
    ]);

    if (!limit.ok) {
      // details 에 담은 초 값은 fail() 이 Retry-After 헤더로 옮깁니다.
      throw new AppError(ERROR_CODES.RATE_LIMITED, undefined, limit.retryAfterSec);
    }

    const data = await rewardService.lookup(input);
    return ok(data, `${data.userName}님의 경품함입니다.`);
  });
}
