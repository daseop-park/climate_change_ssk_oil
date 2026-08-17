/**
 * GET /api/admin/dashboard — 운영 통계
 *
 * "오늘"은 서버 로컬 시간이 아니라 한국 시간 기준입니다 (`src/lib/date.ts`).
 * 재고 수치는 여기에만 실립니다 — 공개 경품 목록(`/api/prizes`)에는 넣지 않습니다.
 */
import { handle, ok } from "@/lib/api-handler";
import { adminService } from "@/services/admin.service";

export function GET() {
  return handle(async () => {
    const data = await adminService.getDashboard();
    return ok(data, "대시보드 통계입니다.");
  });
}
