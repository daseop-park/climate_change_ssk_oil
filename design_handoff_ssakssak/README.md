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
- 배경 이미지 `assets/intro-bg-earth.png` (지구를 든 손 · 숲 항공샷) — `object-fit:cover; object-position:center`, 전체 채움 (모바일에서 좌우 잘림 허용).
  구 `intro-bg.png`(숲 항공샷 단독)는 더 이상 쓰지 않습니다. 새 이미지는 중앙 피사체가 어두워, 패널 뒤로 비칠 때 본문 대비가 구 이미지보다 낮습니다 (아래 **미해결 사항** 참조).
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
background:rgba(245,248,245,.45);   /* v4 는 .34 — 새 배경 대비 확보를 위해 상향 */
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

**CARD NEWS — 환경을 지키는 습관 (사진 카드뉴스)**

> ⚠️ **개정됨.** v4 의 "GUIDE" 캐러셀(2160×1080 벡터 슬라이드 8장)은 폐기하고 사진 배경 카드뉴스 5장으로 교체했습니다.
> 원본 스펙: `revisions/home-cardnews.html`. v4.dc.html 의 해당 섹션은 더 이상 기준이 아닙니다.

- 섹션 헤더: 키커 "CARD NEWS" `10.5px/800/.14em/#1E8E5A`, 제목 "환경을 지키는 습관" `21px/800/-.03em`, 안내 "옆으로 넘겨 보세요 · 5장" `13px/#5A6A62`
- 트랙: `display:flex; gap:12px; padding:0 16px 8px; overflow-x:auto; scroll-snap-type:x mandatory`
  - v4 와 달리 트랙 자체에는 `border-radius`·`box-shadow` 를 주지 않습니다. 카드마다 개별로 둥글립니다.
- 카드 5장, 각 `flex:none; width:344px; height:208px; border-radius:20px; scroll-snap-align:center`
  - 440px 셸에서 **다음 카드가 살짝 보이는 피크(peek) 레이아웃**입니다. 폭 344px 은 이 피크를 만들기 위한 값이므로 100% 로 바꾸지 마세요.
  - 좌우 여백이 16px 뿐이라 첫·마지막 카드는 끝까지 밀어도 중앙에 닿지 않습니다. 인디케이터를 스크롤 위치로 역산할 때 **양 끝은 따로 고정**해야 실제 화면과 어긋나지 않습니다.
- 카드 구성: 배경 사진(`object-fit:cover`) + 어두운 그라디언트 `linear-gradient(180deg, rgba(10,18,13,.62) 0%, rgba(10,18,13,.82) 100%)` + 중앙 정렬 텍스트 `padding:20px 24px`
  - 라벨 `12px/700/#8FE6B8` ("CARD 01 · 표지" 형식) — 원본 스펙은 `#C9F24E`(라임)이나 사이트 팔레트에 맞춰 민트로 구현
  - 제목 `19px/900/1.35/-.03em/#fff`, 본문 `13px/1.5/rgba(255,255,255,.84)`
- 자동 전환 4000ms (`scrollBy({behavior:'smooth'})`), 마지막 → 첫 장 순환
  - 사용자가 트랙을 만지면(`pointerdown`·`touchstart`·`wheel`) **6000ms 동안 자동 전환을 쉽니다.** 없으면 스와이프 도중 타이머가 화면을 낚아챕니다.
  - `prefers-reduced-motion: reduce` 이면 자동 전환을 켜지 않습니다.
- 하단 dot 5개: 활성 `22×3px #1E8E5A`, 비활성 `10×3px #D3DCD6`
- 카드별 사진: 01 `photo-delivery.png` / 02 `card-settop.png` / 03 `card-eggshell.png` / 04 `card-aircon.png` / 05 `card-pad.png`
  - 04·05 는 흰 배경 사진이라 위 그라디언트가 없으면 흰 텍스트가 읽히지 않습니다. 오버레이를 빼지 마세요.

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
- BACKGROUND 섹션: 01/02/03 번호 카드 체인 (03 = "기름 오염으로 재활용률 저조 (16.4%)")
- SOLUTION 섹션: 본문 + 사양 칩 3개(`14cm × 14cm` / `PLA + 케이폭` / `천연비누 코팅`), 칩 `bg #E7F2EC / 글자 #1E8E5A / border-radius:999px`
- HOW IT WORKS 섹션: 원형 아이콘(32px, `#E7F2EC` 배경) + 한 줄 설명 3행
- IMPACT 섹션: 2열 그리드 스탯 카드 2장 (`90%` 재활용 가능성 개선 목표 / `ESG` 기업·지자체 연계 가능)
- MODEL 섹션: 본문 + 아이콘 카드 1장 ("지자체 협력 · 무상 보급" / "음식점 비치 → 소비자 무료 제공")
- 팀 섹션: 아바타 카드 — **순서상 항상 마지막**

> 위 4개 섹션(SOLUTION / HOW IT WORKS / IMPACT / MODEL)은 v4 이후 추가분입니다.
> 원본 스펙: `revisions/about-us.html`.
> 섹션 배경은 `bg-white/40` 과 무배경을 번갈아 씁니다 (BACKGROUND·HOW IT WORKS·MODEL 이 흰 배경).
> 원본에 있던 "패드 구조 자세히 보기" 이동 행은 **대상 페이지가 없어 구현하지 않았습니다.** 패드 구조 페이지를 만들면 되살리세요.

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
| 카드뉴스 캐러셀 | 4000ms 자동 전환 + 수동 스크롤 스냅. 사용자 조작 시 6000ms 정지, `prefers-reduced-motion` 이면 자동 전환 없음 |
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
| `promoIdx` | number | 카드뉴스 캐러셀 인덱스 |
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
| 앱 패널 | `rgba(245,248,245,.45)` + `blur(8px)` — v4 의 `.34` 에서 상향 |
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
| 캐러셀 자동 전환 | `4000ms` (사용자 조작 후 `6000ms` 정지) |
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

