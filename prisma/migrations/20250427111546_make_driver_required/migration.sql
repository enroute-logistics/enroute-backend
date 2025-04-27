-- DropForeignKey
ALTER TABLE "Vehicle"
DROP CONSTRAINT "Vehicle_driverId_fkey";

-- AlterTable
ALTER TABLE "Vehicle"
ALTER COLUMN "driverId"
SET
  NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;