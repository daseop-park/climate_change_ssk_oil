import Image from "next/image";
import Link from "next/link";

export default function HomeFooter() {
  const linkClass =
    "py-[5px] text-left text-[12.5px] font-semibold text-white/82 hover:text-mint-400";

  return (
    <footer className="bg-[rgba(14,42,28,.7)] px-5 pt-8 pb-[34px] text-white">
      <div className="flex items-center gap-[9px]">
        <Image
          src="/assets/logo-ssak.png"
          alt="싹싹기름 로고"
          width={28}
          height={28}
          className="h-7 w-7 rounded-[7px] object-contain"
        />
        <span className="text-[14px] font-extrabold tracking-[-.02em]">
          team_싹싹기름
        </span>
      </div>
      <p className="mt-[14px] mb-0 max-w-[22em] text-[12.5px] leading-[1.7] text-white/64">
        배달용기에 묻은 기름을 닦아 재활용할 수 있게 만들고, 그 실천을 즉석 경품으로
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
        {/*
          "이용약관·문의" 였고 누르면 "준비 중이에요" 토스트만 떴습니다.
          이용약관 페이지는 만들 계획이 없으므로 라벨에서 빼고, 실제로 있는
          고객센터로만 보냅니다 — 없는 문서를 링크 라벨로 약속하지 않습니다.
        */}
        <Link href="/support" className={linkClass}>
          고객센터 문의
        </Link>
      </div>
      <div className="mt-6 border-t border-white/16 pt-[18px] text-[11px] leading-[1.7] text-white/42">
        기후변화대응 공모전 출품작
        <br />© 2026 team_싹싹기름. All rights reserved.
      </div>
    </footer>
  );
}
