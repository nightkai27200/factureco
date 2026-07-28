import api from "@/lib/api";


export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
};



export async function getClients(): Promise<Client[]> {

  const response = await api.get<Client[]>("/clients");

  return response.data;

}



export async function createClient(
  data: Omit<Client,"id">
){

  const response =
    await api.post<Client>(
      "/clients",
      data
    );

  return response.data;

}



export async function deleteClient(
  id:string
){

  await api.delete(
    `/clients/${id}`
  );

}