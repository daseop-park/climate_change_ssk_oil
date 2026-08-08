/**
 * 리워드 코드 생성기.
 *
 * (2단계에서 `scripts/issue-codes.ts` 안에 있던 것을 꺼냈습니다.
 *  관리자 화면의 "리워드 코드 생성"이 같은 로직을 써야 하는데, 스크립트 파일 안에
 *  숨어 있으면 복붙본이 생기고 두 경로의 코드 규칙이 갈라집니다.)
 */
import crypto from "crypto";

// 오독하기 쉬운 문자 제외: 영문 I·O, 숫자 0·1
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24
const DIGITS = "23456789"; // 8

/** 만들 수 있는 코드의 총 가짓수 (24³ × 8³ = 7,077,888) */
export const CODE_SPACE = LETTERS.length ** 3 * DIGITS.length ** 3;

/**
 * `ABC-234` 형태의 코드 하나를 만듭니다.
 * `Math.random` 이 아니라 `crypto.randomInt` 를 씁니다 — 코드를 추측할 수 있으면
 * 사전 배정된 1등 경품을 긁어갈 수 있습니다.
 */
export function randomCode(): string {
  const pick = (set: string) => set[crypto.randomInt(set.length)];
  return `${pick(LETTERS)}${pick(LETTERS)}${pick(LETTERS)}-${pick(DIGITS)}${pick(DIGITS)}${pick(DIGITS)}`;
}

/** 암호학적으로 안전한 Fisher-Yates 셔플 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
