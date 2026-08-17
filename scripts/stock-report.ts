/**
 * 상품별 재고 현황. 재고는 저장된 카운터가 아니라 reward_codes 를 **세어서** 만듭니다.
 * 관리자 Dashboard 와 같은 집계 함수(`adminService.getStock`)를 씁니다.
 *
 *   npm run db:stock
 */
import { db } from "../src/lib/db";
import { adminService } from "../src/services/admin.service";
import { padEndW, padStartW, percent, truncW } from "./format";

async function main() {
  const rows = await adminService.getStock();
  const totalIssued = rows.reduce((a, r) => a + r.issued, 0);

  console.log(
    "\n" +
      padEndW("상품", 34) +
      padEndW("등급", 8) +
      padStartW("발급", 6) +
      padStartW("미사용", 8) +
      padStartW("사용", 6) +
      padStartW("지급", 6) +
      padStartW("확률", 9),
  );
  console.log("-".repeat(77));
  for (const r of rows) {
    console.log(
      padEndW(truncW(r.name, 32), 34) +
        padEndW(r.rank, 8) +
        padStartW(String(r.issued), 6) +
        padStartW(String(r.unused), 8) +
        padStartW(String(r.used), 6) +
        padStartW(String(r.received), 6) +
        padStartW(percent(r.issued, totalIssued), 9),
    );
  }
  console.log("-".repeat(77));
  console.log(
    padEndW("합계", 42) +
      padStartW(String(totalIssued), 6) +
      padStartW(String(rows.reduce((a, r) => a + r.unused, 0)), 8) +
      padStartW(String(rows.reduce((a, r) => a + r.used, 0)), 6) +
      padStartW(String(rows.reduce((a, r) => a + r.received, 0)), 6),
  );

  const batches = await adminService.listBatches();
  console.log("\n배치: " + (batches.map((b) => `${b.batch}(${b.quantity})`).join(", ") || "없음"));

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
