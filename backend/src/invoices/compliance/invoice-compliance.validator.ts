import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceItem, Client, Company } from '@prisma/client';

import {
  ComplianceIssue,
  InvoiceComplianceResult,
} from './invoice-compliance.types';

import { COMPLIANCE_CODES } from './invoice-compliance.constants';

type InvoiceWithRelations = Invoice & {
  invoiceItems: InvoiceItem[];
  client: Client;
  user: {
    company: Company | null;
  };
};

@Injectable()
export class InvoiceComplianceValidator {
  /**
   * Validation complète d'une facture avant génération
   * d'un document électronique.
   *
   * IMPORTANT :
   * Ce service vérifie la cohérence des données de Facturco.
   * Il ne constitue pas à lui seul une certification
   * réglementaire de conformité.
   */
  validate(invoice: InvoiceWithRelations): InvoiceComplianceResult {
    const errors: ComplianceIssue[] = [];
    const warnings: ComplianceIssue[] = [];

    this.validateCompany(invoice, errors, warnings);
    this.validateClient(invoice, errors, warnings);
    this.validateInvoice(invoice, errors, warnings);
    this.validateItems(invoice, errors, warnings);
    this.validateDeliveryAddress(invoice, errors, warnings);
    this.validateCreditNote(invoice, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Entreprise émettrice
   */
  private validateCompany(
    invoice: InvoiceWithRelations,
    errors: ComplianceIssue[],
    warnings: ComplianceIssue[],
  ): void {
    const company = invoice.user?.company;

    if (!company) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_NAME_MISSING,
        field: 'company',
        message: 'Les informations de l’entreprise émettrice sont manquantes.',
        severity: 'ERROR',
      });

      return;
    }

