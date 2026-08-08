/**
 * GET  /api/admin/product — 상품 목록 (`?includeDeleted=1` 이면 삭제분 포함)
 * POST /api/admin/product — 상품 등록
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { createProductSchema } from "@/lib/validation";
import { adminService } from "@/services/admin.service";

export function GET(req: NextRequest) {
  return handle(async () => {
    const includeDeleted = req.nextUrl.searchParams.get("includeDeleted") === "1";
    const data = await adminService.listProducts(includeDeleted);
    return ok(data, "상품 목록입니다.");
  });
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, createProductSchema);
    const data = await adminService.createProduct(input);
    return ok(data, `'${data.name}' 을(를) 등록했습니다.`, { status: 201 });
  });
}
