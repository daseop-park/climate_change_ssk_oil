import type { CSSProperties } from "react";

/**
 * 상품 이미지 플레이스홀더(대각선 스트라이프).
 *
 * 상품마다 `hue` 를 달리 줘서 사진이 없어도 서로 구분됩니다.
 * 실제 상품 사진이 준비되면 `Product.image` 를 채우고 이 함수는 폴백으로만 남깁니다.
 *
 * (프로토타입의 `lib/design/prizes.ts` 에서 옮겨왔습니다 — 그 파일의 정적 경품 목록은
 *  `GET /api/prizes` 로 대체되어 사라졌지만, 이 함수는 순수 스타일 계산이라 남겼습니다.)
 */
export function imgFor(hue: number): CSSProperties {
  return {
    background: `repeating-linear-gradient(135deg, hsl(${hue} 32% 92%) 0 11px, hsl(${hue} 32% 88%) 11px 22px)`,
  };
}
