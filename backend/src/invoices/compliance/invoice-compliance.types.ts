export type ComplianceSeverity = 'ERROR' | 'WARNING';

export interface ComplianceIssue {
  code: string;
  field: string;
  message: string;
  severity: ComplianceSeverity;
}

export interface InvoiceComplianceResult {
  valid: boolean;
  errors: ComplianceIssue[];
  warnings: ComplianceIssue[];
}