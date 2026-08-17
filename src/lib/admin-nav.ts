/**
 * 관리자 콘솔 내비게이션 정의와 경로 판정.
 *
 * ⚠️ `proxy.ts`(서버)와 사이드바(클라이언트)가 **같이** 씁니다.
 *    서버 전용 모듈(Prisma·node:crypto·next/headers)을 여기서 import 하지 마세요.
 *
 * 메뉴를 한 배열로 모아 두는 이유는 §5 의 무한 리다이렉트 사고를 구조적으로 막기 위해서입니다.
 * 로그인 경로와 보호 대상 경로가 서로 다른 파일에 흩어져 있으면, 한쪽만 고쳤을 때
 * "로그인 페이지가 로그인으로 리다이렉트되는" 상태가 되고 화면은 그냥 멈춘 것처럼 보입니다.
 */

export const ADMIN_ROOT = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

/** 로그인 후 돌아갈 곳을 담는 쿼리 파라미터 이름 */
export const NEXT_PARAM = "next";

export type AdminNavItem = {
  href: string;
  label: string;
  /** 카운트 뱃지에 쓸 값의 출처. 없으면 뱃지를 그리지 않습니다. */
  badge?: "issued" | "wins";
};

/**
 * `OPERATION` 섹션 4개.
 *
 * 핸드오프의 `SYSTEM` 섹션(감사 로그·관리자 계정)은 섹션째 기각했습니다 —
 * 편집이 없으니 감사 대상이 없고, 운영자는 한 명이라 계정 화면이 무의미합니다.
 * (`docs/phase5-admin-estimate.md` §3)
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/codes", label: "발급 이력", badge: "issued" },
  { href: "/admin/prizes", label: "경품 현황" },
  { href: "/admin/wins", label: "당첨 내역", badge: "wins" },
];

/** 관리자 영역인가 — 페이지(`/admin…`)와 API(`/api/admin…`) 를 함께 봅니다. */
export function isAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_ROOT ||
    pathname.startsWith(`${ADMIN_ROOT}/`) ||
    pathname.startsWith("/api/admin")
  );
}

/**
 * `?next=` 값을 안전한 내부 경로로 좁힙니다.
 *
 * 검사하지 않으면 `/admin/login?next=https://evil.example` 한 줄로 open redirect 가 됩니다.
 * 관리자 로그인 화면은 피싱 대상으로 가치가 높아 특히 위험합니다.
 *
 * 통과 조건은 하나 — **`/admin` 으로 시작하는 상대 경로.**
 * `//evil.example` 같은 프로토콜 상대 URL 도 이 조건에서 함께 걸립니다.
 */
export function sanitizeAdminNext(value: string | null | undefined): string {
  if (!value) return ADMIN_ROOT;
  if (!value.startsWith(ADMIN_ROOT)) return ADMIN_ROOT;
  // 로그인 화면으로 되돌려 보내면 로그인 직후 다시 로그인 화면이 뜹니다.
  if (value === ADMIN_LOGIN_PATH || value.startsWith(`${ADMIN_LOGIN_PATH}?`)) return ADMIN_ROOT;
  return value;
}
