/*
  Warnings:

  - You are about to drop the column `category` on the `tickets` table. All the data in the column will be lost.
  - Changed the type of `category` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('network', 'hardware', 'software', 'account');

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "category",
ADD COLUMN     "category" "ServiceCategory" NOT NULL;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "category";

-- CreateIndex
CREATE UNIQUE INDEX "Service_category_key" ON "Service"("category");
