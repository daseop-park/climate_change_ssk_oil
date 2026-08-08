import type { Prisma } from "../generated/prisma/client";

/**
 * 레포지토리 함수가 받는 DB 핸들.
 *
 * 트랜잭션 안에서는 `tx`, 밖에서는 `db` 를 넘깁니다. 레포지토리가 `db` 를 직접
 * import 하지 않기 때문에, 같은 함수를 트랜잭션 안팎 어디서나 재사용할 수 있습니다.
 * 트랜잭션 경계를 정하는 것은 Service 의 책임입니다.
 */
export type DbClient = Prisma.TransactionClient;
