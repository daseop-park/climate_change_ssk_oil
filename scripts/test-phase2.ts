/**
 * 2단계 스모크 테스트 — Repository/Service 레이어의 상태 전이와 방어 로직을 확인합니다.
 *
 *   npm run db:smoke
 *
 * 테스트용 배치·사용자를 만들고 끝나면 지웁니다. 기존 데이터는 건드리지 않습니다.
 *
 * 동시성에 대하여
 *   PostgreSQL + `pg` 드라이버는 비동기라 아래 "동시 등록" 테스트의 요청들이 실제로 겹칩니다.
 *   조건부 update 의 `where status = 'UNUSED'` 가 DB 행 잠금으로 직렬화되어
 *   정확히 한 건만 통과하는지를 진짜로 검증합니다.
 *   (SQLite 시절에는 드라이버가 동기라 이 테스트가 형식적이었습니다.)
 *
 *   다만 여기서 겹치는 것은 **한 프로세스 안의 동시 요청**입니다.
 *   여러 인스턴스로 띄웠을 때의 경합은 6단계에서 부하 도구로 확인하세요.
 */
import { db } from "../src/lib/db";
import { decryptPhone, generatePhoneHash, normalizePhone } from "../src/lib/crypto";
import { hashPassword, signAdminToken, verifyAdminToken } from "../src/lib/admin-auth";
import { isAppError, type ErrorCode } from "../src/lib/errors";
import { rewardService } from "../src/services/reward.service";
import { adminService } from "../src/services/admin.service";
import { rewardRepository } from "../src/repositories/reward.repository";
import { REWARD_STATUS } from "../src/types/reward";

const STAMP = Date.now();
const BATCH = `smoke-${STAMP}`;
const PHONE_A = `010${String(STAMP).slice(-8)}`;
const PHONE_B = `011${String(STAMP).slice(-8)}`;
/** 동시 등록 경합에 참여할 사람들 */
const RACERS = 5;
const RACE_PHONES = Array.from({ length: RACERS }, (_, i) => `0102${String(STAMP).slice(-6)}${i}`);
const PLAN = { prd_ecobag: 4, prd_sb_americano: 2 }; // 6개

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail = "") {
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (ok) passed++;
  else failed++;
}

/** 실패하기를 기대하는 호출. 지정한 errorCode 로 실패해야 통과입니다. */
async function expectError(label: string, code: ErrorCode, fn: () => Promise<unknown>) {
  try {
    await fn();
    check(label, false, "에러 없이 성공해버림");
  } catch (e) {
    const actual = isAppError(e) ? e.code : `(AppError 아님: ${String(e)})`;
    check(label, actual === code, `기대 ${code} / 실제 ${actual}`);
  }
}

