"use client";

import ProductImage from "@/components/prize/ProductImage";
import { useShell } from "./ShellContext";

export default function PrizeSheet() {
  // sheetPrize 는 닫힌 뒤에도 유지되므로 퇴장 애니메이션 동안 내용이 남습니다.
  const { sheetPrize: shown, sheetOpen: open, closeAll } = useShell();

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      className="ssak-scroll absolute right-0 bottom-0 left-0 z-40 max-h-[88%] overflow-y-auto rounded-t-[26px] bg-white shadow-[0_-14px_40px_rgba(23,33,28,.2)]"
      style={{
        transform: open ? "translateY(0)" : "translateY(102%)",
        transition: "transform .34s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {shown && (
        <>
          <div className="mx-auto mt-3 mb-1 h-1 w-[38px] rounded-[3px] bg-[#DBE3DD]" />
          <button
            type="button"
            onClick={closeAll}
            aria-label="닫기"
            tabIndex={open ? undefined : -1}
            /*
              z-10 은 장식이 아닙니다. 아래 `ProductImage` 가 next/image 의 `fill` 때문에
              `relative` 로 렌더되는데, DOM 순서상 이 버튼보다 뒤에 와서 같은
              `z-index:auto` 레벨에서는 이미지가 버튼을 덮습니다. 상품 사진이 없던
              시절에는 플레이스홀더가 위치 지정 없는 div 라 드러나지 않던 문제입니다.
            */
            className="bg-line-2 absolute top-[14px] right-[14px] z-10 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px] border-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <g stroke="#17211C" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </g>
            </svg>
          </button>

          <div className="px-5 pt-2 pb-6">
            <ProductImage
              src={shown.image}
              alt={shown.name}
              hue={shown.hue}
              className="mb-[18px] h-[170px] w-full rounded-[18px]"
              labelClassName="text-[11px]"
              sizes="(max-width: 480px) 92vw, 420px"
            />
            {/* 그리드와 같은 규칙 — 카테고리 · 등급. 확률은 관리자 화면에만 남습니다. */}
            <span className="bg-chip-bg text-green-600 rounded-[7px] px-[9px] py-1 text-[11px] font-bold">
              {shown.category} · {shown.rank}
            </span>
            <h2 className="mt-[11px] mb-0 text-[20px] font-extrabold tracking-[-.02em]">
              {shown.name}
            </h2>
            {shown.description && (
              <p className="text-muted-2 mt-[14px] mb-0 text-[13px] leading-[1.65]">
                {shown.description}
              </p>
            )}
            <div className="bg-surface mt-[18px] flex items-center gap-[9px] rounded-[14px] px-4 py-[14px]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" stroke="#1E8E5A" strokeWidth="1.8" />
                <path d="M12 8v5" stroke="#1E8E5A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.1" fill="#1E8E5A" />
              </svg>
              <span className="text-muted-2 text-[12px] leading-[1.5]">
                패드 코드를 입력하면 이 경품에 자동 응모됩니다.
              </span>
            </div>
            <button
              type="button"
              onClick={closeAll}
              tabIndex={open ? undefined : -1}
              className="bg-green-600 mt-4 h-[54px] w-full cursor-pointer rounded-[15px] border-none text-[16px] font-extrabold text-white shadow-[0_8px_18px_rgba(30,142,90,.3)] active:scale-[.98]"
            >
              코드 입력하러 가기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
