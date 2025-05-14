-- CreateTable
CREATE TABLE
  "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
  );

-- CreateTable
CREATE TABLE
  "VehicleFile" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleFile_pkey" PRIMARY KEY ("id")
  );

-- CreateTable
CREATE TABLE
  "ShipmentFile" (
    "id" SERIAL NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShipmentFile_pkey" PRIMARY KEY ("id")
  );

-- CreateIndex
CREATE INDEX "File_organizationId_idx" ON "File" ("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleFile_vehicleId_fileId_key" ON "VehicleFile" ("vehicleId", "fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentFile_shipmentId_fileId_key" ON "ShipmentFile" ("shipmentId", "fileId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFile" ADD CONSTRAINT "VehicleFile_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFile" ADD CONSTRAINT "VehicleFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentFile" ADD CONSTRAINT "ShipmentFile_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentFile" ADD CONSTRAINT "ShipmentFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE;