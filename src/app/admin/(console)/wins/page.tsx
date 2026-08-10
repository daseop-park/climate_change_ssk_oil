import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";

/**
 * 당첨 내역 · 실물 지급 `/admin/wins` — **5.5** 에서 채웁니다.
 *
 * 조회 전용 콘솔에서 **유일하게 쓰기가 남는 화면**입니다. 현장에서 고객을 앞에 두고
 * 실시간으로 처리해야 해서 CLI 로 대체할 수 없습니다.
 */
export default function AdminWinsPage() {
  return (
    <AdminPage title="당첨 내역" subtitle="이름·전화번호로 조회한 뒤 실물 지급을 처리합니다">
      <AdminPanel className="text-muted-3 p-6 text-[12px] leading-[1.7]">
        조회 → 체크 → 일괄 지급 화면과 당첨 내역 목록은{" "}
        <strong className="text-ink font-bold">5.5</strong> 에서 채웁니다.
      </AdminPanel>
    </AdminPage>
  );
}
