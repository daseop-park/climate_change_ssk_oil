"use client";

import ProductImage from "@/components/prize/ProductImage";
import { useDialog } from "@/hooks/useDialog";
import { useShell } from "./ShellContext";

const CONFETTI_COLORS = ["#5FD39A", "#1E8E5A", "#FFD666", "#FF8A5C", "#7CC4FF"];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-[-10px] top-[-30px] bottom-0 z-0 overflow-hidden">
      {Array.from({ length: 26 }).map((_, i) => {
        const size = 6 + (i % 3) * 3;
        return (
          <span
            key={i}
            className="ssak-confetti absolute rounded-[2px]"
            style={{
              top: "-10px",
              left: `${(i * 37) % 100}%`,
              width: `${size}px`,
              height: `${size + 3}px`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              opacity: 0,
              animation: `ssakFall ${1.4 + (i % 5) * 0.25}s linear ${
                (i % 8) * 0.12
              }s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function RevealModal() {
  const { phase, result, revealCodeLabel, closeReveal } = useShell();

  // 꽝이 없습니다 — 상품은 코드 발급 시점에 이미 배정돼 있어서, 등록이 성공하면 곧 당첨입니다.
  // (실패는 예외로 처리되어 여기까지 오지 않고 토스트로 나갑니다.)
  const on = phase === "revealing" || phase === "result";

  /*
    ESC 를 `result` 에서만 받습니다.

    `revealing` 은 등록 요청이 날아가 있는 1800ms 구간입니다. 여기서 닫히면 화면은
    사라졌는데 등록은 그대로 성공해서, 사용자는 무엇에 당첨됐는지 못 본 채 코드만
    소진됩니다. 되돌릴 방법이 없으므로 아예 닫지 못하게 합니다.

    `focusKey` 에 `phase` 를 넘기는 이유: 열리는 순간(`revealing`)에는 안에 포커스 가능한
    요소가 없고, 버튼은 `result` 로 넘어가야 생깁니다. phase 를 키로 주면 그때 다시 잡습니다.
  */
  const ref = useDialog<HTMLDivElement>({
    open: on,
    onEscape: phase === "result" ? closeReveal : null,
    focusKey: phase,
  });

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal={on}
      tabIndex={-1}
      inert={!on}
      className="absolute inset-0 z-50 flex items-center justify-center p-5 outline-none transition-opacity duration-300"
      style={{
        background:
          phase === "result" ? "rgba(23,33,28,.55)" : "rgba(20,102,63,.9)",
        opacity: on ? 1 : 0,
        pointerEvents: on ? "auto" : "none",
      }}
    >
      {phase === "revealing" && (
        <div className="flex flex-col items-center" aria-live="polite">
          <div className="ssak-spin flex h-[110px] w-[110px] items-center justify-center rounded-[30px] bg-[linear-gradient(140deg,#1E8E5A,#14663F)] shadow-[0_16px_40px_rgba(20,102,63,.4)] [animation:ssakSpin_1s_linear_infinite]">
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 14c0-5 4-9 15-10-1 11-5 15-10 15-3 0-5-2-5-5z"
                fill="#fff"
              />
            </svg>
          </div>
          <div className="ssak-pulse mt-[22px] text-[16px] font-extrabold text-white [animation:ssakPulse_1.1s_ease-in-out_infinite]">
            경품을 추첨하고 있어요…
          </div>
          <div className="mt-[6px] text-[12.5px] text-white/70">
            {revealCodeLabel}
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div className="relative w-[86%] max-w-[340px]">
          <Confetti />
          <div
            className="relative rounded-[26px] bg-white px-[22px] pt-[26px] pb-[22px] text-center shadow-[0_24px_60px_rgba(0,0,0,.3)]"
            style={{ animation: "ssakPop .5s cubic-bezier(.22,1,.36,1)" }}
            aria-live="polite"
          >
            <div className="text-green-600 text-[13px] font-extrabold tracking-[.06em]">
              🎉 축하합니다!
            </div>
            <ProductImage
              src={result.product.image}
              alt={result.product.name}
              hue={result.product.hue}
              className="ssak-float mx-auto mt-4 h-[150px] w-[150px] rounded-[22px] [animation:ssakFloat_2.4s_ease-in-out_infinite]"
              sizes="150px"
            />
            <span className="bg-chip-bg text-green-600 mt-4 inline-block rounded-[7px] px-[9px] py-1 text-[11px] font-bold">
              {result.product.category} 당첨
            </span>
            <h2 className="mt-[9px] mb-0 text-[21px] leading-[1.3] font-extrabold tracking-[-.02em]">
              {result.product.name}
            </h2>
            <p className="text-muted-3 mt-[9px] mb-0 text-[12.5px] leading-[1.5]">
              경품함에 저장되었어요. 마이페이지에서 확인하세요.
            </p>
            <button
              type="button"
              onClick={closeReveal}
              /* `autoFocus` 제거 — 초기 포커스는 `useDialog` 가 잡습니다. 두 군데가
                 같은 일을 하면 다음 사람이 어느 쪽이 동작하는지 알 수 없습니다. */
              className="bg-green-600 mt-5 h-[52px] w-full cursor-pointer rounded-[14px] border-none text-[15px] font-extrabold text-white shadow-[0_8px_18px_rgba(30,142,90,.3)] active:scale-[.98]"
            >
              경품함에 담기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
