/**
 * 요청 게이트 — 사이트 접근 토큰과 관리자 인증을 함께 처리합니다.
 *
 * ⚠️ 파일 이름이 `middleware.ts` 가 아니라 `proxy.ts` 인 이유:
 *    Next 16 에서 middleware 규칙은 deprecated 이고, 무엇보다 middleware 는 Edge 런타임이라
 *    `jsonwebtoken` 과 node:crypto 를 쓸 수 없습니다. (빌드는 경고만 내고 통과한 뒤 런타임에 터집니다.)
 *    proxy 는 항상 Node.js 런타임에서 돌기 때문에 토큰 검증을 그대로 할 수 있습니다.
 *    그래서 이 파일에는 `runtime` 같은 세그먼트 설정을 넣으면 안 됩니다 — 빌드가 거부합니다.
 *
 * 순서는 **사이트 게이트 → 관리자 인증** 입니다. 게이트는 사이트 전체(관리자 화면 포함)에
 * 걸리고, 관리자 인증은 그 위에 한 겹 더 얹힙니다. 운영자도 노트북에서 QR 링크로 한 번
 * 들어와 쿠키를 받아야 하는데, 이 한 번의 마찰을 감수하고 관리자 경로에 예외를 두지 않는
 * 편을 택했습니다 — 예외 경로는 늘어날수록 빠뜨리기 쉽습니다.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { readAdminToken } from "@/lib/admin-session";
import { ERROR_CODES } from "@/lib/errors";
import {
  GATE_COOKIE,
  GATE_PARAM,
  hasGateCookie,
  isGateEnabled,
  isValidGateToken,
  setGateCookie,
} from "@/lib/site-gate";
import type { ApiFailure } from "@/types/dto";

/**
 * 토큰 없이 통과시켜야 하는 관리자 경로.
 * 로그인은 토큰을 **발급받으러** 오는 곳이라 여기서 막으면 영원히 로그인할 수 없습니다.
 */
const PUBLIC_ADMIN_PATHS = new Set(["/api/admin/login"]);

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function unauthorizedJson(message: string) {
  return NextResponse.json<ApiFailure>(
    { success: false, message, errorCode: ERROR_CODES.UNAUTHORIZED },
    { status: 401 },
  );
}

/**
 * 게이트에 막힌 화면.
 *
 * 404 로 존재 자체를 감출 수도 있지만, 여기까지 온 사람은 이미 URL 을 아는 상태라
 * 감춰서 얻는 것이 적습니다. 대신 팀원이 설정 실수를 유령 버그로 오해하지 않도록
 * 무슨 일이 일어났는지는 알려줍니다. (외부 자원을 참조하지 않는 단일 문서입니다.)
 */
function blockedPage() {
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>접근할 수 없습니다</title></head>
<body style="margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#0E2A1C;color:#fff;font-family:system-ui,-apple-system,sans-serif">
<main style="max-width:340px;padding:32px;text-align:center">
<div style="font-size:10.5px;font-weight:800;letter-spacing:.14em;color:#5FD39A">TEAM 싹싹기름</div>
<h1 style="margin:14px 0 0;font-size:20px;font-weight:800;letter-spacing:-.02em">초대된 참여자만 들어올 수 있어요</h1>
<p style="margin:12px 0 0;font-size:13.5px;line-height:1.7;color:rgba(255,255,255,.72)">
기름 흡수 패드에 인쇄된 QR 코드로 접속해 주세요.<br>현장 운영자에게 문의하셔도 됩니다.
</p></main></body></html>`;

  return new NextResponse(html, {
    status: 403,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/**
 * 사이트 게이트.
 *
 * 반환값이 있으면 그것으로 응답을 끝내고, `null` 이면 다음 단계로 넘어갑니다.
 */
function siteGate(req: NextRequest): NextResponse | null {
  if (!isGateEnabled()) return null;

  try {
    // 1) QR 로 방금 들어온 경우 — 쿠키를 굽고 주소에서 토큰을 지웁니다.
    //    지우지 않으면 주소창·공유 링크·리퍼러에 토큰이 그대로 남습니다.
    const candidate = req.nextUrl.searchParams.get(GATE_PARAM);
    if (candidate !== null) {
      if (!isValidGateToken(candidate)) {
        return isApiPath(req.nextUrl.pathname)
          ? unauthorizedJson("접근 권한이 없습니다.")
          : blockedPage();
      }
      const clean = req.nextUrl.clone();
      clean.searchParams.delete(GATE_PARAM);
      return setGateCookie(NextResponse.redirect(clean));
    }

    // 2) 이미 통과한 경우
    if (hasGateCookie(req.cookies.get(GATE_COOKIE)?.value)) return null;

    return isApiPath(req.nextUrl.pathname)
      ? unauthorizedJson("접근 권한이 없습니다.")
      : blockedPage();
  } catch (e) {
    // 게이트를 켜 달라고 했는데 토큰이 없는 등의 설정 오류입니다.
    // 켜 달라는 요청을 무시하고 열어두는 것보다 막고 로그를 남기는 편이 낫습니다.
    console.error("[proxy] 사이트 게이트 설정 오류:", e);
    return isApiPath(req.nextUrl.pathname)
      ? unauthorizedJson("접근 권한이 없습니다.")
      : blockedPage();
  }
}

export function proxy(req: NextRequest) {
  const blocked = siteGate(req);
  if (blocked) return blocked;

  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/admin") || PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  try {
    verifyAdminToken(readAdminToken(req));
    return NextResponse.next();
  } catch {
    // 만료·위조·부재를 구분하지 않습니다. 구분해 주면 공격자에게 힌트가 됩니다.
    return unauthorizedJson("관리자 인증이 필요합니다.");
  }
}

export const config = {
  /*
   * 정적 자원을 뺀 모든 경로.
   *
   * `_next/*` 와 `public/` 파일까지 게이트에 걸면 차단 화면조차 제대로 못 그리고,
   * 요청 수만큼 토큰 검증이 돌아 낭비입니다. 확장자 목록은 `public/` 에 실제로 두는
   * 형식만 담았습니다 — 새 형식을 추가하면 여기도 함께 고쳐야 합니다.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|txt|xml|woff2?)$).*)",
  ],
};
