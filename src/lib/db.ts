import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 클라이언트 단일 인스턴스.
 *
 * DB 위치는 **DATABASE_URL 하나만** 참조합니다.
 * 앱과 CLI(마이그레이션·시드)가 같은 값을 보도록 여기서 경로를 따로 만들지 않습니다.
 *
 * 로컬 개발은 Railway 의 공개 프록시 URL(`*.proxy.rlwy.net`)을 쓰고,
 * Railway 에 배포하면 내부 주소(`postgres.railway.internal`)가 자동 주입됩니다.
 * 코드는 어느 쪽이든 동일하게 동작합니다.
 */
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "[db] 환경변수 DATABASE_URL 이 설정되지 않았습니다. .env.example 을 참고해 .env 를 만들어주세요.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
