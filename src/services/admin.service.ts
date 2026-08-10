/**
 * 관리자 도메인 로직.
 *
 * 코드 발급·상품 시드·재고 집계는 원래 `scripts/` 안에 있던 로직을 2단계에서 이곳으로
 * 옮긴 것입니다. 관리자 화면(5단계)과 CLI 가 같은 함수를 호출하게 되므로,
 * 분배 계획 검증이나 배치 중복 방지 같은 규칙이 한쪽에만 적용되는 일이 없습니다.
 * 스크립트는 이제 인자 파싱과 출력만 담당하는 얇은 어댑터입니다.
 */
import { db } from "../lib/db";
import { DEFAULT_PLAN, PRODUCTS, planTotal } from "../lib/catalog";
import { randomCode, shuffle } from "../lib/code-generator";
import { decryptPhone } from "../lib/crypto";
import { kstDateKey, kstDayRange, kstRecentDayKeys, kstRecentDaysFrom } from "../lib/date";
import { AppError, ERROR_CODES } from "../lib/errors";
import { maskName, maskPhone } from "../lib/mask";
import { signAdminToken, verifyPassword } from "../lib/admin-auth";
import { productRepository } from "../repositories/product.repository";
import { rewardRepository } from "../repositories/reward.repository";
import { REWARD_STATUS, type RewardStatus } from "../types/reward";
import type {
  AdminLoginResponse,
  AdminNavCounts,
  CreateProductRequest,
  DailyUsageDto,
  DashboardResponse,
  IssueCodesResponse,
  IssuedCodeDto,
  StockRowDto,
  UpdateProductRequest,
} from "../types/dto";

/** 코드 생성 재시도 한계. 이 횟수 안에 중복 없는 집합을 못 만들면 코드 공간이 포화된 것입니다. */
const CODE_RETRY_ROUNDS = 10;
const RECENT_WIN_LIMIT = 10;
/** 일별 추이 차트의 막대 수. 핸드오프 디자인이 14개 기준입니다. */
const DAILY_CHART_DAYS = 14;

/** 비율 %. 분모가 0이면 0 — `0/0 = NaN` 이 그대로 화면에 나가면 진행바 폭이 깨집니다. */
function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : (part / whole) * 100;
}

/**
 * 일별 추이 시리즈를 만듭니다.
 *
 * 빈 날짜를 0 으로 채우는 것이 핵심입니다. 집계 결과만 그리면 아무도 등록하지 않은 날이
 * 막대에서 통째로 빠져, 14일 차트가 실제보다 촘촘해 보이고 날짜 축이 어긋납니다.
 *
 * 일자 판정은 `kstDateKey` — 대시보드 KPI 의 "오늘"(`kstDayRange`)과 같은 기준입니다.
 * 서버가 UTC 로 도는 환경(Railway 기본값)에서 이 둘이 어긋나면 KPI 숫자와 차트 마지막
 * 막대가 달라지는데, 나란히 놓여 있어서 바로 눈에 띕니다.
 */
function buildDailySeries(
  rows: { usedAt: Date | null; receivedAt: Date | null }[],
  days: number,
): DailyUsageDto[] {
  const series = new Map<string, DailyUsageDto>(
    kstRecentDayKeys(days).map((date) => [date, { date, registered: 0, received: 0 }]),
  );

  for (const row of rows) {
    // 한 행이 두 막대에 기여할 수 있습니다 — 등록한 날과 지급받은 날이 다를 수 있어서
    // else 로 묶지 않고 각각 셉니다.
    //
    // `bucket` 이 없을 수 있습니다. 조회 조건이 `usedAt >= since OR receivedAt >= since` 라,
    // 예전에 등록된 코드를 오늘 지급하면 **usedAt 은 창 밖**인 채로 행이 딸려 옵니다.
    // 그 등록분까지 세면 14일 합계가 실제보다 커집니다.
    if (row.usedAt) {
      const bucket = series.get(kstDateKey(row.usedAt));
      if (bucket) bucket.registered += 1;
    }
    if (row.receivedAt) {
      const bucket = series.get(kstDateKey(row.receivedAt));
      if (bucket) bucket.received += 1;
    }
  }

  return [...series.values()];
}

