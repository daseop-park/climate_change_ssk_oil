import type { Metadata } from "next";
import SubHeader from "@/components/shell/SubHeader";
import SupportActions from "@/components/support/SupportActions";
import { FAQS } from "@/lib/design/content";

export const metadata: Metadata = { title: "고객센터 문의 · team_싹싹기름" };

export default function SupportPage() {
  return (
    <>
      <SubHeader title="고객센터 문의" />
      <main className="ssak-scroll min-h-0 flex-1 overflow-y-auto px-[18px] pt-5 pb-10">
        <SupportActions />

        <h3 className="mx-[2px] mt-6 mb-[10px] text-[14px] font-extrabold">
          자주 묻는 질문
        </h3>
        <div className="flex flex-col gap-[10px]">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="ssak-faq rounded-2xl border border-[rgba(230,236,231,.62)] bg-white/50 px-4 py-[14px]"
            >
              <summary className="cursor-pointer list-none text-[13.5px] font-bold">
                Q. {f.q}
              </summary>
              <p className="text-muted-2 mt-[10px] mb-0 text-[12.5px] leading-[1.6]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
