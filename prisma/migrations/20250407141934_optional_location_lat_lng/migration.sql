-- Make location lat and lng optional
ALTER TABLE "Shipment"
ALTER COLUMN "originLat"
DROP NOT NULL,
ALTER COLUMN "originLng"
DROP NOT NULL,
ALTER COLUMN "destinationLat"
DROP NOT NULL,
ALTER COLUMN "destinationLng"
DROP NOT NULL;