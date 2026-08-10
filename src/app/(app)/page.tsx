"use client";

import { useEffect, useRef, useState } from "react";
import GuideCarousel from "@/components/home/GuideCarousel";
import HeroCode from "@/components/home/HeroCode";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import HowItWorks from "@/components/home/HowItWorks";
import PrizeSection from "@/components/home/PrizeSection";

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const [headerSolid, setHeaderSolid] = useState(false);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setHeaderSolid(el.scrollTop > 90);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <HomeHeader solid={headerSolid} />
      <main
        ref={mainRef}
        className="ssak-scroll block min-h-0 flex-1 overflow-y-auto"
      >
        <HeroCode />
        <HowItWorks />
        <GuideCarousel />
        <PrizeSection />
        <HomeFooter />
      </main>
    </>
  );
}
