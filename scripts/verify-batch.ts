/**
 * 발급된 배치를 검증합니다. 발급 품질 점검용 QA 도구입니다.
 *
 *   npm run db:verify
 *   npm run db:verify -- --batch 2026-demo-01
 */
import { db } from "../src/lib/db";
import { DEFAULT_PLAN } from "../src/lib/catalog";
import { rewardRepository } from "../src/repositories/reward.repository";
import { REWARD_STATUS } from "../src/types/reward";

const CODE_PATTERN = /^[A-HJ-NP-Z]{3}-[2-9]{3}$/;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

let failed = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
}

async function main() {
  const batch = arg("batch");
  const codes = await rewardRepository.findByBatch(db, batch);

  if (codes.length === 0) {
    console.error("검증할 코드가 없습니다. 먼저 'npm run db:issue -- --batch <이름>' 을 실행하세요.");
    process.exit(1);
  }

  console.log(`\n검증 대상: ${batch ?? "전체"} · ${codes.length}개\n`);

  // 1) 코드 고유성
  const unique = new Set(codes.map((c) => c.rewardCode));
  check("코드 중복 없음", unique.size === codes.length, `고유 ${unique.size}/${codes.length}`);

  // 2) 형식 — 영문 3(I·O 제외) + 숫자 3(0·1 제외)
  const badFormat = codes.filter((c) => !CODE_PATTERN.test(c.rewardCode));
  check("형식 준수", badFormat.length === 0, badFormat.slice(0, 3).map((c) => c.rewardCode).join(", "));

  // 3) 초기 상태 — 이미 사용된 배치를 검증하면 여기서 걸립니다(정상)
  const notUnused = codes.filter((c) => c.status !== REWARD_STATUS.UNUSED || c.userId !== null);
  check("초기 상태 UNUSED · 미할당", notUnused.length === 0, `위반 ${notUnused.length}건`);

  // 4) 분배 일치 (배치를 지정했을 때만)
  if (batch) {
    const actual: Record<string, number> = {};
    for (const c of codes) actual[c.productId] = (actual[c.productId] ?? 0) + 1;
    const mismatched = Object.entries(DEFAULT_PLAN).filter(([id, n]) => actual[id] !== n);
    check(
      "분배 계획과 일치",
      mismatched.length === 0,
      mismatched.map(([id, n]) => `${id} 계획${n}/실제${actual[id] ?? 0}`).join(", "),
    );
  }

  // 5) 셔플 — 같은 상품이 연속으로 몰려 있지 않은지.
  //    셔플에 실패하면 발급 순서대로 인쇄했을 때 상자 앞쪽이 전부 같은 경품이 됩니다.
  let maxRun = 1;
  let run = 1;
  for (let i = 1; i < codes.length; i++) {
    run = codes[i].productId === codes[i - 1].productId ? run + 1 : 1;
    maxRun = Math.max(maxRun, run);
  }
  // 40%짜리 경품이 있으므로 우연히 4~5연속은 정상입니다. 10연속이면 셔플이 안 된 것입니다.
  check("셔플됨 (동일 경품 연속 < 10)", maxRun < 10, `최대 연속 ${maxRun}회`);

  console.log(failed === 0 ? "\n전체 통과 ✅\n" : `\n${failed}건 실패 ❌\n`);
  await db.$disconnect();
  if (failed) process.exit(1);
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
