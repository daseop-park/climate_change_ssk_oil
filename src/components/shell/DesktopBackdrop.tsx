import Image from "next/image";

/**
 * 데스크톱(`lg:` 이상) 셸 바깥 여백을 채우는 캠페인 배경.
 *
 * ## 왜 CSS 로만 숨기나
 *
 * 서버는 뷰포트를 모릅니다. `useMediaQuery` 같은 JS 분기를 쓰면 첫 렌더가 서버와
 * 어긋나 하이드레이션 경고가 나거나, 맞추려고 마운트 후에 켜면 모바일에서도
 * 한 프레임 깜빡입니다. **`lg:` 유틸리티로만** 제어합니다.
 *
 * 숨김 판정을 삽입부(`AppShell`)가 아니라 이 컴포넌트가 가지고 있습니다 —
 * 호출부는 `<DesktopBackdrop />` 한 줄만 보면 되고, "언제 보이는가"는 여기 한 곳에만
 * 적혀 있습니다.
 *
 * ## 네트워크 비용
 *
 * 배경 사진은 `Intro` 가 이미 쓰는 `/assets/intro-bg-earth.png` 를 재사용합니다.
 * 여기서는 **`priority` 를 붙이지 않습니다.** 기본 `loading="lazy"` 라 `display:none`
 * 인 동안(=`lg:` 미만) 브라우저가 아예 받지 않습니다 — 레이아웃 박스가 없어
 * 뷰포트와 교차할 일이 없기 때문입니다. 모바일에 한 바이트도 늘지 않습니다.
 *
 * ## 접근성
 *
 * 순수 장식이라 `aria-hidden` 입니다. 같은 로고·문구가 셸 안 `Intro` 에 접근 가능한
 * 형태로 이미 있어서, 스크린리더에 두 번 읽히면 손해입니다.
 */
export default function DesktopBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden bg-[#0D1A12] select-none lg:block"
    >
      <Image
        src="/assets/intro-bg-earth.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* 셸이 떠 보이도록 바깥을 눌러 둡니다. 가운데가 가장 밝고 가장자리로 갈수록 어둡습니다. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_45%,rgba(8,18,12,.42)_0%,rgba(8,18,12,.72)_55%,rgba(6,14,10,.9)_100%)]" />

      {/*
        좌측 카피 — 셸 왼쪽 여백의 가운데에 놓습니다.
        `right` 를 셸의 왼쪽 모서리(중앙에서 220px = 440/2)보다 32px 더 왼쪽에 두어
        폭이 좁아져도 셸과 겹치지 않습니다. 여백이 좁아지면 글이 접힐 뿐입니다.

        문구와 로고는 `Intro` 의 것을 그대로 씁니다 — 여기서 새 카피를 만들면
        디자인 스펙에 없는 문장이 화면에만 생깁니다.
      */}
      <div className="absolute top-1/2 right-[calc(50%+252px)] left-0 flex -translate-y-1/2 justify-center px-8">
        <div className="flex w-full max-w-[400px] flex-col items-start gap-9 drop-shadow-[0_6px_24px_rgba(0,0,0,.45)]">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold tracking-[.22em] text-white/68 uppercase">
              team_싹싹기름
            </span>
            <p className="m-0 text-[30px] leading-[1.4] font-bold text-white text-pretty">
              기름 한 방울부터
              <br />
              지구는 달라집니다.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4">
            <Image
              src="/assets/logo-amiyu.png"
              alt=""
              width={220}
              height={65}
              className="block h-auto w-[168px]"
            />
            <Image
              src="/assets/logo-fruit3.png"
              alt=""
              width={186}
              height={60}
              className="block h-auto w-[142px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
