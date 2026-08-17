import Link from "next/link";

/** About / 마이페이지 / 고객센터 / 분리배출 tip 공통 헤더 */
export default function SubHeader({ title }: { title: string }) {
  return (
    <header className="ssak-subheader border-line sticky top-0 z-20 flex h-[58px] shrink-0 items-center justify-between border-b bg-[rgba(245,248,245,.9)] pr-2 pl-[6px] backdrop-blur-[12px]">
      <Link
        href="/"
        aria-label="뒤로"
        className="flex h-11 w-11 items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <polyline
            points="15 5 8 12 15 19"
            stroke="#17211C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <span className="text-ink text-[15px] font-bold tracking-[-.02em]">
        {title}
      </span>
      <div className="w-11" />
    </header>
  );
}
