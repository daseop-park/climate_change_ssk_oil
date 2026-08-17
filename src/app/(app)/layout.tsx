import AppShell from "@/components/shell/AppShell";

/**
 * 사용자 화면 셸.
 *
 * 홈·마이페이지·About·팁·문의가 전부 이 안에 들어갑니다. 관리자 콘솔(`/admin`)은
 * 이 그룹 밖이라 모바일 폭 고정과 인트로 애니메이션의 영향을 받지 않습니다.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
