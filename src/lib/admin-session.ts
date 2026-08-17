/**
 * 관리자 세션 쿠키.
 *
 * JWT 를 Authorization 헤더가 아니라 **httpOnly 쿠키**로 나릅니다.
 * 관리자 화면이 서버 컴포넌트로 렌더링되면 페이지 이동에는 헤더를 실을 수 없고,
 * 자바스크립트로 읽을 수 있는 저장소(localStorage)에 토큰을 두면 XSS 한 번에 털립니다.
 *
 * 쿠키로 옮기면 CSRF 가 따라오는데, `SameSite=Strict` 로 막습니다 —
 * 다른 사이트에서 시작된 요청에는 이 쿠키가 아예 붙지 않습니다.
 */
import type { NextRequest, NextResponse } from "next/server";
import { AppError, ERROR_CODES } from "./errors";

export const ADMIN_COOKIE = "admin_session";

type CookieOptions = {
  httpOnly: true;
  sameSite: "strict";
  secure: boolean;
  path: string;
  expires?: Date;
  maxAge?: number;
};

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "strict",
    // 로컬 개발은 http 라 secure 를 켜면 쿠키가 저장되지 않습니다.
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

/** 로그인 응답에 세션 쿠키를 굽습니다. */
export function setAdminCookie(res: NextResponse, token: string, expiresAt: Date): NextResponse {
  res.cookies.set(ADMIN_COOKIE, token, { ...baseOptions(), expires: expiresAt });
  return res;
}

/** 로그아웃 — 만료시켜 지웁니다. */
export function clearAdminCookie(res: NextResponse): NextResponse {
  res.cookies.set(ADMIN_COOKIE, "", { ...baseOptions(), maxAge: 0 });
  return res;
}

/**
 * 요청에서 관리자 토큰을 꺼냅니다. 없으면 UNAUTHORIZED.
 * 토큰의 유효성(서명·만료) 검증은 `verifyAdminToken` 이 합니다.
 */
export function readAdminToken(req: NextRequest): string {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) throw new AppError(ERROR_CODES.UNAUTHORIZED);
  return token;
}
