# Implementation Plan: Reward & Gift Collection Web App

> **상태: 동결 — 갱신하지 않습니다.** 착수 시점의 원안이며, 여기서 가져오는 것은
> **Phase 1~6 번호의 정의뿐**입니다. 현재 기준·확정 결정·진행 상황은
> **[`implementation-plan.md`](../implementation-plan.md)** 를 보세요.
>
> 작성 Phase 1 착수 전 (2026-08-07 이전) · 이후 갱신 없음
> 선행 근거: [`front_design/design_spec.md`](../../front_design/design_spec.md) · [`back_111.md`](../../back_111.md)
> 관련: [`docs/implementation-plan.md`](../implementation-plan.md) · [`docs/phase5-admin-estimate.md`](../phase5-admin-estimate.md)
>
> 📌 **2026-09-03: `docs/implementation_plan.md` 에서 이 경로로 옮기며 이름을 바꿨습니다.**
> 하이픈/밑줄 한 글자 차이로 살아있는 문서와 구분되던 상태를 없애기 위해서입니다.
>
> 아래 본문에는 이후 결정으로 **뒤집힌 내용이 그대로 남아 있습니다.** 당시 판단을 지우지 않고
> 남겨두는 편이 "왜 이렇게 됐는지" 를 설명해 주기 때문입니다. 대표적인 것:
>
> - **Phase 5 의 범위**는 2026-08-09 에 **조회 전용**으로 축소됐습니다.
>   아래 "상품 등록(Soft Delete) · 리워드 코드 일괄 생성기" 는 **폐기된 계획**입니다 —
>   상품 CRUD 와 코드 발급은 관리자 화면이 아니라 백엔드(CLI)에서 합니다.
>   현재 범위와 견적은 [`phase5-admin-estimate.md`](../phase5-admin-estimate.md).
> - **로컬 SQLite** 는 2026-08-07 Railway PostgreSQL 전면 전환으로 폐기됐습니다.
> - **배경 이미지(`clean_oil_bg.jpg`)** 조항은 디자인 핸드오프 반영 시 폐기됐습니다.
> - **`Sidebar.tsx` · `ProductModal.tsx`** 는 실제로 `shell/Drawer.tsx` · `shell/PrizeSheet.tsx`
>   (모달이 아니라 바텀시트) 로 구현됐고, `내 정보 관리` 모달은 `/mypage` 라우트가 됐습니다.
> - **"미들웨어 검증"** 은 `src/proxy.ts` 입니다. Next 16 에서 middleware 는 Edge 런타임이라
>   `jsonwebtoken`·`node:crypto` 를 쓸 수 없습니다.

이 문서는 [design_spec.md](../../front_design/design_spec.md)의 프론트엔드 디자인 기획과 [back_111.md](../../back_111.md)의 백엔드/보안 요구사항을 결합하여 작성한 **단계별 작업 계획서**입니다.

---

## 🔍 1. 두 문서 비교 분석 및 보완 제안 (Inconsistencies & Suggestions)

두 문서의 명세 중 더욱 정교한 구현을 위해 **보완이 필요한 부분**들입니다.

### 1) 사용자 메인 화면 내 '입력 폼(Form)' 구현 구체화
*   **기존 디자인 초안**: '설명글'과 '확인 버튼'만 도식화되어 있음.
*   **백엔드 요구사항**: 사용자가 '이름', '전화번호', '리워드 코드'를 입력하여 등록해야 함.
*   **수정 방향**: 메인 화면의 카드 내부에 **이름(텍스트), 전화번호(숫자/대시), 리워드 코드(알파벳/숫자 혼합)를 입력할 수 있는 React Hook Form + Zod 입력 폼**을 배치하고, '확인 버튼'이 이를 제출(Submit)하는 이벤트(Event 3)로 연동되도록 개선합니다.

### 2) 사이드바 내 '내 정보 관리(유저)' 기능과 백엔드 연동
*   **기존 디자인 초안**: 유저가 자신의 정보를 관리하는 메뉴로만 기재됨.
*   **백엔드 요구사항**: 유저가 전화번호를 입력하여 자신이 등록한 리워드(USED/RECEIVED 상태)를 확인할 수 있어야 함.
*   **수정 방향**: 사이드바에서 `내 정보 관리` 클릭 시 **'내 리워드 확인 모달'**이 열리도록 디자인합니다. 여기서 유저가 전화번호를 입력하면, 백엔드에서 `phoneHash`를 생성하여 해당 유저의 등록된 상품 목록과 수령 상태를 조회해 화면에 표기합니다.

### 3) 로컬 개발 환경용 DB 설정 (Prisma)
*   **기존 백엔드 요구사항**: Railway PostgreSQL.
*   **로컬 개발 및 즉시 검증을 위한 제안**: `prisma/schema.prisma` 설정 시, 기본 database provider를 `sqlite` 또는 `postgresql`로 동적 설정 가능하게 하거나, 로컬에서는 `sqlite` (파일 데이터베이스 `dev.db`)를 사용하여 복잡한 DB 설치 과정 없이 즉시 검증 가능하도록 개발을 시작하고, 환경변수(`DATABASE_URL`) 변경만으로 PostgreSQL로 배포할 수 있도록 구성합니다.

---

## 🚀 2. 단계별 개발 계획 (Step-by-Step Execution Plan)

