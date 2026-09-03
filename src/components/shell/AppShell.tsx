"use client";

import DesktopBackdrop from "./DesktopBackdrop";
import Drawer from "./Drawer";
import Intro from "./Intro";
import PrizeSheet from "./PrizeSheet";
import RevealModal from "./RevealModal";
import { ShellProvider, useShell } from "./ShellContext";
import Toast from "./Toast";

/**
 * 모바일 폭 고정 셸 + 인트로 배경 + 반투명 앱 패널.
 * 앱 패널은 상단 68px 을 비워 두어 인트로 사진과 로고가 계속 보입니다.
 *
 * ## 데스크톱(`lg:` 이상)
 *
 * 440px 셸을 **그대로 둡니다.** QR 로 들어오는 모바일 캠페인이라 2단 레이아웃 같은
 * 재설계는 디자인 핸드오프와 정면으로 충돌합니다. 대신 셸 바깥 여백을
 * `DesktopBackdrop` 으로 채우고, 셸에 모서리 곡률과 높이 제한을 주어
 * "화면에 놓인 앱" 으로 보이게 합니다.
 *
 * `lg:` 미만에는 **어떤 클래스도 추가하지 않았습니다.** 역방향 변형(`max-lg:`)을
 * 쓰지 않기로 한 것도 같은 이유입니다 — 모바일이 안 바뀌었다는 것을 diff 만 보고
 * 확인할 수 있어야 합니다 (`docs/polishing/sdd/sdd-responsive-layout.md` §3).
 */
function Shell({ children }: { children: React.ReactNode }) {
  const { entered, menuOpen, sheetOpen, closeAll } = useShell();
  const overlayOn = menuOpen || sheetOpen;

  return (
    <div className="bg-page-bg relative flex min-h-[100dvh] items-start justify-center lg:items-center">
      <DesktopBackdrop />

      {/*
        `lg:h-[min(880px,92dvh)]` — 셸 안 절대 위치 요소(인트로·드로어·시트·결과 모달)가
        전부 셸 기준 상대값이라 함께 줄어듭니다. `overflow-hidden` 이 이미 있어
        둥근 모서리로 내부가 삐져나오지도 않습니다.
      */}
      <div className="bg-surface relative z-10 flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden shadow-[0_20px_60px_rgba(23,33,28,.14)] lg:h-[min(880px,92dvh)] lg:rounded-[32px] lg:shadow-[0_40px_90px_rgba(4,16,10,.55)]">
        <Intro />

        <div
          className="ssak-panel absolute top-[68px] right-0 bottom-0 left-0 z-30 flex flex-col overflow-hidden rounded-t-3xl bg-[rgba(245,248,245,.45)] shadow-[0_-20px_50px_rgba(4,16,10,.5)] backdrop-blur-[8px]"
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
