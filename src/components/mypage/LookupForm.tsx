"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FieldSet from "@/components/form/FieldSet";
import { LOOKUP_FIELDS } from "@/components/form/fields";
import { useShell } from "@/components/shell/ShellContext";
import { useLookupRewards } from "@/hooks/useRewardApi";
import { messageFor } from "@/lib/error-messages";
import { lookupRewardsSchema } from "@/lib/validation";

/**
 * 경품함 조회 폼.
 *
 * 로그인이 없으므로 **볼 때마다** 이름과 전화번호를 입력합니다.
 * 브라우저에 저장하지 않기로 한 결정이라, 새로고침하면 이 폼으로 돌아옵니다.
 *
 * 등록 폼과 같은 `FieldSet` 을 쓰고 `variant` 만 다릅니다(밝은 배경).
 */

type FormInput = z.input<typeof lookupRewardsSchema>;
type FormOutput = z.output<typeof lookupRewardsSchema>;

/** 조회 맥락에 맞춘 문구. NOT_FOUND 가 "코드가 없다"로 읽히면 안 됩니다. */
const LOOKUP_MESSAGES = {
  NOT_FOUND: "입력하신 이름·전화번호로 등록된 경품이 없어요.",
  NETWORK_ERROR: "연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
} as const;

export default function LookupForm() {
  const { applyLookup, showToast } = useShell();
  const lookup = useLookupRewards();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(lookupRewardsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", phone: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await lookup.mutateAsync(values);
      applyLookup({ name: values.name, phone: values.phone }, [...res.pending, ...res.received]);
    } catch (e) {
      showToast(messageFor(e, LOOKUP_MESSAGES));
    }
  });

  return (
    <div className="rounded-[18px] border border-[rgba(230,236,231,.62)] bg-white/50 p-5">
      <h2 className="mt-0 mb-[6px] text-[16px] font-extrabold tracking-[-.01em]">
        내 경품함 확인
      </h2>
      <p className="text-muted-3 mt-0 mb-[18px] text-[12.5px] leading-[1.55]">
        코드를 등록할 때 입력한 이름과 전화번호를 넣어주세요.
      </p>

      <form onSubmit={onSubmit} noValidate>
        <FieldSet
          fields={LOOKUP_FIELDS}
          form={form}
          variant="light"
          idPrefix="lookup"
          disabled={lookup.isPending}
        />

        <button
          type="submit"
          disabled={lookup.isPending}
          className="bg-green-600 mt-2 h-[50px] w-full cursor-pointer rounded-[14px] border-none text-[15px] font-extrabold text-white shadow-[0_8px_18px_rgba(30,142,90,.3)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {lookup.isPending ? "확인 중…" : "경품함 열기"}
        </button>
      </form>

      <p className="text-muted-3 mt-[14px] mb-0 text-[11.5px] leading-[1.5]">
        입력한 정보는 조회에만 쓰이고 이 기기에 저장되지 않습니다.
      </p>
    </div>
  );
}
