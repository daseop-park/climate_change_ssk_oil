"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 사용자 화면 에러 경계.
 *
 * `(app)/layout.tsx` 안쪽에서 렌더되므로 **`AppShell` 패널 안에** 들어갑니다.
 * 그래서 배경·폭을 다시 잡지 않고, 다른 서브페이지와 같은 `main` 형태만 맞춥니다.
 *
 * ⚠️ 이 파일은 **같은 세그먼트의 `layout.tsx` 는 감싸지 않습니다.**
 *    `AppShell` 이 렌더에 실패하면 여기까지 오지 못하고 `global-error.tsx` 로 갑니다.
 *    (Next 문서 `error.md`: "It does not wrap the layout.js or template.js above it
 *    in the same segment.")
 */
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // 배포 환경에서는 브라우저 콘솔이 유일한 단서입니다. digest 로 서버 로그와 맞춥니다.
    console.error("[app] 화면 렌더 실패:", error);
  }, [error]);

  return (
    <main className="ssak-scroll flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-8 text-center">
      <div className="text-green-600 text-[10.5px] font-extrabold tracking-[.14em]">
        ERROR
      </div>
      <h1 className="text-ink mt-[10px] mb-0 text-[19px] font-extrabold tracking-[-.03em]">
        화면을 불러오지 못했어요
      </h1>
      <p className="text-muted-2 mt-3 mb-0 text-[13px] leading-[1.7]">
        일시적인 문제일 수 있어요.
        <br />
        다시 시도해도 같으면 잠시 후 들어와 주세요.
      </p>

      <div className="mt-6 flex items-center gap-[10px]">
        {/*
          `unstable_retry` 는 Next 16.2 에서 추가됐고 `reset` 과 달리 **데이터를 다시 받아옵니다.**
          `reset` 은 경계만 초기화해서, 원인이 서버 쪽이면 같은 화면이 그대로 다시 납니다.
          `next` 를 캐럿 없이 `16.2.9` 로 고정해 두었으므로 unstable 접두사에도 안전합니다.
        */}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="bg-green-600 inline-flex h-10 cursor-pointer items-center rounded-full border-none px-5 text-[13.5px] font-bold text-white active:scale-95"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="border-line-3 text-ink inline-flex h-10 items-center rounded-full border bg-white px-5 text-[13.5px] font-bold active:scale-95"
        >
          홈으로
        </Link>
      </div>

      {error.digest && (
        <p className="text-muted-3 mt-5 mb-0 font-mono text-[11px]">
          오류 코드 {error.digest}
        </p>
      )}
    </main>
  );
}
