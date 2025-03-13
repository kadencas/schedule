/*
  Warnings:

  - The values [LOCATION] on the enum `EntityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EntityType_new" AS ENUM ('TASK', 'STATION');
ALTER TABLE "entities" ALTER COLUMN "type" TYPE "EntityType_new" USING ("type"::text::"EntityType_new");
ALTER TYPE "EntityType" RENAME TO "EntityType_old";
ALTER TYPE "EntityType_new" RENAME TO "EntityType";
DROP TYPE "EntityType_old";
COMMIT;
