/*
Warnings:

- Made the column `customerId` on table `Shipment` required. This step will fail if there are existing NULL values in that column.

 */
-- DropForeignKey
ALTER TABLE "Shipment"
DROP CONSTRAINT "Shipment_vehicleId_fkey";

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create a default customer for existing shipments without one
INSERT INTO
  "Customer" (name, "organizationId", "createdAt", "updatedAt")
SELECT DISTINCT
  'Default Customer',
  s."organizationId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM
  "Shipment" s
WHERE
  s."customerId" IS NULL;

-- Update existing shipments to use the default customer
UPDATE "Shipment" s
SET
  "customerId" = c.id
FROM
  "Customer" c
WHERE
  s."customerId" IS NULL
  AND c.name = 'Default Customer'
  AND c."organizationId" = s."organizationId";

-- Make customerId required
ALTER TABLE "Shipment"
ALTER COLUMN "customerId"
SET
  NOT NULL;