"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin-nav";
import type { AdminNavCounts } from "@/types/dto";
import AdminLogoutButton from "./AdminLogoutButton";

/**
 * 좌측 고정 내비게이션 — 224px, `#0E2A1C`.
 *
 * 활성 상태를 알려면 현재 경로가 필요해서 클라이언트 컴포넌트입니다.
 * 대신 **카운트는 서버에서 계산해 props 로 받습니다** — 여기서 조회하면
 * Prisma 타입이 클라이언트 번들로 새어 들어옵니다 (Phase 2 에서 겪은 문제).
 */
export default function AdminSidebar({ counts }: { counts: AdminNavCounts }) {
  const pathname = usePathname();

  return (
    <aside className="bg-green-900 flex w-[224px] flex-shrink-0 flex-col gap-[26px] px-[14px] py-[22px]">
      <div className="flex items-center gap-[10px] px-2">
        {/*
          핸드오프는 `#1E8E5A` 사각형 안에 "싹" 글자를 넣은 자리표시였습니다.
          실제 로고로 교체합니다 — 마크가 짙은 초록이라 어두운 사이드바 위에서는
          밝은 타일이 필요하고, 공개 화면 헤더·푸터도 같은 방식입니다.
        */}
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
    </aside>
  );
}
