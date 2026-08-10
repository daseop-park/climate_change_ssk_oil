import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";
import { formatDateTime } from "@/lib/format-date";
import { adminService } from "@/services/admin.service";

/**
 * 대시보드 `/admin`.
 *
 * 5.1 에서는 셸이 제대로 서는지 확인할 수 있을 만큼만 채웁니다.
 * KPI 카드·일별 사용 추이 차트·경품 잔여 게이지·최근 당첨 테이블은 **5.2** 입니다.
 */
export default async function AdminDashboardPage() {
  const counts = await adminService.getNavCounts();
  const usedRate = counts.issued === 0 ? 0 : (counts.wins / counts.issued) * 100;

  return (
    <AdminPage
      title="대시보드"
      // 핸드오프의 "5분마다 자동 갱신" 은 기각했습니다. `revalidate` 없이 매 요청 렌더하므로
      // 새로고침이 곧 최신입니다 (`admin/layout.tsx` 의 `dynamic = "force-dynamic"`).
      subtitle={`${formatDateTime(new Date().toISOString())} 기준 · 새로고침하면 최신`}
    >
      <AdminPanel className="p-6">
        <h2 className="text-ink m-0 text-[14.5px] font-extrabold tracking-[-.02em]">코드 사용률</h2>
        <div className="mt-[10px] flex items-baseline gap-[7px]">
          <span className="text-ink text-[28px] font-black tracking-[-.03em]">
            {usedRate.toFixed(1)}%
          </span>
          <span className="text-muted-3 text-[11.5px] font-extrabold">
            {counts.wins.toLocaleString("ko-KR")} / {counts.issued.toLocaleString("ko-KR")}장
          </span>
        </div>
        <div className="bg-track mt-[10px] h-[6px] overflow-hidden rounded-[6px]">
          <div className="bg-green-600 h-full" style={{ width: `${usedRate}%` }} />
        </div>
      </AdminPanel>

      <AdminPanel className="text-muted-3 p-6 text-[12px] leading-[1.7]">
        KPI 카드 3장 · 일별 코드 사용 스택 막대(14일) · 경품 잔여 게이지 · 최근 당첨 테이블은
        <strong className="text-ink font-bold"> 5.2</strong> 에서 채웁니다.
      </AdminPanel>
    </AdminPage>
  );
}
