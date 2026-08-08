/** 콘솔 표 정렬 유틸. 한글·한자는 터미널에서 2칸을 차지합니다. */

function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    // CJK 한글/한자/전각 기호 대역
    const wide =
      (c >= 0x1100 && c <= 0x115f) ||
      (c >= 0x2e80 && c <= 0xa4cf) ||
      (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xf900 && c <= 0xfaff) ||
      (c >= 0xff00 && c <= 0xff60) ||
      (c >= 0xffe0 && c <= 0xffe6);
    w += wide ? 2 : 1;
  }
  return w;
}

export function padEndW(s: string, width: number): string {
  return s + " ".repeat(Math.max(0, width - displayWidth(s)));
}

export function padStartW(s: string, width: number): string {
  return " ".repeat(Math.max(0, width - displayWidth(s))) + s;
}

/** 표시 너비 기준으로 자릅니다. */
export function truncW(s: string, width: number): string {
  let out = "";
  for (const ch of s) {
    if (displayWidth(out + ch) > width) break;
    out += ch;
  }
  return out;
}

/**
 * 정수 나눗셈의 부동소수점 오차를 피해 퍼센트를 만듭니다.
 * (29 / 100) * 100 은 28.999999999999996 이 되지만, (29 * 100) / 100 은 정확히 29 입니다.
 */
export function percent(part: number, total: number): string {
  if (!total) return "0%";
  const raw = (part * 100) / total;
  return `${Number.isInteger(raw) ? raw : Number(raw.toFixed(2))}%`;
}
