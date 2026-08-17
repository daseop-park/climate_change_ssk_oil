"use client";

import { useShell } from "./ShellContext";

export default function Toast() {
  const { toast } = useShell();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute right-0 bottom-[30px] left-0 z-[60] flex justify-center transition-all duration-[260ms] ease-out"
      style={{
        opacity: toast ? 1 : 0,
        transform: toast ? "translateY(0)" : "translateY(14px)",
      }}
    >
      <div className="bg-ink flex max-w-[88%] items-center gap-[9px] rounded-[14px] px-[18px] py-[13px] text-white shadow-[0_10px_26px_rgba(23,33,28,.3)]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" stroke="#5FD39A" strokeWidth="2" />
          <polyline
            points="8 12 11 15 16 9"
            stroke="#5FD39A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[13.5px] font-bold">{toast}</span>
      </div>
    </div>
  );
}
