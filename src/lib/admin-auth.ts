/**
 * 관리자 인증 — 비밀번호 검증과 JWT 발급·검증.
 *
 * 관리자 계정은 DB 테이블이 아니라 **환경변수 하나**로 둡니다.
 * 운영자가 한 명뿐인 현장 이벤트라 계정 관리 화면을 만들 이유가 없고,
 * 테이블이 없으면 관리자 계정이 유출될 표면도 없습니다.
 * 다중 관리자가 필요해지면 그때 Admin 모델을 추가하고 이 파일의
 * `verifyPassword` 만 레포지토리 조회로 바꾸면 됩니다.
 */
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AppError, ERROR_CODES } from "./errors";

/**
 * 저장 형식: `scrypt:<saltHex>:<hashHex>`
 *
 * 구분자로 `$` 를 쓰지 않습니다. Next 는 `.env` 를 읽을 때 변수 확장을 하기 때문에,
 * `scrypt$1a98...` 같은 값이 `$1a98...` 부분을 변수 참조로 해석해 통째로 사라집니다.
 * (실제로 이것 때문에 로그인이 500 으로 떨어졌습니다. hex 에는 `:` 가 없어 안전합니다.)
 */
const SCRYPT_PREFIX = "scrypt";
const SEPARATOR = ":";
const KEY_LENGTH = 64;

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8시간 — 현장 운영 하루치
const TOKEN_SUBJECT = "admin";

export type AdminTokenPayload = {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
};

function requireEnv(name: "JWT_SECRET" | "ADMIN_PASSWORD_HASH"): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[admin-auth] 환경변수 ${name} 가 설정되지 않았습니다. .env.example 을 참고해 .env 에 값을 채워주세요.`,
    );
  }
  return value;
}

/** 비밀번호를 저장 가능한 문자열로 만듭니다. (scripts/hash-password.ts 에서 사용) */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, KEY_LENGTH);
  return [SCRYPT_PREFIX, salt.toString("hex"), derived.toString("hex")].join(SEPARATOR);
}

/**
 * 입력한 비밀번호가 ADMIN_PASSWORD_HASH 와 일치하는지 확인합니다.
 *
 * 비교는 반드시 `timingSafeEqual` 로 합니다. `===` 로 비교하면 앞자리부터
 * 일치하는 만큼 응답이 느려져, 시간 차이만으로 해시를 한 바이트씩 복원할 수 있습니다.
 */
export function verifyPassword(password: string): boolean {
  const stored = requireEnv("ADMIN_PASSWORD_HASH");
  const parts = stored.split(SEPARATOR);

  if (parts.length !== 3 || parts[0] !== SCRYPT_PREFIX) {
    throw new Error(
      `[admin-auth] ADMIN_PASSWORD_HASH 형식이 올바르지 않습니다. ` +
        `'npm run admin:hash -- "<비밀번호>"' 로 다시 생성해 .env 에 넣어주세요. ` +
        `(값에 '$' 가 들어 있으면 Next 의 .env 변수 확장으로 깨집니다)`,
    );
  }

  const [, saltHex, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);

  return crypto.timingSafeEqual(expected, actual);
}

export function signAdminToken(): { token: string; expiresAt: Date } {
  const token = jwt.sign({ role: "admin" }, requireEnv("JWT_SECRET"), {
    subject: TOKEN_SUBJECT,
    expiresIn: TOKEN_TTL_SECONDS,
  });
  return { token, expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000) };
}

/**
 * 토큰을 검증하고 페이로드를 돌려줍니다.
 * 만료·위조·형식 오류를 모두 UNAUTHORIZED 하나로 뭉갭니다 —
 * "만료됨"과 "서명 불일치"를 구분해 알려주면 공격자에게 힌트가 됩니다.
 */
export function verifyAdminToken(token: string): AdminTokenPayload {
  try {
    const payload = jwt.verify(token, requireEnv("JWT_SECRET"));
    if (typeof payload === "string" || payload.sub !== TOKEN_SUBJECT) {
      throw new Error("unexpected payload");
    }
    return payload as AdminTokenPayload;
  } catch {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }
}

// 토큰을 요청에서 꺼내는 일은 `admin-session.ts` 가 맡습니다.
// (Authorization 헤더가 아니라 httpOnly 쿠키를 씁니다 — 이유는 그 파일 주석 참고)
