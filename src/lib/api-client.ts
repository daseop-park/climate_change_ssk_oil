/**
 * 브라우저용 API 호출 래퍼.
 *
 * 서버는 항상 `{ success, message, data }` 또는 `{ success, message, errorCode }` 를 돌려줍니다.
 * 이 파일이 그 껍데기를 벗겨서, 호출하는 쪽은 `data` 만 받고 실패는 예외로 받게 합니다.
 *
 * ⚠️ 클라이언트 전용입니다. Prisma·node 모듈을 여기서 import 하지 마세요.
 */
import type { ErrorCode } from "./errors";
import type { ApiResponse } from "../types/dto";

/**
 * API 실패를 나타내는 예외.
 *
 * `code` 로 분기하고 `message` 를 그대로 보여주는 것이 기본입니다.
 * 서버가 이미 사용자용 문구를 담아 보내기 때문에, 화면마다 문구를 다시 만들 필요가 없습니다.
 * 맥락상 다른 안내가 필요할 때만 `messageFor()` 로 덮어쓰세요.
 */
export class ApiError extends Error {
  readonly code: ErrorCode | "NETWORK_ERROR";
  readonly status: number;
  /** 429 일 때 서버가 알려준 재시도 대기 초 */
  readonly retryAfterSec?: number;

  constructor(
    code: ErrorCode | "NETWORK_ERROR",
    message: string,
    status: number,
    retryAfterSec?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    // 오프라인·타임아웃 등 응답 자체가 없는 경우
    throw new ApiError("NETWORK_ERROR", "네트워크 연결을 확인해 주세요.", 0);
  }

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      "DATABASE_ERROR",
      "서버 응답을 이해할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      res.status,
    );
  }

  if (!body.success) {
    const retryAfter = res.headers.get("retry-after");
    throw new ApiError(
      body.errorCode,
      body.message,
      res.status,
      retryAfter ? Number(retryAfter) : undefined,
    );
  }

  return body.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
};
