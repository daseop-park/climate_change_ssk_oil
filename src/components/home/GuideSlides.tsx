import type { ReactNode } from "react";

/* ==========================================================================
   GUIDE 캐러셀 슬라이드 — 2160×1080 고정 캔버스 위에 그려집니다.
   실제 표시 크기는 GuideCarousel 이 --slide-scale 로 축소해 맞춥니다.
   ========================================================================== */

const SLIDE_FONT = "'Noto Sans KR', var(--font-sans)";

/** 좌상단 알약 키커 */
function Kicker({ label }: { label: string }) {
  return (
    <div className="bg-green-900 absolute top-16 left-[100px] z-[3] flex items-center gap-5 rounded-full px-11 py-[18px]">
      <span className="bg-mint-400 h-[18px] w-[18px] rounded-full" />
      <span className="text-[34px] font-extrabold tracking-[.12em] text-white">
        {label}
      </span>
    </div>
  );
}

/** 우하단 근거 문구 */
function Note({ children }: { children: ReactNode }) {
  return (
    <div className="text-muted-3 absolute right-[100px] bottom-[66px] z-[3] text-[30px] font-semibold">
      {children}
    </div>
  );
}

/** 라이트 슬라이드 공통 프레임 (장식 원 + 키커 + 근거) */
function LightSlide({
  tip,
  note,
  children,
}: {
  tip: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div
      className="bg-surface-slide relative flex h-[1080px] w-[2160px] flex-col overflow-hidden p-[100px]"
      style={{ fontFamily: SLIDE_FONT }}
    >
      <div className="bg-slide-arc absolute right-[-140px] bottom-[-160px] h-[560px] w-[560px] rounded-full" />
      <Kicker label={tip} />
      <Note>{note}</Note>
      {children}
    </div>
  );
}

function Headline({ children }: { children: ReactNode }) {
  return (
    <div className="text-ink text-[112px] leading-[1.24] font-black tracking-[-0.01em]">
      {children}
    </div>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <div className="text-muted text-[50px] font-medium">{children}</div>
  );
}

/** 강조 스팬 */
function Hi({ children }: { children: ReactNode }) {
  return <span className="text-green-600">{children}</span>;
}

/** 레이아웃 1 — 비교형 */
function Compare({
  bad,
  good,
}: {
  bad: { label: string; text: string };
  good: { label: string; text: string };
}) {
  return (
    <div className="flex w-full max-w-[1700px] gap-12">
      <div className="border-line flex flex-1 flex-col gap-[26px] rounded-[32px] border-2 bg-white p-[52px_48px]">
        <div className="flex items-center gap-5">
          <div className="text-muted-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF0EC] text-[40px] font-black">
            ✕
          </div>
          <span className="text-muted-3 text-[40px] font-extrabold">
            {bad.label}
          </span>
        </div>
        <div className="text-ink-70 text-left text-[52px] leading-[1.4] font-bold">
          {bad.text}
        </div>
      </div>
      <div className="border-green-900 bg-green-900 flex flex-1 flex-col gap-[26px] rounded-[32px] border-2 p-[52px_48px]">
        <div className="flex items-center gap-5">
          <div className="bg-green-600 flex h-16 w-16 items-center justify-center rounded-full text-[36px] font-black text-white">
            ○
          </div>
          <span className="text-mint-400 text-[40px] font-extrabold">
            {good.label}
          </span>
        </div>
        <div className="text-left text-[52px] leading-[1.4] font-bold text-white">
          {good.text}
        </div>
      </div>
    </div>
  );
}

/** 레이아웃 3 — 선언형 */
function Declare({ children }: { children: ReactNode }) {
  return (
    <div className="border-line text-ink-70 max-w-[1700px] rounded-[32px] border-2 bg-white p-[56px_68px] text-[56px] leading-[1.5] font-bold">
      {children}
    </div>
  );
}

const STEP_COLORS = [
  { bg: "#0E2A1C", fg: "#fff" },
  { bg: "#14663F", fg: "#fff" },
  { bg: "#1E8E5A", fg: "#fff" },
  { bg: "#5FD39A", fg: "#0E2A1C" },
];

