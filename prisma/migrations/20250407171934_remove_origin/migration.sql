-- Remove origin and destination columns from Shipment table
ALTER TABLE "Shipment"
DROP COLUMN "origin",
DROP COLUMN "destination";