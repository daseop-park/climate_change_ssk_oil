# 문서 인덱스

> **상태: 살아있는 문서 — 문서를 추가·이동하면 이 표를 함께 고칩니다.**
>
> 작성 2026-09-03 · 최종 갱신 2026-09-03
> 선행 근거: 없음 (이 문서는 목차입니다)
> 관련: [`../README.md`](../README.md)(실행·배포 안내는 그쪽입니다)

이 폴더는 **왜 이렇게 만들었는지**를 담습니다.
**어떻게 실행하는지**는 저장소 루트의 [`README.md`](../README.md) 를 보세요.

---

## 처음 읽는다면

1. [`prd.html`](./prd.html) — 제품 개요·요구사항. 브라우저로 여세요.
2. [`archive/architecture.md`](./archive/architecture.md) — 코드를 열기 전에 구조를 잡는 용도.
   요청이 게이트를 어떻게 지나고 레이어가 어떻게 나뉘는지 다이어그램으로 있습니다.
3. [`implementation-plan.md`](./implementation-plan.md) 의 **확정 결정사항** 표 — 되돌리면 안 되는 결정들
4. 손댈 영역의 문서 하나 — 관리자면 `phase5-admin-estimate.md`, 레이아웃이면 `polishing/sdd/`

---

## 전체 목록

| 문서 | 성격 | 상태 |
|---|---|---|
| [`prd.html`](./prd.html) | 코드베이스에서 역산한 PRD | 참고용 스냅샷 (2026-09-03 기준) |
| [`implementation-plan.md`](./implementation-plan.md) | 확정 결정 · 진행 기록 · 정리 로그 | **살아있음 — 계속 갱신** |
| [`phase5-admin-estimate.md`](./phase5-admin-estimate.md) | 관리자 콘솔 설계 · 견적 | 확정 · 구현 완료 |
| [`polishing/sdd/sdd-responsive-layout.md`](./polishing/sdd/sdd-responsive-layout.md) | 반응형 레이아웃 설계 | 구현 완료 · **§6 육안 검증만 미완** |
| [`polishing/review/review-responsive-layout.md`](./polishing/review/review-responsive-layout.md) | 위 설계와 실제 구현의 대조 리뷰 | 코드 대조 완료 · 남은 육안 검증 목록 포함 |
| [`archive/architecture.md`](./archive/architecture.md) | 구조 스냅샷 — 레이어 · 데이터 모델 · 요청 흐름 (mermaid 8종) | **동결** — 2026-09-03 기준 |
| [`archive/implementation-plan-original.md`](./archive/implementation-plan-original.md) | 착수 시점 원안 | **동결 — 갱신하지 않음** |

### 이 폴더 밖의 기준 문서

| 문서 | 성격 |
|---|---|
| [`../back_111.md`](../back_111.md) | 백엔드·보안 요구사항 원본 |
| [`../front_design/design_spec.md`](../front_design/design_spec.md) | 프론트 디자인 기준 |
| `../design_handoff_ssakssak/` · `../admin_handoff/` | 디자인 핸드오프 **원본 — 읽기 전용** |

---

## 폴더 규칙

```
docs/
├─ README.md                  이 파일
├─ prd.html                   PRD (별도 유지)
├─ implementation-plan.md     현행 기준 — 다른 문서와 충돌하면 이 문서가 이깁니다
├─ phase5-admin-estimate.md   영역별 설계·견적
├─ archive/                   동결 문서. 역사 기록이므로 고치지 않습니다
│  ├─ architecture.md         구조 스냅샷 — 바뀌면 고치지 말고 새 스냅샷을 뜹니다
│  └─ implementation-plan-original.md
└─ polishing/                 폴리싱 단계 산출물
   ├─ sdd/                    착수 전 설계 (sdd-<주제>.md)
   └─ review/                 리뷰 결과
```

**새 문서를 만들 때** — 폴리싱 단계 설계는 `polishing/sdd/sdd-<주제>.md`,
리뷰 결과는 `polishing/review/`, 나머지는 `docs/` 루트에 두고 이 인덱스에 한 줄 추가합니다.
문서를 폐기할 때는 지우지 말고 `archive/` 로 옮긴 뒤 상태 배너를 **동결**로 바꿉니다.

**모든 문서의 머리말은 네 줄로 통일합니다** — 상태 / 작성·갱신일 / 선행 근거 / 관련 문서.
열자마자 "이건 살아있나, 동결됐나" 가 보이게 하기 위해서입니다.

---

## 주의

**절 번호는 API 입니다.** `phase5-admin-estimate.md` 의 절 번호는 소스 9개 파일이,
`polishing/sdd/sdd-responsive-layout.md` 의 절 번호는 소스 5개 파일이 주석에서 직접 인용합니다.
절을 추가·삭제해 번호가 밀리면 그 주석들이 조용히 틀린 곳을 가리키게 됩니다.

**반응형 작업은 코드 대조까지만 끝났습니다.** 설계(`polishing/sdd/`)와 실제 구현의 대조는
`polishing/review/review-responsive-layout.md` 로 마쳤고 — 설계대로 구현됐습니다 —
**SDD §6 의 뷰포트 매트릭스 육안 검증은 아직 남아 있습니다.** 확인 항목은 리뷰 문서 §4 의 표에
정리돼 있으니, 브라우저를 열 수 있는 환경에서 그 표부터 보세요.

**실제 발급된 리워드 코드는 어떤 문서에도 적지 않습니다.** 코드↔경품 매핑이 곧 답안지입니다.
발급 결과물은 `.gitignore` 된 `out/` 으로만 나갑니다.
