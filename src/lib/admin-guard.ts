/**
 * 서버 컴포넌트용 관리자 인증 확인 — **2차 가드**.
 *
 * 1차는 `src/proxy.ts` 입니다. 그쪽이 렌더 이전에 막아 주므로 여기까지 오는 요청은
 * 이미 통과한 것이어야 합니다. 그럼에도 한 겹 더 두는 이유는 proxy 가 **단일 실패점**이기
 * 때문입니다 — matcher 정규식의 오타 하나로 관리자 화면 전체가 무방비가 되는데,
 * 화면은 아무 이상 없이 잘 그려져서 **눈으로는 알아챌 수 없습니다.**
 *
 * ⚠️ `next/headers` 를 쓰므로 서버 컴포넌트·라우트 핸들러에서만 부를 수 있습니다.
 */
import { cookies } from "next/headers";
import { verifyAdminToken } from "./admin-auth";
import { ADMIN_COOKIE } from "./admin-session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  try {
    verifyAdminToken(token);
    return true;
  } catch {
    // 만료·위조·서명 불일치를 구분하지 않습니다. 어느 쪽이든 결과는 로그인 화면입니다.
    return false;
  }
}
