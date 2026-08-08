/**
 * 경품 6종을 DB에 심습니다. 고정 id 로 upsert 하므로 여러 번 실행해도 안전합니다.
 *
 *   npm run db:seed
 *
 * 실제 로직은 `adminService.seedProducts()` 에 있습니다.
 * 이 파일은 실행하고 결과를 찍기만 합니다.
 */
import { db } from "../src/lib/db";
import { PRODUCTS } from "../src/lib/catalog";
import { adminService } from "../src/services/admin.service";

async function main() {
  const total = await adminService.seedProducts();

  for (const p of PRODUCTS) {
    console.log(`  ✓ ${p.rank.padEnd(4)} ${p.name}`);
  }
  console.log(`\n상품 ${total}종 준비 완료.`);

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
