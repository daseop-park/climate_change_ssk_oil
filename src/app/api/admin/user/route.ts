/**
 * GET /api/admin/user — 사용자 조회
 *
 *   ?phone=01012345678  단건 조회 (전화번호로 검색)
 *   (없으면)            최근 가입순 목록
 *
 * ⚠️ 응답의 `phone` 은 **복호화된 전화번호**입니다. 관리자 전용 경로에서만 쓰세요.
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseQuery } from "@/lib/api-handler";
import { adminUserQuerySchema } from "@/lib/validation";
import { userService } from "@/services/user.service";

const DEFAULT_TAKE = 50;
const MAX_TAKE = 200;

export function GET(req: NextRequest) {
  return handle(async () => {
    const params = req.nextUrl.searchParams;

    if (params.get("phone")) {
      const { phone } = parseQuery(req, adminUserQuerySchema);
      const data = await userService.findForAdminByPhone(phone);
      return ok([data], "사용자를 찾았습니다.");
    }

    const take = Math.min(Number(params.get("take")) || DEFAULT_TAKE, MAX_TAKE);
    const skip = Math.max(Number(params.get("skip")) || 0, 0);
    const data = await userService.listForAdmin({ skip, take });
    return ok(data, "사용자 목록입니다.");
  });
}
