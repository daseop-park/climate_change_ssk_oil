/**
 * POST /api/admin/login — 관리자 로그인
 *
 * 이 경로만 proxy 인증에서 제외돼 있습니다 (토큰을 받으러 오는 곳이라
 * 여기서 막으면 영원히 로그인할 수 없습니다 — `src/proxy.ts` 참고).
 *
 * 토큰은 응답 본문이 아니라 **httpOnly 쿠키**로 나갑니다.
 * 본문에 실으면 자바스크립트가 읽을 수 있게 되고, 그러면 XSS 한 번에 털립니다.
 */
import type { NextRequest } from "next/server";
import { handle, ok, parseBody } from "@/lib/api-handler";
import { setAdminCookie } from "@/lib/admin-session";
import { adminLoginSchema } from "@/lib/validation";
import { adminService } from "@/services/admin.service";

export function POST(req: NextRequest) {
  return handle(async () => {
    const { password } = await parseBody(req, adminLoginSchema);
    const session = adminService.login(password);

    const res = ok({ expiresAt: session.expiresAt }, "로그인되었습니다.");
    return setAdminCookie(res, session.token, new Date(session.expiresAt));
  });
}
