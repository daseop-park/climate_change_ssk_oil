import Link from "next/link";
import AdminPage, { AdminPanel } from "@/components/admin/AdminPage";
import AdminReceivePanel from "@/components/admin/AdminReceivePanel";
import { TableEmpty, Td, Th, Tr } from "@/components/admin/AdminTable";
// 상태 라벨·색은 카드 쪽에 두고 여기서 가져다 씁니다. 두 벌로 두면 한쪽만 고쳐진 채
// 표와 카드가 서로 다른 말을 하게 됩니다.
import AdminWinCards, {
  WIN_STATUS_CLASS,
  WIN_STATUS_LABEL,
} from "@/components/admin/AdminWinCards";
import { formatDateTime } from "@/lib/format-date";
import { adminService } from "@/services/admin.service";
import { REWARD_STATUS, type RewardStatus } from "@/types/reward";

/**
 * 당첨 내역 · 실물 지급 `/admin/wins`.
 *
 * 필터와 페이지 번호는 **URL 에 담습니다.** 서버 컴포넌트가 `searchParams` 로 읽어
 * 그대로 조회하므로 별도 API 라우트가 필요 없고, 운영자가 특정 화면을 북마크하거나
 * 새로고침해도 상태가 유지됩니다.
 *
 * 견적서는 여기에 "당첨 내역 목록 API" 를 두는 것으로 잡았지만, 만들지 않았습니다 —
 * 이 페이지가 서버 컴포넌트라 소비자가 없습니다. 쓰지 않는 엔드포인트는 공격 표면만
 * 늘리고, `/api/admin/dashboard` 처럼 죽은 채 남습니다.
 * (지급 처리는 상호작용이라 라우트가 필요하고, 그건 만들었습니다.)
 */

const FILTERS: { label: string; status?: RewardStatus }[] = [
  { label: "전체" },
  { label: "수령 대기", status: REWARD_STATUS.USED },
  { label: "수령 완료", status: REWARD_STATUS.RECEIVED },
];

/** `?status=` 는 주소창에서 아무 값이나 올 수 있습니다. 아는 값만 통과시킵니다. */
function parseStatus(raw: string | string[] | undefined): RewardStatus | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === REWARD_STATUS.USED || v === REWARD_STATUS.RECEIVED ? v : undefined;
}

function parsePage(raw: string | string[] | undefined): number {
  const v = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(v) && v >= 1 ? Math.trunc(v) : 1;
}

export default async function AdminWinsPage(props: PageProps<"/admin/wins">) {
  const params = await props.searchParams;
  const status = parseStatus(params.status);
  const page = parsePage(params.page);

  const { items, total, pageSize } = await adminService.listWins({ status, page });
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const hrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/admin/wins?${s}` : "/admin/wins";
  };

  return (
    <AdminPage
      title="당첨 내역"
      subtitle={`전체 ${total.toLocaleString("ko-KR")}건 · ${page}/${lastPage} 페이지`}
    >
      <AdminReceivePanel />

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] px-4 pt-[18px] pb-[14px] md:px-[22px]">
          <h3 className="text-ink m-0 text-[14.5px] font-extrabold tracking-[-.02em]">전체 목록</h3>
          <div className="flex items-center gap-[6px]">
            {FILTERS.map((f) => {
              const active = f.status === status;
              const q = f.status ? `?status=${f.status}` : "";
              return (
                <Link
                  key={f.label}
                  href={`/admin/wins${q}`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-[8px] px-[11px] py-[6px] text-[11.5px] font-bold transition-colors ${
                    active
                      ? "bg-green-600 text-white"
                      : "border-line-3 text-muted hover:bg-surface border"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {items.length === 0 ? (
          <TableEmpty>
            {status ? "이 상태의 당첨 내역이 없습니다." : "아직 등록된 코드가 없습니다."}
          </TableEmpty>
        ) : (
          <>
            {/*
              표는 `lg:` 이상에서만 그립니다. 8컬럼이라 좁은 화면에서는 어떻게 접어도
              읽을 수 없고, 컬럼을 지우면 현장에서 대조할 값이 사라집니다.
              `lg:` 이상에서도 사이드바를 뺀 폭이 880px 아래로 내려갈 수 있어
              표 자체는 가로 스크롤합니다 (레이아웃의 `min-w-[1120px]` 을 여기로 내린 것).
            */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[880px] border-collapse">
                <thead>
                  <tr>
                    <Th edge="start">당첨 시각</Th>
                    <Th>코드</Th>
                    <Th>배치</Th>
                    <Th>경품</Th>
                    <Th>성함</Th>
                    <Th>연락처</Th>
                    <Th>지급 시각</Th>
                    <Th edge="end">상태</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((w) => {
                    const s = w.status as RewardStatus;
                    return (
                      <Tr key={w.rewardId}>
                        <Td edge="start" className="text-muted font-mono">
                          {formatDateTime(w.wonAt)}
                        </Td>
                        <Td className="text-ink font-mono font-bold">{w.rewardCode}</Td>
                        <Td className="text-muted">{w.batch}</Td>
                        {/* 1280px 에서 줄어드는 유일한 가변 폭 컬럼입니다. */}
                        <Td className="text-ink max-w-0 truncate font-bold">{w.productName}</Td>
                        <Td className="text-ink font-bold">{w.userNameMasked}</Td>
                        <Td className="text-muted font-mono">{w.phoneMasked}</Td>
                        <Td className="text-muted-3 font-mono">
                          {w.receivedAt ? formatDateTime(w.receivedAt) : "-"}
                        </Td>
                        <Td edge="end">
                          <span
                            className={`rounded-[20px] px-[9px] py-1 text-[10.5px] font-extrabold ${WIN_STATUS_CLASS[s] ?? WIN_STATUS_CLASS.UNUSED}`}
                          >
                            {WIN_STATUS_LABEL[s] ?? s}
                          </span>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 같은 데이터를 두 번 그립니다 — 페이지네이션으로 잘려 있어 비용은 무시할 수준입니다. */}
            <div className="lg:hidden">
              <AdminWinCards items={items} />
            </div>
          </>
        )}

        {lastPage > 1 ? (
          <div className="border-line bg-surface flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] border-t px-4 py-[14px] md:px-[22px]">
            <span className="text-muted-3 text-[11.5px] font-semibold">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}건
            </span>
            <div className="flex items-center gap-[6px]">
              <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
                이전
              </PageLink>
              <PageLink href={hrefFor(page + 1)} disabled={page >= lastPage}>
                다음
              </PageLink>
            </div>
          </div>
        ) : null}
      </AdminPanel>
    </AdminPage>
  );
}

/** 끝 페이지에서는 링크가 아니라 비활성 표시가 되어야 합니다 — 눌러도 같은 화면이면 혼란스럽습니다. */
function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const base = "rounded-[8px] px-[13px] py-[6px] text-[11.5px] font-bold border";
  if (disabled) {
    return <span className={`${base} border-line-3 text-muted-3 opacity-50`}>{children}</span>;
  }
  return (
    <Link href={href} className={`${base} border-line-3 text-ink hover:bg-white`}>
      {children}
    </Link>
  );
}
