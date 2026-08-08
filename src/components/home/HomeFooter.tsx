"use client";

import Image from "next/image";
import Link from "next/link";
import { useShell } from "@/components/shell/ShellContext";

export default function HomeFooter() {
  const { showToast } = useShell();

  const linkClass =
    "py-[5px] text-left text-[12.5px] font-semibold text-white/82 hover:text-mint-400";

  return (
    <footer className="bg-[rgba(14,42,28,.7)] px-5 pt-8 pb-[34px] text-white">
      <div className="flex items-center gap-[9px]">
        <Image
          src="/assets/logo-r14.png"
          alt="싹싹기름 로고"
          width={26}
          height={28}
          className="h-7 w-auto rounded-[7px] object-contain"
        />
        <span className="text-[14px] font-extrabold tracking-[-.02em]">
          team_싹싹기름
        </span>
      </div>
      <p className="mt-[14px] mb-0 max-w-[22em] text-[12.5px] leading-[1.7] text-white/64">
        가정에서 버려지는 식용유를 흡수 패드로 처리하고, 그 실천을 즉석 경품으로
        돌려드리는 기후행동 프로젝트입니다.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-[10px] border-t border-white/16 pt-5">
        <Link href="/about" className={linkClass}>
          About us
        </Link>
        <Link href="/tip" className={linkClass}>
          분리배출 tip
        </Link>
        <Link href="/mypage" className={linkClass}>
          마이페이지
        </Link>
        <button
          type="button"
          onClick={() => showToast("준비 중이에요")}
          className={`${linkClass} cursor-pointer border-none bg-transparent`}
        >
          이용약관·문의
        </button>
      </div>
      <div className="mt-6 border-t border-white/16 pt-[18px] text-[11px] leading-[1.7] text-white/42">
        기후변화대응 공모전 출품작
        <br />© 2026 team_싹싹기름. All rights reserved.
      </div>
    </footer>
  );
}
