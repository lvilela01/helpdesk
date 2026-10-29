/*
  Warnings:

  - You are about to drop the column `email` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mustChangePassword` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordTemporary` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'client';

-- DropIndex
DROP INDEX "clients_email_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "account_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "mustChangePassword",
DROP COLUMN "password",
DROP COLUMN "passwordTemporary",
DROP COLUMN "role",
ADD COLUMN     "account_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "passwordTemporary" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_account_id_key" ON "clients"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_account_id_key" ON "users"("account_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
