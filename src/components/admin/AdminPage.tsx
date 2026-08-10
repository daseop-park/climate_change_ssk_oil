/**
 * 콘솔 페이지 한 장 — 헤더 + 본문.
 *
 * 헤더를 레이아웃이 아니라 페이지가 그립니다. 제목·부제가 화면마다 다르고,
 * 레이아웃은 경로를 알 수 없기 때문입니다(`layout.tsx` 는 pathname 을 받지 않습니다).
 * 경로 → 제목 표를 따로 두면 메뉴를 늘릴 때마다 두 곳을 맞춰야 합니다.
 *
 * 핸드오프 헤더 우측의 **기간 필터**와 **CSV 내보내기**는 없습니다 —
 * CSV 는 CLI(`npm run db:issue --csv`)로 넘겼고 기간 필터는 조회 범위가 고정이라
 * 기각했습니다. 자리는 `actions` 로 남겨 둡니다.
 */
export default function AdminPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-line flex items-center justify-between border-b bg-white px-7 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-ink m-0 text-[19px] font-extrabold tracking-[-.025em]">{title}</h1>
          {subtitle ? (
            <span className="text-muted-3 text-[12px] font-medium">{subtitle}</span>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-[9px]">{actions}</div> : null}
      </header>

      <div className="flex flex-1 flex-col gap-5 px-7 pt-6 pb-8">{children}</div>
    </>
  );
}

/**
 * 콘솔의 기본 표면 — 불투명 흰색 + 1px 테두리.
 *
 * 사용자 화면의 유리 질감(반투명 + backdrop-filter)은 여기서 쓰지 않습니다.
 * 관리 화면은 밀도와 가독성이 우선이라 그림자 대신 테두리로만 구분합니다.
 * (`admin_handoff/README.md` Design Tokens)
 */
export function AdminPanel({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-line rounded-[14px] border bg-white ${className}`}>{children}</div>
  );
}
