/**
 * 도메인 에러 정의.
 *
 * Service 레이어는 HTTP 를 모릅니다. 대신 `AppError` 를 던지고,
 * Route Handler 의 전역 핸들러가 이것을 상태코드 + 응답 바디로 번역합니다.
 * 이렇게 두면 같은 서비스를 CLI 스크립트에서 호출해도 그대로 동작합니다.
 */

export const ERROR_CODES = {
  /** 존재하지 않는 리워드 코드 */
  INVALID_CODE: "INVALID_CODE",
  /** 이미 다른 사람이 등록한 코드 */
  ALREADY_USED: "ALREADY_USED",
  /** 이미 실물 지급이 끝난 리워드 */
  ALREADY_RECEIVED: "ALREADY_RECEIVED",
  NOT_FOUND: "NOT_FOUND",
  INVALID_PHONE: "INVALID_PHONE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  /** 배치 중복 발급 등, 현재 상태에서 수행할 수 없는 요청 */
  CONFLICT: "CONFLICT",
  /** 짧은 시간에 너무 많이 요청 — 전화번호 열거 방어 */
  RATE_LIMITED: "RATE_LIMITED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const STATUS: Record<ErrorCode, number> = {
  INVALID_CODE: 404,
  ALREADY_USED: 409,
  ALREADY_RECEIVED: 409,
  NOT_FOUND: 404,
  INVALID_PHONE: 400,
  VALIDATION_ERROR: 400,
  DATABASE_ERROR: 500,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  RATE_LIMITED: 429,
};

/**
 * 사용자에게 그대로 노출되는 기본 문구입니다.
 * 내부 사정(어떤 쿼리가 실패했는지 등)을 흘리지 않도록 담백하게 유지하세요.
 */
const DEFAULT_MESSAGE: Record<ErrorCode, string> = {
  INVALID_CODE: "등록되지 않은 리워드 코드입니다.",
  ALREADY_USED: "이미 등록된 리워드 코드입니다.",
  ALREADY_RECEIVED: "이미 수령 처리된 리워드가 포함되어 있습니다.",
  NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
  INVALID_PHONE: "전화번호 형식을 확인해 주세요.",
  VALIDATION_ERROR: "입력값을 확인해 주세요.",
  DATABASE_ERROR: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  UNAUTHORIZED: "인증이 필요합니다.",
  CONFLICT: "현재 상태에서는 처리할 수 없는 요청입니다.",
  RATE_LIMITED: "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.",
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** 로그·디버깅용 부가 정보. 응답 바디에는 포함하지 않습니다. */
  readonly details?: unknown;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? DEFAULT_MESSAGE[code]);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}

/**
 * 정체불명의 예외를 AppError 로 좁힙니다.
 * 예상 못 한 예외를 그대로 응답에 실어 보내면 스택이나 쿼리문이 새어 나갑니다.
 */
export function toAppError(e: unknown): AppError {
  if (isAppError(e)) return e;
  return new AppError(ERROR_CODES.DATABASE_ERROR, undefined, e);
}
