-- DropIndex
DROP INDEX "Invoice_number_key";

-- DropIndex
DROP INDEX "Quote_number_key";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "amount" DROP DEFAULT;
