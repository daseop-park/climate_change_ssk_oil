# 리뷰 — 반응형 레이아웃 구현 대조

> **상태: 리뷰 완료 — 코드 대조는 끝, 육안 검증은 미완(§4).**
> 작성 2026-09-03 · 최종 갱신 2026-09-03
> 선행 근거: [`../sdd/sdd-responsive-layout.md`](../sdd/sdd-responsive-layout.md)(대조 대상 설계) · 미커밋 작업본 `git diff`
> 관련: [`../../implementation-plan.md`](../../implementation-plan.md) · [`../../phase5-admin-estimate.md`](../../phase5-admin-estimate.md) §8

---

## 0. 무엇을 어떻게 대조했나

**대조 대상** — 워킹 트리의 미커밋 변경 (`HEAD` = `b45d857`). 소스 12개 수정 + 신규 2개.

| 신규 | 수정 |
|---|---|
| `src/components/shell/DesktopBackdrop.tsx` | `AppShell.tsx` · `not-found.tsx` |
| `src/components/admin/AdminWinCards.tsx` | 콘솔 `layout` · `page` · `codes` · `prizes` · `wins` |
| | `AdminSidebar` · `AdminPage` · `AdminReceivePanel` · `AdminRecentWinsTable` |

**대조 방법** — 설계 문서의 주장을 하나씩 코드·빌드 산출물에 되물었습니다.

- `git diff` 전문을 설계 §4·§5 의 "영향 파일" 표와 한 줄씩 대조
- `grep` 으로 브레이크포인트 사용 실태 집계 (§3 검증)
- `npx tsc --noEmit` · `npx eslint` · `npx next build` **재실행** — 셋 다 통과 (설계 §9-5 주장 확인)
- 빌드 산출 CSS 의 `@media` 블록 실측
- 프리렌더 HTML(`.next/server/app/index.html`)에서 `loading` 속성 · `srcSet` · `<link rel=preload>` 실측
- 셸 내부 절대 위치 요소 전수 조사 — 셸 높이 변경(§4-3 ⚠️)의 영향 범위 계산

**하지 않은 것** — 브라우저 육안 검증(§6). 설계 §9-5 가 선언한 그대로 여전히 미완입니다.
`npm run test:api` 도 재실행하지 않았습니다 — 대신 diff 에 `src/app/api/` · `src/services/` ·
`src/lib/` 변경이 **0건**임을 확인했습니다. "서버 라우트 무변경" 주장은 정적으로 성립합니다.

---

## 1. 한 줄 결론

**설계대로 구현됐습니다.** §4·§5 의 영향 파일 표는 실제 diff 와 일치하고, 손대지 않기로 한
파일(`AdminTable` · 사용자 페이지 5개 · `Intro` · `Drawer` · `PrizeSheet` · `RevealModal` ·
`home/` · `admin/login`)은 전부 무변경입니다. §9 의 "달라진 것" 넷도 코드에서 그대로 확인됩니다.

다만 **설계가 검토하지 않아 구현에도 빠진 구멍이 하나**(D1 · 관리자 드로어 배경 스크롤)와,
**§6 육안 검증에서 가장 먼저 깨질 자리 둘**(D2 · D3)이 계산으로 드러났습니다.

---

## 2. 설계 대비 구현 — 항목별 대조

### §3 브레이크포인트 체계

| 주장 | 검증 결과 |
|---|---|
| `md:` `lg:` 둘만 쓴다 | ✅ `md:` 22곳 · `lg:` 29곳, 13개 파일 |
| `sm:` `xl:` `2xl:` 0건 | ✅ 셋 다 `src/` 전체 0건 |
| `max-*:` 역방향 변형 0건 | ✅ 유일한 `max-lg:` 문자열은 `AppShell.tsx:22` **주석 안**입니다 |
| 커스텀 브레이크포인트 없음 | ✅ `globals.css` 에 `--breakpoint-*` 없음 |
| 모바일 퍼스트 (덧붙이기만) | ⚠️ 원칙은 지켜졌으나 무조건 클래스 3개가 추가됨 → **D5** |

빌드 산출 CSS 의 `@media` 블록 실측 — 폭 관련은 정확히 둘입니다.

```
1 @media (min-width:48rem)                 ← md
1 @media (min-width:64rem)                 ← lg
1 @media (hover:hover)                     ← Tailwind hover 변형 (폭 무관, 기존)
1 @media (prefers-reduced-motion:reduce)   ← 기존
```

