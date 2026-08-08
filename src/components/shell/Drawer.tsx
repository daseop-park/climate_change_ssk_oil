"use client";

import Link from "next/link";
import { useShell } from "./ShellContext";

const MENU_ITEMS = [
  { label: "About us", desc: "프로젝트 소개·설명글", href: "/about" },
  { label: "마이페이지", desc: "내 경품함·당첨 내역", href: "/mypage" },
  { label: "분리배출 tip", desc: "올바른 분리수거 팁", href: "/tip" },
];

export default function Drawer() {
  const { menuOpen, closeAll } = useShell();

  return (
    <aside
      aria-hidden={!menuOpen}
      className="bg-surface absolute top-0 right-0 bottom-0 z-40 flex w-4/5 max-w-[320px] flex-col shadow-[-14px_0_40px_rgba(23,33,28,.18)]"
      style={{
        transform: menuOpen ? "translateX(0)" : "translateX(102%)",
        transition: "transform .32s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <div className="border-line flex h-[58px] items-center justify-between border-b pr-[10px] pl-[18px]">
        <span className="text-[15px] font-extrabold">전체 메뉴</span>
        <button
          type="button"
          onClick={closeAll}
          aria-label="닫기"
          className="flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-transparent"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <g stroke="#17211C" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </g>
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-[10px]">
        {MENU_ITEMS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            onClick={closeAll}
            tabIndex={menuOpen ? undefined : -1}
            className="flex w-full items-center justify-between rounded-[13px] px-3 py-[15px] text-left hover:bg-[#EEF3EF]"
          >
            <span>
              <span className="text-ink block text-[15px] font-bold">
                {m.label}
              </span>
              <span className="text-muted-3 mt-[3px] block text-[12px]">
                {m.desc}
              </span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polyline
                points="9 6 15 12 9 18"
                stroke="#B7C2BB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}
      </nav>

      <div className="border-line-2 mt-auto border-t p-[18px]">
        <div className="text-muted-3 text-[12px] leading-[1.6]">
          기후변화대응 공모전 출품작
          <br />© team_싹싹기름 · v2.0
        </div>
      </div>
    </aside>
  );
}
