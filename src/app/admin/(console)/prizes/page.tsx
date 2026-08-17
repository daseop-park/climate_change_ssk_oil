import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";
import { TableEmpty, Td, Th, Tr } from "@/components/admin/AdminTable";
import { imgFor } from "@/lib/product-image";
import { adminService } from "@/services/admin.service";

/**
 * 경품 현황 `/admin/prizes` — **전부 읽기 전용**.
 *
 * 핸드오프 1c 의 가중치 입력 · 노출 토글 · "변경사항 저장" 버튼은 전부 없습니다.
 * 사전 배정 모델에서는 확률이 **이미 발급된 코드 분포에 확정되어 박혀** 있어서,
 * 가중치를 고쳐도 바뀌는 것이 없습니다. 다음 배치의 분배는 발급할 때
 * (`npm run db:issue`) 정합니다. 노출 제어는 백엔드의 `deletedAt` 이 대신합니다.
 *
 * 확률 변경 감사 로그 경고 배너도 함께 사라졌습니다 — 변경할 수 있는 것이 없으니
 * 로그로 남길 사건도 없습니다.
 */
export default async function AdminPrizesPage() {
  const prizes = await adminService.listPrizeStatus();
  const totalIssued = prizes.reduce((sum, p) => sum + p.issued, 0);
  const totalUnused = prizes.reduce((sum, p) => sum + p.unused, 0);

  return (
    <AdminPage
      title="경품 현황"
      subtitle="발급 비율에서 계산한 확률과 잔여 · 편집은 CLI 에서 합니다"
    >
      <AdminPanel className="overflow-hidden">
        <div className="text-ink px-[22px] pt-[18px] pb-[14px] text-[15px] font-extrabold tracking-[-.02em]">
          경품 목록
        </div>

        {prizes.length === 0 ? (
          <TableEmpty>
            등록된 경품이 없습니다. <code className="font-mono">npm run db:seed</code> 로
            시드하세요.
          </TableEmpty>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th edge="start">경품</Th>
                  <Th numeric>발급</Th>
                  <Th numeric>확률</Th>
                  <Th numeric edge="end">
                    잔여
                  </Th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((p) => (
                  <Tr key={p.productId}>
                    <Td edge="start">
                      <div className="flex items-center gap-[11px]">
                        {/*
                          34×34 썸네일. 상품 사진이 없으면 `hue` 기반 스트라이프로 떨어집니다 —
                          공개 화면의 `ProductImage` 와 같은 폴백이지만, 여기서는 34px 고정이라
                          next/image 를 끼울 이득이 없어 배경 스타일만 씁니다.
                        */}
                        <div
                          className="h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-[9px] bg-cover bg-center"
                          style={
                            p.image
                              ? { backgroundImage: `url(${p.image})`, backgroundSize: "contain" }
                              : imgFor(p.hue)
                          }
                          aria-hidden
                        />
                        <div className="flex min-w-0 flex-col gap-[2px]">
                          <span className="text-ink truncate text-[12.5px] font-bold">
                            {p.name}
                          </span>
                          <span className="text-muted-3 text-[10.5px] font-bold">
                            {p.rank} · {p.category}
                          </span>
                        </div>
                      </div>
                    </Td>
                    <Td numeric className="text-muted">
                      {p.issued.toLocaleString("ko-KR")}
                    </Td>
                    {/* 파생값이라 입력이 아닙니다. 저장된 컬럼과 집계를 동시에 두면 반드시 어긋납니다. */}
                    <Td numeric className="text-ink font-bold">
                      {p.oddsLabel ?? "-"}
                    </Td>
                    <Td numeric edge="end" className="text-ink font-extrabold">
                      {p.unused.toLocaleString("ko-KR")}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>

            {/*
              핸드오프 푸터의 "가중치 합계 160" 은 우리에게 없는 값입니다.
              대신 실제로 의미가 있는 **발급 합계**를 놓고, 저장 버튼 자리는 비웁니다.
            */}
            <div className="border-line bg-surface flex items-center justify-between border-t px-[22px] py-[14px]">
              <span className="text-muted text-[12px] font-bold">
                발급 합계 <strong className="text-ink font-mono">{totalIssued}</strong> · 잔여{" "}
                <strong className="text-ink font-mono">{totalUnused}</strong> · 전원 당첨 (미당첨
                없음)
              </span>
              <span className="text-muted-3 text-[11.5px] font-semibold">
                확률은 발급 비율에서 계산한 파생값입니다
              </span>
            </div>
          </>
        )}
      </AdminPanel>

      <div className="border-line bg-surface flex gap-[11px] rounded-[11px] border px-[15px] py-[13px]">
        <span className="text-green-600 flex-shrink-0 text-[11.5px] font-black">i</span>
        <div className="text-muted text-[11.5px] leading-[1.6]">
          <p className="m-0">
            <strong className="text-ink">확률은 이 화면에만 있습니다.</strong> 사용자 화면에는
            등급만 보이고 발급 비율은 나가지 않습니다 — 배치 구성비를 공개하는 것과 같기
            때문입니다.
          </p>
          <p className="m-0 mt-[3px]">
            경품 추가·수정은 <code className="text-ink font-mono font-bold">src/lib/catalog.ts</code>{" "}
            를 고치고 <code className="text-ink font-mono font-bold">npm run db:seed</code> 로
            반영합니다. 이미 코드가 발급된 상품은 삭제할 수 없습니다.
          </p>
        </div>
      </div>
    </AdminPage>
  );
}
