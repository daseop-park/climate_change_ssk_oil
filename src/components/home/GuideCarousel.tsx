"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GUIDE_CARDS } from "./GuideCards";

/** 자동 넘김 간격. */
const AUTO_MS = 4000;
/** 사용자가 직접 넘긴 뒤 자동 넘김을 쉬는 시간 — 손가락과 타이머가 다투지 않게. */
const PAUSE_MS = 6000;

/** 트랙 중앙과 카드 중앙의 거리(px). 음수면 카드가 왼쪽에 있습니다. */
function offsetFromCenter(track: HTMLElement, card: Element) {
  const t = track.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  return c.left + c.width / 2 - (t.left + t.width / 2);
}

/**
 * CARD NEWS — 환경을 지키는 습관.
 * 사진 위에 어두운 그라디언트를 덮고 텍스트를 얹은 5장짜리 가로 스크롤 카드뉴스입니다.
 * 440px 셸 기준으로 다음 카드가 살짝 보이도록 카드 폭을 344px 로 고정했습니다.
 */
export default function GuideCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const pausedUntil = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    /*
     * 트랙 중앙에 가장 가까운 카드를 인디케이터에 반영합니다.
     * 다만 좌우 여백이 (트랙폭 − 카드폭)/2 보다 좁아 첫·마지막 카드는
     * 끝까지 밀어도 중앙에 닿지 못합니다. 그래서 스크롤 양 끝은
     * 화면을 차지한 카드가 아니라 이웃 카드가 뽑히므로 따로 고정합니다.
     */
    const onScroll = () => {
      const last = el.children.length - 1;
      let next: number;

      if (el.scrollLeft <= 1) {
        next = 0;
      } else if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        next = last;
      } else {
        let best = 0;
        let bestGap = Infinity;
        for (const [i, node] of Array.from(el.children).entries()) {
          const gap = Math.abs(offsetFromCenter(el, node));
          if (gap < bestGap) {
            bestGap = gap;
            best = i;
          }
        }
        next = best;
      }

      idxRef.current = next;
      setIdx(next);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* 사용자가 만지는 동안에는 자동 넘김을 멈춥니다. 자동 스크롤은 이 이벤트를
       발생시키지 않으므로 타이머가 스스로를 미루는 일은 없습니다. */
    const pause = () => {
      pausedUntil.current = Date.now() + PAUSE_MS;
    };
    const PAUSE_EVENTS = ["pointerdown", "touchstart", "wheel"] as const;
    for (const type of PAUSE_EVENTS) {
      el.addEventListener(type, pause, { passive: true });
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = reduced
      ? null
      : setInterval(() => {
          if (Date.now() < pausedUntil.current) return;
          const next = (idxRef.current + 1) % el.children.length;
          // 마지막 → 첫 장은 큰 음수라 브라우저가 스크롤 0 으로 잘라 줍니다.
          el.scrollBy({
            left: offsetFromCenter(el, el.children[next]),
            behavior: "smooth",
          });
        }, AUTO_MS);

    return () => {
      el.removeEventListener("scroll", onScroll);
      for (const type of PAUSE_EVENTS) el.removeEventListener(type, pause);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <section className="py-8">
      <div className="px-4">
        <span className="text-green-600 block text-[10.5px] font-extrabold tracking-[.14em]">
          CARD NEWS
        </span>
        <h2 className="mt-2 mb-0 text-[21px] leading-[1.3] font-extrabold tracking-[-.03em]">
          환경을 지키는 습관
        </h2>
        <p className="text-muted-2 mt-2 mb-0 text-[13px] leading-[1.5]">
          옆으로 넘겨 보세요 · {GUIDE_CARDS.length}장
        </p>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="환경을 지키는 습관 카드뉴스"
        className="ssak-scroll mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
      >
        {GUIDE_CARDS.map((card) => (
          <article
            key={card.label}
            className="relative flex h-[208px] w-[344px] flex-none snap-center items-center justify-center overflow-hidden rounded-[20px] bg-[#0A120D]"
          >
            <Image
              src={card.img}
              alt=""
              fill
              sizes="344px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,13,.62)_0%,rgba(10,18,13,.82)_100%)]" />
            <div className="relative px-6 py-5 text-center">
              <span className="text-mint-300 block text-[12px] leading-[1.5] font-bold">
                {card.label}
              </span>
              <h3 className="mt-2 mb-0 text-[19px] leading-[1.35] font-black tracking-[-.03em] text-white text-pretty">
                {card.title.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < card.title.length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <p className="mt-[10px] mb-0 text-[13px] leading-[1.5] text-white/84 text-pretty">
                {card.desc}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-[5px]">
        {GUIDE_CARDS.map((card, i) => (
          <div
            key={card.label}
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
