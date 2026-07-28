import api from "@/lib/api";


export type Quote = {

  id:string;

  number:string;

  status:string;

  amount:number;

  client?:{
    name:string;
  };

};



export async function getQuotes(){

  const response =
    await api.get<Quote[]>(
      "/quotes"
    );


  return response.data;

}



export async function createQuote(data:any){

  const response =
    await api.post(
      "/quotes",
      data
    );


  return response.data;

}