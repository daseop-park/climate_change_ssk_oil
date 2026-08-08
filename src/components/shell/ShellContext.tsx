"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { messageFor } from "@/lib/error-messages";
import { REVEAL_MS, withMinimumDelay } from "@/lib/reveal";
import { usePrizes, useRegisterReward } from "@/hooks/useRewardApi";
import type {
  PublicPrizeDto,
  RegisterRewardRequest,
  RegisterRewardResponse,
  RewardItemDto,
} from "@/types/dto";
import { REWARD_STATUS } from "@/types/reward";

/**
 * 앱 전역 상태.
 *
 * 로그인이 없으므로 **사용자가 누구인지는 이 세션의 메모리에만** 있습니다.
 * 등록하거나 경품함을 조회하면 `identity` 가 채워지고, 새로고침하면 사라집니다.
 * (브라우저 저장소에 이름·전화번호를 남기지 않기로 한 결정입니다.)
 */

export type Phase = "idle" | "revealing" | "result";

/** 이 세션에서 확인된 사용자. 서버가 인정한 신원이 아니라 "방금 입력한 값"입니다. */
export type Identity = { name: string; phone: string };

type ShellValue = {
  entered: boolean;
  enterApp: () => void;
  /** 인트로를 이미 통과한 세션 — 로고 애니메이션을 건너뜁니다. */
  skipIntro: boolean;

  menuOpen: boolean;
  openMenu: () => void;
  closeAll: () => void;

  /** 공개 경품 목록 (확률은 서버가 발급 비율에서 계산) */
  prizes: PublicPrizeDto[];
  prizesLoading: boolean;

  sheetPrize: PublicPrizeDto | null;
  /** 닫히는 동안에도 내용이 남도록 열림 여부는 따로 둡니다. */
  sheetOpen: boolean;
  openSheet: (id: string) => void;

  toast: string | null;
  showToast: (msg: string) => void;

  /** 코드 등록. 연출은 최소 REVEAL_MS 유지됩니다. */
  registerReward: (input: RegisterRewardRequest) => Promise<boolean>;
  registering: boolean;

  phase: Phase;
  result: RegisterRewardResponse | null;
  revealCodeLabel: string;
  closeReveal: () => void;

  identity: Identity | null;
  /** null 이면 아직 확인 전. 빈 배열이면 확인했는데 없는 것입니다. */
  myRewards: RewardItemDto[] | null;
  applyLookup: (identity: Identity, rewards: RewardItemDto[]) => void;
  clearIdentity: () => void;
};

const ShellContext = createContext<ShellValue | null>(null);

const ENTERED_KEY = "ssak-entered";

/**
 * 이 페이지 로드에서 인트로를 건너뛸지 — 세션에 진입 기록이 있거나
 * 서브페이지로 바로 들어온 경우입니다. 값은 로드당 한 번만 계산해서
 * 고정합니다(진입 직후 로고 애니메이션이 끊기지 않도록).
 */
let skipIntroMemo: boolean | null = null;

const noopSubscribe = () => () => {};

function getSkipSnapshot() {
  if (skipIntroMemo === null) {
    skipIntroMemo =
      sessionStorage.getItem(ENTERED_KEY) === "1" || window.location.pathname !== "/";
  }
  return skipIntroMemo;
}

const getSkipServerSnapshot = () => false;

