export type InvoiceStatus = 'issued';

export interface InvoiceFilters {
  subscriptionId?: string;
  customerReference?: string;
  status?: InvoiceStatus;
  limit: number;
  offset: number;
}

export interface GenerateInvoiceItem {
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
}

export interface GenerateInvoiceData {
  invoiceNumber: string;
  subscriptionId: string;
  customerReference: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  issueDate: string;
  currency: string;
  subtotal: string;
  taxTotal: string;
  discountTotal: string;
  total: string;
  idempotencyKey: string;
  generatedByRunId: string;
  items: GenerateInvoiceItem[];
}