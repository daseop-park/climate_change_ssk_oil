/**
 * 콘솔 테이블의 공통 조각.
 *
 * 5.2 의 최근 당첨에 이어 5.3·5.4·5.5 가 같은 모양의 표를 씁니다. 헤더 셀 스타일을
 * 화면마다 적어 두면 한 곳만 고쳐진 표가 생기는데, 나란히 놓이지 않아 눈에 띄지 않습니다.
 *
 * 핸드오프 규칙 두 가지를 여기에 박아 둡니다.
 *   - 헤더는 `surface` 배경 + 상하 `line` 테두리, `11px/800/.06em/muted-3`
 *   - **수치는 우측 정렬 + monospace.** 자릿수가 세로로 맞아야 크기를 눈으로 비교할 수 있습니다
 */

/** 양끝 컬럼은 22px, 가운데는 12px — 표가 카드 모서리에 붙지 않게 합니다. */
type Edge = "start" | "end" | "middle";

const PAD: Record<Edge, string> = {
  start: "pl-[22px] pr-3",
  middle: "px-3",
  end: "pr-[22px] pl-3",
};

export function Th({
  children,
  numeric = false,
  edge = "middle",
}: {
  children: React.ReactNode;
  /** 수치 컬럼 — 우측 정렬 */
  numeric?: boolean;
  edge?: Edge;
}) {
  return (
    <th
      scope="col"
      className={`text-muted-3 border-line bg-surface border-t border-b py-[10px] text-[11px] font-extrabold tracking-[.06em] ${PAD[edge]} ${numeric ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  numeric = false,
  edge = "middle",
  className = "",
}: {
  children: React.ReactNode;
  numeric?: boolean;
  edge?: Edge;
  className?: string;
}) {
  return (
    <td
      className={`py-[13px] text-[12.5px] ${PAD[edge]} ${numeric ? "text-right font-mono" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-line-2 border-b last:border-b-0">{children}</tr>;
}

/** 표 자리에 들어가는 빈 상태. 헤더까지 지우면 무엇이 없는지조차 안 보입니다. */
export function TableEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-3 border-line m-0 border-t px-[22px] py-8 text-center text-[12px] font-semibold">
      {children}
    </p>
  );
}
