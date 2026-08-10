import Link from "next/link";
import type { StockRowDto } from "@/types/dto";

/**
 * 경품별 잔여 게이지.
 *
 * 핸드오프의 **소진 경고 박스와 잔여 임계 색(`#C0492E`)은 뺐습니다.** 사전 배정 모델에서는
 * 한 상품의 코드가 다 나가도 "추첨 대상에서 제외" 같은 일이 벌어지지 않습니다 —
 * 남은 코드가 없을 뿐이라 자연히 끝납니다. 경고할 사건 자체가 없습니다.
 * (`docs/phase5-admin-estimate.md` §3)
 */
export default function AdminStockGauges({ stock }: { stock: StockRowDto[] }) {
  return (
    <div className="border-line flex flex-col gap-[14px] rounded-[14px] border bg-white px-[22px] pt-5 pb-[22px]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-ink m-0 text-[14.5px] font-extrabold tracking-[-.02em]">경품 잔여</h3>
        <Link href="/admin/prizes" className="text-green-600 text-[11.5px] font-bold">
          전체 보기
        </Link>
      </div>

      {stock.length === 0 ? (
        <p className="text-muted-3 m-0 text-[12px] font-semibold">등록된 경품이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-[13px]">
          {stock.map((s) => {
            const ratio = s.issued === 0 ? 0 : (s.unused / s.issued) * 100;
            return (
              <div key={s.productId} className="flex flex-col gap-[7px]">
                <div className="flex items-baseline justify-between gap-3">
                  {/* 1280px 에서 긴 경품명이 수치를 밀어내지 않도록 자릅니다. */}
                  <span className="text-ink truncate text-[12.5px] font-bold">{s.name}</span>
                  <span className="text-muted flex-shrink-0 font-mono text-[11.5px] font-extrabold">
                    {s.unused} / {s.issued}
                  </span>
                </div>
                <div className="bg-track h-[7px] overflow-hidden rounded-[7px]">
                  <div className="bg-green-600 h-full" style={{ width: `${ratio}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
