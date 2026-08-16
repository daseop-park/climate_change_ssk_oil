import type { MetadataRoute } from "next";

/**
 * 전 경로 색인 거부.
 *
 * 이 사이트는 패드 QR 로 들어온 참여자만 쓰는 1회성 행사 페이지입니다.
 * 검색 결과에 뜰 이유가 없고, 뜨면 오히려 손해입니다 —
 * 코드 없이 들어온 사람에게는 아무 기능도 없는 화면이기 때문입니다.
 *
 * ⚠️ **게이트가 꺼져 있을 때를 위한 장치입니다.**
 * `SITE_GATE_ENABLED` 가 켜져 있으면 `proxy.ts` 가 크롤러를 403 으로 막으므로
 * 이 파일이 없어도 색인되지 않습니다. 하지만 공모전 심사·포트폴리오 공개를 위해
 * 게이트를 끄는 기간이 있고(계획서의 게이트 절 참조), 그 동안에는 이 파일만이 방어선입니다.
 *
 * 관리자 화면은 `admin/layout.tsx` 의 `robots: { index: false }` 로 한 겹 더 막혀 있습니다.
 * 여기서 전체를 막으므로 중복이지만, 한쪽을 되돌릴 때 다른 쪽이 남도록 둘 다 둡니다.
 *
 * 참고: robots.txt 는 **요청**이지 강제가 아닙니다. 규칙을 지키지 않는 크롤러는
 * 게이트로 막아야 합니다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
