-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "EInvoiceStatus" AS ENUM ('NOT_APPLICABLE', 'TO_SEND', 'PENDING', 'SENT', 'RECEIVED', 'ACCEPTED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "ElectronicInvoiceFormat" AS ENUM ('FACTUR_X', 'UBL', 'CII');

-- CreateEnum
CREATE TYPE "OperationCategory" AS ENUM ('GOODS', 'SERVICES', 'MIXED');

-- CreateEnum
CREATE TYPE "VatPaymentOption" AS ENUM ('DEBITS', 'RECEIPTS');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('STANDARD', 'CREDIT_NOTE', 'DEBIT_NOTE');

-- CreateEnum
CREATE TYPE "TransmissionStatus" AS ENUM ('PENDING', 'SENT', 'RECEIVED', 'DELIVERED', 'ACCEPTED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "ReceivedInvoiceStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'ACCEPTED', 'REJECTED', 'ERROR', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EReportingType" AS ENUM ('TRANSACTION', 'PAYMENT');

-- CreateEnum
CREATE TYPE "ReportingStatus" AS ENUM ('NOT_REPORTED', 'PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CARD', 'CASH', 'DIRECT_DEBIT', 'CHEQUE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_userId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'FR',
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "siren" TEXT,
ADD COLUMN     "siret" TEXT,
ADD COLUMN     "type" "ClientType" NOT NULL DEFAULT 'BUSINESS',
ADD COLUMN     "vatNumber" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "country" TEXT DEFAULT 'FR',
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "siren" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "deliveryCountry" TEXT,
ADD COLUMN     "deliveryPostalCode" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "eInvoiceStatus" "EInvoiceStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "electronicFormat" "ElectronicInvoiceFormat",
ADD COLUMN     "invoiceType" "InvoiceType" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "issueDate" TIMESTAMP(3),
ADD COLUMN     "operationCategory" "OperationCategory",
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "precedingInvoiceNumber" TEXT,
ADD COLUMN     "vatPaymentOption" "VatPaymentOption",
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "ElectronicInvoiceDocument" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "format" "ElectronicInvoiceFormat" NOT NULL,
    "pdfPath" TEXT,
    "xmlPath" TEXT,
    "documentHash" TEXT,
    "formatVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectronicInvoiceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EInvoiceTransmission" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "requestId" TEXT,
    "status" "TransmissionStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "sentAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EInvoiceTransmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceivedInvoice" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "provider" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierSiren" TEXT,
    "supplierSiret" TEXT,
    "supplierVatNumber" TEXT,
    "supplierAddress" TEXT,
    "supplierPostalCode" TEXT,
    "supplierCity" TEXT,
    "supplierCountry" TEXT DEFAULT 'FR',
    "issueDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION,
    "vatAmount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "ReceivedInvoiceStatus" NOT NULL DEFAULT 'RECEIVED',
    "pdfPath" TEXT,
    "xmlPath" TEXT,
    "rawPayload" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReceivedInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod",
    "reference" TEXT,
    "reportingStatus" "ReportingStatus" NOT NULL DEFAULT 'NOT_REPORTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EReportingRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "type" "EReportingType" NOT NULL,
    "status" "ReportingStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "externalId" TEXT,
    "requestId" TEXT,
    "payload" JSONB NOT NULL,
    "responsePayload" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EReportingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectronicInvoiceDocument_invoiceId_key" ON "ElectronicInvoiceDocument"("invoiceId");

-- CreateIndex
CREATE INDEX "EInvoiceTransmission_invoiceId_idx" ON "EInvoiceTransmission"("invoiceId");

-- CreateIndex
CREATE INDEX "EInvoiceTransmission_externalId_idx" ON "EInvoiceTransmission"("externalId");

-- CreateIndex
CREATE INDEX "EInvoiceTransmission_requestId_idx" ON "EInvoiceTransmission"("requestId");

-- CreateIndex
CREATE INDEX "EInvoiceTransmission_status_idx" ON "EInvoiceTransmission"("status");

-- CreateIndex
CREATE INDEX "EInvoiceTransmission_provider_idx" ON "EInvoiceTransmission"("provider");

-- CreateIndex
CREATE INDEX "ReceivedInvoice_provider_idx" ON "ReceivedInvoice"("provider");

-- CreateIndex
CREATE INDEX "ReceivedInvoice_externalId_idx" ON "ReceivedInvoice"("externalId");

-- CreateIndex
CREATE INDEX "ReceivedInvoice_userId_idx" ON "ReceivedInvoice"("userId");

-- CreateIndex
CREATE INDEX "ReceivedInvoice_supplierSiren_idx" ON "ReceivedInvoice"("supplierSiren");

-- CreateIndex
CREATE INDEX "ReceivedInvoice_status_idx" ON "ReceivedInvoice"("status");

-- CreateIndex
CREATE INDEX "ReceivedInvoice_receivedAt_idx" ON "ReceivedInvoice"("receivedAt");

-- CreateIndex
CREATE INDEX "InvoicePayment_invoiceId_idx" ON "InvoicePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePayment_userId_idx" ON "InvoicePayment"("userId");

-- CreateIndex
CREATE INDEX "InvoicePayment_paymentDate_idx" ON "InvoicePayment"("paymentDate");

-- CreateIndex
CREATE INDEX "InvoicePayment_reportingStatus_idx" ON "InvoicePayment"("reportingStatus");

-- CreateIndex
CREATE INDEX "EReportingRecord_userId_idx" ON "EReportingRecord"("userId");

-- CreateIndex
CREATE INDEX "EReportingRecord_invoiceId_idx" ON "EReportingRecord"("invoiceId");

-- CreateIndex
CREATE INDEX "EReportingRecord_type_idx" ON "EReportingRecord"("type");

-- CreateIndex
CREATE INDEX "EReportingRecord_status_idx" ON "EReportingRecord"("status");

-- CreateIndex
CREATE INDEX "EReportingRecord_provider_idx" ON "EReportingRecord"("provider");

-- CreateIndex
CREATE INDEX "EReportingRecord_externalId_idx" ON "EReportingRecord"("externalId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_siren_idx" ON "Client"("siren");

-- CreateIndex
CREATE INDEX "Client_siret_idx" ON "Client"("siret");

-- CreateIndex
CREATE INDEX "Client_vatNumber_idx" ON "Client"("vatNumber");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_eInvoiceStatus_idx" ON "Invoice"("eInvoiceStatus");

-- CreateIndex
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");

-- CreateIndex
CREATE INDEX "Invoice_number_idx" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Quote_clientId_idx" ON "Quote"("clientId");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE INDEX "User_subscriptionId_idx" ON "User"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectronicInvoiceDocument" ADD CONSTRAINT "ElectronicInvoiceDocument_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EInvoiceTransmission" ADD CONSTRAINT "EInvoiceTransmission_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivedInvoice" ADD CONSTRAINT "ReceivedInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EReportingRecord" ADD CONSTRAINT "EReportingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EReportingRecord" ADD CONSTRAINT "EReportingRecord_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
