"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import FieldSet from "@/components/form/FieldSet";
import { LOOKUP_FIELDS } from "@/components/form/fields";
import { useAdminLookup, useAdminReceive } from "@/hooks/useAdminApi";
import { isApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format-date";
import { lookupRewardsSchema } from "@/lib/validation";
import type { AdminLookupResponse } from "@/types/dto";

/**
 * 실물 지급 처리 — **조회 전용 콘솔에서 유일한 쓰기 화면**입니다.
 *
 * 흐름은 조회 → 체크 → 일괄 지급. 현장에서 고객을 앞에 두고 실시간으로 해야 해서
 * CLI 로 대체할 수 없는 유일한 작업입니다.
 *
 * ## 왜 이름까지 입력받나
 *
 * 목록에 성함이 마스킹되어 나가면서(§6 B안) **"화면을 보고 대조" 하는 방식이 성립하지
 * 않게 됐습니다.** 대신 운영자가 고객에게 물어 입력하면 서버가 해시로 맞춰 봅니다.
 * 확인 수단이 사라진 것이 아니라 화면에서 입력으로 옮겨 간 것입니다.
 *
 * 조회 폼과 지급 요청이 **같은 이름·전화번호**를 씁니다. 조회만 통과하고 지급은
 * 번호만으로 되면 확인 절차에 구멍이 남습니다.
 */

type FormInput = z.input<typeof lookupRewardsSchema>;
type FormOutput = z.output<typeof lookupRewardsSchema>;

export default function AdminReceivePanel() {
  const router = useRouter();
  const { mutateAsync: lookup, isPending: looking } = useAdminLookup();
  const { mutateAsync: receive, isPending: receiving } = useAdminReceive();

  const [found, setFound] = useState<AdminLookupResponse | null>(null);
  /** 조회에 쓴 값. 지급 요청에 그대로 실어 보냅니다. */
  const [identity, setIdentity] = useState<FormOutput | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(lookupRewardsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", phone: "" },
  });

  const onLookup = form.handleSubmit(async (values) => {
    setMessage(null);
    setFound(null);
    setChecked(new Set());
    try {
      const res = await lookup(values);
      setFound(res);
      setIdentity(values);
      // 수령 대기 건은 대부분 전부 지급합니다. 기본으로 켜 두고 빼는 편이 빠릅니다.
      setChecked(new Set(res.pending.map((r) => r.id)));
      if (res.pending.length === 0) {
        setMessage({ tone: "ok", text: "수령 대기 중인 리워드가 없습니다." });
      }
    } catch (e) {
      setMessage({
        tone: "error",
        text: isApiError(e) ? e.message : "조회에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  });

  async function onReceive() {
    if (!identity || checked.size === 0) return;
    setMessage(null);

    try {
      const res = await receive({
        name: identity.name,
        phone: identity.phone,
        rewardIds: [...checked],
      });
      setMessage({ tone: "ok", text: `${res.receivedCount}건을 지급 완료 처리했습니다.` });

      // 서버가 전부 성공 또는 전부 롤백이므로, 성공했다면 화면 상태를 다시 만들 필요 없이
      // 조회를 한 번 더 돌려 실제 상태를 받아 옵니다. 아래 목록도 함께 갱신합니다.
      const refreshed = await lookup(identity);
      setFound(refreshed);
      setChecked(new Set(refreshed.pending.map((r) => r.id)));
      router.refresh();
    } catch (e) {
      setMessage({
        tone: "error",
        text: isApiError(e) ? e.message : "지급 처리에 실패했습니다.",
      });
    }
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const busy = looking || receiving;

  return (
    <div className="border-line rounded-[14px] border bg-white px-[22px] pt-5 pb-[22px]">
      <h3 className="text-ink m-0 text-[15px] font-extrabold tracking-[-.02em]">실물 지급 처리</h3>
      <p className="text-muted-3 mt-[5px] mb-[18px] text-[12px] leading-[1.6]">
        고객에게 <strong className="text-ink">이름과 전화번호를 물어</strong> 입력하세요. 목록의
        성함·연락처는 가려져 있어 눈으로 대조할 수 없습니다.
      </p>

      <form onSubmit={onLookup} noValidate className="grid grid-cols-[1fr_1fr_auto] items-start gap-[14px]">
        {/* 공개 조회 폼과 같은 필드 선언을 씁니다 — 문구가 갈라지지 않도록. */}
        <div className="contents [&_label]:text-ink-70 [&_label]:tracking-normal">
          <FieldSet fields={LOOKUP_FIELDS} form={form} idPrefix="admin-recv" disabled={busy} />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-green-600 mt-[25px] h-[46px] cursor-pointer rounded-[11px] px-6 text-[13.5px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {looking ? "조회 중…" : "조회"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className={`mt-3 mb-0 text-[12px] font-semibold ${
            message.tone === "error" ? "text-danger" : "text-green-600"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {found ? (
        <div className="border-line mt-[18px] border-t pt-[18px]">
          <div className="mb-3 flex items-baseline gap-[10px]">
            <span className="text-ink text-[13px] font-extrabold">{found.userNameMasked}</span>
            <span className="text-muted-3 font-mono text-[12px] font-semibold">
              {found.phoneMasked}
            </span>
            <span className="text-muted-3 text-[11.5px] font-semibold">
              수령 대기 {found.pending.length}건 · 수령 완료 {found.received.length}건
            </span>
          </div>

          {found.pending.length === 0 ? (
            <p className="text-muted-3 m-0 text-[12px] font-semibold">
              지급할 리워드가 없습니다.
            </p>
          ) : (
            <>
              <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
                {found.pending.map((r) => (
                  <li key={r.id}>
                    <label className="border-line-3 hover:bg-surface flex cursor-pointer items-center gap-[11px] rounded-[10px] border px-3 py-[10px]">
                      <input
                        type="checkbox"
                        checked={checked.has(r.id)}
                        onChange={() => toggle(r.id)}
                        disabled={busy}
                        className="accent-green-600 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-ink flex-1 truncate text-[12.5px] font-bold">
                        {r.product.name}
                      </span>
                      <span className="text-muted font-mono text-[12px]">{r.rewardCode}</span>
                      <span className="text-muted-3 text-[11.5px] font-semibold">
                        {formatDate(r.usedAt)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="mt-[14px] flex items-center justify-between">
                <span className="text-muted-3 text-[11.5px] font-semibold">
                  {/* 부분 성공이 없다는 것을 누르기 전에 알려 줍니다. */}
                  선택한 {checked.size}건을 한 번에 처리합니다. 하나라도 실패하면 전부 취소됩니다.
                </span>
                <button
                  type="button"
                  onClick={onReceive}
                  disabled={busy || checked.size === 0}
                  className="bg-green-800 h-[42px] cursor-pointer rounded-[11px] px-5 text-[13px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {receiving ? "처리 중…" : `${checked.size}건 지급 완료`}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
