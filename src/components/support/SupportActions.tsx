"use client";

import { useShell } from "@/components/shell/ShellContext";

/** 고객센터 액션 카드 — 채널 연동 전까지는 안내 토스트만 띄웁니다. */
export default function SupportActions() {
  const { showToast } = useShell();

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-[rgba(230,236,231,.62)] bg-white/50 p-[18px]">
      <button
        type="button"
        onClick={() => showToast("준비 중이에요")}
        className="bg-green-600 h-[52px] cursor-pointer rounded-[13px] border-none text-[14.5px] font-bold text-white active:scale-[.98]"
      >
        1:1 문의하기
      </button>
      <button
        type="button"
        onClick={() => showToast("준비 중이에요")}
        className="border-line-3 text-ink h-[52px] cursor-pointer rounded-[13px] border-[1.5px] bg-white text-[14.5px] font-bold"
      >
        카카오톡 채널 문의
      </button>
    </div>
  );
}
