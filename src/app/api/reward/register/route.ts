/**
 * POST /api/reward/register — 리워드 코드 등록 (UNUSED → USED)
 *
 * 전화번호는 본문(HTTPS)으로만 받습니다. 쿼리스트링에 실으면 접근 로그·리퍼러에 남습니다.
 *
 * 무작위 대입 방어로 **실패한 시도만 세는** 카운터를 겁니다. 성공까지 세면 정상 참여자가
 * 서로의 몫을 깎아먹습니다. 한도 근거는 `rate-limit.ts` 의 `REGISTER_LIMITS` 주석 참고.
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { AppError, ERROR_CODES, isAppError } from "@/lib/errors";
import { clientIp, consumeAll, peekAll, REGISTER_LIMITS } from "@/lib/rate-limit";
import { registerRewardSchema } from "@/lib/validation";
import { rewardService } from "@/services/reward.service";

export function POST(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, registerRewardSchema);

    const ip = clientIp(req.headers);
    const counters = [
      { key: "register:fail:global:m", rule: REGISTER_LIMITS.globalPerMinute },
      { key: "register:fail:global:h", rule: REGISTER_LIMITS.globalPerHour },
      { key: `register:fail:ip:${ip}`, rule: REGISTER_LIMITS.ipPerMinute },
    ];

    // 아직 성공·실패를 모르므로 여기서는 확인만 합니다. 기록은 실패가 확정된 뒤에.
    const limit = peekAll(counters);
    if (!limit.ok) {
      // details 에 담은 초 값은 fail() 이 Retry-After 헤더로 옮깁니다.
      throw new AppError(ERROR_CODES.RATE_LIMITED, undefined, limit.retryAfterSec);
    }

    try {
      const data = await rewardService.register(input);
      return ok(data, `${data.product.name} 당첨! 경품함에 저장되었습니다.`, { status: 201 });
    } catch (e) {
      // 존재하지 않는 코드만 셉니다.
      // ALREADY_USED 는 같은 패드를 두 번 낸 정상 사용자의 신호이고,
      // 무작위 대입이 하필 이미 쓰인 코드를 맞힐 확률은 무시할 수준입니다.
      if (isAppError(e) && e.code === ERROR_CODES.INVALID_CODE) {
        consumeAll(counters);
      }
      throw e;
    }
  });
}
