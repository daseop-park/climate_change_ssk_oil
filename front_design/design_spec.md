# Design & Event Specifications: Climate Change SSK Oil

> **갱신 이력**
> - 2026-08-12 — 인트로/앱 배경을 `intro-bg-earth.png`로 교체(이에 맞춰 앱 패널 불투명도 `.34 → .45`). 홈 GUIDE 캐러셀을 사진 카드뉴스 5장으로 교체, About us 에 SOLUTION/HOW IT WORKS/IMPACT/MODEL 추가. 개정 스펙은 `design_handoff_ssakssak/revisions/` 로 분리.
> - 2026-08-06 — 진실 소스를 `design_handoff_ssakssak/`로 교체. 기존의 **"배경 이미지 미사용 / 글래스모피즘 금지 / 불투명 서피스"** 조항은 새 디자인과 정면 충돌하므로 **폐기**했습니다. 8대 버튼 이벤트 중 6·7·8번은 라우트 분리 방식으로 변경.
> - 2026-07-16 — 최초 작성 (구 Claude Design 초안 기준)

이 문서는 **`design_handoff_ssakssak/`의 디자인 핸드오프**를 진실 소스(Source of Truth)로 삼아,
그 디자인을 현재 프로젝트(Next.js App Router + TypeScript + Tailwind CSS)에 적용하기 위한 명세서입니다.

> **원칙**: HTML 초안을 그대로 복붙하지 않는다. 색상·타이포그래피·간격·라운드·그림자를 **토큰으로 추출**해
> `globals.css`의 `@theme`에 정리하고, 화면은 그 토큰 위에서 컴포넌트 단위로 재작성한다.

---

## 🎨 1. 디자인 소스 (Design Source)

### 진실 소스
- **`design_handoff_ssakssak/README.md`** — 화면별 수치 명세 (hifi, 확정값)
- **`design_handoff_ssakssak/team_싹싹기름 v4.dc.html`** — 디자인 프로토타입. **단 아래 개정본이 덮은 섹션은 제외**
- **`design_handoff_ssakssak/revisions/`** — v4 이후 개정본. 해당 섹션은 v4 보다 **이쪽이 우선**한다
  - `home-cardnews.html` — 홈 "환경을 지키는 습관" (v4 의 GUIDE 벡터 슬라이드 8장을 대체)
  - `about-us.html` — About us 추가 섹션
- `design_handoff_ssakssak/support.js` — 프로토타입 런타임. **이식 대상 아님**
- `front_design/` — 구 참조 자료(로고 원본)로만 유지. 시각 기준으로 삼지 않는다.

### 배경 & 서피스 (구 조항 폐기)

**배경 이미지를 사용한다.** `assets/intro-bg-earth.png`가 인트로 스플래시이자, 진입 이후에도
`z-index: 60 → 5`로 내려가 **앱 패널 뒤 배경으로 상시 잔류**한다. 앱 패널이 상단 68px을 비워 두어
배경 사진과 로고가 계속 보이는 것이 이 디자인의 정체성이다.
(구 `intro-bg.png`(숲 항공샷)는 2026-08-12 에 교체됨.)

> 새 배경은 중앙 피사체가 어두워 무배경 섹션(홈 코드 입력 폼, About 의 SOLUTION·IMPACT)의
> 본문 대비가 낮았다. 앱 패널 불투명도를 `.34 → .45` 로 올려 해결(2026-08-12).

**글래스모피즘이 핵심 디자인 언어다.** 반투명 서피스 + `backdrop-filter`로 층위를 표현한다.

| 대상 | 값 |
|---|---|
| 앱 패널 | `rgba(245,248,245,.45)` + `blur(8px)` — v4 의 `.34` 에서 상향 |
| 흰 섹션 | `rgba(255,255,255,.4)` |
| 카드 | `rgba(255,255,255,.5)` |
| 카드 테두리 | `rgba(230,236,231,.62)` |
| 섹션 테두리 | `rgba(230,236,231,.55)` |
| 서브 헤더 | `rgba(245,248,245,.9)` + `blur(12px)` |
| 푸터 · NOTE | `rgba(14,42,28,.7)` |
| 코드 입력창 | `rgba(255,255,255,.18)` + `blur(6px)` |
| 확인 버튼 | `rgba(30,142,90,.42)` + `blur(6px)` |

### 가독성
- 반투명 표면 뒤로 배경 사진이 비치므로 대비가 상황에 따라 변한다. **다크 히어로·About·tip 히어로에는
  그라데이션 오버레이를 반드시 유지**해 흰색 텍스트의 대비를 보장한다.