export const adminService = {
  /* ── 인증 ──────────────────────────────────────────────── */

  /**
   * 비밀번호를 확인하고 토큰을 발급합니다.
   * 실패 사유(비밀번호 틀림 / 미설정)를 구분해 알려주지 않습니다.
   */
  login(password: string): AdminLoginResponse {
    if (!password || !verifyPassword(password)) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, "비밀번호가 올바르지 않습니다.");
    }
    const { token, expiresAt } = signAdminToken();
    return { token, expiresAt: expiresAt.toISOString() };
  },

  /* ── 대시보드 ──────────────────────────────────────────── */

  async getDashboard(): Promise<DashboardResponse> {
    // "오늘"은 서버 로컬 시간이 아니라 한국 시간 기준입니다. (lib/date.ts 참고)
    const { from, to } = kstDayRange();
    const since = kstRecentDaysFrom(DAILY_CHART_DAYS);

    const [todayRegistered, todayReceived, totalReceived, remaining, issued, stock, recent, usage] =
      await Promise.all([
        rewardRepository.countUsedBetween(db, from, to),
        rewardRepository.countReceivedBetween(db, from, to),
        rewardRepository.countByStatus(db, REWARD_STATUS.RECEIVED),
        rewardRepository.countByStatus(db, REWARD_STATUS.UNUSED),
        rewardRepository.countAll(db),
        adminService.getStock(),
        rewardRepository.recentWins(db, RECENT_WIN_LIMIT),
        rewardRepository.findUsageSince(db, since),
      ]);

    // 꽝이 없으므로 "등록된 코드 수 = 당첨 건수" 입니다. 따로 세지 않고 빼서 구합니다 —
    // 쿼리를 하나 더 날리면 두 숫자가 서로 다른 시점을 보게 될 수 있습니다.
    const registered = issued - remaining;

    return {
      issued,
      registered,
      totalReceived,
      remaining,
      todayRegistered,
      todayReceived,
      usedRate: percent(registered, issued),
      receivedRate: percent(totalReceived, registered),
      daily: buildDailySeries(usage, DAILY_CHART_DAYS),
      stock,
      recentWins: recent.map((r) => ({
        rewardId: r.id,
        rewardCode: r.rewardCode,
        batch: r.batch,
        productName: r.product.name,
        // ⚠️ 마스킹은 **여기서** 끝냅니다. 화면으로 평문을 넘기면 네트워크 탭에 남습니다.
        userNameMasked: r.user ? maskName(r.user.name) : "-",
        phoneMasked: r.user ? maskPhone(decryptPhone(r.user.phoneEncrypted)) : "-",
        status: r.status as RewardStatus,
        // 등록된 코드만 골라 왔으므로 usedAt 은 항상 있습니다. 타입상 nullable 이라 방어만 둡니다.
        wonAt: (r.usedAt ?? r.receivedAt ?? new Date()).toISOString(),
      })),
    };
  },

  /**
   * 사이드바 카운트 뱃지.
   *
   * 콘솔 레이아웃이 페이지를 옮길 때마다 부릅니다. 대시보드 전체를 부르면
   * 재고 집계와 최근 당첨 조회까지 딸려오므로, 필요한 두 개만 셉니다.
   */
  async getNavCounts(): Promise<AdminNavCounts> {
    const [issued, wins] = await Promise.all([
      rewardRepository.countAll(db),
      rewardRepository.countByStatuses(db, [REWARD_STATUS.USED, REWARD_STATUS.RECEIVED]),
    ]);
    return { issued, wins };
  },

  /** 상품별 재고. 저장된 카운터가 아니라 reward_codes 를 세어서 만듭니다. */
  async getStock(): Promise<StockRowDto[]> {
    const [products, grouped] = await Promise.all([
      productRepository.listActive(db),
      rewardRepository.groupByProductStatus(db),
    ]);

    return products.map((p) => {
      const at = (status: string) =>
        grouped.find((g) => g.productId === p.id && g.status === status)?._count._all ?? 0;

      const unused = at(REWARD_STATUS.UNUSED);
      const used = at(REWARD_STATUS.USED);
      const received = at(REWARD_STATUS.RECEIVED);

      return {
        productId: p.id,
        name: p.name,
        rank: p.rank,
        issued: unused + used + received,
        unused,
        used,
        received,
      };
    });
  },

  /* ── 상품 관리 ─────────────────────────────────────────── */

  listProducts(includeDeleted = false) {
    return includeDeleted ? productRepository.listAll(db) : productRepository.listActive(db);
  },

  createProduct(input: CreateProductRequest) {
    if (!input.name?.trim()) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "상품명을 입력해 주세요.");
    }
    return productRepository.create(db, { ...input, name: input.name.trim() });
  },

  async updateProduct(id: string, input: UpdateProductRequest) {
    const existing = await productRepository.findById(db, id);
    if (!existing) throw new AppError(ERROR_CODES.NOT_FOUND, "상품을 찾을 수 없습니다.");
    return productRepository.update(db, id, input);
  },

  /** soft delete. 이미 발급된 코드의 상품 참조를 살려두기 위해 물리 삭제하지 않습니다. */
  async deleteProduct(id: string): Promise<void> {
    const deleted = await productRepository.softDelete(db, id, new Date());
    if (deleted === 0) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "이미 삭제되었거나 존재하지 않는 상품입니다.");
    }
  },

  async restoreProduct(id: string): Promise<void> {
    const restored = await productRepository.restore(db, id);
    if (restored === 0) {
      throw new AppError(ERROR_CODES.CONFLICT, "삭제 상태인 상품이 아닙니다.");
    }
  },

  /** 고정 id 카탈로그를 DB에 반영합니다. 여러 번 실행해도 안전합니다. */
  async seedProducts(): Promise<number> {
    for (const p of PRODUCTS) {
      // image 를 undefined 로 넘기면 Prisma 가 "건드리지 않음"으로 해석해,
      // 카탈로그에서 사진을 뺀 상품의 옛 경로가 DB에 남습니다. 명시적으로 null 을 씁니다.
      await productRepository.upsert(db, { ...p, image: p.image ?? null });
    }
    return productRepository.countActive(db);
  },

  /* ── 리워드 코드 발급 ──────────────────────────────────── */

  /**
   * 배치 단위로 코드를 발급합니다.
   *
   * 사전 배정 모델이라 **발급 시점에 상품이 확정**됩니다. 등록 시점에 추첨하지 않으므로,
   * 여기서 만든 분배가 곧 당첨 확률입니다.
   *
   * `dryRun` 이면 DB에 쓰지 않고 결과만 계산해 돌려줍니다.
   */
  async issueCodes(params: {
    batch: string;
    plan?: Record<string, number>;
    dryRun?: boolean;
  }): Promise<IssueCodesResponse> {
    const batch = params.batch?.trim();
    const plan = params.plan ?? DEFAULT_PLAN;
    const dryRun = params.dryRun ?? false;
    const total = planTotal(plan);

    if (!batch) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "배치 이름을 입력해 주세요.");
    }
    if (total <= 0) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "발급 수량이 0입니다. 분배 계획을 확인해 주세요.");
    }

    // 1) 배치 중복 방지 — 발급은 멱등하지 않습니다.
    const existing = await rewardRepository.countByBatch(db, batch);
    if (existing > 0) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        `배치 '${batch}' 에 이미 ${existing}개의 코드가 발급되어 있습니다. 다른 이름을 쓰세요.`,
      );
    }

    // 2) 계획에 적힌 상품이 실제로 있는지 확인
    const productIds = Object.keys(plan);
    const found = await productRepository.findActiveIdsIn(db, productIds);
    const missing = productIds.filter((id) => !found.some((f) => f.id === id));
    if (missing.length > 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `등록되지 않은 상품이 있습니다: ${missing.join(", ")}`,
      );
    }

    // 3) 상품 배정 목록을 만들고 셔플
    //    셔플하지 않으면 발급 순서대로 인쇄했을 때 상자 앞쪽 패드가 전부 1등이 됩니다.
    const assignments = shuffle(
      Object.entries(plan).flatMap(([productId, n]) =>
        Array.from({ length: n }, () => productId),
      ),
    );

    // 4) 중복 없는 코드 생성 — 메모리 내 Set 으로 자체 중복을 걸러낸 뒤 DB 기존 코드와 대조
    const codes = new Set<string>();
    let cleared = false;
    for (let round = 0; round < CODE_RETRY_ROUNDS && !cleared; round++) {
      while (codes.size < total) codes.add(randomCode());
      const taken = await rewardRepository.findExistingCodes(db, [...codes]);
      if (taken.length === 0) cleared = true;
      else for (const t of taken) codes.delete(t.rewardCode);
    }
    if (!cleared) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "코드 생성 재시도 한계를 넘었습니다. 코드 공간이 포화됐을 수 있습니다.",
      );
    }

    const rows: IssuedCodeDto[] = [...codes].map((rewardCode, i) => ({
      rewardCode,
      productId: assignments[i],
    }));

    if (dryRun) return { batch, total, dryRun: true, rows };

    // 5) 저장 — 전부 성공하거나 전부 실패.
    //    배치 중복 검사를 트랜잭션 안에서 한 번 더 합니다. 위 1)번 이후 다른 관리자가
    //    같은 배치명으로 발급을 끝냈을 수 있습니다.
    await db.$transaction(async (tx) => {
      const raced = await rewardRepository.countByBatch(tx, batch);
      if (raced > 0) {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          `배치 '${batch}' 가 방금 다른 곳에서 발급되었습니다. 다른 이름을 쓰세요.`,
        );
      }
      await rewardRepository.createMany(
        tx,
        rows.map((r) => ({ ...r, batch })),
      );
    });

    return { batch, total, dryRun: false, rows };
  },

  /** 발급된 배치 목록과 각 수량 */
  listBatches() {
    return rewardRepository.listBatches(db);
  },
};
