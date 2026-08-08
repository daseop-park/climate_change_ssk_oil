"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import Field, { type FieldVariant } from "./Field";
import type { FieldConfig } from "./fields";

/**
 * 필드 선언 배열을 그대로 렌더링합니다.
 *
 * 폼 컴포넌트가 인풋을 하나씩 적지 않아도 되도록 하는 것이 목적입니다.
 * 필드를 늘리려면 `fields.ts` 의 배열에 한 줄 넣으면 되고, 이 파일과 화면은 그대로입니다.
 */
type FieldSetProps<T extends FieldValues> = {
  fields: FieldConfig[];
  form: UseFormReturn<T>;
  variant?: FieldVariant;
  /** 한 화면에 폼이 둘 이상일 때 id 충돌을 막습니다. */
  idPrefix: string;
  disabled?: boolean;
};

export default function FieldSet<T extends FieldValues>({
  fields,
  form,
  variant = "light",
  idPrefix,
  disabled,
}: FieldSetProps<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      {fields.map((f) => {
        const path = f.name as Path<T>;
        const registered = register(path);
        const message = errors[path]?.message;

        return (
          <Field
            key={f.name}
            id={`${idPrefix}-${f.name}`}
            label={f.label}
            variant={variant}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            maxLength={f.maxLength}
            mono={f.mono}
            hint={f.hint}
            spellCheck={false}
            disabled={disabled}
            error={typeof message === "string" ? message : undefined}
            {...registered}
            onChange={(e) => {
              // 화면에 보이는 값만 다듬습니다. 서버로 갈 값은 Zod 가 다시 정규화합니다.
              if (f.format) e.target.value = f.format(e.target.value);
              void registered.onChange(e);
            }}
          />
        );
      })}
    </>
  );
}
