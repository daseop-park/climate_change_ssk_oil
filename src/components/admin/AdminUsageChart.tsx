import type { DailyUsageDto } from "@/types/dto";

/**
 * 일별 코드 사용 — CSS flex 스택 막대.
 *
 * 차트 라이브러리를 넣지 않았습니다. 막대 14개에 시리즈 2개면 `height: %` 로 끝나는데,
 * 라이브러리는 대부분 클라이언트 전용이라 이 서버 컴포넌트를 통째로 클라이언트로
 * 끌어내리게 됩니다. 시각 언어(색 2종 · radius 5px · gap 9px)는 핸드오프 값 그대로입니다.
 *
 * ## 두 시리즈를 무엇으로 잡았나
 *
 * 핸드오프는 `사용`과 `당첨`을 쌓았는데, 우리 모델에서는 **그 둘이 같은 숫자**입니다 —
 * 꽝이 없어서 코드를 쓰면 곧 당첨입니다. 쌓아 봐야 한쪽이 다른 쪽의 복제가 됩니다.
 * 그래서 실제로 다른 두 값인 **등록**(`usedAt`)과 **지급**(`receivedAt`)으로 바꿨습니다.
 * 현장 운영자가 보는 질문 — "오늘 몇 개 등록됐고 몇 개 나갔나" — 에 그대로 대응합니다.
 */

/** 막대 높이의 최소값(%). 1건이 0px 로 그려져 "없음"처럼 보이는 것을 막습니다. */
const MIN_VISIBLE = 2;

function barHeight(value: number, max: number): string {
  if (value === 0) return "0%";
  return `${Math.max(MIN_VISIBLE, (value / max) * 100)}%`;
}

export default function AdminUsageChart({ daily }: { daily: DailyUsageDto[] }) {
  // 스택이므로 축 상한은 두 시리즈의 **합** 기준입니다. 최댓값이 0이면 나눗셈이 NaN 이 됩니다.
  const max = Math.max(...daily.map((d) => d.registered + d.received), 1);
  const total = daily.reduce((sum, d) => sum + d.registered + d.received, 0);
  const lastIndex = daily.length - 1;

  return (
    <div className="border-line flex flex-col gap-[18px] rounded-[14px] border bg-white px-[22px] pt-5 pb-[22px]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-ink m-0 text-[14.5px] font-extrabold tracking-[-.02em]">
          일별 코드 사용
        </h3>
        <div className="flex items-center gap-[14px]">
          <Legend className="bg-green-600" label="등록" />
          <Legend className="bg-mint-200" label="지급" />
        </div>
      </div>

      <div className="border-line relative flex h-[186px] items-end gap-[9px] border-b pb-[22px]">
        {daily.map((d, i) => {
          // 마지막 막대는 아직 끝나지 않은 '오늘' 입니다. 색을 죽여 완결된 날과 구분합니다 —
          // 같은 색이면 오늘이 유난히 저조한 날처럼 보입니다.
          const today = i === lastIndex;
          return (
            <div
              key={d.date}
              title={`${d.date} · 등록 ${d.registered} · 지급 ${d.received}`}
              className="flex h-full flex-1 flex-col justify-end gap-[3px]"
            >
              <div
                className={`rounded-t-[5px] ${today ? "bg-step-arrow" : "bg-green-600"}`}
                style={{ height: barHeight(d.registered, max) }}
              />
              <div
                className={today ? "bg-[#DCE7E0]" : "bg-mint-200"}
                style={{ height: barHeight(d.received, max) }}
              />
            </div>
          );
        })}

        {total === 0 ? (
          <p className="text-muted-3 absolute inset-x-0 top-1/2 m-0 -translate-y-1/2 text-center text-[12px] font-semibold">
            최근 {daily.length}일간 등록된 코드가 없습니다.
          </p>
        ) : null}
      </div>

      <div className="text-muted-3 flex justify-between text-[11px] font-semibold">
        {/* 14개 날짜를 다 적으면 1280px 에서 겹칩니다. 양끝과 4일 간격만 찍습니다. */}
        {daily.map((d, i) =>
          i === lastIndex || i % 4 === 0 ? (
            <span key={d.date}>
              {shortDate(d.date)}
              {i === lastIndex ? " (진행 중)" : ""}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className={`h-[9px] w-[9px] rounded-[3px] ${className}`} />
      <span className="text-muted text-[11px] font-bold">{label}</span>
    </div>
  );
}

/** `2026-08-10` → `8/10`. 이미 KST 로 만들어진 키라 여기서 다시 변환하지 않습니다. */
function shortDate(key: string): string {
  const [, month, day] = key.split("-");
  return `${Number(month)}/${Number(day)}`;
}
