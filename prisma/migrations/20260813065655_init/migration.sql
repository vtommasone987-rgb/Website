-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetNumber" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group" TEXT,
    "location" TEXT,
    "deletedAt" TIMESTAMP(3),
    "assignedTo" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageDevice" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacityGb" INTEGER NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "StorageDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "AssetImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "salePriceCents" INTEGER NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assetId" TEXT,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "model" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "details" TEXT NOT NULL,
    "budget" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,

    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "vendor" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalCostCents" INTEGER NOT NULL,
    "purchasedAt" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group" TEXT,
    "deletedAt" TIMESTAMP(3),
    "assetId" TEXT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetGroup" (
    "name" TEXT NOT NULL,

    CONSTRAINT "AssetGroup_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "PurchaseGroup" (
    "name" TEXT NOT NULL,

    CONSTRAINT "PurchaseGroup_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_TicketAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TicketAssets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CustomOrderAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomOrderAssets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetNumber_key" ON "Asset"("assetNumber");

-- CreateIndex
CREATE INDEX "Asset_deletedAt_idx" ON "Asset"("deletedAt");

-- CreateIndex
CREATE INDEX "Part_assetId_idx" ON "Part"("assetId");

-- CreateIndex
CREATE INDEX "StorageDevice_assetId_idx" ON "StorageDevice"("assetId");

-- CreateIndex
CREATE INDEX "AssetImage_assetId_idx" ON "AssetImage"("assetId");

-- CreateIndex
CREATE INDEX "Purchase_deletedAt_idx" ON "Purchase"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE INDEX "_TicketAssets_B_index" ON "_TicketAssets"("B");

-- CreateIndex
CREATE INDEX "_CustomOrderAssets_B_index" ON "_CustomOrderAssets"("B");

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageDevice" ADD CONSTRAINT "StorageDevice_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetImage" ADD CONSTRAINT "AssetImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketAssets" ADD CONSTRAINT "_TicketAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketAssets" ADD CONSTRAINT "_TicketAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomOrderAssets" ADD CONSTRAINT "_CustomOrderAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomOrderAssets" ADD CONSTRAINT "_CustomOrderAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
