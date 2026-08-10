import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";

/**
 * 경품 현황 `/admin/prizes` — **5.4** 에서 채웁니다.
 *
 * 핸드오프 1c 의 가중치 입력·노출 토글·저장 버튼은 전부 기각했습니다.
 * 사전 배정 모델이라 확률은 이미 발급된 코드 분포에 확정되어 있어, 가중치를 편집해도
 * 바뀌는 것이 없습니다. 남는 것은 **발급 비율에서 파생한 읽기 전용 확률과 잔여**입니다.
 */
export default function AdminPrizesPage() {
  return (
    <AdminPage title="경품 현황" subtitle="발급 비율에서 파생한 확률과 잔여 (읽기 전용)">
      <AdminPanel className="text-muted-3 p-6 text-[12px] leading-[1.7]">
        썸네일 · 파생 확률 · 잔여 테이블과 푸터 바는{" "}
        <strong className="text-ink font-bold">5.4</strong> 에서 채웁니다.
      </AdminPanel>
    </AdminPage>
  );
}
