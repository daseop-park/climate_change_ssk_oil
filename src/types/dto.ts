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

/**
 * 사이드바 메뉴 옆 카운트 뱃지.
 *
 * 콘솔 레이아웃이 매 페이지에서 읽으므로 두 번의 `count` 로만 만듭니다.
 * 대시보드 KPI 와 달리 파생 계산이 없어 `DashboardResponse` 와 분리했습니다.
 */
export type AdminNavCounts = {
  /** 발급된 코드 전체 수 */
  issued: number;
  /** 당첨 건수 = 등록된 코드 (USED + RECEIVED) */
  wins: number;
};

export type DashboardResponse = {
  /** 발급 총량. 사용률·지급률의 분모입니다 */
  issued: number;
  /** 당첨 건수 = 등록된 코드 (USED + RECEIVED). 꽝이 없으므로 등록 = 당첨 */
  registered: number;
  /** 실물 지급이 끝난 건수 */
  totalReceived: number;
  /** 아직 아무도 등록하지 않은 코드 수 */
  remaining: number;
  todayRegistered: number;
  todayReceived: number;
  /** 코드 사용률 % — `registered / issued`. 발급이 0이면 0 */
  usedRate: number;
  /** 지급률 % — `totalReceived / registered`. 당첨이 0이면 0 */
  receivedRate: number;
  /** 최근 14일 일별 추이. 빈 날짜도 0 으로 채워져 있습니다 */
  daily: DailyUsageDto[];
  stock: StockRowDto[];
  recentWins: RecentWinDto[];
};

/** 일별 코드 사용 차트의 막대 하나 */
export type DailyUsageDto = {
  /** KST 일자 `2026-08-10` */
  date: string;
  /** 그날 등록된 코드 수 (= 당첨 발생) */
  registered: number;
  /** 그날 실물 지급된 건수 */
  received: number;
};

/**
 * 최근 당첨 한 줄.
 *
 * ⚠️ **평문 성함·전화번호가 들어갈 자리는 없습니다.** 필드 이름에 `Masked` 를 박아 둔 것은
 *    실수로 평문을 넣으면 이름부터 어긋나 보이게 하려는 것입니다.
 *    본인 확인은 이 값을 보고 맞추는 것이 아니라, 운영자가 입력한 값을 서버가 해시로
 *    대조하는 방식입니다 (`docs/phase5-admin-estimate.md` §6 B안).
 */
export type RecentWinDto = {
  rewardId: string;
  rewardCode: string;
  batch: string;
  productName: string;
  /** `김O서` */
  userNameMasked: string;
  /** `010-****-4821` */
  phoneMasked: string;
  status: RewardStatus;
  /** 당첨 시각 = 코드를 등록한 시각 */
  wonAt: string;
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

/**
 * 관리자 사용자 조회.
 *
 * ⚠️ 필드 이름이 `phone` 이 아니라 **`phoneMasked`** 인 것은 의도적입니다.
 *    평문을 실수로 넣으면 이름부터 어긋나 보이고, 예전 코드가 `phone` 을 읽으려 하면
 *    **컴파일이 막습니다.** 5.2 이전에는 여기로 평문 전화번호가 그대로 나갔습니다.
 *
 * 본인 확인은 이 값을 눈으로 대조하는 것이 아니라, 운영자가 입력한 이름·번호를
 * 서버가 해시로 맞춰 보는 방식입니다 (`docs/phase5-admin-estimate.md` §6 B안).
 * 그래서 평문이 응답에 실릴 이유가 없습니다 — 복호화는 대조에만 씁니다.
 */
export type AdminUserDto = {
  id: string;
  /** `김O서` */
  nameMasked: string;
  /** `010-****-4821` */
  phoneMasked: string;
  createdAt: string;
  registeredCount: number;
  receivedCount: number;
};
