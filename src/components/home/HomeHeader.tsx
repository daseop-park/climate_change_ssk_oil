"use client";

import Image from "next/image";
import { useShell } from "@/components/shell/ShellContext";

/**
 * 스크롤 90px 초과 시 solid 로 전환되는 홈 헤더.
 *
 * 전체 메뉴 버튼이 여기 있습니다. 2026-08-17 이전에는 `Intro.tsx` 의 배경 레이어에 떠 있어
 * **모든 페이지**에 공통으로 보였는데, 브랜드 줄과 다른 칸이라 따로 노는 인상이었습니다.
 * 헤더 안으로 들여오면서 **홈에서만** 보이게 됐습니다 — 서브페이지(`SubHeader`)에는
 * 뒤로가기가 있어 홈으로 돌아간 뒤 메뉴를 열게 됩니다.
 */
export default function HomeHeader({ solid }: { solid: boolean }) {
  const { openMenu, menuOpen } = useShell();

  // 헤더가 투명일 때는 인트로 사진 위에 얹히므로 흰색 + 그림자로 읽히게 합니다.
  const onPhoto = !solid;

  return (
    <header
      className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center justify-between px-[18px]"
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
      <div className="flex min-w-0 items-center gap-[10px]">
        {/* 로고는 정사각형입니다. `w-auto` 로 두면 34×34 가 되지만 의도를 못 박아 둡니다. */}
        <Image
          src="/assets/logo-ssak.png"
          alt="싹싹기름 로고"
          width={34}
          height={34}
          className="h-[34px] w-[34px] rounded-[8px] object-contain"
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
      </div>

      {/*
        44px 탭 표적을 유지하면서 아이콘이 좌측 로고와 같은 여백선에 가깝게 보이도록
        음수 마진으로 8px 당깁니다. 버튼 상자를 18px 안쪽에 그대로 두면 아이콘이
        29px 들어가 보여 오른쪽만 비어 보입니다.
      */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="전체 메뉴 열기"
        aria-expanded={menuOpen}
        className="-mr-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent active:scale-90"
        style={{
          filter: onPhoto ? "drop-shadow(0 1px 6px rgba(0,0,0,.45))" : "none",
          transition: "filter .25s ease",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <g
            stroke={solid ? "#17211C" : "#ffffff"}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: "stroke .25s ease" }}
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </g>
        </svg>
      </button>
    </header>
  );
}
