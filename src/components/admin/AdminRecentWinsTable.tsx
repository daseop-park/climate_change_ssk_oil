import Link from "next/link";
import { TableEmpty, Td, Th, Tr } from "@/components/admin/AdminTable";
import { formatDateTime } from "@/lib/format-date";
import { REWARD_STATUS, type RewardStatus } from "@/types/reward";
import type { RecentWinDto } from "@/types/dto";

/**
 * 최근 당첨 — 7컬럼.
 *
 * 1280px 의 **유일한 병목**입니다. 시각·코드·연락처가 monospace 고정폭이고 패딩이
 * 22/12px 라 가변 폭 컬럼은 경품명뿐입니다. 경품명에 `truncate` 를 걸어야 들어갑니다
 * (`docs/phase5-admin-estimate.md` §8). `table-fixed` 가 아니라 `truncate` 를 쓰는 이유는
 * 나머지 컬럼이 내용에 맞춰 줄어들 여지를 남기기 위해서입니다.
 *
 * ⚠️ 성함·연락처는 **이미 마스킹된 값**만 받습니다 (`RecentWinDto`). 여기서 가리는 것이
 *    아닙니다 — 화면에서 가리면 평문이 이미 네트워크 탭에 남은 뒤입니다.
 */

const STATUS_LABEL: Record<RewardStatus, string> = {
  UNUSED: "미등록",
  USED: "수령 대기",
  RECEIVED: "수령 완료",
};

/**
 * 뱃지 색. 핸드오프의 `미사용`(초록) / `사용완료`(회색) 대비를 그대로 씁니다 —
 * 우리 화면에서는 **아직 할 일이 남은 쪽**(수령 대기)이 초록입니다.
 */
const STATUS_CLASS: Record<RewardStatus, string> = {
  UNUSED: "text-muted-3 bg-line-2",
  USED: "text-green-600 bg-chip-bg",
  RECEIVED: "text-muted-3 bg-line-2",
};

export default function AdminRecentWinsTable({ wins }: { wins: RecentWinDto[] }) {
  return (
    <div className="border-line overflow-hidden rounded-[14px] border bg-white">
      <div className="flex items-baseline justify-between px-[22px] pt-[18px] pb-[14px]">
        <h3 className="text-ink m-0 text-[14.5px] font-extrabold tracking-[-.02em]">최근 당첨</h3>
        <Link href="/admin/wins" className="text-green-600 text-[11.5px] font-bold">
          당첨 내역 전체
        </Link>
      </div>

      {wins.length === 0 ? (
        <TableEmpty>아직 등록된 코드가 없습니다.</TableEmpty>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th edge="start">시각</Th>
              <Th>코드</Th>
              <Th>배치</Th>
              <Th>경품</Th>
              <Th>성함</Th>
              <Th>연락처</Th>
              <Th edge="end">상태</Th>
            </tr>
          </thead>
          <tbody>
            {wins.map((w) => {
              const status = w.status as RewardStatus;
              return (
                <Tr key={w.rewardId}>
                  <Td edge="start" className="text-muted font-mono">
                    {formatDateTime(w.wonAt)}
                  </Td>
                  <Td className="text-ink font-mono font-bold">{w.rewardCode}</Td>
                  <Td className="text-muted">{w.batch}</Td>
                  {/* 가변 폭은 이 칸뿐입니다 — 1280px 에서 여기가 줄어들며 표가 들어갑니다. */}
                  <Td className="text-ink max-w-0 truncate font-bold">{w.productName}</Td>
                  <Td className="text-ink font-bold">{w.userNameMasked}</Td>
                  <Td className="text-muted font-mono">{w.phoneMasked}</Td>
                  <Td edge="end">
                    <span
                      className={`rounded-[20px] px-[9px] py-1 text-[10.5px] font-extrabold ${STATUS_CLASS[status] ?? STATUS_CLASS[REWARD_STATUS.UNUSED]}`}
                    >
                      {STATUS_LABEL[status] ?? status}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
