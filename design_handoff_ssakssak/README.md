# Handoff: team_싹싹기름 — 기름 흡수 패드 즉석 당첨 모바일 웹앱

## Overview

아미유 주최 기후변화 대응 공모전 출품작. 배달용기의 잔여 기름을 닦는 **기름 흡수 패드**에 인쇄된 1회용 영문 코드를 입력하면 그 자리에서 경품(상품권·쿠폰) 당첨 여부가 공개되는 모바일 웹앱입니다.

핵심 플로우: **패드로 기름 흡수 → 패드의 QR/코드 확인 → 앱에서 코드 입력 → 즉석 당첨 결과 → 경품함 저장**

부가 콘텐츠: 프로젝트 소개(About us), 분리배출 팁(캐러셀 + 체크리스트), 마이페이지(경품함), 고객센터.

---

## About the Design Files

이 번들의 HTML 파일은 **HTML로 제작한 디자인 레퍼런스(프로토타입)** 입니다. 의도한 화면·인터랙션을 보여주기 위한 것이며, 그대로 프로덕션에 복사해 넣을 코드가 아닙니다.

목표는 이 디자인을 **대상 코드베이스(Next.js App Router + TypeScript + Tailwind CSS)의 기존 패턴과 라이브러리로 재구현**하는 것입니다. 인라인 스타일은 Tailwind 유틸리티로, DCLogic 클래스 컴포넌트는 함수형 컴포넌트 + hooks로 옮기세요.

**프로토타입에서 더미로 구현된 것 (반드시 서버로 이전):**
- 당첨 결과 — 현재는 코드 문자열의 해시로 결정됨. 실제로는 서버가 코드 검증·중복 사용 방지·경품 재고 차감을 원자적으로 처리해야 합니다.
- 사용 코드/당첨 내역 — 현재 클라이언트 state. 실제로는 DB.
- 통계 숫자(내 당첨, 사용한 코드) — 현재 배열 length.

## Fidelity

**High-fidelity (hifi).** 색상·타이포·간격·인터랙션이 모두 확정된 값입니다. 아래 토큰과 스펙 그대로 픽셀 단위로 재현하세요. 단, 상품 이미지·팀 사진 등 실제 에셋은 아직 플레이스홀더(대각선 스트라이프 패턴 / "상품 이미지" 라벨)입니다.

---

## Shell / 프레임

앱 전체는 모바일 폭 고정 셸 안에 들어갑니다.

```
바깥: min-height:100vh; background:#E4EBE5; flex center
셸:   width:100%; max-width:440px; height:100dvh;
      background:#F5F8F5; overflow:hidden;
      box-shadow:0 20px 60px rgba(23,33,28,.14);
      display:flex; flex-direction:column;
```

실서비스에서는 `max-width:440px` 데스크톱 셸을 유지할지 결정하세요. 유지 시 `100dvh` 필수(주소창 대응).

---

## Screens / Views

라우팅은 프로토타입에서 `view: 'home' | 'about' | 'mypage' | 'support' | 'tip'` 단일 state입니다. Next.js에서는 실제 라우트로 분리 권장: `/`, `/about`, `/mypage`, `/support`, `/tip`.

### 1. Intro (스플래시) — 최초 진입

**Purpose**: 브랜드 인지 + 앱 진입.

**Layout**: 셸 전체를 덮는 `position:absolute; inset:0; z-index:60`.

**Components**
- 배경 이미지 `assets/intro-bg.png` — `object-fit:cover; object-position:center`, 전체 채움 (모바일에서 좌우 잘림 허용).
- 비네트: `box-shadow: inset 0 0 90px 30px rgba(8,18,12,.55), inset 0 0 200px 60px rgba(8,18,12,.35)`
- 상하 그라데이션: `linear-gradient(180deg, rgba(8,18,12,.35) 0%, rgba(8,18,12,.05) 38%, rgba(8,18,12,.62) 100%)`
- **로고 묶음** (아미유 220px + 사랑의열매 186px, 세로 gap 16px, `filter: drop-shadow(0 6px 20px rgba(0,0,0,.35))`)
  애니메이션 `ssakIntroLogo` 2.6s `cubic-bezier(.65,0,.35,1)` forwards:
  | 진행 | 상태 |
  |---|---|
  | 0% | 중앙(`top:50%;left:50%;translate(-50%,-50%)`), scale 1, opacity 0 |
  | 14% | 중앙, opacity 1 |
  | 52% | 중앙 유지 |
  | 100% | `top:26px; left:22px; translate(0,0); scale(.56)` (좌상단 고정) |
