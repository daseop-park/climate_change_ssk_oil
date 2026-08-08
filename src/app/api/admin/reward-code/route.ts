/**
 * GET  /api/admin/reward-code — 발급된 배치 목록
 * POST /api/admin/reward-code — 배치 발급
 *
 * 발급 규칙(분배 검증·배치 중복 방지·셔플·중복 없는 코드 생성)은 `adminService.issueCodes()`
 * 안에 있고, CLI(`npm run db:issue`)도 같은 함수를 호출합니다.
 *
 * ⚠️ 응답에는 코드↔상품 매핑이 들어 있습니다. 어떤 코드가 1등인지 그대로 드러나므로
 *    이 응답을 로그로 남기거나 공유하지 마세요. (그래서 관리자 전용입니다.)
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { issueCodesSchema } from "@/lib/validation";
import { adminService } from "@/services/admin.service";

export function GET() {
  return handle(async () => {
    const batches = await adminService.listBatches();
    const data = batches.map((b) => ({ batch: b.batch, count: b._count._all }));
    return ok(data, "발급 배치 목록입니다.");
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, issueCodesSchema);
    const data = await adminService.issueCodes(input);
    return ok(
      data,
      data.dryRun
        ? `${data.total}개 발급 예정입니다. (저장하지 않음)`
        : `${data.rows.length}개를 발급했습니다.`,
      { status: data.dryRun ? 200 : 201 },
    );
  });
}
