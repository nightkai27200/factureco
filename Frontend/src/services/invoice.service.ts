import api from "@/lib/api";

export interface Invoice {
  id: string;
  number: string;
  status: string;
  total: number;
  clientId: string;
  createdAt: string;
}

export async function getInvoices(): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>("/invoices");
  return response.data;
}

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await api.get<Invoice>(`/invoices/${id}`);
  return response.data;
}

export async function createInvoice(data: any): Promise<Invoice> {
  const response = await api.post<Invoice>("/invoices", data);
  return response.data;
}

export async function updateInvoice(
  id: string,
  data: any
): Promise<Invoice> {
  const response = await api.patch<Invoice>(
    `/invoices/${id}`,
    data
  );

  return response.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}