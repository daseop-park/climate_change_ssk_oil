import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

/**
 * 루트 레이아웃 — `<html>`·폰트·전역 프로바이더만 담습니다.
 *
 * 화면 셸은 여기 두지 않습니다. 사용자 화면은 모바일 폭 고정(`max-w-[440px]`),
 * 관리자 콘솔은 데스크톱 1280px 이상이라 같은 셸에 들어갈 수 없습니다.
 * 그래서 `(app)/layout.tsx` 가 `AppShell` 을, `admin/` 이 콘솔 셸을 각각 갖습니다.
 *
 * ⚠️ `Providers`(TanStack Query)는 **반드시 루트에 남아 있어야 합니다.**
 *    `(app)` 으로 함께 내리면 관리자 지급 화면(5.5)의 mutation 이 프로바이더 밖에 놓입니다.
 */

export const metadata: Metadata = {
  title: "team_싹싹기름",
  description:
    "기름 흡수 패드의 코드를 입력하면 그 자리에서 경품 당첨 여부가 공개되는 기후행동 프로젝트입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E2A1C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
