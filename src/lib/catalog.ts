/**
 * 경품 카탈로그와 배치 분배 계획.
 *
 * 상품 id 는 cuid 자동생성 대신 **고정 문자열**을 씁니다.
 * 시드를 여러 번 돌려도 같은 행을 upsert 하고, 발급 계획이 상품을 안정적으로 가리키기 위해서입니다.
 *
 * (2단계에서 `scripts/catalog.ts` 에서 이곳으로 옮겼습니다.
 *  발급·시드가 CLI 전용 로직이 아니라 AdminService 를 통해 관리자 화면에서도
 *  호출되기 때문에, 도메인 데이터가 scripts/ 아래 남아 있으면 안 됩니다.)
 */

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  /** `public/assets/` 아래 상품 사진. 없으면 hue 기반 플레이스홀더로 표시됩니다. */
  image?: string;
  category: string;
  rank: string;
  hue: number;
  sortOrder: number;
};

/** 화면 노출 순서는 디자인 프로토타입의 경품 그리드 순서를 따릅니다. */
export const PRODUCTS: CatalogProduct[] = [
  {
    id: "prd_sb_americano",
    name: "스타벅스 아메리카노 T",
    description:
      "전국 스타벅스 매장에서 사용 가능한 모바일 교환권입니다. 발급 후 30일 이내 사용해 주세요.",
    category: "카페",
    rank: "3등",
    hue: 150,
    sortOrder: 1,
  },
  {
    id: "prd_cvs_5000",
    name: "편의점 모바일상품권 5,000원",
    description:
      "GS25·CU·세븐일레븐 등 전국 편의점에서 현금처럼 사용할 수 있는 모바일 금액권입니다.",
    category: "상품권",
    rank: "2등",
    hue: 210,
    sortOrder: 2,
  },
  {
    id: "prd_sb_giftcard",
    name: "스타벅스 기프트카드 5만원",
    description: "이번 주 최고 경품! 스타벅스 5만원 충전 기프트카드입니다.",
    image: "/assets/prize-starbucks-50000.png",
    category: "카페",
    rank: "1등",
    hue: 20,
    sortOrder: 3,
  },
  {
    id: "prd_delivery_3000",
    name: "배달앱 3,000원 할인쿠폰",
    description:
      "최소 주문금액 12,000원 이상 결제 시 사용 가능한 배달 할인 쿠폰입니다.",
    category: "배달",
    rank: "4등",
    hue: 40,
    sortOrder: 4,
  },
  {
    id: "prd_culture_10000",
    name: "문화상품권 10,000원",
    description:
      "온·오프라인 가맹점에서 폭넓게 사용 가능한 문화상품권 핀번호를 발급해 드립니다.",
    category: "상품권",
    rank: "2등",
    hue: 265,
    sortOrder: 5,
  },
  {
    id: "prd_ecobag",
    name: "싹싹기름 리사이클 에코백",
    description:
      "폐페트병을 재활용한 원단으로 만든 친환경 에코백입니다. 색상은 랜덤 발송됩니다.",
    category: "굿즈",
    rank: "참가상",
    hue: 165,
    sortOrder: 6,
  },
];

/**
 * 100개 배치 분배. 가치가 높을수록 수량이 적습니다.
 * 총 100개라 개수가 곧 퍼센트이며, 반올림 오차가 없습니다.
 */
export const DEFAULT_PLAN: Record<string, number> = {
  prd_sb_giftcard: 1, //  1% · 1등
  prd_culture_10000: 5, //  5% · 2등
  prd_cvs_5000: 10, // 10% · 2등
  prd_sb_americano: 15, // 15% · 3등
  prd_delivery_3000: 29, // 29% · 4등
  prd_ecobag: 40, // 40% · 참가상
};

export const DEFAULT_TOTAL = planTotal(DEFAULT_PLAN);

export function planTotal(plan: Record<string, number>): number {
  return Object.values(plan).reduce((a, b) => a + b, 0);
}

export function productById(id: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productName(id: string): string {
  return productById(id)?.name ?? id;
}
