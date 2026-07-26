"use client";

import {
  downloadQuotePdf,
  downloadInvoicePdf,
} from "@/services/pdf.service";


export default function PdfButtons(){

  const quoteId =
    "MET_TON_ID_DEVIS";

  const invoiceId =
    "MET_TON_ID_FACTURE";


  return (

    <div
      style={{
        display:"flex",
        gap:"20px",
        marginTop:"30px",
      }}
    >


      <button
        onClick={() =>
          downloadQuotePdf(quoteId)
        }
      >
        Télécharger devis PDF
      </button>



      <button
        onClick={() =>
          downloadInvoicePdf(invoiceId)
        }
      >
        Télécharger facture PDF
      </button>


    </div>

  );

}