- 라이트 서피스 위 텍스트는 `ink`(#17211C) / `muted`(#55665C) 계열을 사용한다.
- **`backdrop-filter` 미지원 브라우저 폴백은 필수**다. `globals.css`의 `@supports not (...)` 블록에서
  `.ssak-panel` / `.ssak-subheader` / `.ssak-code-input` / `.ssak-code-submit`을 불투명으로 대체한다.

---

## 🎯 2. 디자인 토큰

전체 정의는 `src/app/globals.css`의 `@theme` 블록이 소유한다. 하드코딩 금지.

- **컬러**: `green-900` `#0E2A1C` / `green-800` `#14663F` / `green-600` `#1E8E5A`(주요 액션) /
  `mint-400` `#5FD39A` / `mint-300` `#8FE6B8` / `ink` `#17211C` / `muted` `#55665C` /
  `muted-3` `#8A9A90` / `line` `#E6ECE7` / `chip-bg` `#E7F2EC` / `surface` `#F5F8F5` / `page-bg` `#E4EBE5`
- **폰트**: Pretendard (본문) / `ui-monospace` (코드·번호)
- **스케일**: 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 16 / 17 / 19 / 20 / 21 / 22 / 24 / 25px
- **키커 공통**: `10.5px / 800 / letter-spacing:.14em`
- **제목 공통**: `letter-spacing:-.02em ~ -.035em`
- **라운드**: 6 / 7 / 10 / 12 / 13 / 14 / 15 / 16 / 18 / 20 / 22 / 24(상단만) / 26 / 30 / 32 / 999px

---

## 💫 3. 전환 및 애니메이션 (핸드오프 확정값)

이 수치는 핸드오프가 소유한다. 임의로 바꾸지 않는다.

| 대상 | 값 |
|---|---|
| 앱 패널 슬라이드 인 | `translateY(104% → 0)` · `.72s cubic-bezier(.22,1,.36,1)` |
| 드로어 | `translateX(102% → 0)` · `.32s cubic-bezier(.22,1,.36,1)` |
| 바텀시트 | `translateY(102% → 0)` · `.34s cubic-bezier(.22,1,.36,1)` |
| 오버레이 | `rgba(23,33,28,.42)` · `opacity .28s ease` |
| 커버플로우 | `.55s cubic-bezier(.22,1,.36,1)` |
| 결과 모달 등장 | `ssakPop .5s cubic-bezier(.22,1,.36,1)` |
| 인트로 로고 | `ssakIntroLogo 2.6s cubic-bezier(.65,0,.35,1)` |
| 인트로 CTA | `ssakIntroUp .8s ease 2.2s both` |
| 추첨 유지 시간 | `1800ms` (응답이 빨라도 최소 유지) |
| 카드뉴스 캐러셀 자동 전환 | `4000ms` (사용자 조작 후 `6000ms` 정지) |
| 토스트 | `2200ms` 후 자동 소멸 |

> 구 명세의 모달 `cubic-bezier(0.34, 1.56, 0.64, 1)` 스프링백은 `ssakPop`으로 대체되었다.

**`prefers-reduced-motion: reduce`** 시 인트로 로고 이동·컨페티·부유 애니메이션을 끄고,
카드뉴스 캐러셀 자동 전환도 중지한다.

---

## ✨ 4. 마이크로 인터랙션

핸드오프에 대응 스펙이 없는 영역으로, **이 문서가 소유**한다. §3의 확정값과 충돌하지 않는 선에서 얹는다.

| 대상 | 효과 | 상태 |
|---|---|---|
| 햄버거 메뉴 버튼 | 호버 시 `hover:scale-110`, 드로어 열린 상태에서 X로 회전 전환 | ⬜ 미구현 |
| 확인(당첨 확인하기) 버튼 | `hover:-translate-y-0.5 hover:shadow-lg duration-200` | ⬜ 미구현 |
| 경품 더보기(+) 버튼 | `hover:rotate-45 transition-transform duration-300` | ⬜ 미구현 |
| 드로어 메뉴 링크 | 좌측 보더 라인 + `hover:pl-2 transition-all duration-200` | ⬜ 미구현 |
| 드로어 메뉴 링크 배경 | `hover:bg-[#EEF3EF]` | ✅ 구현 |
| 경품 카드 · CTA 버튼 | `active:scale-[.98~.99]` | ✅ 구현 |

---

## ⚡ 5. 버튼 이벤트 흐름

| 순서 | 이벤트 | 액션 동작 및 상태 변화 | 상태 |
|---|---|---|---|
| 1 | `onEnterApp` | `entered = true` → 앱 패널 슬라이드 인, 인트로는 배경으로 잔류, 햄버거 페이드인. sessionStorage 저장 | ✅ |
| 2 | `onOpenMenu` | `menuOpen = true` → 드로어 슬라이드 인 + 오버레이 | ✅ |
| 3 | `onCloseMenu` | 오버레이 클릭 · X · 메뉴 항목 선택 시 닫힘 | ✅ |
| 4 | `onOpenProductDetail` | `sheetOpen = true` → 바텀시트 슬라이드 업 | ✅ |
| 5 | `onCloseProductDetail` | 시트 닫힘. 퇴장 애니메이션 동안 내용 유지 | ✅ |
| 6 | `onClickAboutUs` | **`/about` 라우트 이동** (구 명세의 스크롤 이동에서 변경) | ✅ |
| 7 | `onClickMyInfo` | **`/mypage` 라우트 이동** (구 명세의 슬라이드업 패널에서 변경) | ✅ |
| 8 | `onClickCustomerCenter` | **`/support` 라우트 이동** (구 명세의 플로팅 모달에서 변경) | ⚠️ 진입 경로 미연결 |
| 9 | `onSubmitCode` | 빈 값·형식 오류·사용된 코드 → 토스트 / 그 외 → `revealing` → 1800ms → `result` | ✅ |
| 10 | `onCloseReveal` | 코드를 사용 처리, 당첨이면 경품함에 추가, 입력창 초기화, 토스트 | ✅ |

---

## 🗺️ 6. 화면 ↔ 라우트 매핑

프로토타입의 단일 `view` state는 App Router 라우트로 분리한다.

| 화면 | 라우트 | 헤더 |
|---|---|---|
| 홈 | `/` | 스크롤 90px 초과 시 solid 전환 |
| About us | `/about` | 서브 헤더 (뒤로 + 타이틀) |
| 분리배출 tip | `/tip` | 서브 헤더 |
| 마이페이지 | `/mypage` | 서브 헤더 |
| 고객센터 문의 | `/support` | 서브 헤더 |

인트로·앱 패널·드로어·바텀시트·결과 모달·토스트는 **모든 라우트가 공유**하므로
`AppShell`(루트 레이아웃)이 소유하고, 각 페이지는 헤더 + `<main>`만 렌더한다.

---

## 📝 7. 구현 가이드라인

1. **디자인 우선순위**: 시각 스타일은 항상 `design_handoff_ssakssak` → 토큰을 기준으로 한다.
   이 문서의 예시 클래스와 충돌하면 핸드오프가 우선한다.
2. **셸 프레임**: `max-width: 440px`, `height: 100dvh` (주소창 대응). `100vh` 사용 금지.
3. **모달·드로어**: 열린 상태에서 오버레이 클릭 시 자동으로 닫는다.
4. **반응형**: 모바일 세로 뷰(375~480px)를 기준으로 한다.
5. **참조 폴더 격리**: `design_handoff_ssakssak/`, `front_design/`은 참조 전용이며 빌드 대상이 아니다.
   실제 렌더는 `src/` 컴포넌트로 재작성해 사용한다.
6. **`'use client'` 필요 지점**: 카드뉴스 캐러셀(스크롤 리스너·자동 전환 타이머), 스크롤 리스너, 인트로 애니메이션,
   셸 상태 컨텍스트. SSR에서 `window` 접근 금지.
7. **iOS Safari**: 코드 입력창 `font-size`를 16px 미만으로 내리지 않는다 (자동 확대 방지).
8. **터치 타깃**: 44px 이상 유지. 현재 코드 입력창·확인 버튼 46px이 하한선이다.

---

## 🚧 8. 미해결 항목

**보류 (2026-08-06 결정)** — 기능 구현을 먼저 진행하고 나중에 처리한다.

- 상품 이미지가 전부 대각선 스트라이프 플레이스홀더다. `imgFor(hue)` → 실제 이미지로 교체 필요.
- 사랑의열매 로고(`logo-fruit3.png`)가 검정 아트워크라 어두운 배경에서 대비가 낮다. 흰색(음각) 버전 필요.
- 팀원 사진·프로필 미반영 (현재 이니셜 아바타).

**진행 필요**

- §5-8번 `/support` 진입 경로. 현재 URL 직접 입력으로만 도달 가능하며,
  푸터의 "이용약관·문의"는 프로토타입대로 "준비 중이에요" 토스트를 띄운다.
- §4 마이크로 인터랙션 4건.

**서버 이전 대상** (현재 클라이언트 더미)

- 당첨 결과 — `src/lib/design/redeem.ts`의 `outcomeFor`가 코드 해시로 결정. 서버 추첨으로 교체.
- 사용 코드·당첨 내역·통계 숫자 — 현재 `ShellContext`의 로컬 state. DB로 이전.
