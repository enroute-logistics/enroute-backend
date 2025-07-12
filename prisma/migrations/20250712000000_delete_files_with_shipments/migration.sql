-- Cascade delete files with shipments
BEGIN;

ALTER TABLE "ShipmentFile"
DROP CONSTRAINT "ShipmentFile_shipmentId_fkey";

ALTER TABLE "ShipmentFile" ADD CONSTRAINT "ShipmentFile_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE;

COMMIT;