async function main() {
  console.log(`\n2단계 스모크 테스트 · 배치 ${BATCH}\n`);

  /* ── 준비 ─────────────────────────────────────────────── */
  await adminService.seedProducts();
  const issued = await adminService.issueCodes({ batch: BATCH, plan: PLAN });
  check("코드 발급", issued.rows.length === 6, `${issued.rows.length}개`);

  const [c1, c2, c3, c4] = issued.rows.map((r) => r.rewardCode);

  /* ── 등록 (UNUSED → USED) ────────────────────────────── */
  console.log("\n[등록]");

  const reg = await rewardService.register({ name: "김테스트", phone: PHONE_A, code: c1 });
  check("정상 등록", reg.rewardCode === c1, reg.product.name);

  await expectError("이미 사용된 코드 거절", "ALREADY_USED", () =>
    rewardService.register({ name: "다른사람", phone: PHONE_B, code: c1 }),
  );

  await expectError("없는 코드 거절", "INVALID_CODE", () =>
    rewardService.register({ name: "김테스트", phone: PHONE_A, code: "ZZZ-999" }),
  );

  await expectError("잘못된 전화번호 거절", "INVALID_PHONE", () =>
    rewardService.register({ name: "김테스트", phone: "123", code: c2 }),
  );

  // 하이픈 표기가 달라도 같은 사용자로 묶여야 합니다.
  await rewardService.register({
    name: "김테스트",
    phone: `${PHONE_A.slice(0, 3)}-${PHONE_A.slice(3, 7)}-${PHONE_A.slice(7)}`,
    code: c2,
  });
  const userCount = await db.user.count({ where: { phoneHash: generatePhoneHash(PHONE_A) } });
  check("표기가 달라도 동일 사용자", userCount === 1, `사용자 ${userCount}명`);

  // 같은 코드를 여러 명이 동시에 제출 — 정확히 한 건만 성공해야 합니다.
  const raceResults = await Promise.allSettled(
    // 등록자도 서로 다른 사람이어야 실제 상황에 가깝습니다.
    RACE_PHONES.map((phone, i) =>
      rewardService.register({ name: `동시${i + 1}`, phone, code: c3 }),
    ),
  );
  const fulfilled = raceResults.filter((r) => r.status === "fulfilled").length;
  check("동시 등록 시 한 건만 성공", fulfilled === 1, `성공 ${fulfilled}/${RACERS}`);

  // 나머지는 전부 ALREADY_USED 여야 합니다 — 다른 에러가 섞이면 경합 처리가 샌 것입니다.
  const rejectedCodes = raceResults
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => (isAppError(r.reason) ? r.reason.code : String(r.reason)));
  check(
    "패배한 요청은 전부 ALREADY_USED",
    rejectedCodes.every((c) => c === "ALREADY_USED"),
    [...new Set(rejectedCodes)].join(", "),
  );

  // 경합 후에도 코드는 정확히 한 사람에게만 귀속돼야 합니다.
  const raced = await rewardRepository.findByCodeWithProduct(db, c3);
  check(
    "경합 코드의 소유자는 1명",
    raced?.status === REWARD_STATUS.USED && raced.userId != null,
    `status=${raced?.status}`,
  );

  /* ── 조회 ─────────────────────────────────────────────── */
  console.log("\n[조회]");

  const box = await rewardService.lookup({ name: "김테스트", phone: PHONE_A });
  check("경품함 조회", box.pending.length >= 2, `미수령 ${box.pending.length}건`);
  check("수령 목록은 비어 있음", box.received.length === 0);

  await expectError("등록 이력 없는 번호 거절", "NOT_FOUND", () =>
    rewardService.lookup({ name: "김테스트", phone: "01000000000" }),
  );

  // 전화번호만으로는 열리지 않아야 합니다.
  await expectError("이름 불일치 거절", "NOT_FOUND", () =>
    rewardService.lookup({ name: "엉뚱한사람", phone: PHONE_A }),
  );

  // 표기 차이(공백·대소문자)는 흡수해야 합니다 — 본인이 못 여는 게 더 큰 문제입니다.
  const spaced = await rewardService.lookup({ name: " 김 테 스 트 ", phone: PHONE_A });
  check("이름 공백 차이는 흡수", spaced.pending.length === box.pending.length);

  /* ── 수령 (USED → RECEIVED) ──────────────────────────── */
  console.log("\n[수령]");

  const first = box.pending[0];
  const second = box.pending[1];

  const receipt = await rewardService.receive({ name: "김테스트", phone: PHONE_A, rewardIds: [first.id] });
  check("정상 수령 처리", receipt.receivedCount === 1);

  const afterFirst = await rewardRepository.findByIdWithProduct(db, first.id);
  check("상태 RECEIVED 로 전이", afterFirst?.status === REWARD_STATUS.RECEIVED);
  check("receivedAt 기록됨", afterFirst?.receivedAt != null);

  await expectError("이중 지급 거절", "ALREADY_RECEIVED", () =>
    rewardService.receive({ name: "김테스트", phone: PHONE_A, rewardIds: [first.id] }),
  );

  // A안 — 하나라도 처리 불가면 전부 롤백
  await expectError("일부 불가 시 전체 실패", "ALREADY_RECEIVED", () =>
    rewardService.receive({ name: "김테스트", phone: PHONE_A, rewardIds: [second.id, first.id] }),
  );
  const secondAfter = await rewardRepository.findByIdWithProduct(db, second.id);
  check(
    "롤백되어 나머지도 USED 유지",
    secondAfter?.status === REWARD_STATUS.USED,
    `현재 ${secondAfter?.status}`,
  );

  // 남의 리워드 id 를 끼워 넣어도 통과하면 안 됩니다.
  await rewardService.register({ name: "이테스트", phone: PHONE_B, code: c4 });
  const boxB = await rewardService.lookup({ name: "이테스트", phone: PHONE_B });
  await expectError("타인 리워드 지급 거절", "ALREADY_RECEIVED", () =>
    rewardService.receive({ name: "김테스트", phone: PHONE_A, rewardIds: [boxB.pending[0].id] }),
  );
  const bAfter = await rewardRepository.findByIdWithProduct(db, boxB.pending[0].id);
  check("타인 리워드는 USED 유지", bAfter?.status === REWARD_STATUS.USED);

  await expectError("빈 선택 거절", "VALIDATION_ERROR", () =>
    rewardService.receive({ name: "김테스트", phone: PHONE_A, rewardIds: [] }),
  );

  // 5.5 — 이름 복합 대조. 관리자 목록에 성함이 마스킹되어 나가면서 "보고 맞추기" 가
  // 성립하지 않게 됐고, 번호만으로 지급되면 번호를 아는 사람이 남의 경품을 소각할 수 있습니다.
  await expectError("이름 불일치 지급 거절", "NOT_FOUND", () =>
    rewardService.receive({ name: "엉뚱한사람", phone: PHONE_A, rewardIds: [second.id] }),
  );
  const afterMismatch = await rewardRepository.findByIdWithProduct(db, second.id);
  check("이름 불일치는 상태를 바꾸지 않음", afterMismatch?.status === REWARD_STATUS.USED);

  // 공백·대소문자 차이는 흡수합니다 (조회와 같은 규칙).
  const spacedReceipt = await rewardService.receive({
    name: " 김 테스트 ",
    phone: PHONE_A,
    rewardIds: [second.id],
  });
  check("이름 공백 차이는 흡수해 지급", spacedReceipt.receivedCount === 1);

  /* ── 되돌리기 (RECEIVED → USED) ──────────────────────── */
  console.log("\n[되돌리기]");

  await rewardService.revertReceive(first.id);
  const reverted = await rewardRepository.findByIdWithProduct(db, first.id);
  check("RECEIVED → USED 복귀", reverted?.status === REWARD_STATUS.USED);
  check("receivedAt 초기화", reverted?.receivedAt === null);

  await expectError("RECEIVED 아닌 건 되돌리기 거절", "CONFLICT", () =>
    rewardService.revertReceive(first.id),
  );

  /* ── 보안 ─────────────────────────────────────────────── */
  console.log("\n[보안]");

  const stored = await db.user.findUnique({ where: { phoneHash: generatePhoneHash(PHONE_A) } });
  check("전화번호 평문 미저장", stored!.phoneEncrypted !== normalizePhone(PHONE_A));
  check("복호화 왕복 일치", decryptPhone(stored!.phoneEncrypted) === normalizePhone(PHONE_A));
  check("phoneHash 는 원문과 무관", !stored!.phoneHash.includes(normalizePhone(PHONE_A)));

  // 비밀번호 해시·JWT 는 .env 값에 의존하지 않도록 임시 값으로 왕복 검증합니다.
  const savedHash = process.env.ADMIN_PASSWORD_HASH;
  process.env.ADMIN_PASSWORD_HASH = hashPassword("smoke-test-password");
  try {
    const login = adminService.login("smoke-test-password");
    check("관리자 로그인 성공", typeof login.token === "string" && login.token.length > 0);
    check("발급 토큰 검증 통과", verifyAdminToken(login.token).role === "admin");

    let rejected = false;
    try {
      adminService.login("wrong-password");
    } catch (e) {
      rejected = isAppError(e) && e.code === "UNAUTHORIZED";
    }
    check("틀린 비밀번호 거절", rejected);

    let tampered = false;
    try {
      const { token } = signAdminToken();
      verifyAdminToken(token.slice(0, -2) + "xx");
    } catch (e) {
      tampered = isAppError(e) && e.code === "UNAUTHORIZED";
    }
    check("위조 토큰 거절", tampered);
  } finally {
    if (savedHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = savedHash;
  }

  /* ── 집계 ─────────────────────────────────────────────── */
  console.log("\n[집계]");

  const dash = await adminService.getDashboard();
  // 이 테스트가 등록하는 건수: c1, c2, 레이스에서 살아남은 1건, 사용자 B 의 c4 = 4건.
  // 같은 날 다른 등록이 있었다면 그만큼 더 잡힙니다.
  check("오늘 등록 수 집계", dash.todayRegistered >= 4, `${dash.todayRegistered}건`);
  check("재고 행 존재", dash.stock.length > 0, `${dash.stock.length}종`);
  const smokeStock = dash.stock.find((s) => s.productId === "prd_ecobag");
  check("발급 = 미사용+사용+지급", !!smokeStock && smokeStock.issued ===
    smokeStock.unused + smokeStock.used + smokeStock.received);

  await expectError("배치 중복 발급 거절", "CONFLICT", () =>
    adminService.issueCodes({ batch: BATCH, plan: PLAN }),
  );

  const dry = await adminService.issueCodes({ batch: `${BATCH}-dry`, plan: PLAN, dryRun: true });
  const dryStored = await rewardRepository.countByBatch(db, `${BATCH}-dry`);
  check("dry-run 은 저장하지 않음", dry.rows.length === 6 && dryStored === 0);
}

async function cleanup() {
  await db.rewardCode.deleteMany({ where: { batch: BATCH } });
  await db.user.deleteMany({
    where: {
      phoneHash: {
        in: [PHONE_A, PHONE_B, ...RACE_PHONES].map((p) => generatePhoneHash(p)),
      },
    },
  });
}

main()
  .catch((e) => {
    console.error("\n예상치 못한 오류:", e);
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