- **햄버거 버튼** — `top:20px; right:16px; 42×42; border-radius:12px; background:rgba(10,30,20,.28); backdrop-filter:blur(6px)`. 흰색 3줄 아이콘(stroke-width 2). **진입 전에는 `opacity:0; pointer-events:none`**, 진입 후 `.4s ease .25s`로 페이드인.
- **하단 CTA 블록** — `left:0;right:0;bottom:0; padding:0 26px 46px; flex column; gap:18px`, 등장 애니메이션 `ssakIntroUp .8s ease 2.2s both` (14px 아래에서 페이드업)
  - 키커: `11px / 600 / letter-spacing:.22em / uppercase / rgba(255,255,255,.68)` — "team_싹싹기름"
  - 헤드라인: `22px / 700 / line-height 1.45 / #fff` — "기름 한 방울부터 / 지구는 달라집니다."
  - **고스트 버튼** "지금 시작하기": `width:100%; height:56px; border:1.5px solid rgba(255,255,255,.75); border-radius:16px; background:transparent; color:#fff; 16px/700`. 우측 화살표 SVG 18px. hover `background:rgba(255,255,255,.14); border-color:#fff`, active `background:rgba(255,255,255,.22)`.

**Behavior**: 버튼 클릭 → `entered = true`.
- 인트로는 사라지지 않고 `z-index: 60 → 5`로 내려가 **앱 뒤 배경으로 남습니다.**
- CTA 블록은 `opacity 0 / translateY(24px)`로 퇴장(.45s / .55s).
- 앱 패널이 아래에서 위로 슬라이드 인 (아래 참조).

### 2. App Panel (홈 이하 모든 화면의 컨테이너)

```
position:absolute; left:0; right:0; top:68px; bottom:0; z-index:30;
display:flex; flex-direction:column;
background:rgba(245,248,245,.34);
backdrop-filter:blur(8px);
border-radius:24px 24px 0 0;
overflow:hidden;
box-shadow:0 -20px 50px rgba(4,16,10,.5);
transition:transform .72s cubic-bezier(.22,1,.36,1);
transform: entered ? translateY(0) : translateY(104%);
```

**상단 68px은 비워 두어 인트로 배경 사진과 로고가 계속 보입니다.** 이 반투명 + 블러 조합이 전체 디자인의 핵심입니다.

> ⚠️ `backdrop-filter` 미지원 브라우저 폴백 필수:
> ```css
> @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
>   .app-panel { background: #F5F8F5; }
> }
> ```

### 3. Home

**Header** (sticky, `height:60px; padding:0 18px; gap:10px; justify-content:flex-start`)
- 로고 34×34 원형 (`assets/logo-r14.png`) + "team_싹싹기름" 15px/800
- 스크롤 90px 초과 시 `headerSolid` 토글:
  - false → `background: linear-gradient(180deg, rgba(8,40,24,.45), rgba(8,40,24,0))`, 텍스트/아이콘 흰색
  - true → `background: rgba(245,248,245,.72)`, 텍스트/아이콘 `#17211C`

**Hero + 코드 입력** (한 섹션으로 통합)
```
position:relative; margin-top:-60px; padding:76px 20px 20px; color:#fff;
background: linear-gradient(170deg, rgba(14,58,36,.34), rgba(8,36,24,.44));
+ 오버레이 linear-gradient(178deg, rgba(8,40,24,.14) 0%, rgba(9,44,27,.24) 46%, rgba(8,36,22,.34) 100%)
```
- 키커 "CLIMATE ACTION" — `10.5px / 800 / letter-spacing:.14em / #5FD39A`
- 설명 — `13px / line-height 1.55 / rgba(255,255,255,.86) / max-width:19em`
  "패드에 인쇄된 영문 코드를 입력하여 / 당첨된 경품을 확인하세요."
- 구분선 `border-top:1px solid rgba(255,255,255,.22); margin-top:18px; padding-top:16px`
- QR 아이콘 칩 22×22 `border-radius:6px; background:rgba(255,255,255,.94)` + "ENTER CODE" 키커
- **입력창**: `height:46px; border:1px solid rgba(255,255,255,.34); border-radius:10px; background:rgba(255,255,255,.18); backdrop-filter:blur(6px); padding:0 15px; font: 16px/600 ui-monospace; letter-spacing:.08em; color:#fff; text-transform:uppercase`
  placeholder `rgba(255,255,255,.72)`, 문구 "패드 코드를 입력하세요"
  *`font-size`는 16px 미만으로 내리지 마세요 — iOS Safari 자동 확대 방지.*
- **버튼** "당첨 확인하기": `height:46px; margin-top:9px; border-radius:10px; background:rgba(30,142,90,.42); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,.3); 15px/800`, active `scale(.99)`
- 안내문 `11.5px / rgba(255,255,255,.62)` — "코드는 1회만 사용할 수 있어요. 입력 즉시 경품 당첨 여부가 공개됩니다."
- **통계 2칸** (구분선 위): 숫자 `24px/800`, 라벨 `10.5px/700/letter-spacing:.1em/rgba(255,255,255,.6)` — "내 당첨" / "사용한 코드"