### §4 Part A — 사용자 앱 데스크톱

| 설계 항목 | 검증 결과 |
|---|---|
| 셸 바깥 여백만 채우고 셸 내부 무변경 | ✅ 사용자 페이지 5개·`Intro`·`Drawer`·`PrizeSheet`·`RevealModal`·`home/` 전부 diff 0줄 |
| `DesktopBackdrop` 을 CSS(`lg:block`)로만 제어 | ✅ JS 분기 없음. `hidden … lg:block` |
| `priority` 미부착, 기본 `lazy` (§9-1) | ✅ 프리렌더 HTML 에서 `loading="lazy" … sizes="100vw"` 확인 |
| 배경 사진은 `/assets/intro-bg-earth.png` 재사용 | ✅ |
| 좌측 카피·로고는 `Intro` 것 재사용, 새 카피 없음 | ✅ 문구·로고 2종 모두 `Intro.tsx` 와 동일 |
| 순수 장식 → `aria-hidden` | ✅ `aria-hidden` + `pointer-events-none` + `select-none`, 내부 `alt=""` |
| 셸 프레임 `lg:rounded-[32px]` · `lg:h-[min(880px,92dvh)]` | ✅ |
| `not-found.tsx` 도 같은 프레임 | ✅ 배경 연출은 의도적으로 제외 · ⚠️ `overflow-hidden` 누락 → **D4** |

**설계가 말하지 않은 덤** — 백드롭의 로고 2장은 `Intro` 가 `priority` 로 이미 preload 하는
**바로 그 URL**(`logo-amiyu` `w=256 1x, w=640 2x` / `logo-fruit3` `w=256 1x, w=384 2x`)을
그대로 씁니다. `width` 값이 같아 srcSet 후보가 갈라지지 않았습니다. 즉 §9-1 이
"다른 파일을 한 장 더 받는다"고 한 것은 **지구 배경 한 장뿐**이고, 로고는 데스크톱에서도
추가 요청이 없습니다. 설계보다 나은 결과입니다.

**§4-3 ⚠️(셸 높이 변경) 정적 분석** — 셸 안 절대 위치 요소를 전수 조사했습니다.

| 요소 | 위치 지정 | 셸이 짧아지면 |
|---|---|---|
| `Intro` | `absolute inset-0` | 함께 줄어듦 |
| `ssak-intro-logo` | `@keyframes ssakIntroLogo` 가 `top`/`left: 50%` + `translate(-50%,-50%)` | **전부 백분율** — 셸 기준 비례 축소 |
| `ssak-intro-cta` | `absolute right-0 bottom-0 left-0` | 셸 하단에 붙음 |
| `.ssak-panel` | `absolute top-[68px] … bottom-0` | 높이만 줄어듦 |
| `Drawer` | `absolute … w-4/5 max-w-[320px]` | 셸 기준 |
| `PrizeSheet` | `absolute bottom-0 max-h-[88%]` | 셸 기준 |
| `RevealModal` | `absolute inset-0 z-50` | 셸 기준 |
| `Toast` | `absolute bottom-[30px] z-[60]` | 셸 기준 |

**뷰포트 단위(`vh`/`dvh`)로 고정된 요소는 하나도 없습니다.** 계산상 셸 높이 변경은 안전합니다.
설계 §4-3 의 "계산으로는 안전하지만 실측이 필요" 라는 판단이 맞았고, 계산 쪽은 이 표로 끝났습니다.
남은 실측 항목은 **D3** 하나로 좁혀집니다.

### §5 Part B — 관리자 콘솔

| 설계 항목 | 검증 결과 |
|---|---|
| `min-w-[1120px]` 제거, 레이아웃 `flex-col lg:flex-row` | ✅ `layout.tsx` 에서 소멸 |
| `lg:` 미만 상단 바 + 드로어 | ✅ 고정 사이드바 `hidden lg:flex` / 상단 바·드로어 `lg:hidden` |
| `Drawer.tsx` 재사용 안 함, `useState` + `useDialog` | ✅ `ShellContext` 의존 없음 |
| `AdminTable` 무변경 | ✅ diff 0줄 |
| `/admin/wins` 표·카드 이중 렌더 | ✅ `hidden lg:block` / `lg:hidden` |
| `AdminReceivePanel` 버튼 열 스택 | ✅ `grid-cols-1 md:grid-cols-[1fr_1fr_auto]` + `w-full md:w-auto` |
| `admin/login` 무변경 | ✅ `max-w-[360px]`, diff 0줄 |
| `AdminRecentWinsTable` 이 설계에 없던 파일 (§5-4) | ✅ 표 마크업이 실제로 여기 있음 |

