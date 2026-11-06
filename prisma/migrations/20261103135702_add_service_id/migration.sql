/*
  Warnings:

  - You are about to alter the column `amount` on the `tickets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Added the required column `serviceId` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "serviceId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
