# Handoff: 싹싹기름 관리자 콘솔

## Overview

기름 흡수 패드 즉석 당첨 웹앱의 **운영자용 관리 콘솔** 디자인입니다. 운영자가 하는 일은 넷입니다.

1. 패드에 인쇄할 **코드 배치 발급** (CSV 내려받기)
2. **경품 재고·가중치 관리** (확률은 가중치에서 파생)
3. **당첨 내역 확인** — 성함·연락처 대조 후 경품 지급
4. **감사 로그** 확인

**미당첨(꽝)은 없습니다.** 코드 1장 = 경품 1개, 등급만 가중치로 갈립니다.

## About the Design File

`Admin Canvas.dc.html`은 **HTML로 만든 디자인 레퍼런스**입니다. 브라우저에서 바로 열면 세 화면과 구현 메모를 볼 수 있습니다. 프로덕션에 복사해 넣을 코드가 아니라, Next.js App Router + TypeScript + Tailwind로 **재구현할 대상**입니다.

데이터는 전부 하드코딩된 예시입니다.

## Fidelity

**High-fidelity.** 색·타이포·간격·정렬 규칙이 확정된 값입니다. 다만 경품 썸네일은 플레이스홀더(대각선 스트라이프)입니다.

---

## Stack

```
Next.js (App Router) / TypeScript / Tailwind CSS
React Hook Form + Zod / TanStack Query
Route Handler + Prisma + Railway PostgreSQL
AES-256-GCM (성함·전화번호 암호화)
HMAC-SHA256 (조회용 해시)
JWT (관리자 인증 전용)
```

---

## Screens

### 1a. 대시보드 `/admin`

**레이아웃**: 좌측 고정 사이드바 224px + 본문. 전체 1440px 기준.

**사이드바** — `background:#0E2A1C`, `padding:22px 14px`
- 로고: 32×32 `#1E8E5A` 라운드 9px + "싹" / 하단 "ADMIN" `9.5px/800/.14em/#5FD39A`
- 섹션 라벨 `9.5px/800/.14em/rgba(255,255,255,.34)` — OPERATION / SYSTEM
- 항목 `13px`, 패딩 `11px 12px`, radius 10px. 활성 `background:#1E8E5A; color:#fff; font-weight:700`, 비활성 `rgba(255,255,255,.72)/600`
- 우측 카운트 뱃지 `10px/800/#5FD39A`
- 하단 계정 카드 `background:rgba(255,255,255,.07); radius:12px`

**헤더** — `background:#fff; border-bottom:1px solid #E6ECE7; padding:20px 28px`
제목 `19px/800/-.025em`, 서브 `12px/500/#8A9A90`. 우측: 기간 필터(outline 38px) + CSV 내보내기(solid `#1E8E5A` 38px)

**KPI 3장** — `grid-template-columns:repeat(3,1fr); gap:14px`
카드 `background:#fff; border:1px solid #E6ECE7; radius:14px; padding:18px 20px`
- 라벨 `11px/800/.08em/#8A9A90`
- 수치 `28px/900/-.03em/#17211C` + 델타 `11.5px/800` (증가 `#1E8E5A`, 경고 `#C0492E`)
- 진행바 `height:6px; radius:6px; track:#EEF3EF`
- 캡션 `11px/600/#8A9A90`

항목: 코드 사용률 / 당첨 건수 / 경품 소진

**차트 + 경품 잔여** — `grid-template-columns:1.55fr 1fr; gap:14px`
- 좌: 일별 코드 사용 스택 막대 14개. 사용 `#1E8E5A`(당일 `#B9CCC0`), 당첨 `#C7DED1`. 높이 186px, radius 5px 5px 0 0, gap 9px
- 우: 경품별 잔여 게이지 4개 + 소진 경고 박스 (`background:#FBF0ED; border:1px solid #F0D9D2; color:#8A5343`)

**최근 당첨 테이블**
컬럼: 시각 / 코드 / 배치 / 경품 / **성함** / 연락처 / 상태
- 헤더 `background:#F5F8F5`, `11px/800/.06em/#8A9A90`, 상하 `1px solid #E6ECE7`
- 셀 `12.5px`, 행 구분 `1px solid #F0F3F0`, 패딩 `13px 22px`(양끝) / `13px 12px`(중간)
- 시각·코드·연락처는 `ui-monospace`
- 성함은 `12.5px/700/#17211C`, **가운데 글자 마스킹** (김O은)
- 연락처 마스킹 (010-****-4821)
- 상태 뱃지 `10.5px/800; padding:4px 9px; radius:20px` — 미사용 `#1E8E5A on #E7F2EC` / 사용완료 `#8A9A90 on #F0F3F0`

### 1b. 코드 배치 발급 `/admin/codes`

