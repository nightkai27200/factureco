-- Création des enums

CREATE TYPE "QuoteStatus" AS ENUM (
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'REFUSED',
  'CONVERTED'
);


CREATE TYPE "InvoiceStatus" AS ENUM (
  'DRAFT',
  'SENT',
  'PAID',
  'CANCELLED'
);



-- Suppression des anciennes valeurs par défaut

ALTER TABLE "Quote"
ALTER COLUMN "status" DROP DEFAULT;


ALTER TABLE "Invoice"
ALTER COLUMN "status" DROP DEFAULT;



-- Conversion des colonnes

ALTER TABLE "Quote"
ALTER COLUMN "status"
TYPE "QuoteStatus"
USING "status"::text::"QuoteStatus";


ALTER TABLE "Invoice"
ALTER COLUMN "status"
TYPE "InvoiceStatus"
USING "status"::text::"InvoiceStatus";



-- Remise des valeurs par défaut

ALTER TABLE "Quote"
ALTER COLUMN "status"
SET DEFAULT 'DRAFT';


ALTER TABLE "Invoice"
ALTER COLUMN "status"
SET DEFAULT 'DRAFT';