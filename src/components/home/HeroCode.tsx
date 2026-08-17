"use client";

import Link from "next/link";
import { useShell } from "@/components/shell/ShellContext";
import { REWARD_STATUS } from "@/types/reward";
import RegisterForm from "./RegisterForm";

/**
 * 히어로 + 코드 입력 섹션.
 *
 * 폼 자체는 `RegisterForm` 이 갖고 있습니다. 이 파일은 배치와 카피만 담당합니다.
 */
export default function HeroCode() {
  const { myRewards } = useShell();

  return (
    <section className="relative -mt-[60px] overflow-hidden bg-[linear-gradient(170deg,rgba(14,58,36,.34),rgba(8,36,24,.44))] px-5 pt-[76px] pb-5 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(178deg,rgba(8,40,24,.14)_0%,rgba(9,44,27,.24)_46%,rgba(8,36,22,.34)_100%)]" />
      <div className="relative">
        <span className="text-mint-400 inline-block text-[10.5px] font-extrabold tracking-[.14em]">
          CLIMATE ACTION
        </span>
        <p className="mt-[9px] mb-0 max-w-[19em] text-[13px] leading-[1.55] text-white/86">
          패드에 인쇄된 영문 코드를 입력하여
          <br />
          당첨된 경품을 확인하세요.
        </p>

        <RegisterForm />

        <MyRewardSummary rewards={myRewards} />
      </div>
    </section>
  );
}

/**
 * 내 경품 요약.
 *
 * 로그인이 없어서 **누구인지 알기 전에는 숫자를 만들 수 없습니다.**
 * 확인 전에는 마이페이지로 보내는 안내를 대신 보여줍니다.
 * (등록·조회를 하면 이 세션 메모리에 신원이 남아 숫자로 바뀌고, 새로고침하면 되돌아갑니다.)
 */
function MyRewardSummary({ rewards }: { rewards: ReturnType<typeof useShell>["myRewards"] }) {
  if (rewards === null) {
    return (
      <Link
        href="/mypage"
        className="mt-[18px] flex items-center justify-between border-t border-white/16 pt-4 text-white/86 active:opacity-80"
      >
        <span className="text-[13px] font-bold">내 경품함 확인하기</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <polyline
            points="9 6 15 12 9 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    );
  }

  const received = rewards.filter((r) => r.status === REWARD_STATUS.RECEIVED).length;

  return (
    <div className="mt-[18px] flex gap-[26px] border-t border-white/16 pt-4">
      <Stat label="당첨 경품" value={rewards.length} />
      <Stat label="수령 완료" value={received} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[24px] leading-none font-extrabold tracking-[-.02em]">{value}개</div>
      <div className="mt-[6px] text-[10.5px] font-bold tracking-[.1em] text-white/60">{label}</div>
    </div>
  );
}
