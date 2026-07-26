import api from "./api";


export type Stats = {

  revenueHT:number;

  revenueTTC:number;

  pendingInvoices:number;

  acceptedQuotes:number;

  clients:number;

};



export async function getStats():Promise<Stats>{


  const response =
    await api.get<Stats>("/dashboard");


  return response.data;


}