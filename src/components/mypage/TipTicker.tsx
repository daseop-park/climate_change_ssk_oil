"use client";

import { useEffect, useState } from "react";
import { TIP_ONE_LINERS } from "@/lib/design/content";

const ROLL_MS = 3200;
/** 전환 시간. 되감기 타이머와 CSS transition 이 같은 값을 써야 합니다. */
const SLIDE_MS = 450;
/** 한 줄 높이(px). 트랙 이동량과 같아야 줄이 정확히 한 칸씩 올라갑니다. */
const LINE_H = 22;

/**
 * 분리배출 한 줄 팁 티커.
 *
 * 한 줄만 보이는 창을 두고 트랙을 위로 밀어 올립니다.
 * 마지막에 첫 항목 복제본을 붙여, 거기에 닿으면 애니메이션을 끄고
 * 0번으로 되감아 끊김 없이 이어지게 합니다.
 */
export default function TipTicker() {
  const [idx, setIdx] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIdx((i) => i + 1), ROLL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (idx !== TIP_ONE_LINERS.length) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIdx(0);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx]);

  // 되감기 프레임이 화면에 반영된 뒤에 transition 을 되살립니다.
  // 같은 프레임에서 켜면 0번으로 미끄러져 내려가는 게 보입니다.
  useEffect(() => {
    if (animate) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animate]);

  return (
    <div className="mt-3 flex items-center gap-[10px] rounded-[14px] border border-[rgba(230,236,231,.62)] bg-white/50 px-[14px] py-3">
      <span className="bg-chip-bg text-green-600 shrink-0 rounded-[7px] px-[7px] py-[3px] text-[10px] font-extrabold tracking-[.08em]">
        TIP
      </span>

      <div
        className="min-w-0 flex-1 overflow-hidden"
        style={{ height: LINE_H }}
        aria-live="off"
      >
        <div
          style={{
            transform: `translateY(-${idx * LINE_H}px)`,
            transition: animate
              ? `transform ${SLIDE_MS}ms cubic-bezier(.4,0,.2,1)`
              : "none",
          }}
        >
          {[...TIP_ONE_LINERS, TIP_ONE_LINERS[0]].map((t, i) => (
            <div
              key={i}
              className="truncate text-[12.5px]"
              style={{ height: LINE_H, lineHeight: `${LINE_H}px` }}
            >
              <b className="text-ink font-extrabold">{t.item}</b>
              <span className="text-muted-3"> · {t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
