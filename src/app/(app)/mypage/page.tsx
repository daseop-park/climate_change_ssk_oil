"use client";

import LookupForm from "@/components/mypage/LookupForm";
import TipTicker from "@/components/mypage/TipTicker";
import SubHeader from "@/components/shell/SubHeader";
import { useShell } from "@/components/shell/ShellContext";
import { formatDate } from "@/lib/format-date";
import { imgFor } from "@/lib/product-image";
import { REWARD_STATUS } from "@/types/reward";
import type { RewardItemDto } from "@/types/dto";

export default function MyPage() {
  const { identity, myRewards, clearIdentity } = useShell();

  return (
    <>
      <SubHeader title="마이페이지" />
      <main className="ssak-scroll min-h-0 flex-1 overflow-y-auto px-[18px] pt-5 pb-10">
        {/* 조회 전에는 누구인지 알 수 없으므로 폼만 보여줍니다. */}
        {myRewards === null || identity === null ? (
          <>
            <LookupForm />
            <TipTicker />
          </>
        ) : (
          <RewardBox name={identity.name} rewards={myRewards} onReset={clearIdentity} />
        )}
      </main>
    </>
  );
}

function RewardBox({
  name,
  rewards,
  onReset,
}: {
  name: string;
  rewards: RewardItemDto[];
  onReset: () => void;
}) {
  const received = rewards.filter((r) => r.status === REWARD_STATUS.RECEIVED).length;

  return (
    <>
      <div className="flex items-center gap-[14px] px-1 pt-1 pb-5">
        <div className="bg-chip-bg text-green-600 flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-extrabold">
          싹
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-extrabold">{name} 님</div>
          <div className="text-green-700 mt-[2px] text-[12.5px]">
            경품 {rewards.length}개를 모았어요
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-muted-3 shrink-0 cursor-pointer border-none bg-transparent text-[12px] font-bold underline underline-offset-2"
        >
          다른 번호
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="당첨 경품" value={rewards.length} accent />
        <SummaryCard label="수령 완료" value={received} />
      </div>

      <h3 className="mx-[2px] mt-6 mb-[10px] text-[14px] font-extrabold">내 경품함</h3>

      {rewards.length > 0 ? (
        <div className="overflow-hidden rounded-[18px] border border-[rgba(230,236,231,.62)] bg-white/50">
          {rewards.map((r) => (
            <RewardRow key={r.id} reward={r} />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-[rgba(230,236,231,.62)] bg-white/50 px-5 py-[34px] text-center">
          <div className="text-muted-3 text-[13px] leading-[1.6]">
            아직 당첨된 경품이 없어요.
            <br />
            패드 코드를 입력하고 경품을 받아보세요!
          </div>
        </div>
      )}

      <p className="text-muted-3 mt-4 mb-0 px-1 text-[11.5px] leading-[1.5]">
        실물 수령은 현장 운영자에게 전화번호를 알려주시면 됩니다.
      </p>
    </>
  );
}

function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[rgba(230,236,231,.62)] bg-white/50 p-4">
      <div className="text-muted-3 text-[12px] font-semibold">{label}</div>
      <div
        className={`mt-[6px] text-[24px] font-extrabold ${accent ? "text-green-600" : ""}`}
      >
        {value}개
      </div>
    </div>
  );
}

function RewardRow({ reward }: { reward: RewardItemDto }) {
  const isReceived = reward.status === REWARD_STATUS.RECEIVED;

  return (
    <div className="border-line-2 flex items-center gap-3 border-b px-4 py-[13px] last:border-b-0">
      <div className="h-11 w-11 shrink-0 rounded-xl" style={imgFor(reward.product.hue)} />
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] leading-[1.3] font-bold">{reward.product.name}</div>
        <div className="text-muted-3 mt-[2px] text-[11.5px]">
          {formatDate(reward.usedAt)} · {reward.rewardCode}
        </div>
      </div>
      <span
        className="shrink-0 rounded-[20px] px-[9px] py-1 text-[10.5px] font-bold whitespace-nowrap"
        style={{
          color: isReceived ? "#8A9A90" : "#1E8E5A",
          background: isReceived ? "#F0F3F0" : "#E7F2EC",
        }}
      >
        {isReceived ? "수령완료" : "수령대기"}
      </span>
    </div>
  );
}
