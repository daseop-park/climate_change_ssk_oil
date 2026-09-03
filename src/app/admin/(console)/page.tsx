import AdminKpiCard from "@/components/admin/AdminKpiCard";
import AdminPage from "@/components/admin/AdminPage";
import AdminRecentWinsTable from "@/components/admin/AdminRecentWinsTable";
import AdminStockGauges from "@/components/admin/AdminStockGauges";
import AdminUsageChart from "@/components/admin/AdminUsageChart";
import { formatDateTime } from "@/lib/format-date";
import { adminService } from "@/services/admin.service";

/**
 * 대시보드 `/admin`.
 *
 * 서버 컴포넌트에서 `adminService` 를 직접 부릅니다. proxy 와 콘솔 레이아웃이 이미
 * 인증을 통과시킨 뒤라 `fetch` 로 우리 API 를 한 바퀴 돌 이유가 없습니다.
 * 다만 **아래로 내려가는 것은 전부 DTO** 입니다 — Prisma 생성 타입이 컴포넌트 props 에
 * 실리면 클라이언트 번들이 깨집니다 (Phase 2 에서 겪은 문제).
 *
 * 그리드는 전부 분수(`1fr`·`1.55fr`)입니다. 1440px 을 하드코딩하지 않아 1280px 에서
 * 그대로 접힙니다 (`docs/phase5-admin-estimate.md` §8).
 *
 * 폰에서는 세로로 쌓습니다. 분수 그리드는 폭이 줄면 접히는 것이 아니라 **찌그러져서**,
 * 360px 에서 KPI 카드 한 장이 100px 이 됩니다 — 숫자가 줄바꿈되어 읽을 수 없습니다.
 * 이 화면은 조회 전용이라 여기까지가 T2 대응 범위입니다
 * (`docs/polishing/sdd/sdd-responsive-layout.md` §5-1).
 */
export default async function AdminDashboardPage() {
  const d = await adminService.getDashboard();

  return (
    <AdminPage
      title="대시보드"
      // 핸드오프의 "5분마다 자동 갱신" 은 기각했습니다. 현장에서 지급 처리를 하는 중에
      // 재고가 5분 늦게 보이면 같은 경품을 두 번 꺼냅니다. 매 요청 렌더라 새로고침이 곧 최신입니다.
      subtitle={`${formatDateTime(new Date().toISOString())} 기준 · 새로고침하면 최신`}
    >
      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3">
        <AdminKpiCard
          label="코드 사용률"
          value={`${d.usedRate.toFixed(1)}%`}
          delta={d.todayRegistered > 0 ? `오늘 +${d.todayRegistered}` : undefined}
          ratio={d.usedRate}
          caption={`${d.registered.toLocaleString("ko-KR")} / ${d.issued.toLocaleString("ko-KR")}장`}
        />

        <AdminKpiCard
          label="당첨 건수"
          value={d.registered.toLocaleString("ko-KR")}
          delta={d.todayRegistered > 0 ? `오늘 +${d.todayRegistered}` : undefined}
          ratio={d.usedRate}
          barClass="bg-mint-400"
          caption="코드 1장당 경품 1개 · 전원 당첨"
        />

        {/*
          핸드오프의 세 번째 카드는 "경품 소진"(지급/재고)이었는데, 우리 모델에서 소진을
          재는 값은 곧 코드 사용률이라 1번 카드와 같은 숫자가 됩니다. 대신 현장에서
          실제로 필요한 것 — **아직 안 나간 경품이 몇 개인가** — 를 셋째 칸에 뒀습니다.
        */}
        <AdminKpiCard
          label="경품 지급"
          value={d.totalReceived.toLocaleString("ko-KR")}
          delta={d.todayReceived > 0 ? `오늘 +${d.todayReceived}` : undefined}
          ratio={d.receivedRate}
          barClass="bg-green-800"
          caption={
            d.registered - d.totalReceived > 0
              ? `수령 대기 ${(d.registered - d.totalReceived).toLocaleString("ko-KR")}건`
              : "수령 대기 없음"
          }
          captionTone={d.registered - d.totalReceived > 0 ? "danger" : "muted"}
        />
      </div>

      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[1.55fr_1fr]">
        <AdminUsageChart daily={d.daily} />
        <AdminStockGauges stock={d.stock} />
      </div>

      <AdminRecentWinsTable wins={d.recentWins} />
    </AdminPage>
  );
}
