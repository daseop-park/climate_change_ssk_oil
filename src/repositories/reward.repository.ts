/**
 * reward_codes 테이블 접근.
 *
 * 상태 전이(UNUSED → USED → RECEIVED)는 전부 **조건부 updateMany** 로 처리합니다.
 * 읽어서 확인한 뒤 쓰는 방식은 두 요청이 같은 행을 동시에 읽으면 둘 다 통과하므로,
 * 현재 상태 조건을 `where` 절 안에 넣어 DB 가 한 번만 성공시키도록 합니다.
 * 성공 여부는 반환된 `count` 로 판단합니다.
 */
import type { DbClient } from "./types";
import { REWARD_STATUS, type RewardStatus } from "../types/reward";

/** 경품함·등록 응답에 필요한 상품 정보를 함께 싣습니다. */
const withProduct = {
  product: {
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      category: true,
      rank: true,
      hue: true,
    },
  },
} as const;

export type RewardWithProduct = Awaited<
  ReturnType<typeof rewardRepository.findByIdWithProduct>
>;

export type CreateRewardCodeInput = {
  rewardCode: string;
  productId: string;
  batch: string;
};

export const rewardRepository = {
  findByCode(client: DbClient, rewardCode: string) {
    return client.rewardCode.findUnique({ where: { rewardCode } });
  },

  findByIdWithProduct(client: DbClient, id: string) {
    return client.rewardCode.findUnique({ where: { id }, include: withProduct });
  },

  findByCodeWithProduct(client: DbClient, rewardCode: string) {
    return client.rewardCode.findUnique({ where: { rewardCode }, include: withProduct });
  },

  /**
   * UNUSED 인 코드를 특정 사용자에게 귀속시킵니다. (UNUSED → USED)
   *
   * `status: UNUSED` 조건이 동시 등록 방어의 전부입니다. 두 사람이 같은 코드를
   * 동시에 제출하면 먼저 도달한 쪽만 count 1 을 받고, 나머지는 0 을 받습니다.
   *
   * @returns 갱신된 행 수. 0 이면 코드가 없거나 이미 사용된 것입니다.
   */
  async claimByCode(
    client: DbClient,
    params: { rewardCode: string; userId: string; now: Date },
  ): Promise<number> {
    const { count } = await client.rewardCode.updateMany({
      where: { rewardCode: params.rewardCode, status: REWARD_STATUS.UNUSED },
      data: {
        status: REWARD_STATUS.USED,
        userId: params.userId,
        usedAt: params.now,
      },
    });
    return count;
  },

  /**
   * 선택된 리워드를 실물 지급 완료로 바꿉니다. (USED → RECEIVED)
   *
   * 조건 세 가지가 각각 다른 사고를 막습니다.
   *   - `status: USED`  : 관리자 두 명이 동시에 눌러도 한 번만 처리 (이중 지급 방지)
   *   - `userId`        : 남의 리워드 id 를 넣어도 통과하지 못함
   *   - `id: { in }`    : 체크한 것만
   *
   * @returns 갱신된 행 수. 요청한 개수와 다르면 호출한 Service 가 롤백합니다.
   */
  async markReceived(
    client: DbClient,
    params: { ids: string[]; userId: string; now: Date },
  ): Promise<number> {
    const { count } = await client.rewardCode.updateMany({
      where: {
        id: { in: params.ids },
        userId: params.userId,
        status: REWARD_STATUS.USED,
      },
      data: { status: REWARD_STATUS.RECEIVED, receivedAt: params.now },
    });
    return count;
  },

  /**
   * 잘못 지급 처리한 건을 되돌립니다. (RECEIVED → USED)
   * 같은 조건부 update 패턴이라 두 번 눌러도 한 번만 되돌아갑니다.
   */
  async revertReceived(client: DbClient, params: { id: string }): Promise<number> {
    const { count } = await client.rewardCode.updateMany({
      where: { id: params.id, status: REWARD_STATUS.RECEIVED },
      data: { status: REWARD_STATUS.USED, receivedAt: null },
    });
    return count;
  },

  /** 경품함. status 를 주면 그 상태만, 없으면 사용자의 전체 리워드. */
  findByUserId(client: DbClient, userId: string, status?: RewardStatus) {
    return client.rewardCode.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: withProduct,
      orderBy: { usedAt: "desc" },
    });
  },

  /* ── 발급 ──────────────────────────────────────────────── */

  countByBatch(client: DbClient, batch: string) {
    return client.rewardCode.count({ where: { batch } });
  },

  /** 새로 만든 코드가 기존 코드와 겹치는지 확인합니다. */
  findExistingCodes(client: DbClient, codes: string[]) {
    return client.rewardCode.findMany({
      where: { rewardCode: { in: codes } },
      select: { rewardCode: true },
    });
  },

  createMany(client: DbClient, rows: CreateRewardCodeInput[]) {
    return client.rewardCode.createMany({ data: rows });
  },

  findByBatch(client: DbClient, batch?: string) {
    return client.rewardCode.findMany({
      where: batch ? { batch } : {},
      select: { rewardCode: true, productId: true, status: true, userId: true },
      orderBy: { createdAt: "asc" },
    });
  },

  listBatches(client: DbClient) {
    return client.rewardCode.groupBy({ by: ["batch"], _count: { _all: true } });
  },

  /* ── 집계 ──────────────────────────────────────────────── */

  /** 재고는 저장된 카운터가 아니라 reward_codes 를 세어서 만듭니다. */
  groupByProductStatus(client: DbClient) {
    return client.rewardCode.groupBy({
      by: ["productId", "status"],
      _count: { _all: true },
    });
  },

  countByStatus(client: DbClient, status: RewardStatus) {
    return client.rewardCode.count({ where: { status } });
  },

  /** 발급된 코드 전체 수 (상태 무관). 사이드바 '발급 이력' 뱃지의 분모입니다. */
  countAll(client: DbClient) {
    return client.rewardCode.count();
  },

  /** 여러 상태를 한 번에 셉니다. (예: USED + RECEIVED = 당첨 건수) */
  countByStatuses(client: DbClient, statuses: RewardStatus[]) {
    return client.rewardCode.count({ where: { status: { in: statuses } } });
  },

  /** [from, to) 구간에 등록된 건수 */
  countUsedBetween(client: DbClient, from: Date, to: Date) {
    return client.rewardCode.count({ where: { usedAt: { gte: from, lt: to } } });
  },

  /** [from, to) 구간에 지급된 건수 */
  countReceivedBetween(client: DbClient, from: Date, to: Date) {
    return client.rewardCode.count({
      where: { receivedAt: { gte: from, lt: to } },
    });
  },

  recentReceived(client: DbClient, limit: number) {
    return client.rewardCode.findMany({
      where: { status: REWARD_STATUS.RECEIVED },
      orderBy: { receivedAt: "desc" },
      take: limit,
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
  },
};
