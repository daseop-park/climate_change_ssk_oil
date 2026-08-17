-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneEncrypted" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "hue" INTEGER NOT NULL DEFAULT 150,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "oddsLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_codes" (
    "id" TEXT NOT NULL,
    "rewardCode" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "batch" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNUSED',
    "usedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneHash_key" ON "users"("phoneHash");

-- CreateIndex
CREATE INDEX "products_deletedAt_sortOrder_idx" ON "products"("deletedAt", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "reward_codes_rewardCode_key" ON "reward_codes"("rewardCode");

-- CreateIndex
CREATE INDEX "reward_codes_productId_status_idx" ON "reward_codes"("productId", "status");

-- CreateIndex
CREATE INDEX "reward_codes_status_idx" ON "reward_codes"("status");

-- CreateIndex
CREATE INDEX "reward_codes_batch_idx" ON "reward_codes"("batch");

-- CreateIndex
CREATE INDEX "reward_codes_userId_idx" ON "reward_codes"("userId");

-- AddForeignKey
ALTER TABLE "reward_codes" ADD CONSTRAINT "reward_codes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_codes" ADD CONSTRAINT "reward_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