**HOW IT WORKS — 커버플로우**
```
섹션: background:rgba(255,255,255,.4); border-bottom:1px solid rgba(230,236,231,.55); padding:24px 0 26px
무대: position:relative; height:300px; perspective:1100px; overflow:hidden
```
카드 3장 (3:4 비율, 206×275px, `border-radius:18px`, 배경 사진 `cover`):
```
d  = index - activeIndex
ad = |d|
transform: translateX(d * 126px) rotateY(d * -34deg) scale(ad ? .87 : 1)
opacity:   ad > 1 ? 0 : 1
z-index:   10 - ad
box-shadow: ad ? 0 8px 20px rgba(10,44,27,.18) : 0 18px 38px rgba(10,44,27,.32)
transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .45s ease, box-shadow .45s ease
left:50%; margin-left:-103px; top:8px
```
카드 위 그라데이션 `linear-gradient(180deg, rgba(6,26,16,.1) 0%, rgba(6,26,16,.3) 44%, rgba(6,26,16,.86) 100%)`, 하단 텍스트 패딩 `16px 16px 18px`:
| no | title | desc | 이미지 |
|---|---|---|---|
| 01 | 패드로 기름 흡수 | 배달 용기에 남은 기름을 패드로 닦아내요. | photo-greasy.png |
| 02 | QR·코드 입력 | 패드에 인쇄된 코드를 앱에 입력해요. | photo-delivery.png |
| 03 | 즉석 당첨 확인 | 그 자리에서 경품 당첨 여부가 공개돼요. | photo-recycle.png |

번호 `10.5px/800/.14em/#8FE6B8`, 제목 `17px/800/#fff`, 설명 `11.5px/rgba(255,255,255,.78)`.
카드 탭으로 활성 전환. 하단 인디케이터: 활성 `20×7px #1E8E5A`, 비활성 `7×7px #D3DCD6`, `border-radius:7px`, `transition:all .3s`.
*권장 개선: 터치 스와이프 제스처 추가.*

**GUIDE — 환경을 지키는 습관 (팁 캐러셀)**
- 섹션 헤더: 키커 "GUIDE" `10.5px/800/.14em/#1B5E20`, 제목 "환경을 지키는 습관" `21px/800/-.03em`
- 트랙: `display:flex; overflow-x:auto; scroll-snap-type:x mandatory; border-radius:20px; box-shadow:0 10px 26px rgba(23,33,28,.16)`
- 슬라이드 8장, 각 `flex:0 0 100%; aspect-ratio:2/1; scroll-snap-align:center`
- **중요**: 각 슬라이드 내부는 **2160×1080px 고정 캔버스**이며 `transform: scale(containerWidth / 2160)`, `transform-origin: top left`로 축소됩니다. 리사이즈 시 재계산 필요.
  → Next.js에서는 `useEffect` + `ResizeObserver`, `'use client'` 필수. (SSR에서 `window` 접근 금지)
- 자동 전환 3800ms (`scrollTo({behavior:'smooth'})`), 스크롤 위치로 활성 인덱스 역산
- 하단 dot 8개: 활성 `22×3px #1E8E5A`, 비활성 `10×3px #D3DCD6`

**슬라이드 8장의 디자인 시스템** (2160×1080 기준 값)
- 배경: 라이트 `#F2F6F3` / 커버 슬라이드만 `oklch(30% 0.07 152)` (딥그린)
- 공통 우하단 장식 원: `right:-140px; bottom:-160px; 560×560; border-radius:50%; background:#E3EFE7`
- 공통 좌상단 알약 키커: `top:64px; left:100px; background:#0E2A1C; padding:18px 44px; border-radius:999px` + 민트 점 18px `#5FD39A` + 라벨 `34px/800/.12em/#fff` ("TIP 01 · 종이팩" 형식)
- 공통 우하단 근거 문구: `right:100px; bottom:66px; 30px/600/#8A9A90`
- 헤드라인 `112px/900/line-height 1.24/-.01em/#17211C`, 강조 `<span>` `#1E8E5A`
- 서브카피 `50px/500/#55665C`
- 레이아웃 3종:
  1. **비교형** — 2열 gap 48px. 좌: 흰 카드 `border:2px solid #E6ECE7; border-radius:32px; padding:52px 48px`, ✕ 원 64px `#EBF0EC`/글자 `#8A9A90`. 우: `#0E2A1C` 카드, ○ 원 `#1E8E5A`, 라벨 `#5FD39A`, 본문 흰색. 본문 `52px/700/line-height 1.4`
  2. **단계형** — 원 160px 4개 + 화살표(`76px/900/#B9CCC0`). 원 색 램프: `#0E2A1C → #14663F → #1E8E5A → #5FD39A`(마지막만 글자 `#0E2A1C`)
  3. **선언형** — 헤드라인 + 흰 카드 1개 (`56px/700/#3C4B43`)