/** 등록 응답을 경품함 항목으로 바꿉니다 (낙관적 반영용). */
function toRewardItem(res: RegisterRewardResponse): RewardItemDto {
  return {
    id: res.rewardId,
    rewardCode: res.rewardCode,
    status: REWARD_STATUS.USED,
    usedAt: res.usedAt,
    receivedAt: null,
    product: res.product,
  };
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const skipIntro = useSyncExternalStore(
    noopSubscribe,
    getSkipSnapshot,
    getSkipServerSnapshot,
  );
  const [manualEntered, setManualEntered] = useState(false);
  const entered = manualEntered || skipIntro;
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<RegisterRewardResponse | null>(null);
  const [revealCodeLabel, setRevealCodeLabel] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [myRewards, setMyRewards] = useState<RewardItemDto[] | null>(null);

  const { data: prizes, isPending: prizesLoading } = usePrizes();
  // 훅이 돌려주는 객체는 렌더마다 새로 만들어지지만 `mutateAsync` 는 같은 참조입니다.
  // 객체째로 의존성에 넣으면 아래 `value` 메모가 매 렌더 무효화됩니다.
  const { mutateAsync: postRegister } = useRegisterReward();

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 새로고침마다 인트로가 반복되지 않도록 세션 단위로 기억합니다.
  useEffect(() => {
    if (entered) sessionStorage.setItem(ENTERED_KEY, "1");
  }, [entered]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const enterApp = useCallback(() => setManualEntered(true), []);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setSheetOpen(false);
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const openSheet = useCallback((id: string) => {
    setSheetId(id);
    setSheetOpen(true);
    setMenuOpen(false);
  }, []);

  /**
   * 코드 등록.
   *
   * 성공하면 신원을 기억하고 경품함에 **낙관적으로** 넣습니다.
   * 마이페이지에서 조회하면 서버 응답으로 덮어써집니다.
   *
   * @returns 성공 여부. 폼이 입력값을 비울지 판단하는 데 씁니다.
   */
  const registerReward = useCallback(
    async (input: RegisterRewardRequest): Promise<boolean> => {
      setRevealCodeLabel(input.code);
      setMenuOpen(false);
      setSheetOpen(false);
      setPhase("revealing");

      try {
        const res = await withMinimumDelay(postRegister(input), REVEAL_MS);

        setResult(res);
        setPhase("result");
        setIdentity({ name: input.name, phone: input.phone });
        setMyRewards((prev) => [toRewardItem(res), ...(prev ?? [])]);
        return true;
      } catch (e) {
        setPhase("idle");
        showToast(messageFor(e, REGISTER_MESSAGES));
        return false;
      }
    },
    [postRegister, showToast],
  );

  const closeReveal = useCallback(() => {
    setPhase("idle");
    setResult(null);
  }, []);

  /** 조회 결과를 반영합니다. 서버 응답이 낙관적 반영본을 대체합니다. */
  const applyLookup = useCallback((who: Identity, rewards: RewardItemDto[]) => {
    setIdentity(who);
    setMyRewards(rewards);
  }, []);

  const clearIdentity = useCallback(() => {
    setIdentity(null);
    setMyRewards(null);
  }, []);

  const prizeList = useMemo(() => prizes ?? [], [prizes]);

  const sheetPrize = useMemo(
    () => prizeList.find((p) => p.id === sheetId) ?? null,
    [prizeList, sheetId],
  );

  const value = useMemo<ShellValue>(
    () => ({
      entered,
      enterApp,
      skipIntro,
      menuOpen,
      openMenu,
      closeAll,
      prizes: prizeList,
      prizesLoading,
      sheetPrize,
      sheetOpen,
      openSheet,
      toast,
      showToast,
      registerReward,
      registering: phase === "revealing",
      phase,
      result,
      revealCodeLabel,
      closeReveal,
      identity,
      myRewards,
      applyLookup,
      clearIdentity,
    }),
    [
      entered,
      enterApp,
      skipIntro,
      menuOpen,
      openMenu,
      closeAll,
      prizeList,
      prizesLoading,
      sheetPrize,
      sheetOpen,
      openSheet,
      toast,
      showToast,
      registerReward,
      phase,
      result,
      revealCodeLabel,
      closeReveal,
      identity,
      myRewards,
      applyLookup,
      clearIdentity,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

/** 등록 화면 맥락에 맞춘 문구. 나머지는 서버 문구를 그대로 씁니다. */
const REGISTER_MESSAGES = {
  INVALID_CODE: "등록되지 않은 코드예요. 패드의 인쇄를 다시 확인해 주세요.",
  ALREADY_USED: "이미 사용된 코드예요.",
  NETWORK_ERROR: "연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
} as const;

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}