**§5-4 의 `min-w` 하한이 컬럼 수와 맞는지 실측** — 넷 다 일치합니다.

| 화면 | 설계값 | 실제 `<Th>` 개수 | 코드 |
|---|---|---|---|
| `/admin/wins` | 8컬럼 880px | 8 | `min-w-[880px]` ✅ |
| `/admin/codes` | 6컬럼 620px | 6 | `min-w-[620px]` ✅ |
| `/admin/prizes` | 4컬럼 520px | 4 | `min-w-[520px]` ✅ |
| `AdminRecentWinsTable` | 7컬럼 780px | 7 | `min-w-[780px]` ✅ |

`overflow-x-auto` 가 실제로 동작하는지도 확인했습니다 — 네 표 모두 조상이 `flex-col`(주축이
세로)이거나 순수 블록이라 `min-width:auto` 로 밀려나지 않습니다. `AdminPanel` 의
`overflow-hidden` 과도 충돌하지 않습니다(부모가 잘라내고 자식이 스크롤).

### §9 구현하며 달라진 것

| 항목 | 검증 결과 |
|---|---|
| 9-1 `priority` 미부착 | ✅ 위 §4 표 참조 |
| 9-2 상태 라벨·색 통합 | ✅ `AdminWinCards` 가 `WIN_STATUS_*` export, `/admin/wins` 가 import. `AdminRecentWinsTable` 은 자기 벌 유지(문서대로) → **D7** |
| 9-3 드로어 리사이즈 닫기 · 경로 변경 닫기 | ✅ `matchMedia("(min-width: 64rem)")` + 렌더 중 조정(`seenPath`). effect 아님 |
| 9-3 `Brand`/`NavList`/`Account` 분리 | ✅ 고정 사이드바와 드로어가 같은 함수를 씀 |
| 9-4 대시보드 그리드 세로 스택 | ✅ `grid-cols-1 md:grid-cols-3` · `grid-cols-1 lg:grid-cols-[1.55fr_1fr]`. 차트 내부 무변경 |

---

## 3. 발견 사항

### D1 — 관리자 드로어에 배경 스크롤 잠금이 없습니다 · **중간**

`AdminSidebar.tsx` 가 `useDialog` 를 그대로 씁니다. 그런데 `hooks/useDialog.ts:22-25` 는
스크롤 잠금을 **일부러 넣지 않았고**, 그 근거가 이것입니다.

> 셸 자체가 `h-[100dvh] overflow-hidden` 이라 문서가 스크롤되지 않습니다.

이 전제는 **사용자 셸에만** 참입니다. 관리자 콘솔 레이아웃은 `min-h-[100dvh]` 이고
`overflow-hidden` 이 없습니다 — **문서가 스크롤됩니다.** `/admin/wins` 처럼 목록이 긴 화면에서
폰으로 드로어를 열면, 오버레이(`fixed inset-0`, `touch-action` 지정 없음) 위에서 손가락을
움직였을 때 뒤 문서가 함께 스크롤됩니다. iOS Safari 에서 특히 두드러집니다.

설계 §5-2 는 `useDialog` 를 "검증된 훅" 으로 보고 그대로 가져왔는데, 훅이 무엇을 **안 하는지**와
그 전제 조건까지는 옮겨 오지 않았습니다.

**제안** — 오버레이에 `overscroll-contain touch-none` 을 붙이는 것이 가장 싸고, 확실히 하려면
`open` 인 동안 `document.body` 에 `overflow:hidden`. 후자를 택하면 `useDialog` 의
주석(22-25행)에 "관리자 드로어는 예외" 를 한 줄 더해 두세요 — 지금 그 주석은 앱 전체에 대한
서술로 읽힙니다.

### D2 — 1024px 에서 데스크톱 카피가 찌그러집니다 · **중간 · 육안 확인 필요**

`DesktopBackdrop.tsx:53` 의 카피 영역:

```
left-0  right-[calc(50%+252px)]  px-8   →  가용 폭 = 50vw − 252 − 64
```

| 뷰포트 | 카피 내부 폭 |
|---|---|
| **1024** | **196px** |
| 1280 | 324px |
| 1440 | 404px → `max-w-[400px]` 로 400px |
| 1920 | 400px |

