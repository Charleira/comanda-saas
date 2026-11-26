-- CreateTable
CREATE TABLE "StallOperator" (
    "id" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StallOperator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StallOperator_stallId_idx" ON "StallOperator"("stallId");

-- CreateIndex
CREATE INDEX "StallOperator_userId_idx" ON "StallOperator"("userId");

-- CreateIndex
CREATE INDEX "StallOperator_organizationId_idx" ON "StallOperator"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "StallOperator_stallId_userId_key" ON "StallOperator"("stallId", "userId");

-- AddForeignKey
ALTER TABLE "StallOperator" ADD CONSTRAINT "StallOperator_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StallOperator" ADD CONSTRAINT "StallOperator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StallOperator" ADD CONSTRAINT "StallOperator_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
