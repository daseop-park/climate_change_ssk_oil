"use client";

import type { InputHTMLAttributes, Ref } from "react";

/**
 * 폼 입력 한 칸 — 라벨 + 인풋 + 에러/힌트.
 *
 * **디자인이 바뀔 때 고칠 곳은 이 파일 하나입니다.**
 * 등록 폼(어두운 히어로)과 경품함 조회 폼(밝은 카드)이 같은 컴포넌트를 쓰고
 * `variant` 로만 갈라집니다. 새 스킨이 필요하면 아래 `SKIN` 에 항목을 추가하세요.
 */

export type FieldVariant = "dark" | "light";

/** 배경별 스킨. 클래스 문자열을 여기 모아두면 컴포넌트 본문을 건드릴 일이 없습니다. */
const SKIN: Record<
  FieldVariant,
  { label: string; input: string; hint: string; error: string }
> = {
  dark: {
    label: "text-mint-400 text-[10.5px] font-extrabold tracking-[.14em]",
    input:
      "h-[46px] w-full rounded-[10px] border border-white/34 bg-white/18 px-[15px] " +
      "text-white placeholder:text-white/45 backdrop-blur-[6px] outline-none " +
      "focus:border-white/60",
    hint: "text-[11.5px] leading-[1.5] text-white/62",
    error: "text-[11.5px] leading-[1.5] text-[#FFC7B8] font-semibold",
  },
  light: {
    label: "text-green-600 text-[10.5px] font-extrabold tracking-[.14em]",
    input:
      "h-[46px] w-full rounded-[10px] border border-[rgba(230,236,231,.9)] bg-white px-[15px] " +
      "text-ink placeholder:text-[#A8B5AC] outline-none focus:border-green-600",
    hint: "text-muted-3 text-[11.5px] leading-[1.5]",
    error: "text-[11.5px] leading-[1.5] font-semibold text-[#C2452D]",
  },
};

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
  id: string;
  label: string;
  variant?: FieldVariant;
  /** 에러가 있으면 힌트 대신 에러를 보여줍니다. */
  error?: string;
  hint?: string;
  /** 코드 입력처럼 고정폭 글꼴이 필요한 경우 */
  mono?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export default function Field({
  id,
  label,
  variant = "light",
  error,
  hint,
  mono = false,
  ref,
  ...input
}: FieldProps) {
  const skin = SKIN[variant];
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="mb-[14px] last:mb-0">
      <label htmlFor={id} className={`mb-[7px] block ${skin.label}`}>
        {label}
      </label>

      {/*
        font-size 는 16px 미만으로 내리지 마세요 — iOS Safari 가 입력 시 화면을 자동 확대합니다.
        디자인상 더 작아 보여야 한다면 transform 이나 letter-spacing 으로 조정하세요.
      */}
      <input
        {...input}
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          skin.input,
          "text-[16px] font-semibold",
          mono ? "font-mono tracking-[.08em] uppercase" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {error ? (
        <p id={`${id}-error`} role="alert" className={`mt-[6px] mb-0 ${skin.error}`}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={`mt-[6px] mb-0 ${skin.hint}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
