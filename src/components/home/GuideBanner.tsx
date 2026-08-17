import Image from "next/image";
import Link from "next/link";

/**
 * GUIDE — 분리배출 tip 페이지로 보내는 배너.
 * 카드뉴스 바로 아래에 놓아, 훑어본 내용을 더 보고 싶을 때 이어지도록 했습니다.
 * '가이드 보기' 는 버튼처럼 보이지만 링크 영역은 카드 전체입니다 — 손가락으로
 * 누르는 화면이라 표적을 크게 잡는 편이 안전합니다.
 */
export default function GuideBanner() {
  return (
    <section className="px-4 pb-7">
      <span className="text-green-600 block font-mono text-[11px] leading-[1.5] font-bold tracking-[.08em]">
        GUIDE
      </span>
      <h2 className="mt-2 mb-0 text-[21px] leading-[1.3] font-extrabold tracking-[-.03em]">
        분리배출이 헷갈릴 때
      </h2>

      <Link
        href="/tip"
        className="relative mt-4 block h-[176px] overflow-hidden rounded-[20px] bg-[#0A120D] transition-transform active:scale-[.99]"
      >
        <Image
          src="/assets/photo-recycle.png"
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 408px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,24,16,.15)_0%,rgba(9,24,16,.85)_100%)]" />
        <div className="absolute right-5 bottom-5 left-5 text-white">
          <div className="text-[17px] leading-[1.4] font-bold tracking-[-.02em] text-pretty">
            헷갈리는 분리배출, 13가지만 기억하세요
          </div>
          <span className="mt-3 inline-flex h-9 items-center rounded-full border border-white/60 px-4 text-[13px] leading-[1.4] font-medium">
            가이드 보기 →
          </span>
        </div>
      </Link>
    </section>
  );
}
