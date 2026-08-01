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

    return number.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €';
  }

  private date(value: any): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('fr-FR');
  }

  private drawLine(
    doc: PDFKit.PDFDocument,
    y: number,
    color = '#e5e7eb',
  ) {
    doc
      .strokeColor(color)
      .lineWidth(0.7)
      .moveTo(50, y)
      .lineTo(545, y)
      .stroke();
  }

  private drawFooter(
    doc: PDFKit.PDFDocument,
    company: any,
  ) {
    const pageHeight = doc.page.height;

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#6b7280')
      .text(
        [
          company?.name || '',
          company?.siret
            ? `SIRET : ${company.siret}`
            : '',
          company?.vatNumber
            ? `TVA : ${company.vatNumber}`
            : '',
        ]
          .filter(Boolean)
          .join(' • '),
        50,
        pageHeight - 55,
        {
          width: 495,
          align: 'center',
        },
      );

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        'Merci pour votre confiance.',
        50,
        pageHeight - 35,
        {
          width: 495,
          align: 'center',
        },
      );
  }

  private addLogo(
    doc: PDFKit.PDFDocument,
    company: any,
  ) {
    if (!company?.logo) {
      return;
    }

    try {
      const logoPath = path.join(
        process.cwd(),
        company.logo.replace(/^\/+/, ''),
      );

      if (fs.existsSync(logoPath)) {
        doc.image(
          logoPath,
          50,
          45,
          {
            fit: [80, 80],
          },
        );
      }
    } catch (error) {
      console.log(
        'Erreur logo PDF :',
        error,
      );
    }
  }

  // ============================================================
  // EN-TÊTE TABLEAU
  // ============================================================

  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    y: number,
    primary: string,
  ): number {

    const tableX = 50;
    const tableWidth = 495;
    const headerHeight = 28;

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
      .fontSize(9)
      .fillColor('white');

    doc.text(
      'DESCRIPTION',
      60,
      y + 9,
      {
        width: 225,
      },
    );

    doc.text(
      'QTÉ',
      290,
      y + 9,
      {
        width: 45,
        align: 'center',
      },
    );

    doc.text(
      'PRIX HT',
      350,
      y + 9,
      {
        width: 75,
        align: 'right',
      },
    );

    doc.text(
      'TOTAL HT',
      455,
      y + 9,
      {
        width: 80,
        align: 'right',
      },
    );

    return y + headerHeight + 10;
  }

  // ============================================================
  // FACTURE
  // ============================================================

  async generateInvoicePdf(invoice: any) {

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      info: {
        Title: `Facture ${invoice.number || ''}`,
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

    this.addLogo(
      doc,
      company,
    );

    const companyX =
      company?.logo ? 150 : 50;

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor(primary)
      .text(
        company?.name ||
          'Entreprise',
        companyX,
        50,
        {
          width: 240,
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
      company?.email
        ? company.email
        : '',
      company?.siret
        ? `SIRET : ${company.siret}`
        : '',
      company?.vatNumber
        ? `TVA intracommunautaire : ${company.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(dark)
      .text(
        companyDetails,
        companyX,
        78,
        {
          width: 250,
          lineGap: 2,
        },
      );

    // ==========================================================
    // BLOC FACTURE
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor(primary)
      .text(
        'FACTURE',
        350,
        50,
        {
          width: 195,
          align: 'right',
        },
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(dark)
      .text(
        invoice.number || '',
        350,
        84,
        {
          width: 195,
          align: 'right',
        },
      );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(gray)
      .text(
        `Date d'émission : ${this.date(
          invoice.invoiceDate ||
          invoice.createdAt,
        )}`,
        350,
        103,
        {
          width: 195,
          align: 'right',
        },
      );

    if (invoice.dueDate) {
      doc.text(
        `Date d'échéance : ${this.date(
          invoice.dueDate,
        )}`,
        350,
        118,
        {
          width: 195,
          align: 'right',
        },
      );
    }

    // ==========================================================
    // SÉPARATION
    // ==========================================================

    this.drawLine(
      doc,
      150,
      primary,
    );

    // ==========================================================
    // CLIENT
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(primary)
      .text(
        'FACTURÉ À',
        50,
        175,
      );

    const clientDetails = [
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
        ? `TVA intracommunautaire : ${client.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(dark)
      .text(
        clientDetails,
        50,
        195,
        {
          width: 250,
          lineGap: 3,
        },
      );

    // ==========================================================
    // TABLEAU
    // ==========================================================

    let y = 285;

    y = this.drawTableHeader(
      doc,
      y,
      primary,
    );

    const tableX = 50;
    const tableWidth = 495;

    const items =
      invoice.invoiceItems || [];

    items.forEach(
      (item: any, index: number) => {

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
            quantity * unitPrice,
          );

        // IMPORTANT :
        // fontSize n'est PAS mis dans heightOfString().
        // On définit d'abord la police et sa taille.

        doc
          .font('Helvetica')
          .fontSize(9);

        const descriptionHeight =
          doc.heightOfString(
            description,
            {
              width: 220,
              lineGap: 3,
            },
          );

        const rowHeight =
          Math.max(
            28,
            descriptionHeight + 12,
          );

        // ======================================================
        // NOUVELLE PAGE
        // ======================================================

        if (
          y + rowHeight > 700
        ) {
          doc.addPage();

          y = 60;

          y = this.drawTableHeader(
            doc,
            y,
            primary,
          );
        }

        // ======================================================
        // FOND ALTERNÉ
        // ======================================================

        if (index % 2 === 0) {
          doc
            .rect(
              tableX,
              y - 5,
              tableWidth,
              rowHeight,
            )
            .fill('#f9fafb');
        }

        // ======================================================
        // CONTENU LIGNE
        // ======================================================

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(dark);

        doc.text(
          description,
          60,
          y,
          {
            width: 220,
            lineGap: 3,
          },
        );

        doc.text(
          quantity.toString(),
          290,
          y,
          {
            width: 45,
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
            width: 80,
            align: 'right',
          },
        );

        y += rowHeight;

        this.drawLine(
          doc,
          y - 2,
        );
      },
    );

    // ==========================================================
    // TOTAUX
    // ==========================================================

    y += 25;

    // Si les totaux sont trop bas,
    // on crée une nouvelle page.

    if (y > 650) {
      doc.addPage();
      y = 60;
    }

    const totalsX = 335;
    const totalsWidth = 210;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(dark)
      .text(
        'Total HT',
        totalsX,
        y,
        {
          width: 90,
        },
      );

    doc.text(
      this.money(
        invoice.subtotal,
      ),
      445,
      y,
      {
        width: 100,
        align: 'right',
      },
    );

    y += 20;

    doc.text(
      `TVA ${Number(
        invoice.vatRate || 0,
      )}%`,
      totalsX,
      y,
      {
        width: 90,
      },
    );

    doc.text(
      this.money(
        invoice.vatAmount,
      ),
      445,
      y,
      {
        width: 100,
        align: 'right',
      },
    );

    y += 25;

    doc
      .roundedRect(
        totalsX - 10,
        y - 5,
        totalsWidth + 10,
        38,
        5,
      )
      .fill(primary);

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('white')
      .text(
        'TOTAL TTC',
        totalsX,
        y + 7,
        {
          width: 100,
        },
      );

    doc.text(
      this.money(
        invoice.amount,
      ),
      435,
      y + 7,
      {
        width: 100,
        align: 'right',
      },
    );

    // ==========================================================
    // INFORMATIONS DE PAIEMENT
    // ==========================================================

    y += 65;

    if (y > 650) {
      doc.addPage();
      y = 60;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(primary)
      .text(
        'CONDITIONS DE RÈGLEMENT',
        50,
        y,
      );

    y += 20;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(dark);

    if (invoice.paymentMethod) {

      doc.text(
        `Mode de paiement : ${invoice.paymentMethod}`,
        50,
        y,
        {
          width: 495,
        },
      );

      y += 16;
    }

    if (invoice.dueDate) {

      doc.text(
        `Date limite de paiement : ${this.date(
          invoice.dueDate,
        )}`,
        50,
        y,
        {
          width: 495,
        },
      );

      y += 16;
    }

    if (invoice.paymentTerms) {

      const paymentTerms =
        String(invoice.paymentTerms);

      doc
        .font('Helvetica')
        .fontSize(9);

      const paymentTermsHeight =
        doc.heightOfString(
          paymentTerms,
          {
            width: 495,
            lineGap: 3,
          },
        );

      doc.text(
        paymentTerms,
        50,
        y,
        {
          width: 495,
          lineGap: 3,
        },
      );

      y += paymentTermsHeight + 10;
    }

    // ==========================================================
    // MENTIONS LÉGALES
    // ==========================================================

    y += 12;

    if (y > 680) {
      doc.addPage();
      y = 60;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(primary)
      .text(
        'MENTIONS',
        50,
        y,
      );

    y += 17;

    const legalLines: string[] = [];

    legalLines.push(
      'En cas de retard de paiement, des pénalités de retard sont exigibles conformément à la réglementation en vigueur.',
    );

    legalLines.push(
      'Indemnité forfaitaire pour frais de recouvrement : 40 €.',
    );

    if (
      Number(invoice.vatRate) === 0
    ) {
      legalLines.push(
        'TVA non applicable selon le régime applicable à l’entreprise, si celui-ci le justifie.',
      );
    }

    if (invoice.notes) {
      legalLines.push(
        String(invoice.notes),
      );
    }

    const legalText =
      legalLines.join('\n');

    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(gray);

    const legalHeight =
      doc.heightOfString(
        legalText,
        {
          width: 495,
          lineGap: 4,
        },
      );

    // Si les mentions ne tiennent pas,
    // on les place sur une nouvelle page.

    if (
      y + legalHeight > 700
    ) {
      doc.addPage();
      y = 60;
    }

    doc.text(
      legalText,
      50,
      y,
      {
        width: 495,
        lineGap: 4,
      },
    );

    // ==========================================================
    // FOOTER
    // ==========================================================

    this.drawFooter(
      doc,
      company,
    );

    // ==========================================================
    // NUMÉROS DE PAGE
    // ==========================================================

    const range =
      doc.bufferedPageRange();

    for (
      let i = range.start;
      i < range.start + range.count;
      i++
    ) {

      doc.switchToPage(i);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          `Page ${i + 1 - range.start} / ${range.count}`,
          50,
          doc.page.height - 22,
          {
            width: 495,
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

  async generateQuotePdf(quote: any) {

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
      info: {
        Title: `Devis ${quote.number || ''}`,
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

    this.addLogo(
      doc,
      company,
    );

    const companyX =
      company?.logo ? 150 : 50;

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor(primary)
      .text(
        company?.name ||
          'Entreprise',
        companyX,
        50,
        {
          width: 240,
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
        ? `TVA intracommunautaire : ${company.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(dark)
      .text(
        companyDetails,
        companyX,
        78,
        {
          width: 250,
          lineGap: 2,
        },
      );

    // ==========================================================
    // TITRE
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor(primary)
      .text(
        'DEVIS',
        350,
        50,
        {
          width: 195,
          align: 'right',
        },
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(dark)
      .text(
        quote.number || '',
        350,
        84,
        {
          width: 195,
          align: 'right',
        },
      );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(gray)
      .text(
        `Date d'émission : ${this.date(
          quote.quoteDate ||
          quote.createdAt,
        )}`,
        350,
        103,
        {
          width: 195,
          align: 'right',
        },
      );

    // ==========================================================
    // SÉPARATION
    // ==========================================================

    this.drawLine(
      doc,
      150,
      primary,
    );

    // ==========================================================
    // CLIENT
    // ==========================================================

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(primary)
      .text(
        'CLIENT',
        50,
        175,
      );

    const clientDetails = [
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
        ? `TVA intracommunautaire : ${client.vatNumber}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(dark)
      .text(
        clientDetails,
        50,
        195,
        {
          width: 250,
          lineGap: 3,
        },
      );

    // ==========================================================
    // OBJET DU DEVIS
    // ==========================================================

    let y = 275;

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(primary)
      .text(
        'OBJET DU DEVIS',
        50,
        y,
      );

    y += 20;

    const quoteTitle =
      String(quote.title || '');

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(dark);

    const titleHeight =
      doc.heightOfString(
        quoteTitle,
        {
          width: 495,
        },
      );

    doc.text(
      quoteTitle,
      50,
      y,
      {
        width: 495,
      },
    );

    y += titleHeight + 10;

    // ==========================================================
    // DESCRIPTION DU DEVIS
    // ==========================================================

    if (quote.description) {

      const quoteDescription =
        String(quote.description);

      // IMPORTANT :
      // On définit la police AVANT heightOfString().
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(gray);

      const descriptionHeight =
        doc.heightOfString(
          quoteDescription,
          {
            width: 495,
            lineGap: 3,
          },
        );

      // Vérification pagination
      if (
        y + descriptionHeight > 690
      ) {
        doc.addPage();
        y = 60;
      }

      doc.text(
        quoteDescription,
        50,
        y,
        {
          width: 495,
          lineGap: 3,
        },
      );

      y += descriptionHeight + 15;
    }

    // ==========================================================
    // TABLEAU
    // ==========================================================

    const tableX = 50;
    const tableWidth = 495;

    // Protection si la description est longue
    if (y > 680) {
      doc.addPage();
      y = 60;
    }

    y = this.drawTableHeader(
      doc,
      y,
      primary,
    );

    const items =
      quote.quoteItems || [];

    items.forEach(
      (item: any, index: number) => {

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
            quantity * unitPrice,
          );

        // ======================================================
        // CALCUL HAUTEUR DESCRIPTION
        // ======================================================

        doc
          .font('Helvetica')
          .fontSize(9);

        const descriptionHeight =
          doc.heightOfString(
            description,
            {
              width: 220,
              lineGap: 3,
            },
          );

        const rowHeight =
          Math.max(
            28,
            descriptionHeight + 12,
          );

        // ======================================================
        // NOUVELLE PAGE
        // ======================================================

        if (
          y + rowHeight > 700
        ) {
          doc.addPage();

          y = 60;

          y = this.drawTableHeader(
            doc,
            y,
            primary,
          );
        }

        // ======================================================
        // FOND ALTERNÉ
        // ======================================================

        if (index % 2 === 0) {
          doc
            .rect(
              tableX,
              y - 5,
              tableWidth,
              rowHeight,
            )
            .fill('#f9fafb');
        }

        // ======================================================
        // TEXTE
        // ======================================================

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(dark);

        doc.text(
          description,
          60,
          y,
          {
            width: 220,
            lineGap: 3,
          },
        );

        doc.text(
          quantity.toString(),
          290,
          y,
          {
            width: 45,
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
            width: 80,
            align: 'right',
          },
        );

        y += rowHeight;

        this.drawLine(
          doc,
          y - 2,
        );
      },
    );

    // ==========================================================
    // TOTAUX
    // ==========================================================

    y += 25;

    if (y > 650) {
      doc.addPage();
      y = 60;
    }

    const totalsX = 335;
    const totalsWidth = 210;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(dark)
      .text(
        'Total HT',
        totalsX,
        y,
        {
          width: 90,
        },
      );

    doc.text(
      this.money(
        quote.amountHT,
      ),
      445,
      y,
      {
        width: 100,
        align: 'right',
      },
    );

    y += 20;

    doc.text(
      `TVA ${Number(
        quote.tva || 0,
      )}%`,
      totalsX,
      y,
      {
        width: 90,
      },
    );

    doc.text(
      this.money(
        quote.amountTVA,
      ),
      445,
      y,
      {
        width: 100,
        align: 'right',
      },
    );

    y += 25;

    doc
      .roundedRect(
        totalsX - 10,
        y - 5,
        totalsWidth + 10,
        38,
        5,
      )
      .fill(primary);

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('white')
      .text(
        'TOTAL TTC',
        totalsX,
        y + 7,
        {
          width: 100,
        },
      );

    doc.text(
      this.money(
        quote.amount,
      ),
      435,
      y + 7,
      {
        width: 100,
        align: 'right',
      },
    );

    // ==========================================================
    // CONDITIONS DU DEVIS
    // ==========================================================

    y += 65;

    if (y > 650) {
      doc.addPage();
      y = 60;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(primary)
      .text(
        'CONDITIONS',
        50,
        y,
      );

    y += 20;

    const conditionsText =
      'Ce devis est valable pendant 30 jours à compter de sa date d’émission.';

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(dark);

    const conditionsHeight =
      doc.heightOfString(
        conditionsText,
        {
          width: 495,
        },
      );

    doc.text(
      conditionsText,
      50,
      y,
      {
        width: 495,
      },
    );

    y += conditionsHeight + 20;

    doc.text(
      'Bon pour accord :',
      50,
      y,
    );

    y += 35;

    doc
      .strokeColor('#9ca3af')
      .lineWidth(0.7)
      .moveTo(50, y)
      .lineTo(280, y)
      .stroke();

    // ==========================================================
    // FOOTER
    // ==========================================================

    this.drawFooter(
      doc,
      company,
    );

    // ==========================================================
    // NUMÉROS DE PAGE
    // ==========================================================

    const range =
      doc.bufferedPageRange();

    for (
      let i = range.start;
      i < range.start + range.count;
      i++
    ) {

      doc.switchToPage(i);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          `Page ${i + 1 - range.start} / ${range.count}`,
          50,
          doc.page.height - 22,
          {
            width: 495,
            align: 'right',
          },
        );
    }

    doc.end();

    return doc;
  }
}