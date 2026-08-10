"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-nav";

/**
 * 로그아웃 — 세션 쿠키를 만료시키고 로그인 화면으로 보냅니다.
 *
 * `replace` 를 쓰는 이유: `push` 면 뒤로 가기로 방금 떠난 관리자 화면으로 돌아갑니다.
 * 쿠키가 없으니 실제 데이터는 못 보지만, 캐시된 화면이 잠깐 스치는 것부터 피하는 게 낫습니다.
 * `refresh()` 로 라우터 캐시까지 비웁니다.
 */
export default function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await api.post("/api/admin/logout");
    } catch {
      // 실패해도 로그인 화면으로 보냅니다. 쿠키가 이미 만료됐을 때가 대부분이라
      // 여기서 멈춰 세우면 로그아웃이 안 되는 것처럼 보입니다.
    }
    router.replace(ADMIN_LOGIN_PATH);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={busy}
      className="h-[34px] w-full cursor-pointer rounded-[10px] border border-white/14 text-[11.5px] font-bold text-white/72 transition-colors hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}
