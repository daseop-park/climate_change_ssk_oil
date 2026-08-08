"use client";

import Image from "next/image";

/** 스크롤 90px 초과 시 solid 로 전환되는 홈 헤더 */
export default function HomeHeader({ solid }: { solid: boolean }) {
  return (
    <header
      className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center justify-start gap-[10px] px-[18px]"
      style={{
        background: solid
          ? "rgba(245,248,245,.72)"
          : "linear-gradient(180deg,rgba(8,40,24,.45),rgba(8,40,24,0))",
        backdropFilter: solid ? "blur(12px)" : "none",
        WebkitBackdropFilter: solid ? "blur(12px)" : "none",
        borderBottom: solid ? "1px solid #E6ECE7" : "1px solid transparent",
        transition: "background .25s ease, border-color .25s ease",
      }}
    >
      <Image
        src="/assets/logo-r14.png"
        alt="싹싹기름 로고"
        width={31}
        height={34}
        className="h-[34px] w-auto rounded-[8px] object-contain"
      />
      <span
        className="text-[15px] font-bold tracking-[-.02em]"
        style={{
          color: solid ? "#17211C" : "#fff",
          textShadow: solid ? "none" : "0 1px 8px rgba(0,0,0,.4)",
          transition: "color .25s ease",
        }}
      >
        team_싹싹기름
      </span>
    </header>
  );
}
