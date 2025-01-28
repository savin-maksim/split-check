-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_checkId_fkey";

-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "checkId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "Check"("id") ON DELETE SET NULL ON UPDATE CASCADE;
