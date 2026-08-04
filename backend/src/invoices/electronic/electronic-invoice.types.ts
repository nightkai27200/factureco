export interface ElectronicInvoiceResult {
  success: boolean;

  invoiceId: string;

  invoiceNumber: string;

  format: 'FACTUR_X';

  xml: string;

  errors: string[];

  warnings: string[];
}