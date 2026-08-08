# climate-change-ssk-oil

[Next.js](https://nextjs.org) (App Router) 기반 웹 프로젝트입니다.

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- Prisma 7 + PostgreSQL (Railway)
- ESLint

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 을 `.env` 로 복사한 뒤 값을 채웁니다. `.env` 는 커밋되지 않습니다.

```bash
cp .env.example .env
```

`DATABASE_URL` 은 Railway → Postgres 서비스 → `Variables` 탭의 **`DATABASE_PUBLIC_URL`** 값을 씁니다.
같은 탭의 내부 주소(`postgres.railway.internal:5432`)는 Railway 컨테이너 안에서만 해석되므로
로컬 개발에서는 동작하지 않습니다. 공개 프록시 주소는 `*.proxy.rlwy.net` 형태입니다.
(배포 시에는 Railway 가 내부 주소를 자동 주입하므로 따로 설정하지 않습니다.)

암호화 키는 아래 명령으로 만들어 붙여 넣으세요. (`JWT_SECRET`, `PHONE_ENCRYPTION_KEY`, `PHONE_HMAC_SECRET`)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> ⚠️ `PHONE_ENCRYPTION_KEY` 와 `PHONE_HMAC_SECRET` 은 한 번 정하면 바꾸지 마세요.
> 키가 바뀌면 이미 저장된 전화번호를 복호화할 수 없고, `phoneHash` 대조도 불가능해집니다.

### 3. 관리자 비밀번호 해시 생성

관리자 계정은 DB 테이블이 아니라 환경 변수 하나로 관리합니다.
아래 명령의 출력값을 `.env` 의 `ADMIN_PASSWORD_HASH` 에 넣으세요. **비밀번호 원문을 적으면 안 됩니다.**

```bash
npm run admin:hash -- "<비밀번호>"
```

이 값이 없으면 관리자 로그인(`POST /api/admin/login`)이 동작하지 않습니다.

> ⚠️ 셸 히스토리에 비밀번호가 남습니다. 실행 후 히스토리를 정리하세요.

### 4. DB 준비

```bash
npx prisma migrate dev     # 스키마 반영
npm run db:seed            # 경품 6종 등록
npm run db:issue -- --batch 2026-demo-01   # 리워드 코드 발급
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 주요 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | 타입 검사 (`tsc --noEmit`) |
| `npm run admin:hash -- "<비밀번호>"` | 관리자 비밀번호 해시 생성 |
| `npm run db:seed` | 경품 카탈로그를 DB에 심기 (여러 번 실행해도 안전) |
| `npm run db:issue -- --batch <이름>` | 리워드 코드 배치 발급 (`--dry-run`, `--out <경로>` 지원) |
| `npm run db:stock` | 상품별 재고 현황 출력 |
| `npm run db:verify` | 발급된 배치 검증 (중복·형식·분배·셔플) |
| `npm run db:smoke` | 서비스 레이어 스모크 테스트 (상태 전이·보안·집계) |
| `npm run test:api` | HTTP 스모크 테스트 — **서버를 먼저 띄워야 합니다** |

> ⚠️ `db:issue --out` 으로 뽑은 CSV 에는 코드↔상품 매핑이 들어 있습니다. 커밋하거나 공유하지 마세요.

`test:api` 는 실제로 뜬 서버에 요청을 보냅니다. 터미널 두 개가 필요합니다.

```bash
npm run build && npm run start -- -p 3111   # 터미널 1
npm run test:api                            # 터미널 2
```

## API

응답은 전부 아래 형태입니다.

```jsonc
// 성공
{ "success": true,  "message": "...", "data": { } }
// 실패
{ "success": false, "message": "...", "errorCode": "ALREADY_USED" }
```

### 공개

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/prizes` | 경품 목록. 확률은 발급 비율에서 계산합니다. **재고는 포함되지 않습니다** |
| `POST` | `/api/reward/register` | 리워드 등록 (`name`·`phone`·`code`) |
| `POST` | `/api/reward/lookup` | 내 경품함 조회 (`name`·`phone`). 레이트 리밋 적용 |
| `PATCH` | `/api/reward/receive` | 실물 지급 처리 (`phone`·`rewardIds`). 하나라도 실패하면 전부 롤백 |

조회인데 `POST` 인 것은 전화번호를 URL 에 남기지 않기 위해서입니다.
`GET` 으로 바꾸면 쿼리스트링이 접근 로그·브라우저 히스토리·리퍼러에 그대로 남습니다.

### 관리자

`/api/admin/*` 는 `src/proxy.ts` 가 세션 쿠키를 검사합니다(`login` 제외).

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/api/admin/login` | 비밀번호 검증 후 httpOnly 세션 쿠키 발급 |
| `POST` | `/api/admin/logout` | 세션 쿠키 만료 |
| `GET` | `/api/admin/dashboard` | 오늘 등록·지급, 잔여, 상품별 재고, 최근 지급 |
| `GET` `POST` | `/api/admin/product` | 상품 목록(`?includeDeleted=1`) · 상품 등록 |
| `PATCH` `DELETE` `POST` | `/api/admin/product/[id]` | 수정 · 삭제(soft) · 복구 |
| `GET` `POST` | `/api/admin/reward-code` | 배치 목록 · 배치 발급(`dryRun` 지원) |
| `GET` | `/api/admin/user` | 사용자 목록 또는 `?phone=` 단건. 전화번호는 복호화되어 내려갑니다 |

### 에러 코드

| 코드 | 상태 | 의미 |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | 입력 형식 오류 |
| `INVALID_PHONE` | 400 | 전화번호 형식 오류 |
| `UNAUTHORIZED` | 401 | 관리자 인증 실패·부재 |
| `INVALID_CODE` | 404 | 등록되지 않은 리워드 코드 |
| `NOT_FOUND` | 404 | 대상 없음 (이름·전화번호 불일치 포함) |
| `ALREADY_USED` | 409 | 이미 등록된 코드 |
| `ALREADY_RECEIVED` | 409 | 이미 지급 처리된 리워드가 포함됨 |
| `CONFLICT` | 409 | 현재 상태에서 불가능한 요청 (배치 중복 등) |
| `RATE_LIMITED` | 429 | 요청 과다. `Retry-After` 헤더 참고 |
| `DATABASE_ERROR` | 500 | 그 밖의 서버 오류 |

## 폴더 구조

```
src/app/           # 페이지 및 레이아웃 (App Router)
src/app/api/       # Route Handler — 검증 → 서비스 호출 → 정형 응답
src/proxy.ts       # /api/admin/* 세션 검사 (middleware.ts 아님 — 아래 참고)
src/components/    # UI 컴포넌트
src/lib/           # 암호화·에러·검증·레이트리밋 등 공용 모듈
src/repositories/  # Prisma 쿼리 (DB 접근만)
src/services/      # 비즈니스 로직 · 트랜잭션 경계
src/types/         # 도메인 타입 및 DTO
prisma/            # 스키마 및 마이그레이션
scripts/           # CLI 어댑터 (서비스 호출 + 출력)
public/            # 정적 파일
```

요청은 `Route → 검증(Zod) → Service → Repository → Prisma` 순서로 흐릅니다.
Repository 는 Prisma 만, 비즈니스 판단은 Service 만 합니다. 트랜잭션 경계도 Service 가 정합니다.

> **`middleware.ts` 를 쓰지 마세요.** Next 16 에서 deprecated 이고, Edge 런타임이라
> `jsonwebtoken`·`node:crypto` 를 쓸 수 없습니다. 빌드는 경고만 내고 통과한 뒤 런타임에 실패합니다.
> `proxy.ts` 는 항상 Node.js 런타임에서 돌아갑니다 (그래서 `runtime` 세그먼트 설정을 넣으면 빌드가 거부합니다).

메인 페이지는 `src/app/page.tsx`에서 수정하세요.
