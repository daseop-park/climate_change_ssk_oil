/**
 * 리워드 코드 배치 발급 (CLI 어댑터).
 *
 *   npm run db:issue -- --batch 2026-demo-01
 *   npm run db:issue -- --batch 2026-demo-01 --out out/codes.csv
 *   npm run db:issue -- --batch 2026-demo-01 --dry-run
 *
 * 발급 규칙(분배 검증·배치 중복 방지·셔플·중복 없는 코드 생성)은 전부
 * `adminService.issueCodes()` 안에 있습니다. 이 파일은 인자를 파싱하고 결과를 출력할 뿐입니다.
 * 관리자 화면의 "리워드 코드 생성"도 같은 함수를 호출합니다.
 *
 * 출력물에는 코드↔상품 매핑이 들어 있으니 저장소에 커밋하지 마세요. (`out/` 은 gitignore 대상)
 */
import fs from "fs";
import path from "path";
import { db } from "../src/lib/db";
import { DEFAULT_PLAN, productById, productName } from "../src/lib/catalog";
import { CODE_SPACE } from "../src/lib/code-generator";
import { isAppError } from "../src/lib/errors";
import { adminService } from "../src/services/admin.service";
import { padEndW, padStartW, percent, truncW } from "./format";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const batch = arg("batch");
  const dryRun = process.argv.includes("--dry-run");
  const outPath = arg("out");

  if (!batch) {
    console.error("사용법: npm run db:issue -- --batch <배치이름> [--out <경로>] [--dry-run]");
    process.exit(1);
  }

  const result = await adminService.issueCodes({ batch, dryRun });

  console.log(`\n배치: ${result.batch}${result.dryRun ? "  (DRY RUN — 저장하지 않음)" : ""}`);
  console.log(`총량: ${result.total}개 · 코드 공간 ${CODE_SPACE.toLocaleString()}조합\n`);
  console.log(padEndW("상품", 34) + padEndW("등급", 8) + padStartW("수량", 6) + padStartW("확률", 9));
  console.log("-".repeat(57));
  for (const [productId, n] of Object.entries(DEFAULT_PLAN)) {
    console.log(
      padEndW(truncW(productName(productId), 32), 34) +
        padEndW(productById(productId)?.rank ?? "", 8) +
        padStartW(String(n), 6) +
        padStartW(percent(n, result.total), 9),
    );
  }

  if (result.dryRun) {
    console.log("\n샘플 5개:");
    result.rows.slice(0, 5).forEach((r) => console.log(`  ${r.rewardCode}  →  ${productName(r.productId)}`));
    await db.$disconnect();
    return;
  }

  console.log(`\n✓ ${result.rows.length}개 발급 완료.`);

  if (outPath) {
    const abs = path.resolve(process.cwd(), outPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    const csv = [
      "rewardCode,product,rank",
      ...result.rows.map(
        (r) => `${r.rewardCode},"${productName(r.productId)}",${productById(r.productId)?.rank ?? ""}`,
      ),
    ].join("\n");
    fs.writeFileSync(abs, csv, "utf8");
    console.log(`✓ ${abs}`);
    console.log("  ⚠️ 이 파일에는 코드↔상품 매핑이 들어 있습니다. 커밋하거나 공유하지 마세요.");
  } else {
    console.log("  코드 목록이 필요하면 --out <경로> 로 CSV를 뽑으세요. (예: --out out/codes.csv)");
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  // 서비스가 던진 도메인 에러는 스택 없이 메시지만 보여줍니다.
  console.error(isAppError(e) ? `\n${e.message}\n` : e);
  await db.$disconnect();
  process.exit(1);
});
