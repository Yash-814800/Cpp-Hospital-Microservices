import apiClient from './apiClient';
import { ApiResponse, Invoice, Payment, PaymentMethod } from '../types';

export const billingService = {
  // Get all invoices
  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices');
    return response.data.data;
  },

  // Get invoice by ID
  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data.data;
  },

  // Create invoice
  createInvoice: async (invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', invoice);
    return response.data.data;
  },

  // Update invoice
  updateInvoice: async (id: number, invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await apiClient.put<ApiResponse<Invoice>>(`/invoices/${id}`, invoice);
    return response.data.data;
  },

  // Delete invoice
  deleteInvoice: async (id: number): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },

  // Get invoices by patient
  getInvoicesByPatient: async (patientId: number): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>(
      `/invoices/patient/${patientId}`
    );
    return response.data.data;
  },

  // Get payments for invoice
  getPaymentsByInvoice: async (invoiceId: number): Promise<Payment[]> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      `/invoices/${invoiceId}/payments`
    );
    return response.data.data;
  },

  // Record payment
  recordPayment: async (
    invoiceId: number,
    amount: number,
    paymentMethod: PaymentMethod,
    transactionId?: string,
    notes?: string
  ): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(
      `/invoices/${invoiceId}/payments`,
      {
        amount,
        paymentMethod,
        transactionId,
        notes,
      }
    );
    return response.data.data;
  },
};