> **`assets/` 는 원본(마스터), `public/assets/` 는 배포본입니다.**
> 대부분은 양쪽이 바이트 단위로 동일하지만, 아래 **"리사이즈됨"** 표시가 붙은 파일은 `public/` 쪽이 화면 표시 크기 × DPR 3 을 상한으로 축소·재압축된 사본입니다.
> 원본이 필요하면 여기서 가져가고, `public/` 파일을 여기로 되돌려 덮어쓰지 마세요.

| 파일 | 용도 | 상태 |
|---|---|---|
| `intro-bg-earth.png` | 인트로 + 앱 배경 (지구를 든 손) | 실제 · 리사이즈됨 (580×768 → 동일, 재압축만) |
| `intro-bg.png` | 구 인트로 배경 (숲 항공샷) | **미사용** — 이력용으로만 보관 |
| `logo-amiyu.png` | 아미유 로고 | 실제 |
| `logo-fruit3.png` | 사랑의열매 로고 (여백 트리밍, **투명 배경 · 검정 아트워크**) | 실제 |
| `logo-r14.png` | 팀 원형 로고 | 실제 |
| `photo-greasy.png` | 커버플로우 01 | 임시 |
| `photo-delivery.png` | 커버플로우 02, About 히어로, 카드뉴스 01 | 임시 |
| `photo-recycle.png` | 커버플로우 03, tip 히어로 | 임시 |
| `card-settop.png` | 카드뉴스 02 · 대기전력 | 실제 · 리사이즈됨 (457×266 → 동일, 재압축만) |
| `card-eggshell.png` | 카드뉴스 03 · 음식물류 | 실제 · 리사이즈됨 (648×559 → 동일, 재압축만) |
| `card-aircon.png` | 카드뉴스 04 · 냉방 | 실제 · 리사이즈됨 (1536×1024 → 1032×688) |
| `card-pad.png` | 카드뉴스 05 · 제품 소개 | 실제 · 리사이즈됨 (1402×1122 → 1032×826) |

**미해결 사항**
- 사랑의열매 로고가 검정 아트워크라 어두운 배경에서 대비가 낮습니다. **흰색(음각) 버전 확보 필요.**
- ~~새 배경 위에서 무배경 섹션의 본문 대비가 낮음~~ → 앱 패널 불투명도를 `.34 → .45` 로 올려 완화했습니다 (2026-08-12). 배경 사진이 비치는 정도는 유지하면서 홈 코드 입력 폼과 About 의 SOLUTION·IMPACT 가독성을 확보하는 절충값입니다. 더 올리면 "배경이 상시 비친다"는 이 디자인의 정체성이 희석됩니다.
- `card-settop.png` 는 원본이 457px 라 고해상도 화면에서 흐립니다. 더 큰 원본 확보 권장.
- 경품 이미지 `baemin12.png` / `gs5000.png` / `staramericano.png` / `starbucks50,000.png` 는 아직 이 표에 정리되지 않았습니다 (경품 작업 진행 중).
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

- [ ] `'use client'` — 캐러셀 스크롤 리스너·자동 전환 타이머, 인트로 애니메이션이 있는 컴포넌트
- [ ] `100vh` → `100dvh`
- [ ] `backdrop-filter` `@supports` 폴백
- [x] ~~슬라이드 2160px 캔버스 스케일링을 `ResizeObserver`로 재구현~~ — 사진 카드뉴스로 교체되어 불필요
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
| `team_싹싹기름 v4.dc.html` | **기본 디자인.** 인트로 + 반투명 홈 + 커버플로우 + 4개 서브페이지. 단 아래 `revisions/` 가 덮어쓴 부분은 제외 |
| `revisions/` | **v4 이후 개정본.** 해당 섹션은 v4 가 아니라 이쪽이 기준입니다 |
| `revisions/home-cardnews.html` | 홈 "환경을 지키는 습관" — v4 의 GUIDE 벡터 슬라이드 8장을 대체하는 사진 카드뉴스 5장 |
| `revisions/about-us.html` | About us — SOLUTION / HOW IT WORKS / IMPACT / MODEL 섹션 추가본 |
| `assets/` | 이미지 원본(마스터). `public/assets/` 와의 관계는 위 **Assets** 참조 |
| `support.js` | 프로토타입 런타임. **이식 대상 아님** — 무시하세요 |
| `분리수거_배출_tip.txt` | 분리배출 tip 페이지 원문 |

HTML 파일은 브라우저에서 바로 열어 인터랙션을 확인할 수 있습니다.
단 `revisions/` 의 두 파일은 `<html>` 래퍼가 없는 **조각(fragment)** 이며, `about-us.html` 은 Tabler 아이콘 클래스(`ti ti-*`)를 쓰므로 해당 CSS 없이 열면 아이콘 자리가 빕니다. 레이아웃·수치 확인용으로는 그대로 열어도 됩니다.
