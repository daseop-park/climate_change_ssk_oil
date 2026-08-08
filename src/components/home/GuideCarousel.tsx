"use client";

import { useEffect, useRef, useState } from "react";
import { GUIDE_SLIDES } from "./GuideSlides";

const AUTO_MS = 3800;

/**
 * GUIDE — 환경을 지키는 습관.
 * 각 슬라이드는 2160×1080 고정 캔버스이며, 컨테이너 폭에 맞춰
 * ResizeObserver 로 --slide-scale 을 다시 계산합니다.
 */
export default function GuideCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const applyScale = () => {
      const w = el.clientWidth;
      if (!w) return;
      el.style.setProperty("--slide-scale", String(w / 2160));
    };

    const ro = new ResizeObserver(applyScale);
    ro.observe(el);
    applyScale();

    const onScroll = () => {
      const w = el.clientWidth;
      if (!w) return;
      const i = Math.round(el.scrollLeft / w);
      if (i !== idxRef.current) {
        idxRef.current = i;
        setIdx(i);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = reduced
      ? null
      : setInterval(() => {
          const w = el.clientWidth;
          if (!w) return;
          idxRef.current = (idxRef.current + 1) % GUIDE_SLIDES.length;
          el.scrollTo({ left: idxRef.current * w, behavior: "smooth" });
        }, AUTO_MS);

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <section className="relative px-4 pt-[26px] pb-[6px]">
      <div className="mx-[2px] mb-[13px] flex items-baseline justify-between">
        <div>
          <div className="text-green-700 text-[10.5px] font-extrabold tracking-[.14em]">
            GUIDE
          </div>
          <h2 className="mt-[6px] mb-0 text-[21px] font-extrabold tracking-[-.03em]">
            환경을 지키는 습관
          </h2>
        </div>
      </div>

      <div
        ref={trackRef}
        className="ssak-scroll flex snap-x snap-mandatory overflow-x-auto rounded-[20px] shadow-[0_10px_26px_rgba(23,33,28,.16)]"
      >
        {GUIDE_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="bg-surface-slide relative aspect-[2/1] flex-[0_0_100%] snap-center overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{ transform: "scale(var(--slide-scale, 0.2037))" }}
            >
              {slide}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-[5px]">
        {GUIDE_SLIDES.map((_, i) => (
          <div
            key={i}
            className="h-[3px] rounded-[3px] transition-all duration-300"
            style={{
              width: i === idx ? "22px" : "10px",
              background: i === idx ? "#1E8E5A" : "#D3DCD6",
            }}
          />
        ))}
      </div>
    </section>
  );
}
