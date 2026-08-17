"use client";

import { useEffect } from "react";

/**
 * 루트 레이아웃이 렌더에 실패했을 때의 최후 화면.
 *
 * 이 파일이 뜨는 상황에서는 **`app/layout.tsx` 자체가 없는 것으로 칩니다.**
 * 그래서 `<html>`·`<body>` 를 직접 그려야 하고, 전역 CSS·폰트도 안 실립니다
 * (Next 문서 `error.md`: "Global error UI must define its own html and body tags,
 * global styles, fonts, or other dependencies").
 *
 * 그래서 Tailwind 클래스가 아니라 **인라인 스타일**을 씁니다. 여기서 클래스를 쓰면
 * 스타일이 하나도 안 먹은 맨 HTML 이 나옵니다. 색은 디자인 토큰 값을 직접 적었습니다
 * (`--color-green-900` = #0E2A1C, `--color-surface` = #F5F8F5).
 *
 * `metadata` 를 export 할 수 없으므로(클라이언트 컴포넌트) 제목은 `<title>` 로 답니다.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[global] 루트 렌더 실패:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E2A1C",
          color: "#F5F8F5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <title>문제가 발생했어요 · team_싹싹기름</title>
        <main style={{ maxWidth: 340, padding: 32, textAlign: "center" }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: ".14em",
              color: "#5FD39A",
            }}
          >
            TEAM 싹싹기름
          </div>
          <h1
            style={{
              margin: "14px 0 0",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-.02em",
            }}
          >
            문제가 발생했어요
          </h1>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 13.5,
              lineHeight: 1.7,
              color: "rgba(245,248,245,.72)",
            }}
          >
            잠시 후 다시 시도해 주세요.
            <br />
            같은 화면이 계속 나오면 현장 운영자에게 알려 주세요.
          </p>

          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: 24,
              height: 40,
              padding: "0 20px",
              border: "none",
              borderRadius: 999,
              background: "#5FD39A",
              color: "#0E2A1C",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>

          {error.digest && (
            <p
              style={{
                margin: "20px 0 0",
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                color: "rgba(245,248,245,.42)",
              }}
            >
              오류 코드 {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
