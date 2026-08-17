"use client";

import { useEffect } from "react";

/**
 * 관리자 영역 에러 경계.
 *
 * ⚠️ **`(console)/error.tsx` 가 아니라 `admin/error.tsx` 입니다.** 계획서 6.2 는 전자로
 * 적었지만, `error.tsx` 는 **같은 세그먼트의 `layout.tsx` 를 감싸지 않습니다.**
 * 그런데 이 앱에서 DB 가 죽었을 때 실제로 터지는 곳이 바로 그 레이아웃입니다 —
 * `(console)/layout.tsx` 가 사이드바 뱃지를 만들려고 `adminService.getNavCounts()` 를
 * 서버에서 `await` 합니다. 경계를 `(console)` 안에 두면 그 실패를 **못 잡습니다.**
 * 한 단계 위인 여기 두어야 잡힙니다.
 *
 * (사용자 화면에는 이런 서버 조회가 없습니다. 경품은 `usePrizes()` 가 클라이언트에서
 *  가져오고 실패는 `PrizeSection` 이 직접 표시합니다. 그래서 DB 장애의 진짜 표면은
 *  사용자 셸이 아니라 이쪽입니다.)
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin] 콘솔 렌더 실패:", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-8">
      <div className="border-line w-full max-w-[520px] rounded-2xl border bg-white px-8 py-10 text-center">
        <div className="text-green-600 text-[10.5px] font-extrabold tracking-[.14em]">
          ADMIN
        </div>
        <h1 className="text-ink mt-[10px] mb-0 text-[20px] font-extrabold tracking-[-.03em]">
          콘솔을 불러오지 못했어요
        </h1>
        <p className="text-muted-2 mt-3 mb-0 text-[13.5px] leading-[1.7]">
          데이터베이스에 연결하지 못했을 수 있어요.
          <br />
          다시 시도해도 같으면 배포 로그와 <code className="font-mono">DATABASE_URL</code> 을
          확인해 주세요.
        </p>

        <button
          type="button"
          onClick={() => unstable_retry()}
          className="bg-green-600 mt-6 inline-flex h-10 cursor-pointer items-center rounded-full border-none px-5 text-[13.5px] font-bold text-white active:scale-95"
        >
          다시 시도
        </button>

        {error.digest && (
          <p className="text-muted-3 mt-5 mb-0 font-mono text-[11px]">
            오류 코드 {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