카피는 `text-[30px] font-bold` 에 `<br>` 이 하드코딩돼 있습니다. "기름 한 방울부터"(7자)는
약 218px, "지구는 달라집니다."(9자)는 약 245px 를 요구합니다. **1024px 에서는 두 줄 다 넘쳐
4줄로 접힙니다.** `text-pretty` 는 균형만 맞출 뿐 넘침을 막지 못합니다.

하필 1024px 는 **배경 연출이 처음 등장하는 폭**이자 §6 매트릭스의 항목입니다. 백드롭이 켜지는
첫 화면이 가장 안 좋은 모습이 됩니다. 1280px 부터는 문제없습니다.

**제안** — 셋 중 하나. ① 카피 글자 크기를 `lg:` 에서 한 단계 낮추고 더 넓은 폭에서 키우기,
② 백드롭의 **카피 블록만** 더 넓은 폭부터 보이기, ③ `right` 오프셋을 뷰포트에 따라 줄이기.
②·③ 에 새 브레이크포인트가 필요하면 **§3 표에 먼저 추가하고 의미를 정의한 뒤** 쓰세요 —
설계가 §3 에서 스스로 정한 규칙입니다.

### D3 — 둥근 셸 + `backdrop-filter` 조합, 하단 모서리 확인 필요 · **낮음 · 육안 확인 필요**

셸에 `lg:rounded-[32px]` 가 붙었고 `overflow-hidden` 이 이미 있습니다(설계 §4-3 이 확인한 대로).
하지만 그 안의 `.ssak-panel`(`AppShell.tsx:43`)은 `absolute … bottom-0` 이면서
`backdrop-blur-[8px]` 입니다. **`backdrop-filter` 는 자체 합성 레이어를 만들고, 조상의
`border-radius` 클립을 벗어나는 것이 Safari 의 알려진 동작입니다.**

패널이 셸 바닥까지 닿아 있어 문제가 생긴다면 **하단 좌우 모서리**에서 나타납니다.
설계 §4-3 은 `overflow-hidden` 존재까지만 확인하고 이 상호작용은 보지 않았습니다.
Chrome 은 대체로 정상, Safari 확인이 필요합니다.

### D4 — `not-found.tsx` 셸에 `overflow-hidden` 이 없습니다 · **낮음**

`AppShell` 과 프레임을 맞추면서 `lg:rounded-[32px]` 는 가져왔는데, 그 곡률이 안전한 이유였던
`overflow-hidden` 은 오지 않았습니다(`not-found.tsx:26`). 지금 내용이 가운데 정렬된 짧은
텍스트뿐이라 넘칠 것이 없어 **당장은 증상이 없습니다.** 다만 두 셸이 "겉모습만" 같아진 상태라,
404 에 무엇이든 추가하는 순간 모서리로 삐져나옵니다. 한 클래스로 끝납니다.

### D5 — §2 비목표 1 의 "DOM·스타일 100% 동일" 은 문자 그대로는 성립하지 않습니다 · **낮음(기록용)**

`lg:` 미만에도 적용되는 추가가 셋 있습니다.

| 위치 | 추가 | 영향 |
|---|---|---|
| `AppShell.tsx:31` 바깥 래퍼 | `relative` | 없음 — 이 래퍼의 절대 위치 자식은 `DesktopBackdrop`(모바일에서 `display:none`) 하나뿐 |
| `AppShell.tsx:39` 셸 | `z-10` | 없음 — 새 쌓임 맥락이 생기지만 셸 내부 요소는 전부 이미 셸(`relative`) 안에 갇혀 있었음(§2 의 절대 위치 전수표 참조) |
| `AppShell.tsx:32` | `<DesktopBackdrop />` 노드 | DOM 에 존재하나 `display:none`, 이미지 요청 0 |

**셋 다 설계 §4-2 의 구조 스케치에 그대로 적혀 있습니다.** 즉 설계 이탈이 아니라, 설계 자신이
비목표 1 을 "**효과가 동일**" 로 완화한 것입니다. 문제는 §3 이 그 근거로 내세운
"모바일이 안 바뀌었는가를 diff 만 보고 눈으로 검증할 수 있다"가 이제 **한 단계 추론을 요구**한다는
점입니다. 위 표가 그 추론입니다 — 다음 사람이 다시 하지 않도록 여기 남깁니다.

앞으로 무조건 클래스를 하나라도 더할 때는, 그 클래스가 왜 모바일에 무해한지를 이 형태로 함께
적어 두는 편이 좋겠습니다.

