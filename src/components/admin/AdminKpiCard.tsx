/**
 * KPI 카드 한 장 — 라벨 · 수치 · 델타 · 진행바 · 캡션.
 *
 * 서버 컴포넌트입니다. 상호작용이 없고 값이 전부 DTO 로 내려오므로
 * `"use client"` 를 붙일 이유가 없습니다 — 붙이면 번들만 커집니다.
 */
export type KpiTone = "positive" | "muted" | "danger";

const TONE: Record<KpiTone, string> = {
  positive: "text-green-600",
  muted: "text-muted-3",
  danger: "text-danger",
};

export default function AdminKpiCard({
  label,
  value,
  delta,
  deltaTone = "positive",
  /** 진행바 채움 비율 0~100 */
  ratio,
  /** 진행바 색. 카드마다 달라 디자인에서 위계를 만듭니다 */
  barClass = "bg-green-600",
  caption,
  captionTone = "muted",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: KpiTone;
  ratio: number;
  barClass?: string;
  caption: string;
  captionTone?: KpiTone;
}) {
  // 데이터가 튀어도 진행바가 카드 밖으로 나가지 않게 잘라 둡니다.
  const width = Math.max(0, Math.min(100, ratio));

  return (
    <div className="border-line flex flex-col gap-[10px] rounded-[14px] border bg-white px-5 py-[18px]">
      <span className="text-muted-3 text-[11px] font-extrabold tracking-[.08em]">{label}</span>

      <div className="flex items-baseline gap-[7px]">
        <span className="text-ink text-[28px] font-black tracking-[-.03em]">{value}</span>
        {delta ? (
          <span className={`text-[11.5px] font-extrabold ${TONE[deltaTone]}`}>{delta}</span>
        ) : null}
      </div>

      <div className="bg-track h-[6px] overflow-hidden rounded-[6px]">
        <div className={`h-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>

      <span className={`text-[11px] font-semibold ${TONE[captionTone]}`}>{caption}</span>
    </div>
  );
}
