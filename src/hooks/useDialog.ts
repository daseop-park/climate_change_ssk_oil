"use client";

import { useEffect, useRef } from "react";

/**
 * 모달·시트·드로어 공통 키보드 처리.
 *
 * 이 앱의 모달 3종은 **닫혀도 DOM 에 남아** transform 으로 밀어 두는 구조입니다.
 * 그래서 닫힌 상태에서도 Tab 이 안으로 들어갔고, 열려 있어도 Tab 이 뒤 화면으로
 * 빠져나갔습니다. 이 훅이 셋을 한꺼번에 처리합니다.
 *
 * - **ESC 닫기** — `onEscape` 가 `null` 이면 ESC 를 막습니다(연출 중처럼 닫히면 안 되는 구간)
 * - **포커스 트랩** — 열려 있는 동안 Tab 이 컨테이너 밖으로 못 나갑니다
 * - **포커스 복귀** — 닫힐 때 열기 직전에 포커스가 있던 요소로 돌려줍니다
 *
 * 두 가지는 **일부러 여기 넣지 않았습니다.**
 *
 * 1. `inert` — 호출부에서 `inert={!open}` 으로 답니다. 훅이 DOM 속성을 직접 만지면
 *    React 가 아는 값과 어긋날 수 있고, 무엇보다 마크업만 봐서는 무엇이 막고 있는지
 *    알 수 없게 됩니다. `aria-hidden` 수동 토글은 `inert` 로 대체하고 **함께 쓰지 않습니다** —
 *    둘을 같이 두면 다음 사람이 어느 쪽이 실제로 막는지 알 수 없습니다.
 * 2. **배경 스크롤 잠금** — 필요 없습니다. `AppShell` 의 오버레이가 열렸을 때
 *    `pointer-events:auto` 로 화면 전체를 덮어 뒤쪽 터치를 이미 먹고(`AppShell.tsx:33-41`),
 *    셸 자체가 `h-[100dvh] overflow-hidden` 이라 문서가 스크롤되지 않습니다.
 *    아무 일도 하지 않는 코드를 넣으면 나중에 지울 수 없는 미신이 됩니다.
 *
 * ⚠️ 컨테이너에 `tabIndex={-1}` 을 주세요. 안에 포커스 가능한 요소가 하나도 없을 때
 *    포커스를 받을 곳이 필요합니다.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * 실제로 포커스를 줄 수 있는 것만 추립니다.
 *
 * `offsetParent` 대신 `getClientRects()` 를 보는 이유: `position:fixed` 요소는
 * 보이는데도 `offsetParent` 가 null 이라 걸러져 버립니다.
 */
function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

type Options = {
  open: boolean;
  /** ESC 로 닫는 동작. `null` 이면 ESC 를 무시합니다. */
  onEscape?: (() => void) | null;
  /**
   * 열린 채로 내용이 바뀌어 **초기 포커스를 다시 잡아야 할 때** 바꿔 주세요.
   * (예: 결과 모달이 `revealing` → `result` 로 넘어가 그때서야 버튼이 생기는 경우)
   */
  focusKey?: string | number | null;
};

export function useDialog<T extends HTMLElement>({
  open,
  onEscape,
  focusKey,
}: Options) {
  const ref = useRef<T>(null);
  const escapeRef = useRef(onEscape);
  const restoreTo = useRef<HTMLElement | null>(null);

  // 매 렌더 갱신합니다. 아래 effect 가 `onEscape` 를 의존성으로 잡으면,
  // 호출부가 콜백을 새로 만들 때마다 리스너가 재등록되고 포커스 복귀까지 오작동합니다.
  useEffect(() => {
    escapeRef.current = onEscape;
  });

  // 열림/닫힘 — 포커스 복귀 지점 기억 + 키 처리
  useEffect(() => {
    const el = ref.current;
    if (!el || !open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const close = escapeRef.current;
        if (close) {
          e.preventDefault();
          close();
        }
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables(el);
      if (items.length === 0) {
        e.preventDefault();
        el.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // 밖에 있으면 안으로 데려옵니다 (오버레이 클릭 등으로 포커스가 새어 나간 경우)
      if (!el.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const back = restoreTo.current;
      restoreTo.current = null;
      // 그 사이 사라졌을 수 있습니다 (드로어에서 링크를 눌러 화면이 바뀐 경우 등)
      if (back?.isConnected) back.focus();
    };
  }, [open]);

  // 초기 포커스 — 열릴 때, 그리고 `focusKey` 가 바뀔 때
  useEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    // 이미 안에 있으면 건드리지 않습니다. 사용자가 옮겨 둔 포커스를 뺏지 않기 위해서입니다.
    if (el.contains(document.activeElement)) return;

    const [first] = focusables(el);
    (first ?? el).focus();
  }, [open, focusKey]);

  return ref;
}
