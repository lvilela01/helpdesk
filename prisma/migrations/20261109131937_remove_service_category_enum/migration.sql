ALTER TABLE "Service"
ALTER COLUMN "category" TYPE TEXT
USING "category"::text;

DROP TYPE "ServiceCategory";
