/**
 * POST /api/admin/logout — 관리자 로그아웃
 *
 * 세션 쿠키를 만료시킵니다. JWT 자체는 서버가 상태를 들고 있지 않아
 * 남은 유효기간 동안 유효하지만, 쿠키가 사라지면 브라우저가 더 이상 실어 보내지 않습니다.
 * (토큰 즉시 무효화가 필요해지면 서버에 폐기 목록을 둬야 합니다.)
 */
import { handle, ok } from "@/lib/api-handler";
import { clearAdminCookie } from "@/lib/admin-session";

export function POST() {
  return handle(async () => {
    return clearAdminCookie(ok(null, "로그아웃되었습니다."));
  });
}
