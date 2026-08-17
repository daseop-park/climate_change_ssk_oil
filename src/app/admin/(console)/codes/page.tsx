import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";
import { TableEmpty, Td, Th, Tr } from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/format-date";
import { adminService } from "@/services/admin.service";

/**
 * 발급 이력 `/admin/codes`.
 *
 * 핸드오프 1b 의 **"새 배치 발급" 폼은 없습니다.** 발급은 CLI(`npm run db:issue`)가
 * `adminService.issueCodes()` 를 그대로 호출하므로 화면을 한 벌 더 만들 이유가 없고,
 * 무엇보다 발급 응답에는 **코드↔상품 매핑**이 실립니다 — 어떤 코드가 1등인지 그대로
 * 드러나는 값이라, 브라우저를 거치는 경로를 늘리지 않는 편이 낫습니다.
 *
 * 그래서 이 화면에 남는 것은 **이력 테이블 하나**입니다 (조회 전용 원칙).
 */
export default async function AdminCodesPage() {
  const batches = await adminService.listBatches();
  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  const totalUsed = batches.reduce((sum, b) => sum + b.used, 0);

  return (
    <AdminPage
      title="발급 이력"
      subtitle={
        batches.length === 0
          ? "아직 발급된 배치가 없습니다"
          : `배치 ${batches.length}개 · 발급 ${totalQuantity.toLocaleString("ko-KR")}장 · 사용 ${totalUsed.toLocaleString("ko-KR")}장`
      }
    >
      <AdminPanel className="overflow-hidden">
        <div className="text-ink px-[22px] pt-4 pb-3 text-[14.5px] font-extrabold tracking-[-.02em]">
          배치 목록
        </div>

        {batches.length === 0 ? (
          <TableEmpty>
            발급된 배치가 없습니다. <code className="font-mono">npm run db:issue</code> 로 발급하세요.
          </TableEmpty>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th edge="start">배치</Th>
                <Th numeric>수량</Th>
                <Th numeric>사용</Th>
                <Th numeric>잔여</Th>
                <Th>발급일</Th>
                <Th edge="end">상태</Th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                // 상태는 저장된 값이 아니라 파생입니다. 유효 기간 컬럼이 없으므로
                // "만료"라는 상태는 존재할 수 없고, 남은 코드가 없으면 자연히 끝납니다.
                const depleted = b.unused === 0;
                return (
                  <Tr key={b.batch}>
                    <Td edge="start" className="text-ink font-bold">
                      {b.batch}
                    </Td>
                    <Td numeric className="text-muted">
                      {b.quantity.toLocaleString("ko-KR")}
                    </Td>
                    <Td numeric className="text-muted">
                      {b.used.toLocaleString("ko-KR")}
                    </Td>
                    <Td numeric className="text-ink font-bold">
                      {b.unused.toLocaleString("ko-KR")}
                    </Td>
                    <Td className="text-muted">{formatDate(b.issuedAt)}</Td>
                    <Td edge="end">
                      <span
                        className={`rounded-[20px] px-[9px] py-1 text-[10.5px] font-extrabold ${
                          depleted ? "text-muted-3 bg-line-2" : "text-green-600 bg-chip-bg"
                        }`}
                      >
                        {depleted ? "소진" : "진행 중"}
                      </span>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AdminPanel>

      {/*
        조회 전용 콘솔이라 화면에서 할 수 있는 일이 없습니다. 현장에서 배치를 더 뿌려야
        할 때 무엇을 쳐야 하는지 여기 적어 둡니다 — 터미널 앞에서 명령을 기억해 내는
        것보다 화면에 있는 편이 낫습니다.
      */}
      <div className="border-line bg-surface flex gap-[11px] rounded-[11px] border px-[15px] py-[13px]">
        <span className="text-green-600 flex-shrink-0 text-[11.5px] font-black">i</span>
        <div className="text-muted text-[11.5px] leading-[1.6]">
          <p className="m-0">
            코드 발급은 터미널에서 합니다 —{" "}
            <code className="text-ink font-mono font-bold">
              npm run db:issue -- --batch &lt;이름&gt;
            </code>
          </p>
          <p className="m-0 mt-[3px]">
            배치 이름은 중복될 수 없고, 발급은 멱등하지 않습니다. 발급 결과에는 코드↔상품
            매핑이 들어 있으니 로그나 메신저로 공유하지 마세요.
          </p>
        </div>
      </div>
    </AdminPage>
  );
}
