/**
 * 사용자 도메인 로직.
 *
 * 전화번호 원문은 이 레이어에서만 다루고, 레포지토리에는 이미 암호화·해시된 값만 넘깁니다.
 * 원문이 아래로 새지 않는 경계를 여기 한 줄로 유지하세요.
 */
import { db } from "../lib/db";
import { assertCryptoEnv, encryptPhone, generatePhoneHash, normalizePhone } from "../lib/crypto";
import { AppError, ERROR_CODES } from "../lib/errors";
import { maskName, maskPhone } from "../lib/mask";
import { userRepository } from "../repositories/user.repository";
import { rewardRepository } from "../repositories/reward.repository";
import type { DbClient } from "../repositories/types";
import type { AdminUserDto } from "../types/dto";
import { REWARD_STATUS } from "../types/reward";
import { decryptPhone } from "../lib/crypto";

/** 국내 휴대폰 번호: 010 계열 10~11자리 */
const PHONE_PATTERN = /^0\d{9,10}$/;

/**
 * 조회용 이름 비교.
 *
 * 공백을 지우고 대소문자를 무시합니다 — "김 철수"와 "김철수", "Kim"과 "kim"은
 * 같은 사람이 그때그때 다르게 적은 것일 뿐인데, 이걸로 자기 경품함이 안 열리면
 * 현장에서 항의로 이어집니다. 이름은 어디까지나 전화번호에 덧붙이는 2차 확인입니다.
 */
function isSameName(a: string, b: string): boolean {
  const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  return normalize(a) === normalize(b);
}

/**
 * 전화번호를 정규화하고 형식을 확인한 뒤, 저장용 파생값을 만듭니다.
 * Zod 검증(3단계)이 앞단에 붙더라도 서비스가 스스로 한 번 더 확인합니다 —
 * 이 함수는 스크립트나 관리자 경로에서도 호출되기 때문입니다.
 */
export function derivePhoneFields(phone: string): {
  normalized: string;
  phoneHash: string;
  phoneEncrypted: string;
} {
  assertCryptoEnv();

  const normalized = normalizePhone(phone);
  if (!PHONE_PATTERN.test(normalized)) {
    throw new AppError(ERROR_CODES.INVALID_PHONE);
  }

  return {
    normalized,
    phoneHash: generatePhoneHash(normalized),
    phoneEncrypted: encryptPhone(normalized),
  };
}

/** 조회 전용 — 암호문을 새로 만들 필요가 없을 때 씁니다. */
export function derivePhoneHash(phone: string): string {
  assertCryptoEnv();

  const normalized = normalizePhone(phone);
  if (!PHONE_PATTERN.test(normalized)) {
    throw new AppError(ERROR_CODES.INVALID_PHONE);
  }

  return generatePhoneHash(normalized);
}

export const userService = {
  /**
   * phoneHash 로 사용자를 찾고, 없으면 만듭니다.
   *
   * `findUnique` 후 `create` 로 나누면 같은 번호의 첫 등록이 동시에 들어올 때
   * 둘 다 "없음"을 보고 둘 다 insert 해 UNIQUE 제약에 걸립니다.
   * upsert 는 DB 의 단일 문장으로 처리되므로 그 창이 없습니다.
   */
  findOrCreate(
    client: DbClient,
    input: { name: string; phoneHash: string; phoneEncrypted: string },
  ) {
    return client.user.upsert({
      where: { phoneHash: input.phoneHash },
      create: {
        name: input.name,
        phoneHash: input.phoneHash,
        phoneEncrypted: input.phoneEncrypted,
      },
      // 재방문자가 이름을 고쳐 적으면 마지막 입력을 따릅니다.
      // phoneEncrypted 는 갱신하지 않습니다 — 같은 번호라 값이 같고,
      // GCM 은 매번 IV 가 달라 무의미한 쓰기만 늘어납니다.
      update: { name: input.name },
    });
  },

  /**
   * 전화번호로 사용자를 찾습니다. 없으면 NOT_FOUND.
   *
   * `expectedName` 을 주면 이름까지 일치해야 통과합니다.
   * 사용자 본인 조회(경품함)에는 이름을 함께 받아 전화번호만으로는 열리지 않게 하고,
   * 관리자 지급 경로에서는 생략합니다 — 관리자는 이미 인증을 통과한 상태입니다.
   */
  async findByPhoneOrThrow(client: DbClient, phone: string, expectedName?: string) {
    const user = await userRepository.findByPhoneHash(client, derivePhoneHash(phone));

    // 이름 불일치를 "이름이 틀렸다"고 알려주면 그 번호가 존재한다는 사실을 확인시켜 줍니다.
    // 번호가 없을 때와 같은 응답으로 뭉갭니다.
    if (!user || (expectedName !== undefined && !isSameName(user.name, expectedName))) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "입력하신 정보로 등록된 리워드가 없습니다. 이름과 전화번호를 확인해 주세요.",
      );
    }
    return user;
  },

  /**
   * 관리자 사용자 목록.
   *
   * ⚠️ **평문은 나가지 않습니다.** 복호화한 번호는 이 함수 안에서 마스킹까지 마치고,
   *    `AdminUserDto` 에는 `phoneMasked` 자리밖에 없습니다.
   *    5.2 이전에는 `phone: decryptPhone(...)` 으로 평문이 그대로 나갔습니다 (§6).
   */
  async listForAdmin(opts: { skip?: number; take?: number } = {}): Promise<AdminUserDto[]> {
    const users = await userRepository.findManyWithCounts(db, opts);
    return users.map((u) => ({
      id: u.id,
      nameMasked: maskName(u.name),
      phoneMasked: maskPhone(decryptPhone(u.phoneEncrypted)),
      createdAt: u.createdAt.toISOString(),
      registeredCount: u._count.rewardCodes,
      receivedCount: u.rewardCodes.length,
    }));
  },

  /**
   * 관리자 단건 조회 — 전화번호 입력으로 사용자를 찾습니다.
   *
   * 입력한 번호는 이미 알고 있는 값이지만, 그렇다고 응답에 평문으로 되돌려 주면
   * 이 응답이 다른 곳에 저장·로깅될 때 평문이 함께 퍼집니다. 목록과 같은 규칙을 씁니다.
   */
  async findForAdminByPhone(phone: string): Promise<AdminUserDto> {
    const user = await userService.findByPhoneOrThrow(db, phone);
    const rewards = await rewardRepository.findByUserId(db, user.id);
    return {
      id: user.id,
      nameMasked: maskName(user.name),
      phoneMasked: maskPhone(decryptPhone(user.phoneEncrypted)),
      createdAt: user.createdAt.toISOString(),
      registeredCount: rewards.length,
      receivedCount: rewards.filter((r) => r.status === REWARD_STATUS.RECEIVED).length,
    };
  },
};
