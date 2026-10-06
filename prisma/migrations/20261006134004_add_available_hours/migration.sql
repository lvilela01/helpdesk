-- AlterTable
ALTER TABLE "users" ADD COLUMN     "available_hours" TEXT[] DEFAULT ARRAY[]::TEXT[];
