-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "subject" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");
