"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { isApiError } from "@/lib/api-client";
import { api } from "@/lib/api-client";
import { adminLoginSchema } from "@/lib/validation";

/**
 * 관리자 로그인 폼.
 *
 * 검증 스키마는 서버 라우트가 쓰는 `adminLoginSchema` 그대로입니다 —
 * 규칙을 클라이언트에 다시 적으면 두 벌이 갈라집니다.
 *
 * **실패 사유를 구분하지 않습니다.** 서버가 이미 "비밀번호가 올바르지 않습니다." 하나로
 * 뭉개서 내려주므로(`admin.service.login`) 그 문구를 그대로 씁니다. 화면에서 굳이
 * "비밀번호 틀림 / 설정 안 됨" 을 갈라 주면 공격자에게 환경 상태를 알려주는 셈입니다.
 *
 * 토큰은 응답 본문이 아니라 httpOnly 쿠키로 옵니다. 그래서 여기서 할 일은
 * **성공 후 이동**뿐입니다 — 저장할 것이 없습니다.
 */

type FormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { password: "" },
  });

  const submitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFailure(null);
    try {
      await api.post("/api/admin/login", { password });
    } catch (e) {
      setFailure(
        isApiError(e) ? e.message : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
      form.resetField("password");
      return;
    }

    // `next` 는 서버 컴포넌트에서 `sanitizeAdminNext()` 를 거친 값입니다.
    // `replace` 라서 뒤로 가기가 로그인 화면으로 돌아오지 않습니다.
    router.replace(next);
    // 쿠키가 방금 생겼습니다. 새로고침하지 않으면 라우터 캐시에 남은
    // "로그인 필요" 상태의 페이로드가 그대로 쓰입니다.
    router.refresh();
  });

  const fieldError = form.formState.errors.password?.message;
  const message = fieldError ?? failure;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[7px]">
      <label htmlFor="admin-password" className="text-ink-70 text-[11.5px] font-extrabold">
        비밀번호
      </label>

      <input
        {...form.register("password")}
        id="admin-password"
        type="password"
        autoComplete="current-password"
        autoFocus
        disabled={submitting}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? "admin-password-error" : undefined}
        className="border-line-3 text-ink focus:border-green-600 h-[42px] w-full rounded-[10px] border bg-white px-[13px] text-[16px] font-semibold outline-none disabled:opacity-60"
      />

      {message ? (
        <p
          id="admin-password-error"
          role="alert"
          className="text-danger m-0 text-[11.5px] leading-[1.5] font-semibold"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 mt-[7px] h-[46px] w-full cursor-pointer rounded-[11px] text-[13.5px] font-extrabold text-white transition-opacity active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
