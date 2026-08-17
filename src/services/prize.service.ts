/**
 * 공개 경품 목록.
 *
 * ⚠️ **이 응답에는 재고도 확률도 넣지 않습니다.**
 *
 * 재고를 공개하면 "1등이 아직 남았는지"를 외부에서 조회할 수 있고, 그걸 보고 코드를
 * 긁는 동기가 생깁니다. **확률도 같은 이유로 뺐습니다** — 발급 비율을 내보내는 것은
 * 사실상 배치 구성비를 공개하는 것이라, 남은 수는 아니어도 "1등은 100장 중 1장" 은
 * 알려주는 셈이었습니다. 재고 비공개 결정과 결이 어긋나 있었습니다.
 * (`docs/implementation-plan.md` — Phase 4 후속, 2026-08-09 결정)
 *
 * 확률 계산 자체는 폐기하지 않고 **관리자 쪽으로 옮겼습니다** (`admin.service.formatOdds`).
 * 화면에는 확률 대신 등급(`rank`)이 들어갑니다.
 *
 * 부수 효과로 이 함수는 `reward_codes` 를 **아예 건드리지 않습니다** — 쿼리가 2개에서
 * 1개로 줄었고, 공개 API 가 코드 테이블에 접근할 이유가 없어졌습니다.
 */
import { db } from "../lib/db";
import { productRepository } from "../repositories/product.repository";
import type { PublicPrizeDto } from "../types/dto";

export const prizeService = {
  async listPublic(): Promise<PublicPrizeDto[]> {
    const products = await productRepository.listActive(db);

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      category: p.category,
      rank: p.rank,
      hue: p.hue,
    }));
  },
};
