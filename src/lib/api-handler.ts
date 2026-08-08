/**
 * Route Handler 공통 처리 — 응답 규격, 에러 번역, 본문 검증.
 *
 * 모든 라우트가 이 파일을 거칩니다. 핵심은 **예외를 그대로 내보내지 않는 것**입니다.
 * `assertCryptoEnv()` 같은 함수는 `[crypto] 환경변수 PHONE_ENCRYPTION_KEY 가...` 처럼
 * 설정 내용이 담긴 평범한 Error 를 던집니다. 이걸 응답에 그대로 실으면 서버 구성이 샙니다.
 * 그래서 항상 `toAppError()` 를 통과시켜 정해진 문구로 바꾼 뒤 내보냅니다.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError, ERROR_CODES, isAppError, toAppError } from "./errors";
import type { ApiFailure, ApiSuccess } from "../types/dto";

/** 성공 응답 */
export function ok<T>(data: T, message = "요청이 처리되었습니다.", init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, message, data }, init);
}

/**
 * 실패 응답.
 *
 * 예상 못 한 예외는 서버 로그에만 남기고, 클라이언트에는 정형 문구만 보냅니다.
 * (`AppError` 는 사용자에게 보여줄 목적으로 만든 것이라 메시지를 그대로 씁니다.)
 */
export function fail(e: unknown) {
  const err = toAppError(e);

  if (!isAppError(e)) {
    console.error("[api] 처리되지 않은 예외:", e);
  }

  const headers: Record<string, string> = {};
  // 429 에는 언제 다시 시도하면 되는지 알려줍니다.
  if (err.code === ERROR_CODES.RATE_LIMITED && typeof err.details === "number") {
    headers["Retry-After"] = String(err.details);
  }

  return NextResponse.json<ApiFailure>(
    { success: false, message: err.message, errorCode: err.code },
    { status: err.status, headers },
  );
}

/**
 * 라우트 본문을 감싸는 실행기. 던져진 것을 전부 정형 응답으로 바꿉니다.
 *
 *   export const POST = (req: NextRequest) => handle(async () => { ... })
 */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (e) {
    return fail(e);
  }
}

/**
 * JSON 본문을 읽고 스키마로 검증합니다.
 *
 * Zod 의 첫 번째 이슈 메시지를 그대로 사용자에게 보여줍니다 —
 * 스키마에 사용자용 한국어 문구를 적어둔 이유입니다.
 */
export async function parseBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "요청 형식이 올바르지 않습니다.");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
      parsed.error.issues,
    );
  }
  return parsed.data;
}

/** 쿼리스트링을 스키마로 검증합니다. */
export function parseQuery<T extends z.ZodType>(req: Request, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
      parsed.error.issues,
    );
  }
  return parsed.data;
}
