/**
 * products 테이블 접근.
 *
 * 삭제는 전부 soft delete 입니다. 물리 삭제하면 이미 발급된 reward_codes 의
 * FK 가 끊어져, 과거 지급 내역을 조회할 수 없게 됩니다.
 */
import type { Prisma } from "../generated/prisma/client";
import { AppError, ERROR_CODES } from "../lib/errors";
import type { DbClient } from "./types";

export type CreateProductInput = {
  id?: string;
  name: string;
  description?: string | null;
  image?: string | null;
  category: string;
  rank: string;
  hue?: number;
  sortOrder?: number;
  oddsLabel?: string | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export const productRepository = {
  /** 화면·발급에 쓸 수 있는 상품만 (soft delete 제외) */
  listActive(client: DbClient) {
    return client.product.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  },

  listAll(client: DbClient) {
    return client.product.findMany({ orderBy: { sortOrder: "asc" } });
  },

  findById(client: DbClient, id: string) {
    return client.product.findUnique({ where: { id } });
  },

  /** 발급 계획에 적힌 상품이 실제로 있는지 확인할 때 씁니다. */
  findActiveIdsIn(client: DbClient, ids: string[]) {
    return client.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
  },

  create(client: DbClient, data: CreateProductInput) {
    return client.product.create({ data: data as Prisma.ProductCreateInput });
  },

  update(client: DbClient, id: string, data: UpdateProductInput) {
    return client.product.update({ where: { id }, data });
  },

  /**
   * soft delete. 이미 삭제된 행은 건드리지 않도록 `deletedAt: null` 을 조건에 겁니다.
   * 두 번 눌러도 첫 삭제 시각이 보존됩니다.
   */
  /**
   * soft delete — **발급된 코드가 있으면 거부합니다.**
   *
   * `deletedAt` 을 "발급 전 상품 정리" 에만 쓰는 규칙으로 좁힌 것입니다. 목록과 집계의
   * 모집단이 다르기 때문입니다 — 목록은 `listActive`(삭제 제외)로 만드는데 재고 집계는
   * `groupByProductStatus`(전체 코드)를 셉니다. 코드가 이미 나간 상품을 지우면
   * **그 상품의 미사용 코드가 재고 표에서 통째로 사라집니다.** 한눈에 확인하는 것이
   * 존재 이유인 콘솔에 보이지 않는 재고가 생기는 셈입니다.
   *
   * ⚠️ 이 가드가 Service 가 아니라 **Repository** 에 있는 것은 의도적입니다.
   *    이 프로젝트는 "Repository 는 Prisma 만, 판단은 Service" 를 지키지만, 상품 삭제는
   *    화면이 아니라 CLI·직접 조작으로 하기로 했습니다. Service 에만 두면 그 경로들이
   *    가드를 통과하지 않습니다. (`docs/phase5-admin-estimate.md` §7-1)
   */
  async softDelete(client: DbClient, id: string, now: Date): Promise<number> {
    const issued = await client.rewardCode.count({ where: { productId: id } });
    if (issued > 0) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        `이미 ${issued}개의 코드가 발급된 상품은 삭제할 수 없습니다. ` +
          `삭제하면 그 코드들의 재고가 관리자 집계에서 사라집니다.`,
      );
    }

    const { count } = await client.product.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: now },
    });
    return count;
  },

  async restore(client: DbClient, id: string): Promise<number> {
    const { count } = await client.product.updateMany({
      where: { id, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    return count;
  },

  /** 고정 id 카탈로그 시드용. 여러 번 실행해도 같은 행을 갱신합니다. */
  upsert(client: DbClient, data: CreateProductInput & { id: string }) {
    const { id, ...rest } = data;
    return client.product.upsert({
      where: { id },
      create: { id, ...rest } as Prisma.ProductCreateInput,
      // 시드는 "카탈로그를 정상 상태로 되돌린다"는 뜻이므로 삭제 표시도 해제합니다.
      update: { ...rest, deletedAt: null },
    });
  },

  countActive(client: DbClient) {
    return client.product.count({ where: { deletedAt: null } });
  },
};
