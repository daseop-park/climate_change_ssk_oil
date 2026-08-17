/**
 * 화면에 띄울 에러 문구 결정.
 *
 * 기본은 **서버가 보낸 문구를 그대로** 씁니다 — 서버가 이미 사용자용 한국어로 만들어 보냅니다.
 * 같은 에러라도 맥락에 따라 다른 안내가 필요할 때만 `overrides` 로 덮어씁니다.
 * (예: `NOT_FOUND` 가 등록 화면에서는 "코드가 없다", 조회 화면에서는 "그런 사람이 없다" 로 읽힙니다)
 *
 * 문구를 컴포넌트 안에 흩뿌리지 말고 이 파일과 각 화면의 override 상수에만 두세요.
 * 카피 수정이 컴포넌트 수정으로 번지지 않습니다.
 */
import { isApiError } from "./api-client";
import type { ErrorCode } from "./errors";

export type MessageKey = ErrorCode | "NETWORK_ERROR";
export type MessageOverrides = Partial<Record<MessageKey, string>>;

const FALLBACK = "잠시 후 다시 시도해 주세요.";

export function messageFor(e: unknown, overrides?: MessageOverrides): string {
  if (!isApiError(e)) return FALLBACK;

  const override = overrides?.[e.code];
  if (override) return override;

  // 429 는 얼마나 기다려야 하는지가 핵심 정보라 서버 문구에 초를 덧붙입니다.
  if (e.code === "RATE_LIMITED" && e.retryAfterSec) {
    return `${e.message} (약 ${e.retryAfterSec}초)`;
  }

  return e.message || FALLBACK;
}

/** 입력값을 고쳐서 다시 시도할 수 있는 종류의 실패인지 — 폼에 남겨둘지 판단할 때 씁니다. */
export function isRecoverable(e: unknown): boolean {
  if (!isApiError(e)) return false;
  return (
    e.code === "VALIDATION_ERROR" ||
    e.code === "INVALID_PHONE" ||
    e.code === "INVALID_CODE" ||
    e.code === "NOT_FOUND"
  );
}
