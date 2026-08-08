/**
 * 3단계 HTTP 스모크 테스트 — 실제로 뜬 서버에 요청을 보내 라우트를 검증합니다.
 *
 *   npm run build && npm run start -- -p 3111     (터미널 1)
 *   npm run test:api                              (터미널 2)
 *
 * 2단계 테스트가 서비스 함수를 직접 부르는 것과 달리, 여기서는 HTTP 를 통과시킵니다.
 * Zod 검증·상태코드·쿠키·프록시 인증·레이트 리밋처럼 라우트 계층에서만 드러나는 것들이
 * 검증 대상입니다.
 *
 * 테스트용 배치·사용자·상품을 만들고 끝나면 지웁니다.
 */
import { db } from "../src/lib/db";
import { generatePhoneHash } from "../src/lib/crypto";
import { adminService } from "../src/services/admin.service";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3111";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "dev-only-change-me-4821";

const STAMP = Date.now();
const BATCH = `http-${STAMP}`;
const PHONE = `010${String(STAMP).slice(-8)}`;
const NAME = "박테스트";
const PLAN = { prd_ecobag: 3, prd_sb_americano: 2 }; // 5개

let passed = 0;
let failed = 0;
let adminCookie = "";
const createdProductIds: string[] = [];

function check(label: string, ok: boolean, detail = "") {
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (ok) passed++;
  else failed++;
}

type ApiBody = {
  success: boolean;
  message?: string;
  errorCode?: string;
  data?: unknown;
};

type Res = { status: number; body: ApiBody; headers: Headers };

async function call(
  method: string,
  path: string,
  body?: unknown,
  opts: { admin?: boolean } = {},
): Promise<Res> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.admin && adminCookie) headers.cookie = adminCookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let parsed: ApiBody;
  try {
    parsed = (await res.json()) as ApiBody;
  } catch {
    parsed = { success: false, message: "(JSON 아님)" };
  }
  return { status: res.status, body: parsed, headers: res.headers };
}

/** 실패 응답이 기대한 상태코드·에러코드인지 확인합니다. */
function expectFail(label: string, res: Res, status: number, errorCode: string) {
  check(
    label,
    res.status === status && res.body.errorCode === errorCode && res.body.success === false,
    `기대 ${status}/${errorCode} · 실제 ${res.status}/${res.body.errorCode}`,
  );
}

