"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDialog } from "@/hooks/useDialog";
import { ADMIN_NAV } from "@/lib/admin-nav";
import type { AdminNavCounts } from "@/types/dto";
import AdminLogoutButton from "./AdminLogoutButton";

/**
 * 콘솔 내비게이션.
 *
 * - `lg:` 이상 — 좌측 고정 사이드바 224px, `#0E2A1C`
 * - `lg:` 미만 — 상단 바(로고 + 메뉴 버튼) + 좌측 슬라이드 드로어
 *
 * 활성 상태를 알려면 현재 경로가 필요해서 클라이언트 컴포넌트입니다.
 * 대신 **카운트는 서버에서 계산해 props 로 받습니다** — 여기서 조회하면
 * Prisma 타입이 클라이언트 번들로 새어 들어옵니다 (Phase 2 에서 겪은 문제).
 *
 * ## 왜 사용자 셸의 `Drawer` 를 안 쓰나
 *
 * 그쪽은 `ShellContext` 에 묶여 있고, 그 컨텍스트는 `(app)` 레이아웃에서만 제공됩니다.
 * 관리자 트리로 끌어오려면 컨텍스트째 옮겨야 하는데, 두 영역이 열림 상태를 공유할
 * 이유가 없습니다. 여기서는 `useState` 하나면 충분합니다 — 다른 컴포넌트가 알 필요가
 * 없는 값입니다.
 *
 * 접근성(포커스 트랩 · 포커스 복귀 · ESC)만 `useDialog` 로 가져다 씁니다.
 * 이미 `Drawer`·`PrizeSheet`·`RevealModal` 셋이 쓰는 훅이라 새로 짤 이유가 없습니다.
 */