- 슬라이드 목록: EP.1 커버(딥그린) / CONTENTS(목차 카드 2개) / TIP 01 종이팩(비교) / TIP 02 페트병(단계) / TIP 03 택배 상자(비교) / TIP 04 폐의약품(선언) / TIP 05 난방(비교) / TIP 06 단열(선언)

**PRIZE — 경품 목록** (grid 2열 또는 list, `rewardLayout` prop)
- 섹션 `background:rgba(255,255,255,.4); border-top:1px solid rgba(230,236,231,.55); padding:26px 16px 32px`
- 카드 `border-radius:14px; background:rgba(255,255,255,.5); border:1px solid rgba(230,236,231,.62)`
- 이미지 자리: 대각선 스트라이프 플레이스홀더 (아래 `imgFor()` 참조) → **실제 상품 이미지로 교체 필요**
- 카드 탭 → 하단 시트

**Footer** — `background:rgba(14,42,28,.7); color:#fff; padding:32px 20px 34px`, 링크 목록(About us / 분리배출 tip / 마이페이지 / 이용약관·문의)

### 4. Subpage Header (About / 마이페이지 / 고객센터 / 분리배출 tip 공통)
```
position:sticky; top:0; z-index:20; height:58px;
background:rgba(245,248,245,.9); backdrop-filter:blur(12px);
border-bottom:1px solid #E6ECE7;
[← 44×44] [타이틀 15px/700/-.02em 중앙] [44px 스페이서]
```
타이틀 매핑: `about → "About us"`, `mypage → "마이페이지"`, `support → "고객센터 문의"`, `tip → "분리배출 tip"`

### 5. About us
- 다크 히어로: `padding:30px 20px 26px`, `linear-gradient(172deg, rgba(8,40,24,.5) 0%, rgba(9,44,27,.78) 50%, rgba(8,36,22,.94) 100%), url(assets/photo-delivery.png) center/cover`
  키커 "ABOUT US" `#5FD39A`, 서브 "아미유 주최 기후 변화 대응 공모전 싹싹기름팀" `12.5px/600/rgba(255,255,255,.72)`, H1 `25px/800/1.32/-.035em`
- BACKGROUND 섹션: 01/02/03 번호 카드 체인
- 팀 섹션: 아바타 카드

### 6. 분리배출 tip
- 다크 히어로 (`photo-recycle.png`), 키커 "SEPARATE COLLECTION", H1 "헷갈리는 분리배출, / 13가지만 기억하세요", 도입 문단 `12.5px/500/1.65/rgba(255,255,255,.78)`
- CHECKLIST 섹션 헤더 + "01 — 13" 카운트
- 항목 카드 13개: `display:flex; gap:13px; padding:16px 15px; border-radius:14px; background:rgba(255,255,255,.5); border:1px solid rgba(230,236,231,.62)`
  - 번호 `11px/800/.06em/#1E8E5A/ui-monospace`
  - 제목 `14.5px/800/-.02em/#17211C`
  - 본문 `12.5px/1.6/#55665C`
- 하단 NOTE 카드 `background:rgba(14,42,28,.7)`, 키커 `#5FD39A`

### 7. 마이페이지
- 프로필 행: 아바타 56px 원형 `#E7F2EC` + "싹" `20px/800/#1E8E5A`, 이름 `17px/800`, 서브 `12.5px/#1B5E20`
- 통계 카드 2개 (2열 grid, gap 12px, `border-radius:18px`, 반투명 흰색)
- 경품함 리스트: 썸네일 44×44 `border-radius:12px`, 제목 `13.5px/700`, 메타 `11.5px/#8A9A90` (`날짜 · 코드`), 배지 — 사용가능 `#1E8E5A` on `#E7F2EC` / 사용완료 `#8A9A90` on `#F0F3F0`, `10.5px/700; padding:4px 9px; border-radius:20px`
- 빈 상태: "아직 당첨된 경품이 없어요. / 패드 코드를 입력하고 경품을 받아보세요!"

### 8. 고객센터
- 액션 카드: "1:1 문의하기" (solid `#1E8E5A`, 52px), "카카오톡 채널 문의" (outline `1.5px #E1E8E2`)
- FAQ `<details>` 아코디언 — 질문 `13.5px/700` "Q. …", 답변 `12.5px/1.6/#5A6A62`

