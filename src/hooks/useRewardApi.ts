"use client";

/**
 * 리워드 관련 서버 호출 훅.
 *
 * 엔드포인트 경로와 쿼리 키를 여기 한 곳에 모읍니다.
 * 컴포넌트는 `usePrizes()` 처럼 의미 단위로만 쓰고, URL 을 직접 알지 않습니다.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  LookupRewardsRequest,
  LookupRewardsResponse,
  PublicPrizeDto,
  RegisterRewardRequest,
  RegisterRewardResponse,
} from "@/types/dto";

export const queryKeys = {
  prizes: ["prizes"] as const,
  /** 조회는 이름+전화번호가 키의 일부입니다. 다른 사람 결과가 섞이지 않도록. */
  myRewards: (phone: string, name: string) => ["my-rewards", phone, name] as const,
};

/** 공개 경품 목록. 확률은 서버가 발급 비율에서 계산해 보냅니다. */
export function usePrizes() {
  return useQuery({
    queryKey: queryKeys.prizes,
    queryFn: () => api.get<PublicPrizeDto[]>("/api/prizes"),
  });
}

/** 리워드 코드 등록. 성공 응답에 당첨 상품이 담겨 옵니다. */
export function useRegisterReward() {
  return useMutation({
    mutationFn: (input: RegisterRewardRequest) =>
      api.post<RegisterRewardResponse>("/api/reward/register", input),
  });
}

/**
 * 경품함 조회.
 *
 * 조회인데 `POST` 인 것은 전화번호를 URL 에 남기지 않기 위해서입니다.
 * 그래서 `useQuery` 가 아니라 `useMutation` 을 씁니다 — 사용자가 버튼을 눌렀을 때만
 * 실행돼야 하고, 자동 재조회·캐시 복원 대상이 아닙니다(개인정보를 캐시에 오래 두지 않습니다).
 */
export function useLookupRewards() {
  return useMutation({
    mutationFn: (input: LookupRewardsRequest) =>
      api.post<LookupRewardsResponse>("/api/reward/lookup", input),
  });
}
