/* ==========================================================================
   CARD NEWS 캐러셀 데이터 — 이미지 위에 텍스트를 얹는 5장짜리 카드뉴스.
   이미지는 `public/assets/` 기준 경로입니다.
   ========================================================================== */

export type GuideCard = {
  img: string;
  /** 배경 사진이라 의미 전달은 텍스트가 하므로 alt 는 비웁니다. */
  label: string;
  title: string[];
  desc: string;
};

export const GUIDE_CARDS: GuideCard[] = [
  {
    img: "/assets/photo-delivery.png",
    label: "CARD 01 · 표지",
    title: ["자취 1개월 차가 놓치기 쉬운", "자취방 환경 습관"],
    desc: "나도 모르게 늘어나는 전기요금과 쓰레기, 생활 속에서 줄이는 방법.",
  },
  {
    img: "/assets/card-settop.png",
    label: "CARD 02 · 대기전력",
    title: ["셋톱박스의 대기전력,", "확인해 보세요"],
    desc: "평균 12.3W로 TV(1.3W)의 약 9.5배. 오래 집을 비울 땐 절전모드나 멀티탭을 활용하세요.",
  },
  {
    img: "/assets/card-eggshell.png",
    label: "CARD 03 · 음식물류",
    title: ["달걀 껍데기와 치킨 뼈는", "음식물류가 아닙니다"],
    desc: "단단하거나 섬유질이 많아 종량제봉투로 배출합니다. 음식물류는 물기를 뺀 뒤 전용 수거함에.",
  },
  {
    img: "/assets/card-aircon.png",
    label: "CARD 04 · 냉방",
    title: ["짧은 외출에도", "에어컨을 꺼야 할까?"],
    desc: "인버터형은 자주 껐다 켜기보다 설정온도 유지가 유리할 수 있어요. 장시간 외출은 끄는 편이 낫습니다.",
  },
  {
    img: "/assets/card-pad.png",
    label: "CARD 05 · 제품 소개",
    title: ["배달 용기 기름기,", "쉽게 닦아 내세요"],
    desc: "닦아 내면 용기 오염과 세척에 드는 물·세제를 함께 줄일 수 있어요. 싹싹기름 흡수 패드로 간편하게.",
  },
];
