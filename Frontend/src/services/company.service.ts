import api from "@/lib/api";

export interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  siret?: string;
  vatNumber?: string;
}

export async function getCompany(): Promise<Company> {
  const response = await api.get<Company>("/company");
  return response.data;
}

export async function updateCompany(
  data: Partial<Company>
): Promise<Company> {
  const response = await api.patch<Company>("/company", data);
  return response.data;
}