import api from "./api";

// ======================================================
// STATUT
// ======================================================

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REFUSED"
  | "CONVERTED";

// ======================================================
// CLIENT
// ======================================================

export interface QuoteClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;

  // Nom de l'entreprise du client
  company?: string | null;
}

// ======================================================
// LIGNE DEVIS
// ======================================================

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  quoteId: string;
}

// ======================================================
// DEVIS
// ======================================================

export interface Quote {
  id: string;
  number: string;

  title: string;
  description?: string;

  status: QuoteStatus;

  subtotal: number;
  vatRate: number;
  vatAmount: number;
  amount: number;

  clientId: string;

  client?: QuoteClient;

  items?: QuoteItem[];

  // Selon le retour Prisma actuel
  quoteItems?: QuoteItem[];

  createdAt: string;
  updatedAt: string;
}

// ======================================================
// CREATION
// ======================================================

export interface CreateQuoteItemData {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteData {
  title: string;
  description?: string;
  clientId: string;
  items: CreateQuoteItemData[];
  vatRate?: number;
}

// ======================================================
// MODIFICATION
// ======================================================

export interface UpdateQuoteData {
  title?: string;
  description?: string;
  clientId?: string;
  items?: CreateQuoteItemData[];
  vatRate?: number;
}

// ======================================================
// STATUT
// ======================================================

export interface UpdateQuoteStatusData {
  status: QuoteStatus;
}

// ======================================================
// FACTURE
// ======================================================

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  invoiceId: string;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;

  // Nom de l'entreprise du client
  company?: string | null;
}

export interface Invoice {
  id: string;
  number: string;

  status: InvoiceStatus;

  subtotal: number;
  vatRate: number;
  vatAmount: number;
  amount: number;

  clientId: string;
  userId: string;

  quoteId?: string | null;

  client?: InvoiceClient;

  invoiceItems?: InvoiceItem[];

  createdAt?: string;
  updatedAt?: string;
}

// ======================================================
// GET TOUS LES DEVIS
// ======================================================

export async function getQuotes(): Promise<Quote[]> {
  const response =
    await api.get<Quote[]>(
      "/quotes",
    );

  return response.data;
}

// ======================================================
// GET UN DEVIS
// ======================================================

export async function getQuote(
  id: string,
): Promise<Quote> {
  const response =
    await api.get<Quote>(
      `/quotes/${id}`,
    );

  return response.data;
}

// ======================================================
// CREER
// ======================================================

export async function createQuote(
  data: CreateQuoteData,
): Promise<Quote> {
  const response =
    await api.post<Quote>(
      "/quotes",
      data,
    );

  return response.data;
}

// ======================================================
// MODIFIER
// ======================================================

export async function updateQuote(
  id: string,
  data: UpdateQuoteData,
): Promise<Quote> {
  const response =
    await api.patch<Quote>(
      `/quotes/${id}`,
      data,
    );

  return response.data;
}

// ======================================================
// MODIFIER STATUT
// ======================================================

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<Quote> {
  const response =
    await api.patch<Quote>(
      `/quotes/${id}/status`,
      {
        status,
      },
    );

  return response.data;
}

// ======================================================
// SUPPRIMER
// ======================================================

export async function deleteQuote(
  id: string,
): Promise<Quote> {
  const response =
    await api.delete<Quote>(
      `/quotes/${id}`,
    );

  return response.data;
}

// ======================================================
// CONVERTIR EN FACTURE
// ======================================================

export async function convertQuoteToInvoice(
  id: string,
): Promise<Invoice> {
  const response =
    await api.post<Invoice>(
      `/quotes/${id}/convert`,
    );

  return response.data;
}

// ======================================================
// PDF
// ======================================================

export async function getQuotePdf(
  id: string,
): Promise<Blob> {
  const response =
    await api.get<Blob>(
      `/quotes/${id}/pdf`,
      {
        responseType: "blob",
      },
    );

  return response.data;
}