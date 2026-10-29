/*
  Warnings:

  - You are about to drop the column `avatar` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "avatar";
