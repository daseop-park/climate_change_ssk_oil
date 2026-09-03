import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-nav";
import { adminService } from "@/services/admin.service";

/**
 * 콘솔 셸 — 인증 2차 가드 + 사이드바.
 *
 * `(console)` Route Group 이라 URL 에는 나타나지 않습니다. 이 그룹의 목적은
 * **로그인 화면을 이 레이아웃 밖에 두는 것** 하나입니다 — 여기 들어오면
 * 아래 가드에 걸려 로그인 화면이 로그인 화면으로 무한히 리다이렉트됩니다.
 *
 * ## 폭
 *
 * 원래 셸에 `min-w-[1120px]` 을 걸어 좁으면 **화면 전체**가 가로로 밀렸습니다.
 * 사이드바까지 같이 밀려서 폰에서는 쓸 수가 없었습니다. 그 하한을 걷어내고
 * 가로 스크롤을 **넓은 표 컨테이너로 내렸습니다** — 이제 좁은 화면에서도 헤더와
 * 내비게이션은 제자리에 있고 표만 옆으로 넘어갑니다.
 *
 * `lg:` 미만에서는 사이드바가 상단 바 + 드로어로 바뀌므로 세로로 쌓고(`flex-col`),
 * `lg:` 이상에서만 좌우로 놓습니다(`lg:flex-row`).
 * 내부 그리드는 전부 `fr` 이라 1280px 에서도 그대로 접힙니다
 * (`docs/phase5-admin-estimate.md` §8 · `docs/polishing/sdd/sdd-responsive-layout.md` §5).
 */
export default async function AdminConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy 가 이미 막았어야 하는 요청입니다. 여기서 한 번 더 보는 이유는
  // proxy 가 뚫렸을 때 화면이 멀쩡해 보여서 알아챌 수 없기 때문입니다 (`lib/admin-guard.ts`).
  if (!(await isAdminAuthenticated())) redirect(ADMIN_LOGIN_PATH);

  // 사이드바 뱃지. 클라이언트 컴포넌트가 직접 조회하면 Prisma 타입이 번들로 새어 들어오므로
  // 서버에서 DTO 로 만들어 props 로 내립니다.
  const counts = await adminService.getNavCounts();

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <AdminSidebar counts={counts} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
