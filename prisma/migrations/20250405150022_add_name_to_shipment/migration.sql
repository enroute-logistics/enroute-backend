-- Add name field to Shipment table
ALTER TABLE "Shipment"
ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Unnamed Shipment';

-- Remove the default after adding the column
ALTER TABLE "Shipment"
ALTER COLUMN "name"
DROP DEFAULT;