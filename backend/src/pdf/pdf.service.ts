import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class PdfService {


async generateInvoicePdf(invoice:any){


const doc = new PDFDocument({
  margin:50,
});


const company = invoice.user?.company;
const client = invoice.client;



// Couleur principale
const primary = '#1e3a8a';



// LOGO

if(company?.logo){

try{

const logoPath =
path.join(
 process.cwd(),
 company.logo.replace('/','')
);


if(fs.existsSync(logoPath)){

doc.image(
 logoPath,
 50,
 45,
 {
  width:90
 }
);

}

}catch(error){

console.log(
"Erreur logo facture",
error
);

}

}



// ENTREPRISE

doc
.fontSize(20)
.fillColor(primary)
.text(
company?.name || "Entreprise",
160,
55
);



doc
.fontSize(10)
.fillColor('black')
.text(
`${company?.address || ""}
${company?.city || ""}
${company?.phone || ""}
${company?.email || ""}`,
160,
85
);



// TITRE FACTURE

doc
.fontSize(24)
.fillColor(primary)
.text(
"FACTURE",
400,
50,
{
align:"right"
}
);


doc
.fontSize(11)
.fillColor('black')
.text(
invoice.number,
400,
85,
{
align:"right"
}
);



doc.moveDown(3);



// CLIENT

doc
.fontSize(13)
.fillColor(primary)
.text(
"FACTURÉ À"
);


doc
.fontSize(11)
.fillColor('black')
.text(
`${client?.name || ""}
${client?.address || ""}
${client?.email || ""}`
);



doc.moveDown(2);



// LIGNE

doc
.moveTo(50,220)
.lineTo(550,220)
.stroke(primary);



// TABLEAU

let y = 250;


doc
.fontSize(11)
.fillColor(primary)
.text(
"DESCRIPTION",
50,
y
);

doc.text(
"QTE",
300,
y
);

doc.text(
"PRIX",
380,
y
);

doc.text(
"TOTAL",
470,
y
);



y += 25;



doc
.fillColor('black');



invoice.invoiceItems?.forEach(
(item)=>{


doc.text(
item.description,
50,
y
);


doc.text(
String(item.quantity),
300,
y
);


doc.text(
`${item.unitPrice.toFixed(2)} €`,
380,
y
);


doc.text(
`${item.total.toFixed(2)} €`,
470,
y
);



y += 25;


}

);




// TOTALS TVA

doc.moveDown(2);


doc
.fontSize(12)
.fillColor('black')
.text(
`Total HT : ${invoice.subtotal.toFixed(2)} €`,
{
align:"right"
}
);


doc.text(
`TVA ${invoice.vatRate}% : ${invoice.vatAmount.toFixed(2)} €`,
{
align:"right"
}
);


doc.moveDown();


doc
.fontSize(17)
.fillColor(primary)
.text(
`TOTAL TTC : ${invoice.amount.toFixed(2)} €`,
{
align:"right"
}
);



doc.end();


return doc;


}

async generateQuotePdf(quote:any){


const doc = new PDFDocument({
  margin:50,
});


const company = quote.user?.company;
const client = quote.client;


const primary = '#1e3a8a';



// LOGO

if(company?.logo){

try{


const logoPath =
path.join(
 process.cwd(),
 company.logo.replace('/','')
);



if(fs.existsSync(logoPath)){


doc.image(
 logoPath,
 50,
 45,
 {
  width:90
 }
);


}


}catch(error){

console.log(
"Erreur logo devis",
error
);

}

}



// ENTREPRISE

doc
.fontSize(20)
.fillColor(primary)
.text(
company?.name || "Entreprise",
160,
55
);



doc
.fontSize(10)
.fillColor('black')
.text(
`${company?.address || ""}
${company?.city || ""}
${company?.phone || ""}
${company?.email || ""}`,
160,
85
);





// TITRE DEVIs

doc
.fontSize(24)
.fillColor(primary)
.text(
"DEVIS",
400,
50,
{
align:"right"
}
);



doc
.fontSize(11)
.fillColor('black')
.text(
quote.number,
400,
85,
{
align:"right"
}
);



doc.moveDown(3);




// CLIENT

doc
.fontSize(13)
.fillColor(primary)
.text(
"CLIENT"
);



doc
.fontSize(11)
.fillColor('black')
.text(
`${client?.name || ""}
${client?.address || ""}
${client?.email || ""}`
);



doc.moveDown(2);




// DESCRIPTION

doc
.fontSize(12)
.fillColor(primary)
.text(
"OBJET DU DEVIS"
);



doc
.fontSize(11)
.fillColor('black')
.text(
quote.title || ""
);



if(quote.description){


doc.text(
quote.description
);


}



doc.moveDown(2);




// SEPARATION

doc
.moveTo(50,250)
.lineTo(550,250)
.stroke(primary);





// TABLEAU

let y = 280;



doc
.fontSize(11)
.fillColor(primary)
.text(
"DESCRIPTION",
50,
y
);



doc.text(
"QTE",
300,
y
);



doc.text(
"PRIX",
380,
y
);



doc.text(
"TOTAL",
470,
y
);



y += 25;



doc.fillColor('black');



quote.quoteItems?.forEach(
(item)=>{


doc.text(
item.description,
50,
y
);



doc.text(
String(item.quantity),
300,
y
);



doc.text(
`${item.unitPrice.toFixed(2)} €`,
380,
y
);



doc.text(
`${item.total.toFixed(2)} €`,
470,
y
);



y += 25;


}

);





// TOTALS TVA

// TOTALS TVA

doc.moveDown(3);


doc
.fontSize(12)
.fillColor('black')
.text(
`Total HT : ${(quote.amountHT || 0).toFixed(2)} €`,
{
align:"right"
}
);


doc.text(
`TVA ${quote.tva || 0}% : ${(quote.amountTVA || 0).toFixed(2)} €`,
{
align:"right"
}
);


doc.moveDown();


doc
.fontSize(16)
.fillColor(primary)
.text(
`TOTAL TTC : ${quote.amount.toFixed(2)} €`,
{
align:"right"
}
);



doc
.moveDown();


doc
.fontSize(16)
.fillColor(primary)
.text(
`TOTAL TTC : ${quote.amount.toFixed(2)} €`,
{
align:"right"
}
);



// CONDITIONS

doc.moveDown(2);


doc
.fontSize(10)
.fillColor('black')
.text(
"Ce devis est valable pendant 30 jours à compter de sa date d'émission."
);



doc.moveDown();



doc.text(
"Bon pour accord : __________________________"
);




// FOOTER


doc
.fontSize(10)
.fillColor('black')
.text(
"Merci pour votre confiance.",
50,
750,
{
align:"center"
}
);



doc.end();


return doc;


}

}