### 📦 Phase 1: 패키지 설치 및 환경 설정 (Setup & Foundation)
1.  **필수 의존성 라이브러리 설치**:
    *   Prisma CLI 및 클라이언트 (`prisma`, `@prisma/client`)
    *   입력 검증 및 폼 관리 (`zod`, `react-hook-form`, `@hookform/resolvers`)
    *   API 상태 관리 (`@tanstack/react-query`)
    *   아이콘 및 암호화 관련 라이브러리 (`lucide-react`, `jsonwebtoken`, `@types/jsonwebtoken` 등)
2.  **환경 변수 (`.env`) 설정**:
    *   `DATABASE_URL`, `JWT_SECRET`, `PHONE_ENCRYPTION_KEY`, `PHONE_HMAC_SECRET` 정의
3.  **암호화/복호화 유틸리티 작성 (`src/lib/crypto.ts`)**:
    *   AES-256-GCM 기반 전화번호 암/복호화 함수 구현
    *   HMAC-SHA256 기반 전화번호 해시 생성 함수 구현

---

### 🗄️ Phase 2: DB 스키마 정의 및 레포지토리/서비스 레이어 구현
1.  **Prisma 스키마 작성 (`prisma/schema.prisma`)**:
    *   `User`, `Product`, `RewardCode` 스키마 및 관계 정의
    *   Prisma migration 실행 및 테스트용 초기 데이터(Seed) 생성 (상품 종류 등)
2.  **Repository 레이어 구현 (`src/repositories/`)**:
    *   `UserRepository`, `ProductRepository`, `RewardRepository` 작성 (Prisma 쿼리 격리)
3.  **Service 레이어 비즈니스 로직 작성 (`src/services/`)**:
    *   `RewardService`: 중복 코드 확인, Prisma Transaction 기반 리워드 등록 (`USED`), 수령 처리 (`RECEIVED` 및 `receivedAt` 기록)
    *   `UserService`: 해시 조회를 통한 유저 생성 또는 기존 유저 검색
    *   `AdminService`: 로그인 검증 및 JWT 발급

---

### 🌐 Phase 3: 백엔드 API (Route Handlers) 및 Validation 구현
1.  **Zod 검증 스키마 설계 (`src/lib/validation.ts`)**:
    *   이름 형식, 전화번호 자릿수, 리워드 코드(대소문자/숫자 조합)에 대한 유효성 검증 규칙 정의
2.  **API 라우트 핸들러 작성 (`src/app/api/`)**:
    *   `POST /api/reward/register`: 사용자 이름, 전화번호, 코드를 검증 후 등록 트랜잭션 수행
    *   `POST /api/reward/lookup`: 전화번호 해시를 사용해 사용자 소유 리워드 리스트 조회
    *   `PATCH /api/reward/receive`: 관리자가 선택한 리워드들을 `RECEIVED` 처리
    *   `POST /api/admin/login`: 관리자 패스워드를 검증하고 JWT 발급
    *   `GET /api/admin/dashboard`: 금일 등록/수령 통계 데이터 제공

---

### 🎨 Phase 4: 사용자(모바일 우선) 프론트엔드 구현
1.  **Tailwind CSS 및 글로벌 스타일 정의 (`src/app/globals.css`)**:
    *   배경 이미지 (`clean_oil_bg.jpg`) 레이아웃 스타일 적용
    *   글래스모피즘 (`backdrop-blur`) 클래스 및 트랜지션 애니메이션 정의
2.  **메인 등록 화면 (`src/app/page.tsx`)**:
    *   반응형 모바일 카드, 설명글, 이름/전화번호/리워드코드 입력 폼 구현
    *   등록 진행 중 로딩, 스켈레톤, 성공/실패 토스트 메시지 추가
3.  **사이드바 드로어 (`src/components/Sidebar.tsx`)**:
    *   슬라이딩 트랜지션 적용
    *   `about us`, `내 정보 관리`, `고객센터 문의` 클릭 시 전환 효과 모달/팝업 구현
4.  **상품 리스트 상세 모달 (`src/components/ProductModal.tsx`)**:
    *   리스트 `+` 버튼 클릭 시 스케일-페이드 애니메이션 모달 오버레이 구현

---

### 👑 Phase 5: 관리자 페이지 구현 (`src/app/admin/`)
1.  **관리자 로그인 페이지 (`src/app/admin/login/page.tsx`)**:
    *   JWT 발급 연동 폼
2.  **관리자 대시보드 (`src/app/admin/page.tsx` 등)**:
    *   주요 통계 메트릭스 카드 (오늘 등록/지급 수, 잔여 리워드 등)
    *   **실물 지급 관리**: 관리자가 유저 전화번호를 입력하면 미지급 리워드 리스트를 출력하고, 체크박스로 선택하여 '지급 완료' 처리하는 기능 (트랜잭션 연동)
    *   **상품 및 리워드 코드 관리**: 새로운 상품 등록(Soft Delete 기능 포함) 및 난수 기반 리워드 코드 일괄 생성기 구현

---

### 🧪 Phase 6: 연동 테스트 및 최적화 (Testing & Polish)
1.  **동시성 트랜잭션 테스트**:
    *   동일한 리워드 코드를 여러 브라우저에서 동시에 등록하려 시도 시, 한 명만 성공하고 나머지는 `ALREADY_USED` 에러가 정상 반환되는지 확인
2.  **보안 검사**:
    *   DB에 저장된 전화번호가 AES로 정상 암호화되었는지 확인
    *   JWT 토큰이 없는 브라우저에서 `/api/admin/*` 접근 시 `UNAUTHORIZED` 차단되는지 미들웨어 검증
3.  **디자인 폴리싱**:
    *   모든 디바이스 크기에서의 반응형 레이아웃 재검토
    *   로딩 애니메이션 스피너, 에러 바운더리 폴백 화면 적용

