"use client";

import Drawer from "./Drawer";
import Intro from "./Intro";
import PrizeSheet from "./PrizeSheet";
import RevealModal from "./RevealModal";
import { ShellProvider, useShell } from "./ShellContext";
import Toast from "./Toast";

/**
 * 모바일 폭 고정 셸 + 인트로 배경 + 반투명 앱 패널.
 * 앱 패널은 상단 68px 을 비워 두어 인트로 사진과 로고가 계속 보입니다.
 */
function Shell({ children }: { children: React.ReactNode }) {
  const { entered, menuOpen, sheetOpen, closeAll } = useShell();
  const overlayOn = menuOpen || sheetOpen;

  return (
    <div className="bg-page-bg flex min-h-[100dvh] items-start justify-center">
      <div className="bg-surface relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden shadow-[0_20px_60px_rgba(23,33,28,.14)]">
        <Intro />

        <div
          className="ssak-panel absolute top-[68px] right-0 bottom-0 left-0 z-30 flex flex-col overflow-hidden rounded-t-3xl bg-[rgba(245,248,245,.34)] shadow-[0_-20px_50px_rgba(4,16,10,.5)] backdrop-blur-[8px]"
          style={{
            transition: "transform .72s cubic-bezier(.22,1,.36,1)",
            transform: entered ? "translateY(0)" : "translateY(104%)",
          }}
        >
          {children}
        </div>

        <div
          onClick={closeAll}
          aria-hidden
          className="absolute inset-0 z-30 bg-[rgba(23,33,28,.42)] transition-opacity duration-[280ms]"
          style={{
            opacity: overlayOn ? 1 : 0,
            pointerEvents: overlayOn ? "auto" : "none",
          }}
        />

        <Drawer />
        <PrizeSheet />
        <RevealModal />
        <Toast />
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <Shell>{children}</Shell>
    </ShellProvider>
  );
}
