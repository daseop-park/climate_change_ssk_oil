"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FieldSet from "@/components/form/FieldSet";
import { REGISTER_FIELDS } from "@/components/form/fields";
import { useShell } from "@/components/shell/ShellContext";
import { registerRewardSchema } from "@/lib/validation";

/**
 * 코드 등록 폼 — 이름 · 전화번호 · 코드.
 *
 * 검증 스키마는 **서버 라우트가 쓰는 것과 같은 것**(`src/lib/validation.ts`)을 씁니다.
 * 규칙을 클라이언트에 다시 적으면 두 벌이 갈라지고, 화면은 통과했는데 서버가 막는 상황이 생깁니다.
 *
 * 필드 구성은 `components/form/fields.ts`, 생김새는 `components/form/Field.tsx` 가 갖고 있습니다.
 * 이 파일에는 **제출 흐름만** 남깁니다 — 디자인 변경이 로직을 건드리지 않도록.
 */

type FormInput = z.input<typeof registerRewardSchema>;
type FormOutput = z.output<typeof registerRewardSchema>;

export default function RegisterForm() {
  const { registerReward, registering } = useShell();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(registerRewardSchema),
    // 한 번 틀린 뒤에는 타이핑하는 동안 바로 잡아줍니다.
    // 처음부터 onChange 로 두면 다 치기도 전에 빨간 글씨가 떠서 거슬립니다.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", phone: "", code: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await registerReward(values);

    // 성공했을 때만 코드를 비웁니다. 이름·전화번호는 남겨서
    // 여러 장을 연달아 등록할 때 다시 입력하지 않게 합니다.
    if (ok) form.resetField("code");
  });

  return (
    <form className="mt-[18px] border-t border-white/22 pt-4" onSubmit={onSubmit} noValidate>
      <FieldSet
        fields={REGISTER_FIELDS}
        form={form}
        variant="dark"
        idPrefix="register"
        disabled={registering}
      />

      <button
        type="submit"
        disabled={registering}
        className="ssak-code-submit mt-[9px] h-[46px] w-full cursor-pointer rounded-[10px] border border-white/30 bg-[rgba(30,142,90,.42)] text-[15px] font-extrabold tracking-[-.01em] text-white backdrop-blur-[6px] transition-opacity active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {registering ? "확인 중…" : "당첨 확인하기"}
      </button>

      <p className="mt-[10px] mb-0 px-[2px] text-[11.5px] leading-[1.5] text-white/62">
        코드는 1회만 사용할 수 있어요. 입력 즉시 경품 당첨 여부가 공개됩니다.
      </p>
    </form>
  );
}