### D6 — `AdminRecentWinsTable` 들여쓰기 미정리 · **낮음**

`overflow-x-auto` 래퍼를 씌우면서 `<table>` 만 한 단계 들여쓰고 `<thead>`·`<tbody>` 이하는
그대로 뒀습니다(`AdminRecentWinsTable.tsx:51-56`). 같은 작업을 한 `codes`·`prizes`·`wins`
셋은 전부 다시 들여썼습니다. devDependencies 에 Prettier 가 없어 lint 가 잡지 못합니다.

### D7 — `WIN_STATUS_*` 는 여전히 두 벌입니다 · **정보**

설계 §9-2 가 "세 벌이 될 뻔한 것을 두 벌로 줄였다" 고 밝힌 그대로입니다.
`AdminRecentWinsTable.tsx:19-33` 의 `STATUS_LABEL`·`STATUS_CLASS` 는 `AdminWinCards` 의
`WIN_STATUS_*` 와 **값이 완전히 동일**합니다. 의도된 상태이므로 고칠 것은 없고, 다음 사람이
"중복이네" 하고 세 번째 벌을 만들지 않도록 확인해 둡니다. 라벨을 바꿀 일이 생기면 **두 곳**입니다.

### D8 — `docs/README.md` 의 SDD 상태 표기가 낡았습니다 · **낮음(이 리뷰에서 수정)**

인덱스는 "⚠️ 배너는 '구현 전' 이지만 실제로는 구현 완료" 라고 적고 있었는데, SDD 배너는 이미
"구현 완료" 로 바뀌어 있었습니다. 이 리뷰 문서를 인덱스에 추가하면서 해당 행도 함께 고쳤습니다.

### D9 — 백드롭 이미지 화질 옵션 · **정보**

`sizes="100vw"` 라 고DPI 데스크톱에서 상위 후보(최대 `w=3840`)까지 갑니다. 이 이미지는
`rgba(8,18,12,.42)`~`.9` 의 방사형 오버레이에 덮여 있어 원본 화질이 거의 드러나지 않습니다.
`quality={60}` 한 줄이면 데스크톱 전송량이 줄고 모바일에는 영향이 없습니다. 결함은 아닙니다.

---

## 4. 남은 검증 — §6 뷰포트 매트릭스

설계 §9-5 가 선언한 미완 항목 그대로이고, 위 D1·D2·D3 을 확인 지점으로 추가했습니다.

| # | 폭 | 확인할 것 |
|---|---|---|
| 1 | 360 · 390 · 744 | **사용자 앱** 변경 전후 스크린샷 동일 (비목표 1). D5 의 셋이 무해하다는 계산의 실증 |
| 2 | 390 | `/admin/wins` 조회 → 선택 → 수령 처리 한 바퀴 |
| 3 | 390 | **D1** — 드로어를 연 채로 배경이 스크롤되는지 |
| 4 | 744 | 상단 바 + 드로어, `AdminReceivePanel` 한 줄→세로 전환(`md:` 768 경계 바로 아래) |
| 5 | 1024 | **D2** — 백드롭 카피 줄바꿈. 고정 사이드바 복귀. `md:`↔`lg:` 가 갈라지는 유일한 구간 |
| 6 | 1440 | 인트로 진입 애니메이션 · `RevealModal` 당첨 연출 · `Drawer` 열림 (§4-3 ⚠️) |
| 7 | 1440 (Safari) | **D3** — 셸 하단 둥근 모서리로 `.ssak-panel` 이 새는지 |
| 8 | 1920 | 백드롭 구도 · 셸 `92dvh` 상한 |
| 9 | — | 키보드만으로 관리자 드로어 열기 / Tab 순회 / Esc / 포커스 복귀 |
| 10 | 1024 경계 | 드로어를 **연 채로** 창을 넓혀 `lg:` 를 넘기 (§9-3 의 포커스 트랩 갇힘 회귀) |

---

## 5. 재현한 명령

```bash
npx tsc --noEmit     # 통과
npx eslint           # 통과
npx next build       # 통과, 라우트 24개
grep -o "@media[^{]*" .next/static/chunks/*.css | sort | uniq -c
grep -o 'loading="lazy"[^>]*intro-bg-earth[^>]*' .next/server/app/index.html
```

`npm run test:api` 는 실행하지 않았습니다 — DB 가 필요하고, 서버 라우트 무변경은
diff 로 확인했습니다(§0).