### 9. Drawer (전체 메뉴)
`position:absolute; top:0; right:0; bottom:0; z-index:40; width:80%; max-width:320px; background:#F5F8F5`, `transform: translateX(open ? 0 : 100%)`, `transition:.34s cubic-bezier(.22,1,.36,1)`.
오버레이 `rgba(23,33,28,.45~.5)`, `transition:opacity .28s`.
항목: 라벨 `15px/700` + 설명 `12px/#8A9A90` + 우측 chevron `#B7C2BB`, hover `background:#EEF3EF`, 패딩 `15px 12px`, `border-radius:13px`.

### 10. 경품 상세 바텀시트
아래에서 올라오는 시트. 핸들바 38×4 `#DBE3DD`, 닫기 34×34 `#F0F3F0`, 이미지 170px, 카테고리 칩 `#1E8E5A on #E7F2EC`, 제목 `20px/800`, 확률 `14px/700/#1E8E5A`, 설명 `13px/1.65/#5A6A62`, 안내 박스 `#F5F8F5`, CTA 54px solid.

### 11. 추첨 / 결과 모달
전체 화면 오버레이 `position:absolute; inset:0; z-index:50; display:flex; center; padding:20px`
- 추첨 중: `background:rgba(20,102,63,.9)`. 110×110 `border-radius:30px` `linear-gradient(140deg,#1E8E5A,#14663F)` 카드가 `ssakSpin 1s linear infinite`, 문구 "경품을 추첨하고 있어요…" `16px/800` + `ssakPulse 1.1s`, 아래 코드 표시. **1800ms 후 결과로 전환.**
- 결과: `background:rgba(23,33,28,.55)`. 흰 카드 `width:86%; max-width:340px; border-radius:26px; padding:26px 22px 22px; box-shadow:0 24px 60px rgba(0,0,0,.3)`, 등장 `ssakPop .5s cubic-bezier(.22,1,.36,1)`
  - 당첨: "🎉 축하합니다!" → 상품 이미지 150×150 (`ssakFloat 2.4s ease-in-out infinite`) → 카테고리 칩 → 제목 `21px/800` → "경품함에 저장되었어요…" → CTA "경품함에 담기"
  - 꽝: 96px 원 `#EEF3EF` + 회색 아이콘 → "아쉽게 다음 기회에!" `20px/800` → 안내문 → CTA "확인" (`#17211C`)
  - 컨페티 26조각, 색 `['#5FD39A','#1E8E5A','#FFD666','#FF8A5C','#7CC4FF']`, `left = i*37 % 100`, `delay = (i%8)*0.12s`

> ⚠️ **알려진 이슈**: 비주얼 에디터에서 드래그하면 이 오버레이 래퍼의 `style` 바인딩이 `left/top/position:absolute`로 덮어써져 모달이 좌상단에 작게 붙는 버그가 두 차례 발생했습니다. 재구현 시 이 래퍼는 위 오버레이 스타일로 고정하세요.

### 12. 토스트
`position:absolute` 하단 중앙, `background:#17211C; color:#fff; padding:13px 18px; border-radius:14px; box-shadow:0 10px 26px rgba(23,33,28,.3)`, 체크 아이콘 `#5FD39A`, 텍스트 `13.5px/700`. 2200ms 후 자동 소멸.
메시지: "코드를 입력해 주세요" / "이미 사용된 코드예요" / "경품함에 저장되었어요" / "준비 중이에요"

---

## Interactions & Behavior

| 트리거 | 동작 |
|---|---|
| "지금 시작하기" | `entered=true` → 앱 패널 `translateY(104% → 0)` 0.72s, 인트로는 배경으로 잔류, 햄버거 페이드인 |
| 헤더 햄버거 / 인트로 햄버거 | 드로어 열기 |
| 오버레이 / X / 메뉴 항목 | 드로어·시트 닫기 |
| 경품 카드 탭 | 바텀시트 열기 |
| 커버플로우 카드 탭 | 활성 인덱스 변경 |
| 팁 캐러셀 | 3800ms 자동 전환 + 수동 스크롤 스냅 |
| main 스크롤 > 90px | 홈 헤더 solid 전환 |
| "당첨 확인하기" | 빈 값 → 토스트 / 사용된 코드 → 토스트 / 그 외 → `phase:'revealing'` → 1800ms → `phase:'result'` |
| 결과 모달 CTA | 코드를 `usedCodes`에 추가, 당첨이면 `wins` 앞에 추가, 입력창 초기화, 토스트 |

