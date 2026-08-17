"use client";

import Image from "next/image";
import { useShell } from "./ShellContext";

/**
 * 인트로(스플래시). 진입 후에도 사라지지 않고 z-index 60 → 5 로 내려가
 * 앱 패널 뒤 배경으로 남습니다.
 */
export default function Intro() {
  const { entered, skipIntro, enterApp } = useShell();

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#0D1A12]"
      style={{ zIndex: entered ? 5 : 60 }}
    >
      <Image
        src="/assets/intro-bg-earth.png"
        alt=""
        fill
        priority
        sizes="440px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 shadow-[inset_0_0_90px_30px_rgba(8,18,12,.55),inset_0_0_200px_60px_rgba(8,18,12,.35)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,12,.35)_0%,rgba(8,18,12,.05)_38%,rgba(8,18,12,.62)_100%)]" />

      {/* 로고 묶음 — 중앙에서 좌상단으로 이동하며 축소 */}
      <div
        className="ssak-intro-logo absolute flex w-[240px] origin-top-left flex-col items-start gap-4 drop-shadow-[0_6px_20px_rgba(0,0,0,.35)]"
        style={{
          top: "26px",
          left: "22px",
          transform: "translate(0,0) scale(.56)",
          animation: skipIntro
            ? "none"
            : "ssakIntroLogo 2.6s cubic-bezier(.65,0,.35,1) forwards",
        }}
      >
        <Image
          src="/assets/logo-amiyu.png"
          alt="아미유"
          width={220}
          height={65}
          className="block h-auto w-[220px]"
          priority
        />
        <Image
          src="/assets/logo-fruit3.png"
          alt="사랑의열매 사회복지공동모금회"
          width={186}
          height={60}
          className="block h-auto w-[186px]"
          priority
        />
      </div>

      {/*
        전체 메뉴 버튼은 2026-08-17 에 `components/home/HomeHeader.tsx` 로 옮겼습니다.
        여기(배경 레이어)에 있으면 모든 페이지에 뜨지만 브랜드 줄과 다른 칸이라 따로 놀았습니다.
        옮기면서 **홈 전용**이 됐습니다 — 서브페이지는 `SubHeader` 의 뒤로가기를 씁니다.
      */}

      {/* 하단 CTA 블록 — 진입과 함께 아래로 퇴장 */}
      <div
        className="ssak-intro-cta absolute right-0 bottom-0 left-0 flex flex-col gap-[18px] px-[26px] pb-[46px]"
        aria-hidden={entered}
        style={{
          transition: "opacity .45s ease, transform .55s ease",
          ...(entered
            ? {
                opacity: 0,
                transform: "translateY(24px)",
                pointerEvents: "none" as const,
              }
            : { animation: "ssakIntroUp .8s ease 2.2s both" }),
        }}
      >
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-[.22em] text-white/68 uppercase">
            team_싹싹기름
          </span>
          <p className="m-0 text-[22px] leading-[1.45] font-bold text-white text-pretty">
            기름 한 방울부터
            <br />
            지구는 달라집니다.
          </p>
        </div>
        <button
          type="button"
          onClick={enterApp}
          tabIndex={entered ? -1 : undefined}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/75 bg-transparent text-[16px] font-bold text-white transition-[background-color,border-color] duration-200 hover:border-white hover:bg-white/14 active:bg-white/22"
        >
          지금 시작하기
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <g
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13,6 19,12 13,18" />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}