**새 배치 폼** — 2열 grid, gap 14px
- 라벨 `11.5px/800/#3C4B43`, 입력 `height:42px; border:1px solid #E1E8E2; radius:10px; padding:0 13px; 13px/600`
- 필드: 배치 이름 / 발급 수량 / 코드 접두어 / 유효 기간
- 안내 박스 `background:#F5F8F5; border:1px solid #E6ECE7; radius:11px`
- CTA: "발급하고 CSV 내려받기" (solid, flex:1, 46px) + "취소" (outline `1.5px #E1E8E2`)

**발급 이력 테이블** — 배치 / 수량 / 사용 / 발급일 / 상태. 수치는 우측 정렬 + monospace.

### 1c. 경품 · 확률 관리 `/admin/prizes`

**경품 테이블**
- 경품 셀: 34×34 썸네일(radius 9px) + 이름 `12.5px/700` + 등급·카테고리 `10.5px/700/#8A9A90`
- 가중치 / 확률 / 잔여 — 전부 우측 정렬 monospace
- 확률은 **입력 불가**. `가중치 ÷ 합계`로 파생 표시
- 잔여가 임계 이하면 `#C0492E`
- 노출 토글 38×22, ON `#1E8E5A` / OFF `#DCE3DD`, 노브 18px 흰색

**푸터 바** — `background:#F5F8F5; border-top:1px solid #E6ECE7; padding:14px 22px`
"가중치 합계 160 · 전원 당첨 (미당첨 없음)" + 저장 버튼 36px

**경고 배너** — `background:#0E2A1C`, 아이콘 `#5FD39A`, 본문 `rgba(255,255,255,.82)`. 확률 변경이 감사 로그에 남는다는 고지.

---

## Design Tokens

앱과 팔레트는 공유하되 **유리 질감(반투명 + backdrop-filter)은 쓰지 않습니다.** 관리 화면은 밀도와 가독성이 우선이라 불투명 표면 + 명확한 테두리로 갑니다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `green-900` | `#0E2A1C` | 사이드바, 경고 배너 |
| `green-800` | `#14663F` | 게이지 |
| `green-600` | `#1E8E5A` | 주요 액션, 활성 상태 |
| `mint-400` | `#5FD39A` | 다크 배경 위 강조 |
| `mint-200` | `#C7DED1` | 차트 보조 계열 |
| `ink` | `#17211C` | 제목·수치 |
| `ink-70` | `#3C4B43` | 폼 라벨 |
| `muted` | `#55665C` | 본문 |
| `muted-3` | `#8A9A90` | 라벨·메타 |
| `line` | `#E6ECE7` | 테두리 |
| `line-2` | `#F0F3F0` | 행 구분선 |
| `line-3` | `#E1E8E2` | 입력 테두리 |
| `chip-bg` | `#E7F2EC` | 그린 뱃지 배경 |
| `surface` | `#F5F8F5` | 본문 배경, 테이블 헤더 |
| `track` | `#EEF3EF` | 진행바 트랙 |
| `danger` | `#C0492E` | 경고 수치·뱃지 |
| `danger-bg` | `#FBF0ED` | 경고 박스 배경 |
| `danger-line` | `#F0D9D2` | 경고 박스 테두리 |
| `danger-text` | `#8A5343` | 경고 박스 본문 |

**Typography**: 9.5 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14.5 / 15 / 19 / 28px. 웨이트 500/600/700/800/900.
숫자·코드·시각·수량은 전부 `ui-monospace, 'SFMono-Regular', monospace` + 우측 정렬.

**Radius**: 9 / 10 / 11 / 12 / 14 / 18 / 20(뱃지·토글)px
**Shadow**: 콘솔 셸만 `0 20px 60px rgba(23,33,28,.14)`. 내부 카드는 그림자 없이 테두리로만 구분.

---

## Data Model (제안)

```prisma
model Prize {
  id          Int      @id @default(autoincrement())
  category    String            // 카페 / 상품권 / 배달 / 굿즈
  title       String
  rank        String            // 1등 … 4등
  weight      Int               // 확률 = weight / SUM(활성 & stockLeft>0 인 weight)
  stockTotal  Int
  stockLeft   Int
  visible     Boolean  @default(true)
  imageUrl    String?
  wins        Win[]
}

model CodeBatch {
  id        Int       @id @default(autoincrement())
  name      String    @unique     // B-2026-04
  quantity  Int
  validFrom DateTime
  validTo   DateTime
  createdAt DateTime  @default(now())
  codes     PadCode[]
}

model PadCode {
  id         Int       @id @default(autoincrement())
  code       String    @unique    // OCEAN-7X2K
  batchId    Int
  batch      CodeBatch @relation(fields: [batchId], references: [id])
  redeemedAt DateTime?
  win        Win?
}

model Win {
  id        Int      @id @default(autoincrement())
  padCodeId Int      @unique
  padCode   PadCode  @relation(fields: [padCodeId], references: [id])
  prizeId   Int
  prize     Prize    @relation(fields: [prizeId], references: [id])

  nameEnc   Bytes                 // AES-256-GCM
  nameIv    Bytes
  nameTag   Bytes
  nameHash  String   @db.Char(64) // HMAC-SHA256
  phoneEnc  Bytes
  phoneIv   Bytes
  phoneTag  Bytes
  phoneHash String   @db.Char(64)

  usedAt    DateTime?             // 경품 수령 처리
  usedBy    Int?                  // 처리한 관리자
  createdAt DateTime @default(now())

  @@index([phoneHash])
  @@index([nameHash])
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  adminId   Int
  action    String            // PRIZE_WEIGHT_CHANGE / WIN_REVEAL / CODE_BATCH_ISSUE …
  target    String
  before    Json?
  after     Json?
  reason    String?
  ip        String?
  createdAt DateTime @default(now())
}
```

