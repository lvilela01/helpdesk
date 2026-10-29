-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_user_id_fkey";

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
