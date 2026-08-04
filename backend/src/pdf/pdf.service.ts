
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {

  // ============================================================
  // OUTILS
  // ============================================================

  private money(value: any): string {

    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) {
      return '0,00 €';
    }

    return number
      .toFixed(2)
      .replace('.', ',')
      .replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ' ',
      ) + ' €';
  }


  private date(value: any): string {

    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(
      'fr-FR',
    );
  }


  private drawLine(
    doc: PDFKit.PDFDocument,
    y: number,
    color = '#e5e7eb',
  ) {

    doc
      .strokeColor(color)
      .lineWidth(0.6)
      .moveTo(40, y)
      .lineTo(555, y)
      .stroke();
  }


  private drawFooter(
    doc: PDFKit.PDFDocument,
    company: any,
  ) {

    const pageHeight =
      doc.page.height;

    const footerY =
      pageHeight - 38;

    const companyFooter = [
      company?.name,
      company?.siret
        ? `SIRET : ${company.siret}`
        : '',
      company?.vatNumber
        ? `TVA : ${company.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join(' • ');

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#6b7280')
      .text(
        companyFooter,
        40,
        footerY,
        {
          width: 515,
          align: 'center',
        },
      );

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#9ca3af')
      .text(
        'Merci pour votre confiance.',
        40,
        footerY + 12,
        {
          width: 515,
          align: 'center',
        },
      );
  }


  private addLogo(
    doc: PDFKit.PDFDocument,
    company: any,
  ) {

    if (!company?.logo) {
      return false;
    }

    try {

      const logoPath =
        path.join(
          process.cwd(),
          company.logo.replace(
            /^\/+/,
            '',
          ),
        );

      if (
        fs.existsSync(
          logoPath,
        )
      ) {

        doc.image(
          logoPath,
          40,
          38,
          {
            fit: [75, 55],
          },
        );

        return true;
      }

    } catch (error) {

      console.log(
        'Erreur logo PDF :',
        error,
      );
    }

    return false;
  }


  // ============================================================
  // TABLEAU
  // ============================================================

  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    y: number,
    primary: string,
  ): number {

    const tableX = 40;
    const tableWidth = 515;
    const headerHeight = 24;

    doc
      .roundedRect(
        tableX,
        y,
        tableWidth,
        headerHeight,
        4,
      )
      .fill(primary);

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('white');

    doc.text(
      'DESCRIPTION',
      50,
      y + 8,
      {
        width: 235,
      },
    );

    doc.text(
      'QTÉ',
      300,
      y + 8,
      {
        width: 40,
        align: 'center',
      },
    );

    doc.text(
      'PRIX HT',
      350,
      y + 8,
      {
        width: 75,
        align: 'right',
      },
    );

    doc.text(
      'TOTAL HT',
      455,
      y + 8,
      {
        width: 90,
        align: 'right',
      },
    );

    return y + headerHeight + 5;
  }


  // ============================================================
  // CALCULS DEVIs
  // ============================================================

  private getQuoteSubtotal(
    quote: any,
  ): number {

    return Number(
      quote.subtotal ??
      quote.amountHT ??
      0,
    );
  }


  private getQuoteVatRate(
    quote: any,
  ): number {

    return Number(
      quote.vatRate ??
      quote.tva ??
      0,
    );
  }


  private getQuoteVatAmount(
    quote: any,
  ): number {

    return Number(
      quote.vatAmount ??
      quote.amountTVA ??
      0,
    );
  }


  private getQuoteTotal(
    quote: any,
  ): number {

    return Number(
      quote.amount ??
      0,
    );
  }


  // ============================================================
  // FACTURE
  // ============================================================

  async generateInvoicePdf(
    invoice: any,
  ) {

    const doc =
      new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title:
            `Facture ${invoice.number || ''}`,
          Author:
            invoice.user?.company?.name ||
            'FactureCo',
          Subject: 'Facture',
        },
      });

    const company =
      invoice.user?.company || {};

    const client =
      invoice.client || {};

    const primary =
      '#1e3a8a';

    const dark =
      '#111827';

    const gray =
      '#6b7280';


    // ==========================================================
    // EN-TÊTE
    // ==========================================================

    const hasLogo =
      this.addLogo(
        doc,
        company,
      );

    const companyX =
      hasLogo ? 135 : 40;

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(primary)
      .text(
        company?.name ||
          'Entreprise',
        companyX,
        42,
        {
          width: 230,
        },
      );

    const companyDetails = [
      company?.address,
      company?.postalCode &&
      company?.city
        ? `${company.postalCode} ${company.city}`
        : company?.city,
      company?.phone
        ? `Tél. : ${company.phone}`
        : '',
      company?.email,
      company?.siret
        ? `SIRET : ${company.siret}`
        : '',
      company?.vatNumber
        ? `TVA : ${company.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(dark)
      .text(
        companyDetails,
        companyX,
        64,
        {
          width: 250,
          lineGap: 1,
        },
      );


    // ==========================================================
    // TITRE FACTURE
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor(primary)
      .text(
        'FACTURE',
        350,
        42,
        {
          width: 205,
          align: 'right',
        },
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(dark)
      .text(
        invoice.number || '',
        350,
        70,
        {
          width: 205,
          align: 'right',
        },
      );

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(gray)
      .text(
        `Date : ${this.date(
          invoice.invoiceDate ||
          invoice.createdAt,
        )}`,
        350,
        85,
        {
          width: 205,
          align: 'right',
        },
      );


    // ==========================================================
    // LIGNE
    // ==========================================================

    this.drawLine(
      doc,
      115,
      primary,
    );


    // ==========================================================
    // CLIENT
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(primary)
      .text(
        'FACTURÉ À',
        40,
        130,
      );

    const clientDetails = [
      client?.company,
      client?.name,
      client?.address,
      client?.postalCode &&
      client?.city
        ? `${client.postalCode} ${client.city}`
        : client?.city,
      client?.email,
      client?.phone
        ? `Tél. : ${client.phone}`
        : '',
      client?.siret
        ? `SIRET : ${client.siret}`
        : '',
      client?.vatNumber
        ? `TVA : ${client.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(dark)
      .text(
        clientDetails,
        40,
        147,
        {
          width: 250,
          lineGap: 1,
        },
      );


    // ==========================================================
    // TABLEAU
    // ==========================================================

    let y = 235;

    y =
      this.drawTableHeader(
        doc,
        y,
        primary,
      );

    const items =
      invoice.invoiceItems ||
      [];

    items.forEach(
      (
        item: any,
        index: number,
      ) => {

        const description =
          String(
            item.description || '',
          );

        const quantity =
          Number(
            item.quantity || 0,
          );

        const unitPrice =
          Number(
            item.unitPrice || 0,
          );

        const total =
          Number(
            item.total ??
            quantity *
            unitPrice,
          );

        doc
          .font('Helvetica')
          .fontSize(8);

        const descriptionHeight =
          doc.heightOfString(
            description,
            {
              width: 235,
              lineGap: 1,
            },
          );

        const rowHeight =
          Math.max(
            21,
            descriptionHeight + 7,
          );


        if (
          y + rowHeight >
          685
        ) {

          doc.addPage();

          y = 45;

          y =
            this.drawTableHeader(
              doc,
              y,
              primary,
            );
        }


        if (
          index % 2 === 0
        ) {

          doc
            .rect(
              40,
              y - 3,
              515,
              rowHeight,
            )
            .fill('#f9fafb');
        }


        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(dark);

        doc.text(
          description,
          50,
          y,
          {
            width: 235,
            lineGap: 1,
          },
        );

        doc.text(
          quantity.toString(),
          300,
          y,
          {
            width: 40,
            align: 'center',
          },
        );

        doc.text(
          this.money(unitPrice),
          350,
          y,
          {
            width: 75,
            align: 'right',
          },
        );

        doc.text(
          this.money(total),
          455,
          y,
          {
            width: 90,
            align: 'right',
          },
        );

        y += rowHeight;

        this.drawLine(
          doc,
          y - 1,
        );
      },
    );


    // ==========================================================
    // TOTAUX
    // ==========================================================

    y += 10;

    if (
      y + 100 >
      700
    ) {

      doc.addPage();

      y = 45;
    }

    const totalsX = 350;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(dark)
      .text(
        'Total HT',
        totalsX,
        y,
        {
          width: 80,
        },
      );

    doc.text(
      this.money(
        invoice.subtotal,
      ),
      445,
      y,
      {
        width: 110,
        align: 'right',
      },
    );

    y += 17;

    doc.text(
      `TVA ${Number(
        invoice.vatRate || 0,
      )}%`,
      totalsX,
      y,
      {
        width: 80,
      },
    );

    doc.text(
      this.money(
        invoice.vatAmount,
      ),
      445,
      y,
      {
        width: 110,
        align: 'right',
      },
    );

    y += 22;

    doc
      .roundedRect(
        totalsX - 8,
        y - 4,
        213,
        32,
        5,
      )
      .fill(primary);

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('white')
      .text(
        'TOTAL TTC',
        totalsX,
        y + 6,
        {
          width: 90,
        },
      );

    doc.text(
      this.money(
        invoice.amount,
      ),
      440,
      y + 6,
      {
        width: 110,
        align: 'right',
      },
    );


    // ==========================================================
    // CONDITIONS FACTURE
    // ==========================================================

    y += 45;

    if (
      y + 80 >
      700
    ) {

      doc.addPage();

      y = 45;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(primary)
      .text(
        'CONDITIONS DE RÈGLEMENT',
        40,
        y,
      );

    y += 15;

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(dark);

    if (
      invoice.paymentMethod
    ) {

      doc.text(
        `Mode de paiement : ${invoice.paymentMethod}`,
        40,
        y,
        {
          width: 515,
        },
      );

      y += 14;
    }

    if (
      invoice.dueDate
    ) {

      doc.text(
        `Date limite : ${this.date(
          invoice.dueDate,
        )}`,
        40,
        y,
        {
          width: 515,
        },
      );

      y += 14;
    }

    if (
      invoice.paymentTerms
    ) {

      doc.text(
        String(
          invoice.paymentTerms,
        ),
        40,
        y,
        {
          width: 515,
          lineGap: 1,
        },
      );
    }


    // ==========================================================
    // MENTIONS
    // ==========================================================

    y += 25;

    if (
      y + 70 >
      700
    ) {

      doc.addPage();

      y = 45;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(primary)
      .text(
        'MENTIONS',
        40,
        y,
      );

    y += 14;

    const legalLines = [
      'En cas de retard de paiement, des pénalités de retard sont exigibles conformément à la réglementation en vigueur.',
      'Indemnité forfaitaire pour frais de recouvrement : 40 €.',
    ];

    if (
      Number(
        invoice.vatRate,
      ) === 0
    ) {

      legalLines.push(
        'TVA non applicable selon le régime applicable à l’entreprise, si celui-ci le justifie.',
      );
    }

    if (
      invoice.notes
    ) {

      legalLines.push(
        String(
          invoice.notes,
        ),
      );
    }

    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(gray)
      .text(
        legalLines.join('\n'),
        40,
        y,
        {
          width: 515,
          lineGap: 1,
        },
      );


    // ==========================================================
    // FOOTER + NUMÉROS
    // ==========================================================

    const range =
      doc.bufferedPageRange();

    for (
      let i = range.start;
      i <
      range.start +
      range.count;
      i++
    ) {

      doc.switchToPage(i);

      this.drawFooter(
        doc,
        company,
      );

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#9ca3af')
        .text(
          `Page ${
            i + 1 - range.start
          } / ${range.count}`,
          40,
          doc.page.height - 18,
          {
            width: 515,
            align: 'right',
          },
        );
    }

    doc.end();

    return doc;
  }


  // ============================================================
  // DEVIS
  // ============================================================

  async generateQuotePdf(
    quote: any,
  ) {

    const doc =
      new PDFDocument({
        size: 'A4',

        // IMPORTANT :
        // Marges réduites pour maximiser
        // la zone disponible.
        margin: 40,

        bufferPages: true,

        info: {
          Title:
            `Devis ${quote.number || ''}`,

          Author:
            quote.user?.company?.name ||
            'FactureCo',

          Subject: 'Devis',
        },
      });


    const company =
      quote.user?.company || {};

    const client =
      quote.client || {};

    const primary =
      '#1e3a8a';

    const dark =
      '#111827';

    const gray =
      '#6b7280';


    // ==========================================================
    // EN-TÊTE
    // ==========================================================

    const hasLogo =
      this.addLogo(
        doc,
        company,
      );

    const companyX =
      hasLogo ? 135 : 40;


    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(primary)
      .text(
        company?.name ||
          'Entreprise',
        companyX,
        42,
        {
          width: 230,
        },
      );


    const companyDetails = [
      company?.address,

      company?.postalCode &&
      company?.city
        ? `${company.postalCode} ${company.city}`
        : company?.city,

      company?.phone
        ? `Tél. : ${company.phone}`
        : '',

      company?.email || '',

      company?.siret
        ? `SIRET : ${company.siret}`
        : '',

      company?.vatNumber
        ? `TVA : ${company.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');


    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(dark)
      .text(
        companyDetails,
        companyX,
        64,
        {
          width: 250,
          lineGap: 1,
        },
      );


    // ==========================================================
    // TITRE DEVIS
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(25)
      .fillColor(primary)
      .text(
        'DEVIS',
        350,
        42,
        {
          width: 205,
          align: 'right',
        },
      );


    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(dark)
      .text(
        quote.number || '',
        350,
        71,
        {
          width: 205,
          align: 'right',
        },
      );


    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(gray)
      .text(
        `Date : ${this.date(
          quote.quoteDate ||
          quote.createdAt,
        )}`,
        350,
        86,
        {
          width: 205,
          align: 'right',
        },
      );


    // ==========================================================
    // LIGNE
    // ==========================================================

    this.drawLine(
      doc,
      115,
      primary,
    );


    // ==========================================================
    // CLIENT
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(primary)
      .text(
        'CLIENT',
        40,
        130,
      );


    const clientDetails = [
      client?.company,

      client?.name,

      client?.address,

      client?.postalCode &&
      client?.city
        ? `${client.postalCode} ${client.city}`
        : client?.city,

      client?.email,

      client?.phone
        ? `Tél. : ${client.phone}`
        : '',

      client?.siret
        ? `SIRET : ${client.siret}`
        : '',

      client?.vatNumber
        ? `TVA : ${client.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');


    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(dark)
      .text(
        clientDetails,
        40,
        147,
        {
          width: 250,
          lineGap: 1,
        },
      );


    // ==========================================================
    // OBJET
    // ==========================================================

    let y = 215;


    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(primary)
      .text(
        'OBJET DU DEVIS',
        40,
        y,
      );


    y += 15;


    const quoteTitle =
      String(
        quote.title || '',
      );


    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(dark);


    const titleHeight =
      doc.heightOfString(
        quoteTitle,
        {
          width: 515,
          lineGap: 1,
        },
      );


    doc.text(
      quoteTitle,
      40,
      y,
      {
        width: 515,
        lineGap: 1,
      },
    );


    y +=
      titleHeight + 4;


    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    if (
      quote.description
    ) {

      const description =
        String(
          quote.description,
        );


      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(gray);


      const descriptionHeight =
        doc.heightOfString(
          description,
          {
            width: 515,
            lineGap: 1,
          },
        );


      // La description ne doit pas
      // déclencher automatiquement
      // une page.
      doc.text(
        description,
        40,
        y,
        {
          width: 515,
          lineGap: 1,
        },
      );


      y +=
        descriptionHeight + 7;
    }


    // ==========================================================
    // TABLEAU
    // ==========================================================

    // On réserve suffisamment de place
    // mais on ne crée PAS de page
    // artificiellement.

    if (
      y < 245
    ) {
      y = 245;
    }


    y =
      this.drawTableHeader(
        doc,
        y,
        primary,
      );


    const items =
      quote.quoteItems ||
      quote.items ||
      [];


    // ==========================================================
    // LIGNES
    // ==========================================================

    items.forEach(
      (
        item: any,
        index: number,
      ) => {

        const description =
          String(
            item.description || '',
          );


        const quantity =
          Number(
            item.quantity || 0,
          );


        const unitPrice =
          Number(
            item.unitPrice || 0,
          );


        const total =
          Number(
            item.total ??
            quantity *
            unitPrice,
          );


        doc
          .font('Helvetica')
          .fontSize(8);


        const descriptionHeight =
          doc.heightOfString(
            description,
            {
              width: 235,
              lineGap: 1,
            },
          );


        const rowHeight =
          Math.max(
            21,
            descriptionHeight + 7,
          );


        // ------------------------------------------------------
        // NOUVELLE PAGE SEULEMENT SI LE TABLEAU DÉBORDE
        // ------------------------------------------------------

        if (
          y + rowHeight >
          685
        ) {

          doc.addPage();

          y = 45;

          y =
            this.drawTableHeader(
              doc,
              y,
              primary,
            );
        }


        // ------------------------------------------------------
        // ALTERNANCE
        // ------------------------------------------------------

        if (
          index % 2 === 0
        ) {

          doc
            .rect(
              40,
              y - 3,
              515,
              rowHeight,
            )
            .fill('#f9fafb');
        }


        // ------------------------------------------------------
        // DESCRIPTION
        // ------------------------------------------------------

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(dark);


        doc.text(
          description,
          50,
          y,
          {
            width: 235,
            lineGap: 1,
          },
        );


        // ------------------------------------------------------
        // QUANTITÉ
        // ------------------------------------------------------

        doc.text(
          quantity.toString(),
          300,
          y,
          {
            width: 40,
            align: 'center',
          },
        );


        // ------------------------------------------------------
        // PRIX
        // ------------------------------------------------------

        doc.text(
          this.money(
            unitPrice,
          ),
          350,
          y,
          {
            width: 75,
            align: 'right',
          },
        );


        // ------------------------------------------------------
        // TOTAL
        // ------------------------------------------------------

        doc.text(
          this.money(
            total,
          ),
          455,
          y,
          {
            width: 90,
            align: 'right',
          },
        );


        y +=
          rowHeight;


        this.drawLine(
          doc,
          y - 1,
        );
      },
    );


    // ==========================================================
    // TOTAUX
    // ==========================================================

    y += 10;


    // Si le tableau arrive trop bas,
    // on garde les totaux ensemble.

    if (
      y + 95 >
      700
    ) {

      doc.addPage();

      y = 45;
    }


    const totalsX =
      350;


    const subtotal =
      this.getQuoteSubtotal(
        quote,
      );


    const vatRate =
      this.getQuoteVatRate(
        quote,
      );


    const vatAmount =
      this.getQuoteVatAmount(
        quote,
      );


    const total =
      this.getQuoteTotal(
        quote,
      );


    // ----------------------------------------------------------
    // HT
    // ----------------------------------------------------------

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(dark)
      .text(
        'Total HT',
        totalsX,
        y,
        {
          width: 80,
        },
      );


    doc.text(
      this.money(
        subtotal,
      ),
      445,
      y,
      {
        width: 110,
        align: 'right',
      },
    );


    y += 17;


    // ----------------------------------------------------------
    // TVA
    // ----------------------------------------------------------

    doc.text(
      `TVA ${vatRate}%`,
      totalsX,
      y,
      {
        width: 80,
      },
    );


    doc.text(
      this.money(
        vatAmount,
      ),
      445,
      y,
      {
        width: 110,
        align: 'right',
      },
    );


    y += 21;


    // ----------------------------------------------------------
    // TTC
    // ----------------------------------------------------------

    doc
      .roundedRect(
        totalsX - 8,
        y - 4,
        213,
        32,
        5,
      )
      .fill(primary);


    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('white')
      .text(
        'TOTAL TTC',
        totalsX,
        y + 6,
        {
          width: 90,
        },
      );


    doc.text(
      this.money(
        total,
      ),
      440,
      y + 6,
      {
        width: 110,
        align: 'right',
      },
    );


    // ==========================================================
    // CONDITIONS
    // ==========================================================

    y += 43;


    if (
      y + 90 >
      700
    ) {

      doc.addPage();

      y = 45;
    }


    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(primary)
      .text(
        'CONDITIONS',
        40,
        y,
      );


    y += 15;


    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(dark);


    const conditionsText =
      'Ce devis est valable pendant 30 jours à compter de sa date d’émission.';


    doc.text(
      conditionsText,
      40,
      y,
      {
        width: 515,
      },
    );


    y += 17;


    doc.text(
      'Bon pour accord :',
      40,
      y,
    );


    y += 24;


    doc
      .strokeColor('#9ca3af')
      .lineWidth(0.7)
      .moveTo(
        40,
        y,
      )
      .lineTo(
        230,
        y,
      )
      .stroke();


    // ==========================================================
    // FOOTER + NUMÉROS DE PAGE
    // ==========================================================

    const range =
      doc.bufferedPageRange();


    for (
      let i = range.start;
      i <
      range.start +
      range.count;
      i++
    ) {

      doc.switchToPage(i);


      this.drawFooter(
        doc,
        company,
      );


      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#9ca3af')
        .text(
          `Page ${
            i + 1 - range.start
          } / ${range.count}`,
          40,
          doc.page.height - 18,
          {
            width: 515,
            align: 'right',
          },
        );
    }


    // ==========================================================
    // FIN
    // ==========================================================

    doc.end();

    return doc;
  }
}

