/**
 * users 테이블 접근. 여기에는 Prisma 호출만 둡니다.
 * 암·복호화나 해시 생성 같은 판단은 Service 에서 합니다.
 */
import type { DbClient } from "./types";
import { REWARD_STATUS } from "../types/reward";

export type CreateUserInput = {
  name: string;
  phoneHash: string;
  phoneEncrypted: string;
};

export const userRepository = {
  findByPhoneHash(client: DbClient, phoneHash: string) {
    return client.user.findUnique({ where: { phoneHash } });
  },

  findById(client: DbClient, id: string) {
    return client.user.findUnique({ where: { id } });
  },

  create(client: DbClient, data: CreateUserInput) {
    return client.user.create({ data });
  },

  /**
   * 이름만 최신값으로 갱신합니다.
   * 같은 번호로 다시 등록할 때 사용자가 이름을 고쳐 적는 경우가 있어,
   * 마지막 입력을 따릅니다. 전화번호 관련 필드는 건드리지 않습니다.
   */
  updateName(client: DbClient, id: string, name: string) {
    return client.user.update({ where: { id }, data: { name } });
  },

  /** 관리자 사용자 조회 — 등록/수령 건수를 함께 셉니다. */
  findManyWithCounts(client: DbClient, opts: { skip?: number; take?: number } = {}) {
    return client.user.findMany({
      skip: opts.skip,
      take: opts.take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { rewardCodes: true } },
        rewardCodes: {
          where: { status: REWARD_STATUS.RECEIVED },
          select: { id: true },
        },
      },
    });
  },

  count(client: DbClient) {
    return client.user.count();
  },
};
