-- AlterTable
ALTER TABLE "segments" ADD COLUMN     "entityShiftId" TEXT;

-- CreateTable
CREATE TABLE "entity_shifts" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "recurrenceEndDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_shifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "entity_shifts" ADD CONSTRAINT "entity_shifts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_shifts" ADD CONSTRAINT "entity_shifts_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_entityShiftId_fkey" FOREIGN KEY ("entityShiftId") REFERENCES "entity_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
