/**
 * products 테이블 접근.
 *
 * 삭제는 전부 soft delete 입니다. 물리 삭제하면 이미 발급된 reward_codes 의
 * FK 가 끊어져, 과거 지급 내역을 조회할 수 없게 됩니다.
 */
import type { Prisma } from "../generated/prisma/client";
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
  async softDelete(client: DbClient, id: string, now: Date): Promise<number> {
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
