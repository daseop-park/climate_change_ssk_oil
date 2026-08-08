# 프로젝트명
QR 기반 리워드 지급 및 실물 수령 관리 웹앱

---

# 프로젝트 목표

QR을 통해 웹앱에 접속한 사용자가 리워드 코드를 등록하고, 운영자는 실물 리워드 지급을 효율적으로 관리할 수 있는 Full-Stack 웹 시스템을 개발한다.

단순 CRUD 수준이 아닌 실제 서비스 수준의 구조를 목표로 하며 다음 요소를 반드시 고려한다.

- 모바일 환경 최적화
- 중복 지급 방지
- 동시성 처리(Transaction)
- 개인정보 보호
- 관리자 운영 기능
- 확장 가능한 아키텍처

---

# 기술 스택

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query

## Backend

- Next.js Route Handler
- Prisma ORM
- Railway PostgreSQL

## Security

- AES-256-GCM (전화번호 암호화)
- HMAC-SHA256 (전화번호 조회용 Hash)
- JWT (관리자 인증 전용)
- Environment Variables

---

# 아키텍처

QR

↓

Web App

↓

API(Route Handler)

↓

Validation(Zod)

↓

Service Layer

↓

Repository Layer

↓

Prisma ORM

↓

PostgreSQL

---

# 폴더 구조

src/

    app/
        api/
        admin/
        reward/

    components/

    services/

    repositories/

    lib/

    hooks/

    types/

    utils/

    middleware/

---

# DB 설계

## users

id

name

phoneEncrypted

phoneHash (UNIQUE INDEX)

createdAt

설명

- phoneEncrypted : AES-256-GCM으로 암호화하여 저장
- phoneHash : HMAC-SHA256으로 생성하여 조회 및 중복 확인용으로 사용
- phoneHash는 최초 리워드 등록 시 생성하여 저장한다.

---

## products

id

name

description

image

createdAt

---

## reward_codes

id

rewardCode (UNIQUE)

productId (FK)

userId (FK, Nullable)

status

usedAt

receivedAt

createdAt

---

# Reward Status

UNUSED

↓

USED

↓

RECEIVED

설명

UNUSED
- 아직 등록되지 않은 코드

USED
- 사용자가 리워드 코드를 등록한 상태
- 실물은 아직 수령하지 않음

RECEIVED
- 운영자가 실물 지급 완료 처리

---

# 관계

User (1)

↓

RewardCode (N)

↓

Product (1)

---

# 리워드 등록 프로세스

사용자

↓

QR 접속

↓

이름 입력

↓

전화번호 입력

↓

리워드 코드 입력

↓

Validation

↓

phoneEncrypted 생성(AES)

↓

phoneHash 생성(HMAC)

↓

phoneHash 존재 여부 확인

↓

없으면 User 생성

있으면 기존 User 사용

↓

RewardCode 조회

↓

status == UNUSED 확인

↓

Prisma Transaction 시작

↓

RewardCode.userId 연결

↓

status = USED

↓

usedAt 기록

↓

Commit

↓

응답 반환

---

# 실물 수령 프로세스

관리자

↓

전화번호 입력

↓

동일한 HMAC 방식으로 phoneHash 생성

↓

phoneHash로 User 조회

↓

RewardCode 조회

조건

status == USED

↓

프론트에 리스트 반환

예시

□ 텀블러

□ 콜라

□ 키링

↓

관리자가 지급 완료한 상품 체크

↓

[수령 완료]

↓

Prisma Transaction

↓

선택된 RewardCode

status

USED

↓

RECEIVED

↓

receivedAt 기록

↓

Commit

---

# 관리자 기능

JWT 로그인

Dashboard

상품 관리

리워드 코드 관리

사용자 조회

실물 지급

통계 조회

---

# Dashboard

오늘 등록 수

오늘 지급 수

전체 지급 수

남은 리워드 수

상품별 지급 현황

최근 지급 내역

---

# 상품 관리

상품 등록

상품 수정

상품 삭제(Soft Delete)

이미지 등록

---

# 리워드 코드 관리

리워드 코드 생성

리워드 코드 검색

사용 여부 확인

실물 지급 여부 확인

---

# 사용자 조회

이름

전화번호(복호화 후 표시)

등록 리워드

지급 리워드

최근 등록일

---

# API

POST

/api/reward/register

리워드 등록

---

전화번호를 https에서 post로 전송하고, 서버에서 즉시 hmac 생성 후 원문은 폐기

전화번호 입력

↓

수령 가능한 리워드 조회

---

PATCH

/api/reward/receive

선택된 리워드

↓

RECEIVED 처리

---

POST

/api/admin/login

JWT 발급

---

GET

/api/admin/dashboard

통계 조회

---

POST

/api/admin/product

상품 생성

---

POST

/api/admin/reward-code

리워드 코드 생성

---

# Validation

Zod 적용

이름 길이

전화번호 형식

리워드 코드 형식

필수값 검증

---

# API Response

성공

{
    success: true,
    message: "...",
    data: {}
}

실패

{
    success: false,
    message: "...",
    errorCode: "..."
}

---

# Error Code

INVALID_CODE

ALREADY_USED

ALREADY_RECEIVED

NOT_FOUND

INVALID_PHONE

VALIDATION_ERROR

DATABASE_ERROR

UNAUTHORIZED

---

# Backend 구조

Route

↓

Validation

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

Repository에서는 Prisma만 사용한다.

Business Logic은 Service에서만 처리한다.

---

# 적용 패턴

Service Layer

Repository Pattern

DTO(Request / Response)

Transaction

Custom Error

Global Error Handler

Dependency 분리

---

# Transaction 적용 대상

리워드 등록

실물 지급

관리자 수정

동시에 동일 코드 등록 요청 시

오직 하나만 성공해야 한다.

---

# 보안

관리자 JWT

AES-256-GCM 전화번호 암호화

HMAC-SHA256 전화번호 Hash

Environment Variables

Prisma(SQL Injection 방지)

HTTPS 전제

---

# Environment Variables

DATABASE_URL

JWT_SECRET

PHONE_ENCRYPTION_KEY

PHONE_HMAC_SECRET

---

# UI/UX

모바일 우선

반응형

Toast

Loading

Skeleton

Confirm Dialog

Error Boundary

Empty State

---

# 추가 구현

관리자 Dashboard Chart

상품별 지급 통계

오늘 등록 수

오늘 지급 수

QR 자동 생성

감사 로그(Audit Log)

Pagination

Search

---

# 코드 품질

TypeScript Strict Mode

ESLint

Prettier

any 사용 금지

공통 타입 분리

API 타입 분리

DTO 사용

컴포넌트 재사용

비즈니스 로직과 UI 완전 분리

---

# 구현 목표

실제 서비스 수준의 유지보수가 가능한 Full-Stack 구조를 구현한다.

단순 CRUD가 아니라

- 보안
- 확장성
- 유지보수성
- 동시성
- 사용자 경험

을 모두 고려한 구조로 개발한다.