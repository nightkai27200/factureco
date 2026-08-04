import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { InvoiceComplianceValidator } from '../compliance/invoice-compliance.validator';

import {
  ElectronicInvoiceResult,
} from './electronic-invoice.types';

@Injectable()
export class ElectronicInvoiceService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly complianceValidator:
      InvoiceComplianceValidator,
  ) {}

  async generate(
    invoiceId: string,
    userId: string,
  ): Promise<ElectronicInvoiceResult> {
    const invoice =
      await this.prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          userId,
        },

        include: {
          client: true,

          invoiceItems: true,

          user: {
            include: {
              company: true,
            },
          },
        },
      });

    if (!invoice) {
      throw new NotFoundException(
        'Facture introuvable.',
      );
    }

    /*
     * 1. VALIDATION
     */

    const compliance =
      this.complianceValidator.validate(
        invoice,
      );

    if (!compliance.valid) {
      throw new BadRequestException({
        message:
          'La facture ne peut pas être transformée en facture électronique.',

        errors:
          compliance.errors,

        warnings:
          compliance.warnings,
      });
    }

    /*
     * 2. GÉNÉRATION XML
     */

    const xml =
      this.generateFacturXXml(invoice);

    return {
      success: true,

      invoiceId: invoice.id,

      invoiceNumber:
        invoice.number,

      format: 'FACTUR_X',

      xml,

      errors: [],

      warnings:
        compliance.warnings.map(
          (warning) =>
            warning.message,
        ),
    };
  }

  private generateFacturXXml(
    invoice: any,
  ): string {
    const company =
      invoice.user.company;

    const client =
      invoice.client;

    const items =
      invoice.invoiceItems;

    const xmlItems =
      items
        .map(
          (
            item: any,
            index: number,
          ) => `
      <ram:IncludedSupplyChainTradeLineItem>

        <ram:AssociatedDocumentLineDocument>
          <ram:LineID>${index + 1}</ram:LineID>
        </ram:AssociatedDocumentLineDocument>

        <ram:SpecifiedTradeProduct>
          <ram:Name>${this.escapeXml(
            item.description,
          )}</ram:Name>
        </ram:SpecifiedTradeProduct>

        <ram:SpecifiedLineTradeAgreement>
          <ram:NetPriceProductTradePrice>
            <ram:ChargeAmount>${this.money(
              item.unitPrice,
            )}</ram:ChargeAmount>
          </ram:NetPriceProductTradePrice>
        </ram:SpecifiedLineTradeAgreement>

        <ram:SpecifiedLineTradeDelivery>
          <ram:BilledQuantity>${item.quantity}</ram:BilledQuantity>
        </ram:SpecifiedLineTradeDelivery>

        <ram:SpecifiedLineTradeSettlement>

          <ram:ApplicableTradeTax>
            <ram:RateApplicablePercent>${this.money(
              item.vatRate,
            )}</ram:RateApplicablePercent>
          </ram:ApplicableTradeTax>

          <ram:SpecifiedTradeSettlementLineMonetarySummation>
            <ram:LineTotalAmount>${this.money(
              item.total,
            )}</ram:LineTotalAmount>
          </ram:SpecifiedTradeSettlementLineMonetarySummation>

        </ram:SpecifiedLineTradeSettlement>

      </ram:IncludedSupplyChainTradeLineItem>
    `,
        )
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>

<rsm:CrossIndustryInvoice
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">

  <rsm:ExchangedDocumentContext>

    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:factur-x.eu:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>

  </rsm:ExchangedDocumentContext>

  <rsm:ExchangedDocument>

    <ram:ID>${this.escapeXml(
      invoice.number,
    )}</ram:ID>

    <ram:IssueDateTime>
      <udt:DateTimeString format="102">
        ${this.formatDate(
          invoice.issueDate,
        )}
      </udt:DateTimeString>
    </ram:IssueDateTime>

  </rsm:ExchangedDocument>

  <rsm:SupplyChainTradeTransaction>

    ${xmlItems}

    <ram:ApplicableHeaderTradeAgreement>

      <ram:SellerTradeParty>

        <ram:Name>${this.escapeXml(
          company.name,
        )}</ram:Name>

        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">
            ${this.escapeXml(
              company.siren,
            )}
          </ram:ID>
        </ram:SpecifiedLegalOrganization>

        <ram:PostalTradeAddress>
          <ram:PostcodeCode>
            ${this.escapeXml(
              company.postalCode,
            )}
          </ram:PostcodeCode>

          <ram:CityName>
            ${this.escapeXml(
              company.city,
            )}
          </ram:CityName>

          <ram:CountryID>
            ${this.escapeXml(
              company.country,
            )}
          </ram:CountryID>
        </ram:PostalTradeAddress>

        ${
          company.vatNumber
            ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">
            ${this.escapeXml(
              company.vatNumber,
            )}
          </ram:ID>
        </ram:SpecifiedTaxRegistration>
        `
            : ''
        }

      </ram:SellerTradeParty>

      <ram:BuyerTradeParty>

        <ram:Name>${this.escapeXml(
          client.name,
        )}</ram:Name>

        ${
          client.siren
            ? `
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">
            ${this.escapeXml(
              client.siren,
            )}
          </ram:ID>
        </ram:SpecifiedLegalOrganization>
        `
            : ''
        }

        <ram:PostalTradeAddress>

          <ram:PostcodeCode>
            ${this.escapeXml(
              client.postalCode,
            )}
          </ram:PostcodeCode>

          <ram:CityName>
            ${this.escapeXml(
              client.city,
            )}
          </ram:CityName>

          <ram:CountryID>
            ${this.escapeXml(
              client.country,
            )}
          </ram:CountryID>

        </ram:PostalTradeAddress>

      </ram:BuyerTradeParty>

    </ram:ApplicableHeaderTradeAgreement>

    <ram:ApplicableHeaderTradeSettlement>

      <ram:InvoiceCurrencyCode>
        ${this.escapeXml(
          invoice.currency,
        )}
      </ram:InvoiceCurrencyCode>

      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>

        <ram:LineTotalAmount>
          ${this.money(
            invoice.subtotal,
          )}
        </ram:LineTotalAmount>

        <ram:TaxBasisTotalAmount>
          ${this.money(
            invoice.subtotal,
          )}
        </ram:TaxBasisTotalAmount>

        <ram:TaxTotalAmount>
          ${this.money(
            invoice.vatAmount,
          )}
        </ram:TaxTotalAmount>

        <ram:GrandTotalAmount>
          ${this.money(
            invoice.amount,
          )}
        </ram:GrandTotalAmount>

      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>

    </ram:ApplicableHeaderTradeSettlement>

  </rsm:SupplyChainTradeTransaction>

</rsm:CrossIndustryInvoice>`;
  }

  private money(
    value: number,
  ): string {
    return Number(value).toFixed(2);
  }

  private formatDate(
    date: Date,
  ): string {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    return `${year}${month}${day}`;
  }

  private escapeXml(
    value: any,
  ): string {
    return String(value ?? '')
      .replace(
        /&/g,
        '&amp;',
      )
      .replace(
        /</g,
        '&lt;',
      )
      .replace(
        />/g,
        '&gt;',
      )
      .replace(
        /"/g,
        '&quot;',
      )
      .replace(
        /'/g,
        '&apos;',
      );
  }
}