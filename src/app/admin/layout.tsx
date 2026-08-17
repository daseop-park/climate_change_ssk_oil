import type { Metadata } from "next";

/**
 * 관리자 영역 공통 설정 — 검색 제외 + 항상 최신.
 *
 * 로그인 화면과 콘솔이 함께 이 아래에 들어갑니다. 셸(사이드바)은 여기가 아니라
 * `(console)/layout.tsx` 에 있습니다 — 로그인 화면에는 사이드바가 없어야 하고,
 * 로그인하러 온 사람이 인증 가드에 걸리면 안 되기 때문입니다.
 *
 * ⚠️ Route Group `(app)` 과 달리 여기는 그냥 `admin/` 폴더입니다.
 *    관리자 화면이 전부 `/admin` 아래에 있어서 `(admin)/admin/…` 은 한 겹이 헛돕니다.
 *    견적서가 말한 분리의 핵심 — 루트 `layout.tsx` 에서 `AppShell` 을 걷어내는 것 — 은
 *    `(app)/layout.tsx` 로 이미 끝났습니다.
 */
export const metadata: Metadata = {
  // 운영 데이터를 다루는 화면이라 색인 대상이 아닙니다.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * `revalidate = 300`(핸드오프 제안)은 기각했습니다.
 * 현장에서 지급 처리를 하는 중에 재고가 5분 늦게 보이면 같은 경품을 두 번 꺼내게 됩니다.
 */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-surface min-h-[100dvh]">{children}</div>;
}
