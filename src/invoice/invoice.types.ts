export type InvoiceStatus = 'issued';

export interface InvoiceFilters {
  subscriptionId?: string;
  customerReference?: string;
  status?: InvoiceStatus;
  limit: number;
  offset: number;
}