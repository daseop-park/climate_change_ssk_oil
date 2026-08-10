import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";

/**
 * 발급 이력 `/admin/codes` — **5.3** 에서 채웁니다.
 *
 * 핸드오프 1b 의 "새 배치 발급" 폼은 여기 오지 않습니다. 코드 발급은 CLI
 * (`npm run db:issue`)가 같은 서비스를 호출하므로 화면을 한 벌 더 만들 이유가 없고,
 * 조회 전용 원칙에도 맞습니다. 이 화면에는 **이력 테이블만** 남습니다.
 */
export default function AdminCodesPage() {
  return (
    <AdminPage title="발급 이력" subtitle="배치별 발급 수량과 사용 현황">
      <AdminPanel className="text-muted-3 p-6 text-[12px] leading-[1.7]">
        배치 / 수량 / 사용 / 발급일 / 상태 테이블은 <strong className="text-ink font-bold">5.3</strong>{" "}
        에서 채웁니다. 코드 발급 자체는 <code className="font-mono">npm run db:issue</code> 로 합니다.
      </AdminPanel>
    </AdminPage>
  );
}
