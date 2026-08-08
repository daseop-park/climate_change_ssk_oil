/**
 * 리워드 도메인 공통 타입.
 *
 * `reward_codes.status` 는 DB enum 이 아니라 String 입니다.
 * (SQLite 로 시작한 흔적이지만, PostgreSQL 로 옮긴 뒤에도 유지합니다 —
 *  상태를 추가할 때 마이그레이션 없이 앱에서만 바꾸면 되고,
 *  값의 유효성은 어차피 이 타입과 조건부 update 의 `where` 절이 통제합니다.)
 *
 * ⚠️ 이 파일은 클라이언트 컴포넌트에서도 import 됩니다.
 *    Prisma 생성 타입을 여기서 re-export 하지 마세요 — 클라이언트 번들이 깨집니다.
 */

export const REWARD_STATUS = {
  /** 아직 등록되지 않은 코드 */
  UNUSED: "UNUSED",
  /** 사용자가 등록한 상태. 실물은 미수령 */
  USED: "USED",
  /** 운영자가 실물 지급 완료 처리 */
  RECEIVED: "RECEIVED",
} as const;

export type RewardStatus = (typeof REWARD_STATUS)[keyof typeof REWARD_STATUS];

export function isRewardStatus(v: string): v is RewardStatus {
  return v in REWARD_STATUS;
}

/** 경품 목록·상세에 쓰는 화면용 DTO (Prisma 모델과 분리) */
export type ProductDto = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string;
  rank: string;
  hue: number;
  /** 발급 비율에서 계산한 당첨 확률 문구 (예: "15%") */
  oddsLabel: string;
};

/** 관리자 재고 현황 — 저장된 카운터가 아니라 reward_codes 집계 결과 */
export type StockRow = {
  productId: string;
  name: string;
  rank: string;
  issued: number;
  unused: number;
  used: number;
  received: number;
};
