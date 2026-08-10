import type { Metadata } from "next";
import SubHeader from "@/components/shell/SubHeader";
import { ABOUT_CHAIN, ABOUT_TEAM } from "@/lib/design/content";

export const metadata: Metadata = { title: "About us · team_싹싹기름" };

export default function AboutPage() {
  return (
    <>
      <SubHeader title="About us" />
      <main className="ssak-scroll block min-h-0 flex-1 overflow-y-auto">
        <section
          className="relative overflow-hidden px-5 pt-[30px] pb-[26px] text-white"
          style={{
            background:
              "linear-gradient(172deg,rgba(8,40,24,.5) 0%,rgba(9,44,27,.78) 50%,rgba(8,36,22,.94) 100%),url('/assets/photo-delivery.png') center/cover no-repeat",
          }}
        >
          <div className="text-mint-400 text-[10.5px] font-extrabold tracking-[.14em]">
            ABOUT US
          </div>
          <p className="mt-3 mb-0 text-[12.5px] font-semibold tracking-[-.01em] text-white/72">
            아미유 주최 기후 변화 대응 공모전 싹싹기름팀
          </p>
          <h1 className="mt-[9px] mb-0 text-[25px] leading-[1.32] font-extrabold tracking-[-.035em] text-pretty">
            배달용기의 잔여 기름을
            <br />
            세척하는 기름 흡수 패드 제작
          </h1>
        </section>

        <section className="border-b border-[rgba(230,236,231,.55)] bg-white/40 px-[18px] pt-[26px] pb-7">
          <div className="text-green-600 text-[10.5px] font-extrabold tracking-[.14em]">
            BACKGROUND
          </div>
          <h2 className="mt-[7px] mb-0 text-[20px] font-extrabold tracking-[-.03em]">
            아이디어 배경
          </h2>
          <p className="text-ink mt-[14px] mb-5 text-[13.5px] leading-[1.6] font-bold tracking-[-.01em]">
            그야말로 배달의 민족인 대한민국 사람들
          </p>
          <div className="flex flex-col gap-[10px]">
            {ABOUT_CHAIN.map((text, i) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl border border-[rgba(230,236,231,.8)] bg-[rgba(245,248,245,.55)] px-[15px] py-[14px]"
              >
                <span className="text-green-600 shrink-0 pt-[2px] text-[10.5px] font-extrabold tracking-[.06em]">
                  0{i + 1}
                </span>
                <span className="text-ink-60 text-[13px] leading-[1.55] font-semibold tracking-[-.01em]">
                  {text}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-[rgba(14,42,28,.7)] px-4 py-[15px] text-[14px] font-extrabold tracking-[-.015em] text-white">
            그래서 만들었습니다.
          </div>
        </section>

        <section className="px-[18px] pt-[26px] pb-[34px]">
          <div className="text-green-600 text-[10.5px] font-extrabold tracking-[.14em]">
            TEAM
          </div>
          <h2 className="mt-[7px] mb-4 text-[20px] font-extrabold tracking-[-.03em]">
            팀원 소개
          </h2>
          <div className="flex flex-col gap-2">
            {ABOUT_TEAM.map((t) => {
              const lead = t.role === "팀장";
              return (
                <div
                  key={t.name}
                  className="flex items-center gap-[13px] rounded-xl border border-[rgba(230,236,231,.62)] bg-white/50 px-[15px] py-[13px]"
                >
                  <div
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold"
                    style={{
                      background: lead ? "#1E8E5A" : "#E7F2EC",
                      color: lead ? "#fff" : "#1E8E5A",
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-bold tracking-[-.01em]">
                      {t.name}
                    </div>
                    <div
                      className="mt-[3px] text-[10.5px] font-extrabold tracking-[.1em]"
                      style={{ color: lead ? "#1E8E5A" : "#8A9A90" }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
