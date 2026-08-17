"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { isApiError } from "@/lib/api-client";

/**
 * 전역 클라이언트 프로바이더.
 *
 * `QueryClient` 를 모듈 최상단이 아니라 `useState` 안에서 만듭니다.
 * 모듈 스코프에 두면 서버에서 여러 요청이 같은 캐시를 공유하게 됩니다.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 경품 목록은 이벤트 중에 거의 바뀌지 않습니다. 창을 옮길 때마다 다시 부르지 않도록.
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 4xx 는 다시 불러도 같은 답이 옵니다. 특히 429 재시도는 차단만 연장시킵니다.
              if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            // 등록은 절대 자동 재시도하지 않습니다 —
            // 성공했는데 응답만 유실된 경우 재시도하면 사용자가 코드를 두 번 쓴 것처럼 보입니다.
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
