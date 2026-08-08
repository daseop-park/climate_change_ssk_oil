/**
 * API 요청·응답 DTO.
 *
 * ⚠️ 이 파일은 클라이언트 컴포넌트에서도 import 됩니다.
 *    Prisma 생성 타입이나 서버 전용 모듈을 여기서 참조하지 마세요.
 */
import type { ErrorCode } from "../lib/errors";
import type { RewardStatus } from "./reward";

/* ── 공통 응답 규격 ───────────────────────────────────────── */

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errorCode: ErrorCode;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/* ── 리워드 등록 ─────────────────────────────────────────── */

export type RegisterRewardRequest = {
  name: string;
  phone: string;
  code: string;
};

/** 등록 직후 화면에 "무엇에 당첨됐는지" 보여주기 위한 응답 */
export type RegisterRewardResponse = {
  rewardId: string;
  rewardCode: string;
  usedAt: string;
  product: RewardProductSummary;
};

export type RewardProductSummary = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string;
  rank: string;
  hue: number;
};

/* ── 경품함 조회 ─────────────────────────────────────────── */

export type LookupRewardsRequest = {
  /**
   * 등록할 때 쓴 이름. 전화번호만으로는 조회되지 않도록 함께 대조합니다.
   * 번호만 알면 남의 경품함을 볼 수 있는 문제를 줄이기 위한 것입니다.
   */
  name: string;
  phone: string;
};

/** 경품함 한 칸 */
export type RewardItemDto = {
  id: string;
  rewardCode: string;
  status: RewardStatus;
  usedAt: string | null;
  receivedAt: string | null;
  product: RewardProductSummary;
};

export type LookupRewardsResponse = {
  userName: string;
  /** 아직 실물을 받지 않은 것 (status: USED) */
  pending: RewardItemDto[];
  /** 수령 완료 (status: RECEIVED) */
  received: RewardItemDto[];
};

/* ── 실물 수령 처리 ──────────────────────────────────────── */

export type ReceiveRewardsRequest = {
  phone: string;
  /** 관리자가 체크한 rewardCode.id 목록 */
  rewardIds: string[];
};

export type ReceiveRewardsResponse = {
  receivedCount: number;
  receivedAt: string;
};

/* ── 공개 경품 목록 ──────────────────────────────────────── */

/**
 * 누구나 볼 수 있는 경품 정보.
 *
 * ⚠️ 재고 수치(issued/unused/…)는 **절대 포함하지 마세요.**
 *    남은 개수를 공개하면 "1등이 아직 남았는지"를 외부에서 조회할 수 있습니다.
 *    재고는 관리자 전용 `DashboardResponse.stock` 에만 실립니다.
 */
export type PublicPrizeDto = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string;
  rank: string;
  hue: number;
  /** 발급 비율에서 계산한 당첨 확률 문구 (예: "15%"). 발급 전이면 null */
  oddsLabel: string | null;
};

/* ── 관리자 ──────────────────────────────────────────────── */

export type AdminLoginRequest = {
  password: string;
};

export type AdminLoginResponse = {
  token: string;
  expiresAt: string;
};

export type DashboardResponse = {
  todayRegistered: number;
  todayReceived: number;
  totalReceived: number;
  /** 아직 아무도 등록하지 않은 코드 수 */
  remaining: number;
  stock: StockRowDto[];
  recentReceived: RecentReceiptDto[];
};

export type StockRowDto = {
  productId: string;
  name: string;
  rank: string;
  issued: number;
  unused: number;
  used: number;
  received: number;
};

export type RecentReceiptDto = {
  rewardId: string;
  rewardCode: string;
  productName: string;
  userName: string;
  receivedAt: string;
};

export type IssueCodesRequest = {
  batch: string;
  /** 상품 id → 발급 수량. 생략하면 기본 분배 계획을 씁니다. */
  plan?: Record<string, number>;
  /** true 면 저장하지 않고 결과만 계산합니다. */
  dryRun?: boolean;
};

export type IssueCodesResponse = {
  batch: string;
  total: number;
  dryRun: boolean;
  rows: IssuedCodeDto[];
};

export type IssuedCodeDto = {
  rewardCode: string;
  productId: string;
};

export type CreateProductRequest = {
  name: string;
  description?: string | null;
  image?: string | null;
  category: string;
  rank: string;
  hue?: number;
  sortOrder?: number;
  oddsLabel?: string | null;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

/** 관리자 사용자 조회 — 전화번호는 복호화해서 내려갑니다. */
export type AdminUserDto = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  registeredCount: number;
  receivedCount: number;
};
