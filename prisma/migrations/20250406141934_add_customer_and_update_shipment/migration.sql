-- CreateTable
CREATE TABLE
  "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
  );

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Shipment"
ADD COLUMN "description" TEXT,
ADD COLUMN "originLat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "originLng" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "originName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "destinationLat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "destinationLng" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "destinationName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "customerId" INTEGER NOT NULL,
ADD COLUMN "distance" DOUBLE PRECISION,
ADD COLUMN "plannedPickupDate" TIMESTAMP(3),
ADD COLUMN "plannedDeliveryDate" TIMESTAMP(3),
ADD COLUMN "weight" DOUBLE PRECISION,
ADD COLUMN "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "price" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;