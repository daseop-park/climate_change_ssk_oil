"use client";

/**
 * 관리자 화면의 서버 호출 훅.
 *
 * 관리자 콘솔은 대부분 **서버 컴포넌트가 서비스를 직접 호출**합니다. 여기 있는 것은
 * 화면에서 실제로 상호작용이 일어나는 것 — 지급 처리 하나뿐입니다.
 *
 * 조회·지급 모두 `useMutation` 입니다. 운영자가 버튼을 눌렀을 때만 돌아야 하고,
 * 자동 재조회·캐시 복원 대상이 아닙니다 — 개인정보를 캐시에 오래 두지 않습니다.
 */
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  AdminLookupResponse,
  LookupRewardsRequest,
  ReceiveRewardsRequest,
  ReceiveRewardsResponse,
} from "@/types/dto";

/** 이름 + 전화번호로 지급 대상 조회. 응답은 마스킹된 값만 옵니다. */
export function useAdminLookup() {
  return useMutation({
    mutationFn: (input: LookupRewardsRequest) =>
      api.post<AdminLookupResponse>("/api/admin/reward/lookup", input),
  });
}

/** 선택한 리워드 일괄 지급. 하나라도 실패하면 서버가 전부 롤백합니다. */
export function useAdminReceive() {
  return useMutation({
    mutationFn: (input: ReceiveRewardsRequest) =>
      api.patch<ReceiveRewardsResponse>("/api/admin/reward/receive", input),
  });
}
