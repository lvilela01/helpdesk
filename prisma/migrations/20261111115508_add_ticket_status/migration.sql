-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'being_served', 'closed');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'open';
