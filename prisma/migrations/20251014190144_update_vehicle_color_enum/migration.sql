-- CreateEnum
CREATE TYPE "VehicleColor" AS ENUM ('WHITE', 'BLUE', 'RED', 'YELLOW', 'GREY');

-- Update existing data to match enum values
UPDATE "Vehicle" SET "color" = 'WHITE' WHERE "color" = 'white';
UPDATE "Vehicle" SET "color" = 'BLUE' WHERE "color" = 'blue';
UPDATE "Vehicle" SET "color" = 'RED' WHERE "color" = 'red';
UPDATE "Vehicle" SET "color" = 'YELLOW' WHERE "color" = 'yellow';
UPDATE "Vehicle" SET "color" = 'GREY' WHERE "color" = 'grey';

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "color" DROP DEFAULT;
ALTER TABLE "Vehicle" ALTER COLUMN "color" TYPE "VehicleColor" USING "color"::"VehicleColor";
ALTER TABLE "Vehicle" ALTER COLUMN "color" SET DEFAULT 'WHITE';
