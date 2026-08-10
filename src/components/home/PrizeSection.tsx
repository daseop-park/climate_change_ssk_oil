"use client";

import ProductImage from "@/components/prize/ProductImage";
import { useShell } from "@/components/shell/ShellContext";

/** PRIZE — 당첨 가능 경품. 목록·확률 모두 서버(`GET /api/prizes`)에서 옵니다. */
export default function PrizeSection() {
  const { prizes, prizesLoading, openSheet } = useShell();

  return (
    <section className="mt-[26px] border-t border-[rgba(230,236,231,.55)] bg-white/40 px-4 pt-[26px] pb-8">
      <div className="border-line mx-[2px] mb-4 flex items-baseline justify-between border-b pb-[13px]">
        <div>
          <div className="text-green-600 text-[10.5px] font-extrabold tracking-[.14em]">
            REWARDS
          </div>
          <h2 className="mt-[6px] mb-0 text-[21px] font-extrabold tracking-[-.03em]">
            당첨 가능 경품
          </h2>
        </div>
        {prizes.length > 0 && (
          <span className="text-muted-3 text-[11.5px] font-bold">총 {prizes.length}종</span>
        )}
      </div>

      {prizesLoading ? (
        <PrizeGridSkeleton />
      ) : prizes.length === 0 ? (
        <div className="rounded-[14px] border border-[rgba(230,236,231,.62)] bg-white/50 px-5 py-[34px] text-center">
          <div className="text-muted-3 text-[13px] leading-[1.6]">
            경품 정보를 불러오지 못했어요.
            <br />
            잠시 후 다시 시도해 주세요.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {prizes.map((r) => (
            <div
              key={r.id}
              className="relative overflow-hidden rounded-[14px] border border-[rgba(230,236,231,.62)] bg-white/50"
            >
              <button
                type="button"
                onClick={() => openSheet(r.id)}
                aria-label={`${r.name} 자세히 보기`}
                className="absolute top-2 right-2 z-[2] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg border-none bg-white/94 active:scale-90"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <g stroke="#17211C" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <line x1="6" y1="12" x2="18" y2="12" />
                  </g>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => openSheet(r.id)}
                className="block w-full cursor-pointer border-none bg-transparent p-0 text-left"
              >
                <ProductImage
                  src={r.image}
                  alt={r.name}
                  hue={r.hue}
                  className="h-24 w-full"
                  sizes="(max-width: 480px) 45vw, 200px"
                />
                <div className="px-3 pt-3 pb-[14px]">
                  {/*
                    등급을 카테고리 칩에 **붙여서** 넣습니다. 칩을 하나 더 두면
                    카드가 좁아 답답해지고, 확률이 있던 자리를 비우면 카드 높이가
                    들쭉날쭉해집니다. 되돌리려면 이 한 줄만 나누면 됩니다.
                  */}
                  <span className="text-green-600 text-[9.5px] font-extrabold tracking-[.08em]">
                    {r.category} · {r.rank}
                  </span>
                  <div className="mt-[7px] min-h-9 text-[13px] leading-[1.4] font-bold tracking-[-.01em]">
                    {r.name}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** 실제 카드와 같은 높이로 잡아 로딩이 끝날 때 화면이 튀지 않게 합니다. */
function PrizeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[14px] border border-[rgba(230,236,231,.62)] bg-white/50"
        >
          <div className="ssak-shimmer h-24 bg-[#EEF3EF]" />
          <div className="px-3 pt-3 pb-[14px]">
            <div className="ssak-shimmer h-[9px] w-10 rounded bg-[#EEF3EF]" />
            <div className="ssak-shimmer mt-[9px] h-[13px] w-full rounded bg-[#EEF3EF]" />
            <div className="ssak-shimmer mt-[6px] h-[13px] w-3/5 rounded bg-[#EEF3EF]" />
          </div>
        </div>
      ))}
    </div>
  );
}
