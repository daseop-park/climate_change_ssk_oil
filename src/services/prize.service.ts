/**
 * 공개 경품 목록.
 *
 * 화면에 뿌릴 당첨 확률을 **발급 비율에서 계산**합니다.
 * 프론트에 확률을 하드코딩해 두면 발급 계획을 바꾸는 순간 표기가 틀어집니다
 * (실제로 한 번 틀어져 있었습니다 — 합계가 86% 였습니다).
 *
 * ⚠️ 이 응답에는 재고 수치를 넣지 않습니다.
 *    남은 개수를 공개하면 "1등이 아직 남았는지"를 외부에서 조회할 수 있고,
 *    그걸 보고 코드를 긁는 동기가 생깁니다. 재고는 관리자 대시보드에만 실립니다.
 */
import { db } from "../lib/db";
import { productRepository } from "../repositories/product.repository";
import { rewardRepository } from "../repositories/reward.repository";
import type { PublicPrizeDto } from "../types/dto";

/** 소수점 없이 보여줍니다. 1% 미만이면 "1% 미만" 으로 뭉갭니다. */
function formatOdds(issued: number, total: number): string | null {
  if (total <= 0 || issued <= 0) return null;

  const percent = (issued / total) * 100;
  if (percent < 1) return "1% 미만";
  return `${Math.round(percent)}%`;
}

export const prizeService = {
  async listPublic(): Promise<PublicPrizeDto[]> {
    const [products, grouped] = await Promise.all([
      productRepository.listActive(db),
      rewardRepository.groupByProductStatus(db),
    ]);

    // 상품별 총 발급 수 — 상태와 무관하게 발급된 코드 전부를 셉니다.
    // 이미 사용된 코드를 빼면 이벤트가 진행될수록 표기 확률이 요동칩니다.
    const issuedBy = new Map<string, number>();
    for (const g of grouped) {
      issuedBy.set(g.productId, (issuedBy.get(g.productId) ?? 0) + g._count._all);
    }

    const totalIssued = [...issuedBy.values()].reduce((a, b) => a + b, 0);

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      category: p.category,
      rank: p.rank,
      hue: p.hue,
      // 마케팅상 다른 문구가 필요하면 상품에 적어둔 값이 우선합니다.
      oddsLabel: p.oddsLabel ?? formatOdds(issuedBy.get(p.id) ?? 0, totalIssued),
    }));
  },
};
