/**
 * 추첨 연출 타이밍.
 *
 * 서버는 추첨하지 않습니다 — 상품은 코드 발급 시점에 이미 정해져 있어서 응답이 매우 빠릅니다.
 * 그대로 두면 버튼을 누르자마자 결과가 튀어나와 "뽑았다"는 감각이 없습니다.
 * 그래서 응답이 빨리 오더라도 최소 시간은 연출을 유지합니다.
 * (프로토타입의 `redeem.ts` 에 있던 규칙을 옮겨온 것입니다.)
 */

/** 추첨 연출 최소 유지 시간(ms) */
export const REVEAL_MS = 1800;

/**
 * 작업과 최소 대기를 함께 기다립니다. 둘 중 늦은 쪽에 맞춰집니다.
 *
 * 실패해도 대기 시간은 지킵니다 — 에러 토스트가 연출 도중에 튀어나오면
 * 무엇이 잘못됐는지 읽기 전에 화면이 바뀝니다.
 */
export async function withMinimumDelay<T>(work: Promise<T>, ms = REVEAL_MS): Promise<T> {
  const delay = new Promise((resolve) => setTimeout(resolve, ms));
  const [result] = await Promise.allSettled([work, delay]);

  if (result.status === "rejected") throw result.reason;
  return result.value;
}