async function main() {
  console.log(`\n3단계 HTTP 스모크 테스트 · ${BASE} · 배치 ${BATCH}\n`);

  // 준비 — 서비스로 직접 발급합니다 (관리자 라우트는 뒤에서 따로 검증).
  await adminService.seedProducts();
  const issued = await adminService.issueCodes({ batch: BATCH, plan: PLAN });
  const codes = issued.rows.map((r) => r.rewardCode);

  /* ── 공개 경품 목록 ───────────────────────────────────── */
  console.log("[GET /api/prizes]");

  const prizes = await call("GET", "/api/prizes");
  check("200 응답", prizes.status === 200 && prizes.body.success);

  const prizeList = prizes.body.data as Array<Record<string, unknown>>;
  check("경품 6종", prizeList?.length === 6, `${prizeList?.length}종`);
  check(
    "확률 문구 포함",
    prizeList?.every((p) => typeof p.oddsLabel === "string"),
    String(prizeList?.[0]?.oddsLabel),
  );

  // 재고가 새면 "1등이 남았는지"를 외부에서 알 수 있습니다. 가장 중요한 확인입니다.
  const leakedKeys = ["issued", "unused", "used", "received", "stock"];
  const leaked = prizeList?.flatMap((p) => leakedKeys.filter((k) => k in p)) ?? [];
  check("재고 수치 미노출", leaked.length === 0, leaked.join(", "));

  /* ── 등록 ─────────────────────────────────────────────── */
  console.log("\n[POST /api/reward/register]");

  const reg = await call("POST", "/api/reward/register", {
    name: NAME,
    phone: PHONE,
    code: codes[0],
  });
  check("201 등록 성공", reg.status === 201 && reg.body.success, reg.body.message);

  const dup = await call("POST", "/api/reward/register", {
    name: "다른사람",
    phone: "01099998888",
    code: codes[0],
  });
  expectFail("중복 코드 409", dup, 409, "ALREADY_USED");

  const bad = await call("POST", "/api/reward/register", {
    name: NAME,
    phone: PHONE,
    code: "ZZZ-999",
  });
  expectFail("없는 코드 404", bad, 404, "INVALID_CODE");

  expectFail(
    "이름 누락 400",
    await call("POST", "/api/reward/register", { phone: PHONE, code: codes[1] }),
    400,
    "VALIDATION_ERROR",
  );
  expectFail(
    "전화번호 형식 400",
    await call("POST", "/api/reward/register", { name: NAME, phone: "123", code: codes[1] }),
    400,
    "VALIDATION_ERROR",
  );
  expectFail(
    "코드 형식 400",
    await call("POST", "/api/reward/register", { name: NAME, phone: PHONE, code: "!!!" }),
    400,
    "VALIDATION_ERROR",
  );
  expectFail(
    "본문 없음 400",
    await call("POST", "/api/reward/register"),
    400,
    "VALIDATION_ERROR",
  );

  // 하이픈 표기와 소문자 코드도 받아들여야 합니다.
  const loose = await call("POST", "/api/reward/register", {
    name: NAME,
    phone: `${PHONE.slice(0, 3)}-${PHONE.slice(3, 7)}-${PHONE.slice(7)}`,
    code: codes[1].toLowerCase().replace("-", ""),
  });
  check("표기 흔들려도 등록", loose.status === 201, loose.body.message);

  /* ── 조회 ─────────────────────────────────────────────── */
  console.log("\n[POST /api/reward/lookup]");

  const box = await call("POST", "/api/reward/lookup", { name: NAME, phone: PHONE });
  check("200 조회 성공", box.status === 200 && box.body.success);

  const boxData = box.body.data as { pending: Array<{ id: string }>; received: unknown[] };
  check("미수령 2건", boxData?.pending?.length === 2, `${boxData?.pending?.length}건`);

  expectFail(
    "이름 불일치 404",
    await call("POST", "/api/reward/lookup", { name: "엉뚱한사람", phone: PHONE }),
    404,
    "NOT_FOUND",
  );

  /* ── 수령 ─────────────────────────────────────────────── */
  console.log("\n[PATCH /api/reward/receive]");

  const ids = boxData.pending.map((p) => p.id);
  const recv = await call("PATCH", "/api/reward/receive", { phone: PHONE, rewardIds: [ids[0]] });
  check("200 지급 처리", recv.status === 200 && recv.body.success, recv.body.message);

  expectFail(
    "이중 지급 409",
    await call("PATCH", "/api/reward/receive", { phone: PHONE, rewardIds: [ids[0]] }),
    409,
    "ALREADY_RECEIVED",
  );

  expectFail(
    "일부 불가 시 전체 실패 409",
    await call("PATCH", "/api/reward/receive", { phone: PHONE, rewardIds: [ids[1], ids[0]] }),
    409,
    "ALREADY_RECEIVED",
  );

  const stillUsed = await db.rewardCode.findUnique({ where: { id: ids[1] } });
  check("롤백되어 USED 유지", stillUsed?.status === "USED", `현재 ${stillUsed?.status}`);

  expectFail(
    "빈 선택 400",
    await call("PATCH", "/api/reward/receive", { phone: PHONE, rewardIds: [] }),
    400,
    "VALIDATION_ERROR",
  );

  /* ── 레이트 리밋 (조회 테스트 마지막에) ───────────────── */
  console.log("\n[레이트 리밋]");

  let limited: Res | null = null;
  for (let i = 0; i < 15 && !limited; i++) {
    const r = await call("POST", "/api/reward/lookup", { name: NAME, phone: PHONE });
    if (r.status === 429) limited = r;
  }
  check("반복 조회 시 429", limited !== null);
  check(
    "errorCode RATE_LIMITED",
    limited?.body.errorCode === "RATE_LIMITED",
    String(limited?.body.errorCode),
  );
  check(
    "Retry-After 헤더 존재",
    !!limited?.headers.get("retry-after"),
    `${limited?.headers.get("retry-after")}초`,
  );

  /* ── 관리자 인증 ──────────────────────────────────────── */
  console.log("\n[관리자 인증]");

  expectFail("미인증 대시보드 401", await call("GET", "/api/admin/dashboard"), 401, "UNAUTHORIZED");
  expectFail("미인증 상품 목록 401", await call("GET", "/api/admin/product"), 401, "UNAUTHORIZED");
  expectFail(
    "틀린 비밀번호 401",
    await call("POST", "/api/admin/login", { password: "wrong-password" }),
    401,
    "UNAUTHORIZED",
  );

  const login = await call("POST", "/api/admin/login", { password: ADMIN_PASSWORD });
  check("로그인 200", login.status === 200 && login.body.success, login.body.message);

  const setCookie = login.headers.getSetCookie?.() ?? [];
  const sessionCookie = setCookie.find((c) => c.startsWith("admin_session="));
  check("세션 쿠키 발급", !!sessionCookie);
  check("httpOnly 플래그", !!sessionCookie?.toLowerCase().includes("httponly"));
  check("SameSite=Strict", !!sessionCookie?.toLowerCase().includes("samesite=strict"));

  // 토큰이 본문으로도 새어 나오면 자바스크립트가 읽을 수 있게 됩니다.
  check("본문에 토큰 미포함", !JSON.stringify(login.body).includes("eyJ"));

  adminCookie = sessionCookie?.split(";")[0] ?? "";

  /* ── 관리자 기능 ──────────────────────────────────────── */
  console.log("\n[관리자 기능]");

  const dash = await call("GET", "/api/admin/dashboard", undefined, { admin: true });
  check("대시보드 200", dash.status === 200 && dash.body.success);
  const dashData = dash.body.data as { stock?: unknown[]; todayRegistered?: number };
  check("재고는 관리자에게만 노출", Array.isArray(dashData?.stock), `${dashData?.stock?.length}종`);

  const created = await call(
    "POST",
    "/api/admin/product",
    { name: `테스트상품-${STAMP}`, category: "굿즈", rank: "참가상", hue: 100 },
    { admin: true },
  );
  check("상품 등록 201", created.status === 201, created.body.message);
  const newProduct = created.body.data as { id: string } | undefined;

  if (!newProduct?.id) {
    // 여기서 멈추면 뒤 검사들이 통째로 날아갑니다. 실패로 기록하고 계속 갑니다.
    check("상품 CRUD 후속 검사", false, "상품 등록 실패로 건너뜀");
  } else {
    createdProductIds.push(newProduct.id);

    const patched = await call(
      "PATCH",
      `/api/admin/product/${newProduct.id}`,
      { rank: "1등" },
      { admin: true },
    );
    check("상품 수정 200", patched.status === 200);

    expectFail(
      "빈 수정 400",
      await call("PATCH", `/api/admin/product/${newProduct.id}`, {}, { admin: true }),
      400,
      "VALIDATION_ERROR",
    );

    const deleted = await call("DELETE", `/api/admin/product/${newProduct.id}`, undefined, {
      admin: true,
    });
    check("상품 삭제 200", deleted.status === 200);

    const stillThere = await db.product.findUnique({ where: { id: newProduct.id } });
    check("soft delete (행 유지)", stillThere !== null && stillThere.deletedAt !== null);
  }

  const dry = await call(
    "POST",
    "/api/admin/reward-code",
    { batch: `${BATCH}-dry`, plan: PLAN, dryRun: true },
    { admin: true },
  );
  check("코드 발급 dry-run 200", dry.status === 200);
  const dryStored = await db.rewardCode.count({ where: { batch: `${BATCH}-dry` } });
  check("dry-run 은 저장 안 함", dryStored === 0);

  expectFail(
    "배치명 형식 400",
    await call("POST", "/api/admin/reward-code", { batch: "잘못된 이름!" }, { admin: true }),
    400,
    "VALIDATION_ERROR",
  );

  const users = await call("GET", `/api/admin/user?phone=${PHONE}`, undefined, { admin: true });
  check("사용자 조회 200", users.status === 200);
  const userList = users.body.data as Array<{ phone: string }>;
  check("전화번호 복호화됨", userList?.[0]?.phone === PHONE, userList?.[0]?.phone);

  /* ── 로그아웃 ─────────────────────────────────────────── */
  console.log("\n[로그아웃]");

  const logout = await call("POST", "/api/admin/logout", undefined, { admin: true });
  check("로그아웃 200", logout.status === 200);

  const cleared = logout.headers.getSetCookie?.() ?? [];
  check(
    "쿠키 만료 처리",
    cleared.some((c) => c.startsWith("admin_session=") && /max-age=0/i.test(c)),
  );

  /* ── 정보 누출 ────────────────────────────────────────── */
  console.log("\n[정보 누출]");

  // 설정 관련 예외가 그대로 새어 나오면 여기서 잡힙니다.
  const responses = [reg, dup, bad, box, recv, login, dash];
  const secrets = ["환경변수", "PHONE_ENCRYPTION_KEY", "PHONE_HMAC_SECRET", "JWT_SECRET", "scrypt$"];
  const leakedSecret = responses.flatMap((r) =>
    secrets.filter((s) => JSON.stringify(r.body).includes(s)),
  );
  check("응답에 설정 정보 없음", leakedSecret.length === 0, leakedSecret.join(", "));

  const stack = responses.filter((r) => JSON.stringify(r.body).includes("at "));
  check("응답에 스택 트레이스 없음", stack.length === 0);
}

async function cleanup() {
  await db.rewardCode.deleteMany({ where: { batch: { startsWith: `http-${STAMP}` } } });
  await db.user.deleteMany({
    where: { phoneHash: { in: [PHONE, "01099998888"].map((p) => generatePhoneHash(p)) } },
  });
  if (createdProductIds.length) {
    await db.product.deleteMany({ where: { id: { in: createdProductIds } } });
  }
}

main()
  .catch((e) => {
    console.error(
      "\n예상치 못한 오류:",
      e instanceof Error && e.message.includes("fetch")
        ? `${BASE} 에 연결할 수 없습니다. 서버를 먼저 띄우세요.\n  npm run build && npm run start -- -p 3111`
        : e,
    );
    failed++;
  })
  .finally(async () => {
    await cleanup();
    console.log(
      failed === 0
        ? `\n전체 통과 ✅  (${passed}건)\n`
        : `\n${failed}건 실패 ❌  (통과 ${passed}건)\n`,
    );
    await db.$disconnect();
    if (failed) process.exit(1);
  });
