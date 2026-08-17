"use client";

import { useRef, useState } from "react";
import { FLOW_CARDS } from "@/lib/design/content";

/** HOW IT WORKS — 3D 커버플로우 */
export default function HowItWorks() {
  const [active, setActive] = useState(1);
  const touchX = useRef<number | null>(null);

  const move = (dir: number) =>
    setActive((i) => Math.min(FLOW_CARDS.length - 1, Math.max(0, i + dir)));

  return (
    <section className="border-b border-[rgba(230,236,231,.55)] bg-white/40 pt-6 pb-[26px]">
      <div className="text-green-600 mx-[18px] mb-1 text-[10.5px] font-extrabold tracking-[.14em]">
        HOW IT WORKS
      </div>
      <h2 className="mx-[18px] mt-0 mb-[18px] text-[19px] font-extrabold tracking-[-.03em]">
        세 단계로 끝나요
      </h2>

      <div
        className="relative h-[300px] overflow-hidden [perspective:1100px]"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {FLOW_CARDS.map((c, i) => {
          const d = i - active;
          const ad = Math.abs(d);
          return (
            <button
              key={c.no}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${c.no} ${c.title}`}
              className="absolute top-2 left-1/2 ml-[-103px] h-[275px] w-[206px] cursor-pointer overflow-hidden rounded-[18px] border-none p-0"
              style={{
                background: `url('/assets/${c.img}.png') center/cover no-repeat, #0A2C1B`,
                transform: `translateX(${d * 126}px) rotateY(${d * -34}deg) scale(${ad ? 0.87 : 1})`,
                opacity: ad > 1 ? 0 : 1,
                zIndex: 10 - ad,
                pointerEvents: ad > 1 ? "none" : "auto",
                boxShadow: ad
                  ? "0 8px 20px rgba(10,44,27,.18)"
                  : "0 18px 38px rgba(10,44,27,.32)",
                transition:
                  "transform .55s cubic-bezier(.22,1,.36,1), opacity .45s ease, box-shadow .45s ease",
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,26,16,.1)_0%,rgba(6,26,16,.3)_44%,rgba(6,26,16,.86)_100%)]" />
              <div className="absolute right-0 bottom-0 left-0 px-4 pt-4 pb-[18px] text-left">
                <div className="text-mint-300 text-[10.5px] font-extrabold tracking-[.14em]">
                  {c.no}
                </div>
                <div className="mt-[6px] text-[17px] leading-[1.3] font-extrabold tracking-[-.02em] text-white">
                  {c.title}
                </div>
                <div className="mt-[5px] text-[11.5px] leading-[1.5] text-white/78">
                  {c.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-[14px] flex justify-center gap-[6px]">
        {FLOW_CARDS.map((c, i) => (
          <span
            key={c.no}
            className="h-[7px] rounded-[7px] transition-all duration-300"
            style={{
              width: i === active ? "20px" : "7px",
              background: i === active ? "#1E8E5A" : "#D3DCD6",
            }}
          />
        ))}
      </div>
    </section>
  );
}
