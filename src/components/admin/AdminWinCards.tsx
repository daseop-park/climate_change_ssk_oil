import { formatDateTime } from "@/lib/format-date";
import type { RecentWinDto } from "@/types/dto";
import type { RewardStatus } from "@/types/reward";

/**
 * 당첨 내역 — `lg:` 미만 카드 리스트.
 *
 * ## 왜 `AdminTable` 을 고치지 않았나
 *
 * `AdminTable` 의 `Th`·`Td`·`Tr` 은 `/admin/codes`·`/admin/prizes`·`/admin/wins`·
 * 대시보드 최근 당첨 **4곳이 공유**합니다. 모바일 카드 전환을 거기에 심으면
 * 폰에서 볼 일이 없는 조회 화면 셋까지 같이 바뀝니다. 현장 업무 화면 하나 때문에
 * 공유 컴포넌트에 화면별 분기를 넣는 것보다, 그 화면에서만 쓰는 컴포넌트를 하나 더
 * 만드는 편이 안전합니다 (`docs/polishing/sdd/sdd-responsive-layout.md` §5-3).
 *
 * 같은 데이터를 표와 카드로 두 번 렌더하지만, 목록은 페이지네이션으로 잘려 있어
 * 실제 비용은 무시할 수준입니다.
 *
 * ⚠️ 성함·연락처는 **이미 마스킹된 값**만 받습니다 (`RecentWinDto`).
 */

export const WIN_STATUS_LABEL: Record<RewardStatus, string> = {
  UNUSED: "미등록",
  USED: "수령 대기",
  RECEIVED: "수령 완료",
};

/** 아직 할 일이 남은 쪽(수령 대기)이 초록입니다 — 끝난 건은 회색으로 가라앉습니다. */
export const WIN_STATUS_CLASS: Record<RewardStatus, string> = {
  UNUSED: "text-muted-3 bg-line-2",
  USED: "text-green-600 bg-chip-bg",
  RECEIVED: "text-muted-3 bg-line-2",
};

export default function AdminWinCards({ items }: { items: RecentWinDto[] }) {
  return (
    <ul className="border-line m-0 flex list-none flex-col gap-0 border-t p-0">
      {items.map((w) => {
        const s = w.status as RewardStatus;
        return (
          <li
            key={w.rewardId}
            className="border-line-2 flex flex-col gap-[9px] border-b px-4 py-[14px] last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-ink min-w-0 flex-1 text-[13.5px] font-bold">
                {w.productName}
              </span>
              <span
                className={`flex-shrink-0 rounded-[20px] px-[9px] py-1 text-[10.5px] font-extrabold ${
                  WIN_STATUS_CLASS[s] ?? WIN_STATUS_CLASS.UNUSED
                }`}
              >
                {WIN_STATUS_LABEL[s] ?? s}
              </span>
            </div>

            {/*
              현장에서 이 화면을 보는 이유는 **누가 무엇을 아직 못 받았는가** 하나입니다.
              그래서 경품명·성함·상태를 위로 올리고, 코드와 배치는 대조용으로 아래 둡니다.
            */}
            <div className="flex flex-wrap items-baseline gap-x-[10px] gap-y-1">
              <span className="text-ink text-[12.5px] font-bold">{w.userNameMasked}</span>
              <span className="text-muted font-mono text-[12px]">{w.phoneMasked}</span>
            </div>

            <dl className="text-muted-3 m-0 grid grid-cols-[auto_1fr] gap-x-[10px] gap-y-[3px] text-[11.5px] font-semibold">
              <dt className="m-0">코드</dt>
              <dd className="text-muted m-0 font-mono">
                {w.rewardCode}
                <span className="text-muted-3 font-sans"> · {w.batch}</span>
              </dd>

              <dt className="m-0">당첨</dt>
              <dd className="text-muted m-0 font-mono">{formatDateTime(w.wonAt)}</dd>

              <dt className="m-0">지급</dt>
              <dd className="m-0 font-mono">
                {w.receivedAt ? formatDateTime(w.receivedAt) : "-"}
              </dd>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