export default function AdminSidebar({ counts }: { counts: AdminNavCounts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const drawerRef = useDialog<HTMLElement>({ open, onEscape: close });

  // 화면이 바뀌면 닫습니다. 링크의 onClick 만으로도 대부분 되지만, 뒤로 가기처럼
  // 클릭이 아닌 경로 변경까지 덮으려면 경로 자체를 봐야 합니다.
  //
  // effect 가 아니라 **렌더 중 조정**입니다. effect 로 하면 드로어가 열린 화면이 한 번
  // 그려진 뒤에 닫혀 깜빡이고, 무엇보다 `react-hooks/set-state-in-effect` 가 막습니다.
  // (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  // `lg:` 로 넓어지면 고정 사이드바가 나오고 드로어는 `display:none` 이 됩니다.
  // 열린 상태로 두면 화면에는 없는데 `useDialog` 의 포커스 트랩만 살아 있어
  // Tab 이 어디로도 못 가고 갇힙니다.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)"); // Tailwind `lg`
    const sync = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <>
      {/* ── lg: 고정 사이드바 ─────────────────────────────────────── */}
      <aside className="bg-green-900 hidden w-[224px] flex-shrink-0 flex-col gap-[26px] px-[14px] py-[22px] lg:flex">
        <Brand />
        <NavList counts={counts} pathname={pathname} />
        <Account />
      </aside>

      {/* ── lg: 미만 상단 바 ──────────────────────────────────────── */}
      <header className="bg-green-900 flex items-center justify-between px-4 py-[10px] lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-white hover:bg-white/8"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </g>
          </svg>
        </button>
      </header>

      {/* ── lg: 미만 드로어 ───────────────────────────────────────── */}
      <div className="lg:hidden">
        <div
          onClick={close}
          aria-hidden
          className="fixed inset-0 z-40 bg-[rgba(6,20,13,.5)] transition-opacity duration-[280ms]"
          style={{
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
          }}
        />

        {/*
          `aria-hidden` 수동 토글 대신 `inert` 입니다 — 둘을 같이 두면 다음 사람이
          어느 쪽이 실제로 막는지 알 수 없습니다 (`hooks/useDialog.ts`).
          닫혀도 DOM 에 남기고 transform 으로 밀어 두는 구조는 사용자 셸 `Drawer` 와 같습니다.
        */}
        <aside
          id="admin-drawer"
          ref={drawerRef}
          tabIndex={-1}
          inert={!open}
          className="bg-green-900 fixed top-0 bottom-0 left-0 z-50 flex w-[264px] max-w-[82%] flex-col gap-[22px] overflow-y-auto px-[14px] py-[18px] shadow-[14px_0_40px_rgba(6,20,13,.3)] outline-none"
          style={{
            transform: open ? "translateX(0)" : "translateX(-102%)",
            transition: "transform .32s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div className="flex items-center justify-between">
            <Brand />
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-white hover:bg-white/8"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden>
                <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </g>
              </svg>
            </button>
          </div>

          <NavList counts={counts} pathname={pathname} onNavigate={close} />
          <Account />
        </aside>
      </div>
    </>
  );
}

/**
 * 로고 묶음.
 *
 * 핸드오프는 `#1E8E5A` 사각형 안에 "싹" 글자를 넣은 자리표시였습니다.
 * 실제 로고로 교체합니다 — 마크가 짙은 초록이라 어두운 사이드바 위에서는
 * 밝은 타일이 필요하고, 공개 화면 헤더·푸터도 같은 방식입니다.
 */
function Brand() {
  return (
    <div className="flex items-center gap-[10px] px-2">
      <Image
        src="/assets/logo-ssak.png"
        alt="싹싹기름 로고"
        width={32}
        height={32}
        className="h-8 w-8 rounded-[9px] bg-white object-contain"
      />
      <div className="flex flex-col gap-[2px]">
        <span className="text-[13px] font-extrabold tracking-[-.01em] text-white">싹싹기름</span>
        <span className="text-mint-400 text-[9.5px] font-extrabold tracking-[.14em]">ADMIN</span>
      </div>
    </div>
  );
}

function NavList({
  counts,
  pathname,
  onNavigate,
}: {
  counts: AdminNavCounts;
  pathname: string;
  /** 드로어에서만 넘깁니다 — 지금 있는 메뉴를 다시 누르면 경로가 안 바뀌어 위 경로 비교가 걸리지 않습니다. */
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-[3px]">
      <div className="px-[10px] pb-2 text-[9.5px] font-extrabold tracking-[.14em] text-white/34">
        OPERATION
      </div>

      {ADMIN_NAV.map((item) => {
        // `/admin` 은 완전 일치로만 활성. startsWith 로 두면 모든 하위 페이지에서
        // 대시보드까지 함께 켜집니다.
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const badge = item.badge ? counts[item.badge] : null;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center justify-between rounded-[10px] px-3 py-[11px] text-[13px] transition-colors",
              active
                ? "bg-green-600 font-bold text-white"
                : "font-semibold text-white/72 hover:bg-white/8",
            ].join(" ")}
          >
            <span>{item.label}</span>
            {badge !== null ? (
              <span className="text-mint-400 font-mono text-[10px] font-extrabold">
                {badge.toLocaleString("ko-KR")}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function Account() {
  return (
    <div className="mt-auto flex flex-col gap-[10px]">
      <div className="flex items-center gap-[10px] rounded-[12px] bg-white/7 p-3">
        <div className="bg-mint-400 text-green-900 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[12px] font-black">
          운
        </div>
        <div className="flex min-w-0 flex-col gap-[1px]">
          <span className="truncate text-[12px] font-bold text-white">운영자</span>
          {/* 관리자는 환경변수 기반 1명뿐이라 이름·권한이 고정 문구입니다.
              다중 관리자가 생기면 토큰 페이로드에서 읽어 채우세요. */}
          <span className="text-[10px] font-semibold text-white/50">최고관리자</span>
        </div>
      </div>

      <AdminLogoutButton />
    </div>
  );
}
