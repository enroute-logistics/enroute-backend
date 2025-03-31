-- CreateTable
CREATE TABLE
  "Driver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
  );

-- AlterTable
ALTER TABLE "Vehicle"
ADD COLUMN "driverId" INTEGER UNIQUE,
ADD COLUMN "maintenanceDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE;