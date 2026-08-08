import crypto from "crypto";

/**
 * 개인정보(전화번호) 암호화 유틸.
 *
 * - 저장:   AES-256-GCM      → `encryptPhone`
 * - 조회:   HMAC-SHA256      → `generatePhoneHash` (users.phoneHash 의 UNIQUE 인덱스)
 *
 * ⚠️ 폴백 키를 두지 않습니다.
 * 환경변수가 없을 때 기본 키로 조용히 암호화하면, 그렇게 쌓인 데이터는 운영 키로 복호화할 수 없어
 * 전화번호가 통째로 유실됩니다. 키가 없으면 암호화 자체를 실패시킵니다.
 */

const MIN_SECRET_LENGTH = 32;

function requireSecret(name: "PHONE_ENCRYPTION_KEY" | "PHONE_HMAC_SECRET"): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(
      `[crypto] 환경변수 ${name} 가 설정되지 않았습니다. .env.example 을 참고해 .env 에 값을 채워주세요.`,
    );
  }

  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `[crypto] 환경변수 ${name} 는 ${MIN_SECRET_LENGTH}자 이상이어야 합니다. (현재 ${value.length}자)`,
    );
  }

  return value;
}

const getEncryptionKey = (): Buffer => {
  // AES-256-GCM은 정확히 32바이트(256비트) 키가 필요하므로 SHA-256으로 해싱해 고정 크기 키를 만듭니다.
  return crypto.createHash("sha256").update(requireSecret("PHONE_ENCRYPTION_KEY")).digest();
};

const getHmacSecret = (): string => requireSecret("PHONE_HMAC_SECRET");

/**
 * 부팅·요청 진입 시점에 키 설정을 미리 검증합니다.
 * 실제 암호화가 일어나는 지점까지 오류가 미뤄지지 않도록 Route Handler 앞단에서 호출하세요.
 */
export function assertCryptoEnv(): void {
  requireSecret("PHONE_ENCRYPTION_KEY");
  requireSecret("PHONE_HMAC_SECRET");
}

/**
 * 전화번호 표기를 통일합니다.
 *
 * 해시와 암호문이 같은 정규화 결과를 쓰도록 이 함수를 단일 창구로 유지하세요.
 * 표기가 어긋나면 같은 사람이 서로 다른 phoneHash 를 갖게 되어 중복 사용자가 생깁니다.
 *
 * TODO(3단계): 국가번호 처리 정책 확정 필요. 현재 '+82 10-1234-5678'은
 * '+821012345678'로 남아 '01012345678'과 다른 해시가 됩니다.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[-\s]/g, "");
}

/**
 * 전화번호 원문을 복호화 불가능한 고유 해시값으로 변환합니다. (중복 검사 및 빠른 조회용)
 * @param phone 전화번호 원문 (예: '010-1234-5678' 또는 '01012345678')
 */
export function generatePhoneHash(phone: string): string {
  return crypto
    .createHmac("sha256", getHmacSecret())
    .update(normalizePhone(phone))
    .digest("hex");
}

/**
 * 전화번호 원문을 AES-256-GCM 방식으로 암호화합니다.
 * @returns 'iv:authTag:encryptedData' 형식의 문자열
 */
export function encryptPhone(phone: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // GCM 권장 IV 크기: 12바이트

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(normalizePhone(phone), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // IV, AuthTag, 암호화된 데이터를 콜론(:)으로 구분하여 결합
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * 암호화된 전화번호 문자열을 복호화하여 원문을 반환합니다.
 * @param encryptedPhoneStr 'iv:authTag:encryptedData' 형식의 문자열
 */
export function decryptPhone(encryptedPhoneStr: string): string {
  const parts = encryptedPhoneStr.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted phone format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
