-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('LOCATION', 'TASK');

-- AlterTable
ALTER TABLE "segments" ADD COLUMN     "entityId" TEXT;

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EntityType" NOT NULL,
    "companyId" TEXT NOT NULL,
    "requiresCoverage" BOOLEAN NOT NULL DEFAULT false,
    "minCoverage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entities_name_key" ON "entities"("name");

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
