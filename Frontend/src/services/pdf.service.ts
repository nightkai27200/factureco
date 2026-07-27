import axios from "axios";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://factureco-production.up.railway.app";



export async function downloadQuotePdf(
  id:string,
){

  const token =
    localStorage.getItem("token");


  const response =
    await axios.get<Blob>(
      `${API_URL}/quotes/${id}/pdf`,
      {
        headers:{
          Authorization:
          `Bearer ${token}`,
        },

        responseType:"blob",
      }
    );


  const file =
    new Blob(
      [response.data],
      {
        type:"application/pdf",
      }
    );


  const url =
    window.URL.createObjectURL(file);


  const link =
    document.createElement("a");


  link.href=url;


  link.download =
    `devis-${id}.pdf`;


  document.body.appendChild(link);

  link.click();

  link.remove();


  window.URL.revokeObjectURL(url);

}






export async function downloadInvoicePdf(
  id:string,
){

  const token =
    localStorage.getItem("token");


  const response =
    await axios.get<Blob>(
      `${API_URL}/invoices/${id}/pdf`,
      {
        headers:{
          Authorization:
          `Bearer ${token}`,
        },

        responseType:"blob",
      }
    );



  const file =
    new Blob(
      [response.data],
      {
        type:"application/pdf",
      }
    );



  const url =
    window.URL.createObjectURL(file);



  const link =
    document.createElement("a");


  link.href=url;



  link.download =
    `facture-${id}.pdf`;



  document.body.appendChild(link);

  link.click();

  link.remove();



  window.URL.revokeObjectURL(url);

}