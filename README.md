# climate-change-ssk-oil

[Next.js](https://nextjs.org) (App Router) 기반 웹 프로젝트입니다.

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- ESLint

## 시작하기

개발 서버 실행:

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

## 폴더 구조

```
src/app/   # 페이지 및 레이아웃 (App Router)
public/    # 정적 파일
```

메인 페이지는 `src/app/page.tsx`에서 수정하세요.
