/**
 * GET /api/health — 배포 플랫폼 헬스체크
 *
 * 프로세스가 살아 있는지가 아니라 **DB 까지 닿는지**를 봅니다. 프로세스만 확인하면
 * DB 가 끊긴 인스턴스도 정상으로 판정돼, 헬스체크를 붙인 의미가 없습니다.
 *
 * 공통 `handle()` 을 쓰지 않습니다. 그쪽은 `{success, message, data}` 포맷과
 * 에러 코드 매핑을 위한 것이고, 헬스체크는 **HTTP 상태 코드만** 읽히면 됩니다.
 * 여기서 200/503 을 직접 정하는 편이 플랫폼 쪽 해석과 어긋나지 않습니다.
 *
 * ⚠️ 이 경로는 `proxy.ts` 에서 사이트 게이트를 **면제**받습니다.
 *    면제하지 않으면 게이트를 켠 순간 헬스체크가 401 을 받고, 플랫폼이 배포를
 *    실패로 판정해 롤백합니다. 면제해도 새어 나가는 정보는 "DB 가 붙어 있는가" 뿐입니다.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** 캐시되면 죽은 인스턴스가 계속 200 을 돌려줍니다. */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (e) {
    console.error("[health] DB 연결 실패:", e);
    // 원인은 로그에만 남깁니다. 게이트 밖 엔드포인트라 응답에 내부 사정을 싣지 않습니다.
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
