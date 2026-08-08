/**
 * 리워드 도메인 로직. 트랜잭션 경계를 정하는 유일한 곳입니다.
 *
 * 상태 전이 규칙
 *   UNUSED → USED      : 사용자가 코드를 등록 (register)
 *   USED   → RECEIVED  : 관리자가 실물 지급 (receive)
 *   RECEIVED → USED    : 오처리 되돌리기 (revertReceive)
 *
 * 세 전이 모두 레포지토리의 조건부 updateMany 를 쓰고, 반환된 count 로 성공을 판정합니다.
 * "먼저 읽어서 확인한다"는 절차가 없다는 점이 핵심입니다 — 확인은 DB 가 합니다.
 */
import { db } from "../lib/db";
import { AppError, ERROR_CODES } from "../lib/errors";
import { normalizeCode } from "../lib/reward-code";
import { rewardRepository } from "../repositories/reward.repository";
import { derivePhoneFields, userService } from "./user.service";
import { REWARD_STATUS, type RewardStatus } from "../types/reward";
import type {
  LookupRewardsRequest,
  LookupRewardsResponse,
  ReceiveRewardsRequest,
  ReceiveRewardsResponse,
  RegisterRewardRequest,
  RegisterRewardResponse,
  RewardItemDto,
} from "../types/dto";

const NAME_MIN = 1;
const NAME_MAX = 20;

/** Prisma UNIQUE 제약 위반 */
function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}

type RewardRow = Awaited<ReturnType<typeof rewardRepository.findByUserId>>[number];

function toRewardItem(r: RewardRow): RewardItemDto {
  return {
    id: r.id,
    rewardCode: r.rewardCode,
    status: r.status as RewardStatus,
    usedAt: r.usedAt?.toISOString() ?? null,
    receivedAt: r.receivedAt?.toISOString() ?? null,
    product: {
      id: r.product.id,
      name: r.product.name,
      description: r.product.description,
      image: r.product.image,
      category: r.product.category,
      rank: r.product.rank,
      hue: r.product.hue,
    },
  };
}

export const rewardService = {
  /**
   * 리워드 코드 등록. (UNUSED → USED)
   *
   * 사용자 생성과 코드 귀속을 한 트랜잭션으로 묶습니다.
   * 코드가 이미 사용된 경우 사용자만 덩그러니 생성되면 안 되기 때문입니다 —
   * 잘못 입력한 사람의 전화번호를 저장할 이유가 없습니다.
   */
  async register(input: RegisterRewardRequest): Promise<RegisterRewardResponse> {
    const name = input.name?.trim() ?? "";
    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "이름을 확인해 주세요.");
    }

    const rewardCode = normalizeCode(input.code ?? "");
    if (!rewardCode) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "리워드 코드를 입력해 주세요.");
    }

    const { phoneHash, phoneEncrypted } = derivePhoneFields(input.phone);

    const run = () =>
      db.$transaction(async (tx) => {
        const user = await userService.findOrCreate(tx, { name, phoneHash, phoneEncrypted });

        const claimed = await rewardRepository.claimByCode(tx, {
          rewardCode,
          userId: user.id,
          now: new Date(),
        });

        if (claimed === 0) {
          // 여기까지 왔다는 건 실패가 확정된 뒤입니다. 원인 조회는 이때만 하면 되므로
          // 정상 경로에서는 추가 쿼리가 발생하지 않습니다.
          const existing = await rewardRepository.findByCode(tx, rewardCode);
          throw new AppError(
            existing ? ERROR_CODES.ALREADY_USED : ERROR_CODES.INVALID_CODE,
          );
        }

        const reward = await rewardRepository.findByCodeWithProduct(tx, rewardCode);
        if (!reward) throw new AppError(ERROR_CODES.DATABASE_ERROR);

        return {
          rewardId: reward.id,
          rewardCode: reward.rewardCode,
          usedAt: (reward.usedAt ?? new Date()).toISOString(),
          product: {
            id: reward.product.id,
            name: reward.product.name,
            description: reward.product.description,
            image: reward.product.image,
            category: reward.product.category,
            rank: reward.product.rank,
            hue: reward.product.hue,
          },
        };
      });

    try {
      return await run();
    } catch (e) {
      // 같은 번호의 첫 등록이 동시에 들어와 users.phoneHash UNIQUE 에 걸린 경우입니다.
      // 재시도하면 upsert 가 기존 행을 찾아 정상 진행합니다. 한 번만 봐줍니다 —
      // 계속 실패한다면 경합이 아니라 다른 문제입니다.
      if (isUniqueViolation(e)) return run();
      throw e;
    }
  },

  /**
   * 경품함 조회. 전화번호는 해시로만 대조하고 원문은 즉시 버립니다.
   *
   * 이름을 함께 받아 대조합니다 — 번호 하나만으로 남의 경품함이 열리지 않도록 하는
   * 2차 확인입니다. (열거 자체는 `rate-limit.ts` 가 별도로 막습니다.)
   */
  async lookup(input: LookupRewardsRequest): Promise<LookupRewardsResponse> {
    const user = await userService.findByPhoneOrThrow(db, input.phone, input.name);
    const rewards = await rewardRepository.findByUserId(db, user.id);

    return {
      userName: user.name,
      pending: rewards.filter((r) => r.status === REWARD_STATUS.USED).map(toRewardItem),
      received: rewards.filter((r) => r.status === REWARD_STATUS.RECEIVED).map(toRewardItem),
    };
  },

  /**
   * 실물 지급 처리. (USED → RECEIVED)
   *
   * **전부 성공하거나 전부 실패합니다.** 요청한 개수와 실제 갱신 수가 다르면
   * 롤백하고 에러를 냅니다. 일부만 처리하고 "3개 중 2개 완료"를 돌려주면,
   * 현장에서 실물을 건네는 관리자가 무엇을 이미 줬는지 알 수 없게 됩니다.
   * 관리자는 목록을 새로고침해 실제 상태를 보고 다시 선택하게 됩니다.
   */
  async receive(input: ReceiveRewardsRequest): Promise<ReceiveRewardsResponse> {
    const ids = [...new Set(input.rewardIds ?? [])].filter(Boolean);
    if (ids.length === 0) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "지급할 리워드를 선택해 주세요.");
    }

    const user = await userService.findByPhoneOrThrow(db, input.phone);
    const now = new Date();

    await db.$transaction(async (tx) => {
      const updated = await rewardRepository.markReceived(tx, { ids, userId: user.id, now });

      if (updated !== ids.length) {
        throw new AppError(
          ERROR_CODES.ALREADY_RECEIVED,
          "이미 수령 처리되었거나 목록에 없는 리워드가 포함되어 있습니다. 목록을 새로고침한 뒤 다시 선택해 주세요.",
          { requested: ids.length, updated },
        );
      }
    });

    return { receivedCount: ids.length, receivedAt: now.toISOString() };
  },

  /**
   * 지급 오처리 되돌리기. (RECEIVED → USED)
   * 관리자 전용이며, 라우트는 5단계에서 붙입니다.
   */
  async revertReceive(rewardId: string): Promise<void> {
    const reverted = await rewardRepository.revertReceived(db, { id: rewardId });
    if (reverted === 0) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "수령 완료 상태인 리워드가 아닙니다.",
      );
    }
  },
};