---

## 구현 메모

### 라우트 & 인증
```
/admin          대시보드
/admin/codes    코드 관리
/admin/prizes   경품 관리
/admin/wins     당첨 내역
/admin/audit    감사 로그
/admin/accounts 관리자 계정
```
- 전부 `middleware.ts`에서 JWT 검증. 쿠키는 **httpOnly + Secure + SameSite=Strict**
- `robots: noindex`
- 로그인 실패 rate limiting 필수

### 개인정보 (성함 + 전화번호)
- 저장: `AES-256-GCM` → `*Enc` / `*Iv` / `*Tag`. 키는 환경변수(32바이트 base64)
- 조회: 정규화 후 `HMAC-SHA256` → `*Hash` 인덱스로 검색. **평문으로 LIKE 검색 불가**
  - 전화번호 정규화: 하이픈·공백 제거, `+82` → `0`
  - 성함 정규화: 공백 제거, NFC
- **목록 API 응답에 평문을 절대 포함하지 마세요.** 서버에서 마스킹한 문자열만 내려보냅니다
  - 성함: 가운데 글자 → `O` (김은서 → 김O서, 2글자면 김O)
  - 전화번호: `010-****-4821`
- 평문 복호화는 별도 버튼 → **사유 입력** → `AuditLog(action: WIN_REVEAL)` 기록 후에만 허용
- 경품 지급 시 본인 대조는 **성함 + 전화번호 복합 조회**(두 해시 AND)로

### 확률 · 재고
- 확률 컬럼을 따로 두지 마세요. **`weight ÷ SUM(weight)`로 항상 파생 계산.** 두 값을 각각 저장하면 반드시 어긋납니다
- 재고 0 → 추첨 대상 제외 → 나머지 가중치로 자동 재정규화
- ⚠️ **미당첨이 없으므로 전 경품 소진 = 이벤트 종료입니다.** 최하위 등급 재고를 총 코드 수 이상으로 확보하거나, 소진 시 응답(대기 안내 등)을 별도로 설계하세요
- 재고 차감은 반드시 트랜잭션 + 원자적 update:
  ```ts
  const updated = await tx.prize.updateMany({
    where: { id: prizeId, stockLeft: { gt: 0 } },
    data: { stockLeft: { decrement: 1 } },
  });
  if (updated.count === 0) { /* 재추첨 */ }
  ```
- 가중치 변경은 `AuditLog`에 **누가 · 언제 · 어떤 값에서 어떤 값으로** 기록. 공모전 심사 대비 근거 자료가 되므로 로그는 삭제 불가로 설계

### 코드 발급
- 5,000건 생성은 요청 타임아웃을 넘길 수 있습니다. **스트리밍 CSV 응답** 또는 백그라운드 잡 + 완료 알림 중 택일
- 서버에서 암호학적 난수(`crypto.randomBytes`)로 생성, 형식 `PREFIX-XXXX` (접두어 4종 × 36⁴)
- 삽입은 `createMany({ skipDuplicates: true })` 후 실제 삽입 수를 검증해 부족분만 재생성
- **발급 후 코드 문자열 목록은 다시 조회할 수 없게** 하고, CSV는 1회 다운로드 후 폐기

### 데이터 페칭
- KPI·차트는 서버 컴포넌트에서 직접 Prisma 조회 (`export const revalidate = 300`)
- 테이블 필터·페이지네이션·정렬만 TanStack Query 클라이언트 훅으로 분리
- 폼은 React Hook Form + Zod. **스키마는 서버 Route Handler와 같은 파일에서 공유**

### 차트
막대 차트는 CSS flex + height %로 충분합니다(디자인 파일 참조). 라이브러리를 넣더라도 이 시각 언어(색 2종, radius 5px, gap 9px)를 유지하세요.

---

## Files

| 파일 | 설명 |
|---|---|
| `Admin Canvas.dc.html` | 관리자 콘솔 디자인 3화면 + 구현 메모 |
| `support.js` | 프로토타입 런타임. **이식 대상 아님** — HTML을 브라우저에서 열기 위해 필요할 뿐 |

`Admin Canvas.dc.html`을 브라우저에서 바로 열어 확인하세요.

## 미구현 / 미확정

- 감사 로그, 관리자 계정, 당첨 내역 전체 목록 화면은 아직 그리지 않았습니다
- 경품 썸네일은 플레이스홀더입니다
- 모바일/태블릿 대응 없음 (관리 콘솔은 데스크톱 전용 전제)