### 폼 검증 (React Hook Form + Zod)
```ts
const codeSchema = z.object({
  code: z.string()
    .trim()
    .transform(v => v.toUpperCase())
    .pipe(z.string().regex(/^[A-Z]+-[A-Z0-9]+$/, '코드 형식을 확인해 주세요')),
});
```
샘플 코드 형식: `OCEAN-7X2K`, `WAVE-K3M9`. 실제 발급 규칙에 맞춰 정규식을 조정하세요.
클라이언트 검증은 UX용일 뿐이고, **유효성의 최종 판단은 서버**입니다.

---

## State Management

### 클라이언트 로컬 state (useState / useReducer)
| 이름 | 타입 | 설명 |
|---|---|---|
| `entered` | boolean | 인트로 통과 여부 (sessionStorage 저장 권장) |
| `view` | enum | 프로토타입용. Next.js에서는 라우터로 대체 |
| `menuOpen` | boolean | 드로어 |
| `sheetId` | number \| null | 열린 경품 시트 |
| `code` | string | 입력 중인 코드 |
| `phase` | `'idle' \| 'revealing' \| 'result'` | 추첨 단계 |
| `result` | Prize \| `{miss:true}` \| null | 결과 |
| `flowIdx` | number | 커버플로우 활성 인덱스 |
| `promoIdx` | number | 팁 캐러셀 인덱스 |
| `headerSolid` | boolean | 스크롤 기반 헤더 스타일 |
| `toast` | string \| null | 토스트 |

### 서버 state (TanStack Query)
| 쿼리 | 엔드포인트 | 비고 |
|---|---|---|
| `prizes` | `GET /api/prizes` | 경품 목록·확률·재고. staleTime 5분 |
| `myWins` | `GET /api/me/wins` | 내 경품함 |
| `myStats` | `GET /api/me/stats` | 당첨 수 / 사용 코드 수 |
| `redeem` (mutation) | `POST /api/codes/redeem` | 코드 제출 → 당첨 결과. 성공 시 위 3개 invalidate |

**중요**: `redeem` mutation의 `isPending` 동안 `phase:'revealing'` 연출을 보여주되, **응답이 1800ms보다 빨리 와도 최소 1800ms는 유지**해 연출이 끊기지 않게 하세요.
```ts
const [resolved, minDelay] = await Promise.all([
  redeemMutation.mutateAsync({ code }),
  new Promise(r => setTimeout(r, 1800)),
]);
```

---

## Backend 구현 노트 (Next.js Route Handler + Prisma + PostgreSQL)

### 데이터 모델 (제안)
```prisma
model Prize {
  id          Int      @id @default(autoincrement())
  category    String            // 카페 / 상품권 / 배달 / 굿즈
  title       String
  rank        String            // 1등 / 2등 / … / 참가상
  weight      Int               // 가중치 (확률 = weight / SUM(weight))
  stockTotal  Int
  stockLeft   Int
  description String
  imageUrl    String?
  wins        Win[]
}

model PadCode {
  id         Int       @id @default(autoincrement())
  code       String    @unique          // OCEAN-7X2K
  batch      String?
  redeemedAt DateTime?
  win        Win?
}

model Win {
  id            Int      @id @default(autoincrement())
  padCodeId     Int      @unique
  padCode       PadCode  @relation(fields: [padCodeId], references: [id])
  prizeId       Int?                     // null = 꽝
  prize         Prize?   @relation(fields: [prizeId], references: [id])
  phoneEnc      Bytes?                   // AES-256-GCM 암호문
  phoneIv       Bytes?
  phoneTag      Bytes?
  phoneHash     String?  @db.Char(64)    // HMAC-SHA256, 조회/중복확인용
  usedAt        DateTime?                // 경품 사용 처리
  createdAt     DateTime @default(now())

  @@index([phoneHash])
}
```

### `POST /api/codes/redeem` 로직
1. Zod로 body 파싱 (`code`, 필요 시 `phone`)
2. **트랜잭션 안에서**:
   - `PadCode`를 `code`로 조회. 없으면 404 → "등록되지 않은 코드예요"
   - `redeemedAt != null` 이면 409 → "이미 사용된 코드예요"
   - 가중치 추첨: `stockLeft > 0`인 `Prize`들의 `weight` 합계로 뽑기. 꽝 확률도 하나의 항목으로 포함
   - 당첨 시 `Prize.stockLeft` 원자적 감소 (`updateMany` + `where: { stockLeft: { gt: 0 } }`로 경쟁 조건 방지, 0행 갱신 시 재추첨 또는 꽝 처리)
   - `PadCode.redeemedAt` 세팅, `Win` 생성
3. 결과 반환

> **절대 클라이언트에서 추첨하지 마세요.** 프로토타입의 `hash(code) % 6` 방식은 코드만 알면 결과를 예측할 수 있습니다.

