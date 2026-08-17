import Link from "next/link";
import type { Metadata } from "next";

/**
 * 404.
 *
 * ⚠️ **`(app)` 안이 아니라 루트에 둡니다.** 계획서 6.2 는 `(app)/not-found.tsx` 로 적었지만,
 * 어느 라우트에도 걸리지 않은 URL 은 **Route Group 에 배정될 수 없습니다.**
 * `(app)` 안에 두면 `/한글주소` 같은 완전 미매칭 요청을 못 받고, `/admin/없는페이지` 도
 * 사용자 셸(440px 모바일)로 그려져 어색합니다.
 *
 * 루트에 두면 `app/layout.tsx` 안에서만 렌더되므로 `AppShell` 이 없습니다.
 * 그래서 이 화면은 배경·정렬을 **스스로** 잡습니다.
 *
 * `global-not-found.js`(실험적 플래그)는 쓰지 않았습니다. 루트 레이아웃이 하나뿐이고
 * 동적 세그먼트도 없어서, 그 파일이 필요한 두 조건 중 어느 쪽에도 해당하지 않습니다.
 */
export const metadata: Metadata = { title: "페이지를 찾을 수 없어요 · team_싹싹기름" };

export default function NotFound() {
  return (
    <div className="bg-page-bg flex min-h-[100dvh] items-start justify-center">
      <div className="bg-surface flex h-[100dvh] w-full max-w-[440px] flex-col items-center justify-center px-8 text-center">
        <div className="text-green-600 font-mono text-[11px] font-bold tracking-[.14em]">
          404
        </div>
        <h1 className="text-ink mt-[10px] mb-0 text-[19px] font-extrabold tracking-[-.03em]">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-muted-2 mt-3 mb-0 text-[13px] leading-[1.7]">
          주소가 바뀌었거나 삭제된 페이지예요.
        </p>

        <Link
          href="/"
          className="bg-green-600 mt-6 inline-flex h-10 items-center rounded-full px-5 text-[13.5px] font-bold text-white active:scale-95"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
