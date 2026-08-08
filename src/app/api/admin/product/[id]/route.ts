/**
 * PATCH  /api/admin/product/[id] — 상품 수정
 * DELETE /api/admin/product/[id] — 상품 삭제 (soft delete)
 * POST   /api/admin/product/[id] — 삭제 취소(복구)
 *
 * 물리 삭제는 하지 않습니다. 이미 발급된 reward_codes 가 상품을 참조하고 있어서,
 * 행을 지우면 과거 지급 내역을 조회할 수 없게 됩니다.
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { updateProductSchema } from "@/lib/validation";
import { adminService } from "@/services/admin.service";

type Params = { params: Promise<{ id: string }> };

export function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    const input = await parseBody(req, updateProductSchema);
    const data = await adminService.updateProduct(id, input);
    return ok(data, "상품 정보를 수정했습니다.");
  });
}

export function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    await adminService.deleteProduct(id);
    return ok(null, "상품을 삭제했습니다. (발급된 코드의 참조는 유지됩니다)");
  });
}

export function POST(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const { id } = await params;
    await adminService.restoreProduct(id);
    return ok(null, "상품을 복구했습니다.");
  });
}
