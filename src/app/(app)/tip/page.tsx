import type { Metadata } from "next";
import SubHeader from "@/components/shell/SubHeader";
import { TIP_ITEMS } from "@/lib/design/content";

export const metadata: Metadata = { title: "분리배출 tip · team_싹싹기름" };

export default function TipPage() {
  return (
    <>
      <SubHeader title="분리배출 tip" />
      <main className="ssak-scroll block min-h-0 flex-1 overflow-y-auto">
        <section
          className="relative overflow-hidden px-5 pt-[30px] pb-[26px] text-white"
          style={{
            background:
              "linear-gradient(172deg,rgba(8,40,24,.5) 0%,rgba(9,44,27,.78) 50%,rgba(8,36,22,.94) 100%),url('/assets/photo-recycle.png') center/cover no-repeat",
          }}
        >
          <div className="text-mint-400 text-[10.5px] font-extrabold tracking-[.14em]">
            SEPARATE COLLECTION
          </div>
          <h1 className="mt-[9px] mb-0 text-[25px] leading-[1.32] font-extrabold tracking-[-.035em] text-pretty">
            헷갈리는 분리배출,
            <br />
            13가지만 기억하세요
          </h1>
          <p className="mt-[14px] mb-0 text-[12.5px] leading-[1.65] font-medium text-white/78 text-pretty">
            분리배출은 &lsquo;잘 버리는 것&rsquo;만큼 &lsquo;잘 놓는 것&rsquo;도
            중요합니다. 일반 주택가에서는 수거 전까지 바람에 날리지 않도록 종이는
            묶고, 비닐은 입구를 단단히 묶어 배출하세요.
          </p>
        </section>

        <section className="border-t border-[rgba(230,236,231,.55)] bg-white/40 px-4 pt-6 pb-[34px]">
          <div className="border-line mx-[2px] mb-4 flex items-baseline justify-between border-b pb-[13px]">
            <div>
              <div className="text-green-600 text-[10.5px] font-extrabold tracking-[.14em]">
                CHECKLIST
              </div>
              <h2 className="mt-[6px] mb-0 text-[20px] font-extrabold tracking-[-.03em]">
                자주 틀리는 13가지
              </h2>
            </div>
            <span className="text-muted-3 text-[11.5px] font-bold">01 — 13</span>
          </div>

          <div className="flex flex-col gap-[10px]">
            {TIP_ITEMS.map((item, i) => (
              <div
                key={item.title}
                className="flex gap-[13px] rounded-[14px] border border-[rgba(230,236,231,.62)] bg-white/50 px-[15px] py-4"
              >
                <span className="text-green-600 shrink-0 pt-[2px] font-mono text-[11px] font-extrabold tracking-[.06em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="text-ink text-[14.5px] leading-[1.4] font-extrabold tracking-[-.02em]">
                    {item.title}
                  </div>
                  <p className="text-muted mt-[7px] mb-0 text-[12.5px] leading-[1.6] text-pretty">
                    {item.lines.map((l, k) => (
                      <span key={k}>
                        {l}
                        {k < item.lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[18px] rounded-xl bg-[rgba(14,42,28,.7)] px-4 py-[15px] text-white">
            <div className="text-mint-400 text-[11px] font-extrabold tracking-[.1em]">
              NOTE
            </div>
            <p className="mt-[7px] mb-0 text-[12.5px] leading-[1.6] text-white/82 text-pretty">
              품목별 기준은 지자체마다 다를 수 있습니다. 헷갈릴 때는 거주 지역의
              배출 기준을 확인하세요.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