### 개인정보 (전화번호)
- 저장: `AES-256-GCM(phone, key)` → `phoneEnc` + `phoneIv` + `phoneTag`. 키는 환경변수(`PHONE_ENC_KEY`, 32바이트 base64).
- 조회·중복확인: `HMAC-SHA256(normalizedPhone, HMAC_KEY)` → `phoneHash`에 인덱스. 정규화(하이픈 제거, `+82` → `0`) 후 해싱.
- 응답에 평문 전화번호를 포함하지 마세요. 관리자 화면에서만 마스킹 표시(`010-****-1234`).

### 관리자 (JWT)
- `/admin` 이하 라우트 + `POST /api/admin/*`은 JWT 검증 미들웨어 필수
- 기능: 코드 배치 발급/CSV 업로드, 경품 재고·가중치 관리, 당첨 내역 조회, 경품 사용 처리
- 토큰은 httpOnly + Secure + SameSite=Strict 쿠키에

### Rate limiting
코드 무차별 대입 방지: IP + 코드 기준으로 분당 시도 횟수 제한. 실패가 누적되면 지연을 늘리세요.

---

## Design Tokens

### Colors
| 토큰 | 값 | 용도 |
|---|---|---|
| `green-900` | `#0E2A1C` | 딥그린 (푸터, 알약 키커, 비교 카드) |
| `green-800` | `#14663F` | 그라데이션 짝, 아이콘 |
| `green-600` | `#1E8E5A` | 주요 액션·강조 |
| `mint-400` | `#5FD39A` | 다크 배경 위 키커·포인트 |
| `mint-300` | `#8FE6B8` | 커버플로우 번호 |
| `ink` | `#17211C` | 본문 최상위 텍스트, 토스트 배경 |
| `ink-70` | `#3C4B43` | 슬라이드 본문 |
| `muted` | `#55665C` | 보조 본문 |
| `muted-2` | `#5A6A62` | FAQ·설명 |
| `muted-3` | `#8A9A90` | 메타·라벨 |
| `line` | `#E6ECE7` | 테두리 |
| `line-2` | `#F0F3F0` | 옅은 구분선 |
| `chip-bg` | `#E7F2EC` | 그린 칩 배경 |
| `surface` | `#F5F8F5` | 앱 배경 |
| `surface-slide` | `#F2F6F3` | 슬라이드 배경 |
| `slide-arc` | `#E3EFE7` | 슬라이드 장식 원 |
| `page-bg` | `#E4EBE5` | 셸 바깥 데스크톱 배경 |
| `step-arrow` | `#B9CCC0` | 단계 화살표 |
| `dot-off` | `#D3DCD6` | 비활성 인디케이터 |

### 반투명 표면 (핵심)
| 대상 | 값 |
|---|---|
| 앱 패널 | `rgba(245,248,245,.34)` + `blur(8px)` |
| 흰 섹션 | `rgba(255,255,255,.4)` |
| 카드 | `rgba(255,255,255,.5)` |
| 카드 테두리 | `rgba(230,236,231,.62)` |
| 섹션 테두리 | `rgba(230,236,231,.55)` |
| 히어로 | `linear-gradient(170deg, rgba(14,58,36,.34), rgba(8,36,24,.44))` |
| 푸터·NOTE | `rgba(14,42,28,.7)` |
| 서브 헤더 | `rgba(245,248,245,.9)` + `blur(12px)` |
| 코드 입력창 | `rgba(255,255,255,.18)` + `blur(6px)` |
| 확인 버튼 | `rgba(30,142,90,.42)` + `blur(6px)` |

### Typography
- 본문 폰트: 시스템 산세리프 (Pretendard 등 한글 폰트 적용 권장)
- 슬라이드 캔버스: `'Noto Sans KR', sans-serif`
- 모노: `ui-monospace, 'SFMono-Regular', monospace` (코드·번호)
- 스케일(앱): 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 16 / 17 / 19 / 20 / 21 / 22 / 24 / 25px
- 웨이트: 500 / 600 / 700 / 800 / 900
- 키커 공통: `10.5px / 800 / letter-spacing:.14em`
- 제목 공통: `letter-spacing:-.02em ~ -.035em`

### Radius
`6 / 7 / 10 / 11 / 12 / 13 / 14 / 15 / 16 / 18 / 20 / 22 / 24(상단만) / 26 / 30 / 32 / 999px`

### Shadow
| 용도 | 값 |
|---|---|
| 셸 | `0 20px 60px rgba(23,33,28,.14)` |
| 앱 패널 | `0 -20px 50px rgba(4,16,10,.5)` |
| 캐러셀 | `0 10px 26px rgba(23,33,28,.16)` |
| 커버플로우 활성 | `0 18px 38px rgba(10,44,27,.32)` |
| 커버플로우 비활성 | `0 8px 20px rgba(10,44,27,.18)` |
| 결과 모달 | `0 24px 60px rgba(0,0,0,.3)` |
| 그린 CTA | `0 8px 18px rgba(30,142,90,.3)` |
| 토스트 | `0 10px 26px rgba(23,33,28,.3)` |