    if (this.isEmpty(company.name)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_NAME_MISSING,
        field: 'company.name',
        message: 'Le nom de l’entreprise émettrice est obligatoire.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.address)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_ADDRESS_MISSING,
        field: 'company.address',
        message: 'L’adresse de l’entreprise émettrice est manquante.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.postalCode)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_POSTAL_CODE_MISSING,
        field: 'company.postalCode',
        message: 'Le code postal de l’entreprise émettrice est manquant.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.city)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_CITY_MISSING,
        field: 'company.city',
        message: 'La ville de l’entreprise émettrice est manquante.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.country)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_COUNTRY_MISSING,
        field: 'company.country',
        message: 'Le pays de l’entreprise émettrice est manquant.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.siren)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_SIREN_MISSING,
        field: 'company.siren',
        message: 'Le SIREN de l’entreprise émettrice est manquant.',
        severity: 'ERROR',
      });
    } else if (!this.isValidSiren(company.siren)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_SIREN_MISSING,
        field: 'company.siren',
        message: 'Le SIREN de l’entreprise émettrice doit contenir 9 chiffres.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.siret)) {
      warnings.push({
        code: COMPLIANCE_CODES.COMPANY_SIRET_MISSING,
        field: 'company.siret',
        message: 'Le SIRET de l’entreprise émettrice est manquant.',
        severity: 'WARNING',
      });
    } else if (!this.isValidSiret(company.siret)) {
      errors.push({
        code: COMPLIANCE_CODES.COMPANY_SIRET_MISSING,
        field: 'company.siret',
        message: 'Le SIRET doit contenir 14 chiffres.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(company.vatNumber)) {
      warnings.push({
        code: COMPLIANCE_CODES.COMPANY_VAT_MISSING,
        field: 'company.vatNumber',
        message: 'Le numéro de TVA intracommunautaire est manquant.',
        severity: 'WARNING',
      });
    }
  }

  /**
   * Client / destinataire
   */
  private validateClient(
    invoice: InvoiceWithRelations,
    errors: ComplianceIssue[],
    warnings: ComplianceIssue[],
  ): void {
    const client = invoice.client;

    if (!client) {
      errors.push({
        code: COMPLIANCE_CODES.CLIENT_NAME_MISSING,
        field: 'client',
        message: 'Le client de la facture est manquant.',
        severity: 'ERROR',
      });

      return;
    }

    if (this.isEmpty(client.name)) {
      errors.push({
        code: COMPLIANCE_CODES.CLIENT_NAME_MISSING,
        field: 'client.name',
        message: 'Le nom du client est obligatoire.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(client.address)) {
      errors.push({
        code: COMPLIANCE_CODES.CLIENT_ADDRESS_MISSING,
        field: 'client.address',
        message: 'L’adresse du client est manquante.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(client.postalCode)) {
      errors.push({
        code: COMPLIANCE_CODES.CLIENT_POSTAL_CODE_MISSING,
        field: 'client.postalCode',
        message: 'Le code postal du client est manquant.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(client.city)) {
      errors.push({
        code: COMPLIANCE_CODES.CLIENT_CITY_MISSING,
        field: 'client.city',
        message: 'La ville du client est manquante.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(client.country)) {
      errors.push({
        code: COMPLIANCE_CODES.CLIENT_COUNTRY_MISSING,
        field: 'client.country',
        message: 'Le pays du client est manquant.',
        severity: 'ERROR',
      });
    }

    /*
     * Pour un client professionnel français,
     * on demande au minimum un identifiant entreprise.
     */
    if (client.type === 'BUSINESS') {
      if (
        this.isEmpty(client.siren) &&
        this.isEmpty(client.siret)
      ) {
        errors.push({
          code: COMPLIANCE_CODES.CLIENT_SIREN_MISSING,
          field: 'client.siren',
          message:
            'Un client professionnel doit disposer d’un identifiant entreprise (SIREN ou SIRET).',
          severity: 'ERROR',
        });
      }

      if (
        client.siren &&
        !this.isValidSiren(client.siren)
      ) {
        errors.push({
          code: COMPLIANCE_CODES.CLIENT_SIREN_MISSING,
          field: 'client.siren',
          message: 'Le SIREN du client doit contenir 9 chiffres.',
          severity: 'ERROR',
        });
      }

      if (
        client.siret &&
        !this.isValidSiret(client.siret)
      ) {
        errors.push({
          code: COMPLIANCE_CODES.CLIENT_SIRET_MISSING,
          field: 'client.siret',
          message: 'Le SIRET du client doit contenir 14 chiffres.',
          severity: 'ERROR',
        });
      }
    }
  }

  /**
   * Données principales de la facture
   */
  private validateInvoice(
    invoice: InvoiceWithRelations,
    errors: ComplianceIssue[],
    warnings: ComplianceIssue[],
  ): void {
    if (this.isEmpty(invoice.number)) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_NUMBER_MISSING,
        field: 'number',
        message: 'Le numéro de facture est obligatoire.',
        severity: 'ERROR',
      });
    }

    if (!invoice.issueDate) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_DATE_MISSING,
        field: 'issueDate',
        message: 'La date d’émission de la facture est obligatoire.',
        severity: 'ERROR',
      });
    }

    if (this.isEmpty(invoice.currency)) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_CURRENCY_MISSING,
        field: 'currency',
        message: 'La devise de la facture est obligatoire.',
        severity: 'ERROR',
      });
    }

    if (!this.isValidAmount(invoice.amount)) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_AMOUNT_INVALID,
        field: 'amount',
        message: 'Le montant total de la facture est invalide.',
        severity: 'ERROR',
      });
    }

    if (!this.isValidAmount(invoice.subtotal)) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_SUBTOTAL_INVALID,
        field: 'subtotal',
        message: 'Le sous-total de la facture est invalide.',
        severity: 'ERROR',
      });
    }

    if (!this.isValidAmount(invoice.vatAmount)) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_VAT_AMOUNT_INVALID,
        field: 'vatAmount',
        message: 'Le montant de TVA est invalide.',
        severity: 'ERROR',
      });
    }

    /*
     * La devise EUR est attendue pour les factures
     * françaises classiques de Facturco.
     */
    if (invoice.currency !== 'EUR') {
      warnings.push({
        code: COMPLIANCE_CODES.COUNTRY_WARNING,
        field: 'currency',
        message:
          'La facture utilise une devise différente de EUR. Vérifiez les règles applicables avant transmission.',
        severity: 'WARNING',
      });
    }
  }

  /**
   * Lignes de facture
   */
  private validateItems(
    invoice: InvoiceWithRelations,
    errors: ComplianceIssue[],
    warnings: ComplianceIssue[],
  ): void {
    if (!invoice.invoiceItems || invoice.invoiceItems.length === 0) {
      errors.push({
        code: COMPLIANCE_CODES.INVOICE_ITEMS_MISSING,
        field: 'invoiceItems',
        message: 'La facture doit contenir au moins une ligne.',
        severity: 'ERROR',
      });

      return;
    }

    invoice.invoiceItems.forEach((item, index) => {
      const prefix = `invoiceItems[${index}]`;

      if (this.isEmpty(item.description)) {
        errors.push({
          code: COMPLIANCE_CODES.ITEM_DESCRIPTION_MISSING,
          field: `${prefix}.description`,
          message: `La description de la ligne ${index + 1} est obligatoire.`,
          severity: 'ERROR',
        });
      }

      if (!this.isPositiveNumber(item.quantity)) {
        errors.push({
          code: COMPLIANCE_CODES.ITEM_QUANTITY_INVALID,
          field: `${prefix}.quantity`,
          message: `La quantité de la ligne ${index + 1} doit être supérieure à 0.`,
          severity: 'ERROR',
        });
      }

      if (!this.isValidAmount(item.unitPrice)) {
        errors.push({
          code: COMPLIANCE_CODES.ITEM_UNIT_PRICE_INVALID,
          field: `${prefix}.unitPrice`,
          message: `Le prix unitaire de la ligne ${index + 1} est invalide.`,
          severity: 'ERROR',
        });
      }

      if (!this.isValidAmount(item.total)) {
        errors.push({
          code: COMPLIANCE_CODES.ITEM_TOTAL_INVALID,
          field: `${prefix}.total`,
          message: `Le total de la ligne ${index + 1} est invalide.`,
          severity: 'ERROR',
        });
      }

      if (
        !this.isValidVatRate(item.vatRate)
      ) {
        errors.push({
          code: COMPLIANCE_CODES.ITEM_VAT_RATE_INVALID,
          field: `${prefix}.vatRate`,
          message: `Le taux de TVA de la ligne ${index + 1} est invalide.`,
          severity: 'ERROR',
        });
      }
    });
  }

  /**
   * Adresse de livraison.
   *
   * Si une adresse de livraison est commencée,
   * on vérifie qu'elle est complète.
   */
  private validateDeliveryAddress(
    invoice: InvoiceWithRelations,
    errors: ComplianceIssue[],
    warnings: ComplianceIssue[],
  ): void {
    const hasDeliveryAddress =
      !this.isEmpty(invoice.deliveryAddress) ||
      !this.isEmpty(invoice.deliveryPostalCode) ||
      !this.isEmpty(invoice.deliveryCity) ||
      !this.isEmpty(invoice.deliveryCountry);

    if (!hasDeliveryAddress) {
      return;
    }

    const complete =
      !this.isEmpty(invoice.deliveryAddress) &&
      !this.isEmpty(invoice.deliveryPostalCode) &&
      !this.isEmpty(invoice.deliveryCity) &&
      !this.isEmpty(invoice.deliveryCountry);

    if (!complete) {
      errors.push({
        code: COMPLIANCE_CODES.DELIVERY_ADDRESS_INCOMPLETE,
        field: 'deliveryAddress',
        message:
          'L’adresse de livraison doit être complète lorsqu’elle est renseignée.',
        severity: 'ERROR',
      });
    }
  }

  /**
   * Vérification des avoirs / notes de débit.
   */
  private validateCreditNote(
    invoice: InvoiceWithRelations,
    errors: ComplianceIssue[],
    warnings: ComplianceIssue[],
  ): void {
    const requiresPrecedingInvoice =
      invoice.invoiceType === 'CREDIT_NOTE' ||
      invoice.invoiceType === 'DEBIT_NOTE';

    if (
      requiresPrecedingInvoice &&
      this.isEmpty(invoice.precedingInvoiceNumber)
    ) {
      errors.push({
        code: COMPLIANCE_CODES.PRECEDING_INVOICE_MISSING,
        field: 'precedingInvoiceNumber',
        message:
          'Une facture rectificative doit référencer la facture précédente.',
        severity: 'ERROR',
      });
    }
  }

  /**
   * SIREN : 9 chiffres
   */
  private isValidSiren(value?: string | null): boolean {
    if (!value) {
      return false;
    }

    const normalized = value.replace(/\s/g, '');

    return /^\d{9}$/.test(normalized);
  }

  /**
   * SIRET : 14 chiffres
   */
  private isValidSiret(value?: string | null): boolean {
    if (!value) {
      return false;
    }

    const normalized = value.replace(/\s/g, '');

    return /^\d{14}$/.test(normalized);
  }

  /**
   * Montant numérique >= 0
   */
  private isValidAmount(value: number): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0
    );
  }

  /**
   * Quantité strictement positive
   */
  private isPositiveNumber(value: number): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value > 0
    );
  }

  /**
   * TVA entre 0 et 100
   */
  private isValidVatRate(value: number): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 100
    );
  }

  /**
   * Vérification chaîne vide.
   */
  private isEmpty(value?: string | null): boolean {
    return !value || value.trim().length === 0;
  }
}