/** 레이아웃 2 — 단계형 */
function Steps({ steps }: { steps: string[][] }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((lines, i) => (
        <div key={i} className="contents">
          {i > 0 && (
            <div className="text-step-arrow flex h-[100px] w-20 items-center justify-center text-[76px] font-black">
              →
            </div>
          )}
          <div className="flex w-[260px] flex-col items-center gap-5">
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full text-[66px] font-black"
              style={{
                background: STEP_COLORS[i].bg,
                color: STEP_COLORS[i].fg,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-ink text-center text-[46px] font-extrabold">
              {lines.map((l, k) => (
                <span key={k}>
                  {l}
                  {k < lines.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   슬라이드 8장
   ========================================================================== */
export const GUIDE_SLIDES: ReactNode[] = [
  // 01 — EP.1 커버 (딥그린)
  <div
    key="cover"
    className="relative flex h-[1080px] w-[2160px] flex-col overflow-hidden p-[100px]"
    style={{ background: "oklch(30% 0.07 152)", fontFamily: SLIDE_FONT }}
  >
    <div className="bg-green-800 absolute right-[-160px] bottom-[-180px] h-[620px] w-[620px] rounded-full opacity-35" />
    <div className="bg-green-600 absolute top-[-160px] left-[-140px] h-[460px] w-[460px] rounded-full opacity-[.18]" />
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[52px] text-center">
      <div className="text-[140px] leading-[1.24] font-black tracking-[-0.01em] text-white">
        몇 년째 자취했는데,
        <br />
        사실 이거 <span className="text-mint-400">다 틀렸다</span>고?
      </div>
      <div className="text-[50px] font-medium text-white/72">
        분리수거 오해부터 숨은 에너지 낭비까지
      </div>
    </div>
  </div>,

  // 02 — CONTENTS
  <div
    key="contents"
    className="bg-surface-slide relative flex h-[1080px] w-[2160px] flex-col overflow-hidden p-[100px]"
    style={{ fontFamily: SLIDE_FONT }}
  >
    <div className="bg-slide-arc absolute right-[-140px] bottom-[-160px] h-[560px] w-[560px] rounded-full" />
    <Kicker label="CONTENTS" />
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[60px] pt-[60px] text-center">
      <Headline>
        분리수거 열심히 했는데
        <br />다 <Hi>반려</Hi>되고 있었다면?
      </Headline>
      <div className="flex w-full max-w-[1700px] flex-col gap-7">
        {[
          { n: "1", bg: "#0E2A1C", text: "오해하기 쉬운 분리수거, 4가지" },
          { n: "2", bg: "#1E8E5A", text: "숨은 에너지 낭비 잡는 법, 2가지" },
        ].map((row) => (
          <div
            key={row.n}
            className="border-line flex items-center gap-9 rounded-[28px] border-2 bg-white p-[44px_52px]"
          >
            <div
              className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full text-[52px] font-black text-white"
              style={{ background: row.bg }}
            >
              {row.n}
            </div>
            <span className="text-ink text-left text-[54px] font-bold">
              {row.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>,

  // 03 — TIP 01 · 종이팩 (비교형)
  <LightSlide key="tip01" tip="TIP 01 · 종이팩" note="종이팩 재활용률 약 13%">
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[60px] pt-[60px] text-center">
      <div className="flex flex-col gap-[26px]">
        <Headline>
          우유팩·두유팩도
          <br />
          따로 <Hi>버려야</Hi> 해요
        </Headline>
        <Sub>종이류함에 넣으면 재활용되지 않습니다</Sub>
      </div>
      <Compare
        bad={{
          label: "일반 종이류함",
          text: "코팅층 때문에 선별되지 못하고 그대로 소각돼요.",
        }}
        good={{
          label: "종이팩 수거함",
          text: "헹궈서 펼쳐 배출하면 화장지 원료로 재탄생해요.",
        }}
      />
    </div>
  </LightSlide>,

  // 04 — TIP 02 · 페트병 (단계형)
  <LightSlide
    key="tip02"
    tip="TIP 02 · 페트병"
    note="라벨·뚜껑을 분리하면 원료 등급이 올라갑니다"
  >
    <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-20">
      <div className="text-center">
        <Headline>
          투명 페트병, <Hi>4단계</Hi>만
          <br />
          기억하세요
        </Headline>
      </div>
      <Steps
        steps={[
          ["내용물", "비우기"],
          ["라벨", "제거"],
          ["찌그러", "뜨리기"],
          ["뚜껑", "닫기"],
        ]}
      />
      <div className="text-muted text-center text-[44px] font-medium">
        이 순서만 지키면 고품질 재활용 원료로 다시 태어나요
      </div>
    </div>
  </LightSlide>,

  // 05 — TIP 03 · 택배 상자 (비교형)
  <LightSlide
    key="tip03"
    tip="TIP 03 · 택배 상자"
    note="이물질이 섞이면 상자 한 묶음이 통째로 반려됩니다"
  >
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[60px] pt-[60px] text-center">
      <div className="flex flex-col gap-[26px]">
        <Headline>
          송장 스티커 남으면
          <br />
          재활용 <Hi>불가</Hi>예요
        </Headline>
        <Sub>깨끗이 씻는 것만으로는 부족합니다</Sub>
      </div>
      <Compare
        bad={{
          label: "접어서 그대로",
          text: "테이프와 운송장이 붙은 채로는 선별장에서 걸러져요.",
        }}
        good={{
          label: "모두 떼고 배출",
          text: "테이프·송장·스테이플러심까지 제거하면 그대로 재활용돼요.",
        }}
      />
    </div>
  </LightSlide>,

  // 06 — TIP 04 · 폐의약품 (선언형)
  <LightSlide
    key="tip04"
    tip="TIP 04 · 폐의약품"
    note="약국·보건소·주민센터에서 상시 수거"
  >
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[60px] pt-[60px] text-center">
      <div className="flex flex-col gap-[26px]">
        <Headline>
          먹다 남은 약,
          <br />그냥 버리면 <Hi>안 돼요</Hi>
        </Headline>
        <Sub>하천으로 흘러 수질오염으로 이어집니다</Sub>
      </div>
      <Declare>
        알약은 포장을 벗겨 알맹이만, 물약은 한 병에 모아
        <br />
        <Hi>폐의약품 수거함</Hi>에 넣어주세요.
      </Declare>
    </div>
  </LightSlide>,

  // 07 — TIP 05 · 난방 (비교형)
  <LightSlide key="tip05" tip="TIP 05 · 난방" note="외출 2~3시간 이내 기준">
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[60px] pt-[60px] text-center">
      <div className="flex flex-col gap-[26px]">
        <Headline>
          짧은 외출엔
          <br />
          보일러 <Hi>끄지 마세요</Hi>
        </Headline>
        <Sub>껐다 켜는 쪽이 오히려 에너지를 더 씁니다</Sub>
      </div>
      <Compare
        bad={{
          label: "완전히 끄기",
          text: "식은 집을 다시 데우는 데 더 많은 연료가 들어가요.",
        }}
        good={{
          label: "외출 모드 유지",
          text: "낮은 온도로 계속 두면 재가동 부담 없이 절약돼요.",
        }}
      />
    </div>
  </LightSlide>,

  // 08 — TIP 06 · 단열 (선언형)
  <LightSlide
    key="tip06"
    tip="TIP 06 · 단열"
    note="문풍지·문틈 스펀지 1만 원 이내"
  >
    <div className="relative z-[2] flex flex-1 flex-col items-center justify-center gap-[60px] pt-[60px] text-center">
      <div className="flex flex-col gap-[26px]">
        <Headline>
          진짜 찬바람은
          <br />
          <Hi>문틈</Hi>에서 새요
        </Headline>
        <Sub>창문 자체보다 틈새 열손실이 큽니다</Sub>
      </div>
      <Declare>
        창틀과 현관문 틈을 먼저 막아보세요.
        <br />
        난방을 올리지 않아도 <Hi>체감 온도가 달라집니다.</Hi>
      </Declare>
    </div>
  </LightSlide>,
];