### Easing / Duration
| 용도 | 값 |
|---|---|
| 패널 슬라이드 | `.72s cubic-bezier(.22,1,.36,1)` |
| 커버플로우 | `.55s cubic-bezier(.22,1,.36,1)` |
| 드로어·시트 | `.34s cubic-bezier(.22,1,.36,1)` |
| 결과 카드 등장 | `.5s cubic-bezier(.22,1,.36,1)` |
| 인트로 로고 | `2.6s cubic-bezier(.65,0,.35,1)` |
| 인트로 CTA | `.8s ease` (2.2s delay) |
| 페이드류 | `.28 ~ .45s ease` |
| 추첨 유지 시간 | `1800ms` |
| 캐러셀 자동 전환 | `3800ms` |
| 토스트 | `2200ms` |

### Keyframes
```css
@keyframes ssakIntroLogo { /* 위 Intro 표 참조 */ }
@keyframes ssakIntroUp   { 0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes ssakPulse     { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes ssakSpin      { /* 회전 */ }
@keyframes ssakPop       { /* 결과 카드 팝인 */ }
@keyframes ssakFloat     { /* 상품 이미지 부유 */ }
```

---

## Assets

`assets/` 폴더 → Next.js `public/assets/`로 이동. CSS `url()` 배경으로 쓰이는 것은 `next/image` 대신 그대로 두세요.

| 파일 | 용도 | 상태 |
|---|---|---|
| `intro-bg.png` | 인트로 배경 (숲 항공샷) | 실제 |
| `logo-amiyu.png` | 아미유 로고 | 실제 |
| `logo-fruit3.png` | 사랑의열매 로고 (여백 트리밍, **투명 배경 · 검정 아트워크**) | 실제 |
| `logo-r14.png` | 팀 원형 로고 | 실제 |
| `photo-greasy.png` | 커버플로우 01 | 임시 |
| `photo-delivery.png` | 커버플로우 02, About 히어로 | 임시 |
| `photo-recycle.png` | 커버플로우 03, tip 히어로 | 임시 |

**미해결 사항**
- 사랑의열매 로고가 검정 아트워크라 어두운 배경에서 대비가 낮습니다. **흰색(음각) 버전 확보 필요.**
- 상품 이미지 전부 플레이스홀더입니다. 현재 코드:
  ```js
  imgFor(hue) {
    return `background: repeating-linear-gradient(135deg,
      hsl(${hue} 32% 92%) 0 11px, hsl(${hue} 32% 88%) 11px 22px)`;
  }
  ```
  Prize 테이블의 `imageUrl`로 교체하세요.
- 팀원 사진·프로필 미반영.

---

## 마이그레이션 체크리스트

- [ ] `'use client'` — 캐러셀 스케일링, 스크롤 리스너, 인트로 애니메이션이 있는 컴포넌트
- [ ] `100vh` → `100dvh`
- [ ] `backdrop-filter` `@supports` 폴백
- [ ] 슬라이드 2160px 캔버스 스케일링을 `ResizeObserver`로 재구현
- [ ] `view` state → App Router 라우트 분리
- [ ] `entered` 상태를 sessionStorage에 저장 (새로고침마다 인트로 반복 방지)
- [ ] 당첨 로직 전부 서버로 이전 (재고 차감은 트랜잭션 + 원자적 update)
- [ ] 전화번호 AES-256-GCM 암호화 + HMAC 해시 인덱스
- [ ] 코드 제출 rate limiting
- [ ] 이미지 최적화 (인트로 배경은 LCP 요소 — `priority` 고려)
- [ ] `prefers-reduced-motion` 대응 (인트로 로고 이동·컨페티·부유 애니메이션 비활성화)
- [ ] 접근성: 모달 포커스 트랩, 드로어 `aria-expanded`, 결과 발표 `aria-live="polite"`
- [ ] 터치 타깃 44px 이상 유지 (현재 코드 입력창·확인 버튼이 46px — 하한선)

---

## Files

| 파일 | 설명 |
|---|---|
| `team_싹싹기름 v4.dc.html` | **최종 디자인.** 인트로 + 반투명 홈 + 커버플로우 + 팁 캐러셀 8장 + 4개 서브페이지 |
| `assets/` | 이미지 에셋 |
| `support.js` | 프로토타입 런타임. **이식 대상 아님** — 무시하세요 |
| `분리수거_배출_tip.txt` | 분리배출 tip 페이지 원문 |

HTML 파일은 브라우저에서 바로 열어 인터랙션을 확인할 수 있습니다.
