import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { billingService } from '../services/billingService';
import { Invoice } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';
import '../styles/Detail.css';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showPaymentForm = searchParams.get('payment') === 'true';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(showPaymentForm);
  
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'CASH' as const,
    transactionId: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadInvoice(parseInt(id));
    }
  }, [id]);

  const loadInvoice = async (invoiceId: number) => {
    try {
      setLoading(true);
      console.log('Loading invoice with ID:', invoiceId);
      const invoiceData = await billingService.getInvoiceById(invoiceId);
      console.log('Invoice data received:', invoiceData);
      setInvoice(invoiceData);
      setPaymentData({ ...paymentData, amount: invoiceData.balanceAmount });
      setError('');
    } catch (err: any) {
      console.error('Error loading invoice:', err);
      setError(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await billingService.recordPayment(
        parseInt(id),
        paymentData.amount,
        paymentData.paymentMethod,
        paymentData.transactionId,
        paymentData.notes
      );
      setShowPayment(false);
      await loadInvoice(parseInt(id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PAID: 'badge-green',
      PENDING: 'badge-orange',
      PARTIALLY_PAID: 'badge-blue',
      CANCELLED: 'badge-red',
    };
    return colorMap[status] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading invoice details...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Invoice not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/billing')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="detail-header">
        <div>
          <h1>Invoice #{invoice.invoiceNumber}</h1>
          <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
            {invoice.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/billing')}>
            Back to List
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h2>Invoice Information</h2>
          <div className="detail-row">
            <span className="detail-label">Invoice Number:</span>
            <span className="detail-value">{invoice.invoiceNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Patient:</span>
            <span className="detail-value">{invoice.patientName || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Invoice Date:</span>
            <span className="detail-value">{formatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Due Date:</span>
            <span className="detail-value">{formatDate(invoice.dueDate)}</span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Payment Summary</h2>
          <div className="detail-row">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value"><strong>{formatCurrency(invoice.totalAmount)}</strong></span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Paid Amount:</span>
            <span className="detail-value" style={{ color: 'green' }}>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Balance:</span>
            <span className="detail-value" style={{ color: invoice.balanceAmount > 0 ? 'red' : 'green' }}>
              <strong>{formatCurrency(invoice.balanceAmount)}</strong>
            </span>
          </div>
        </div>

        <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
          <h2>Line Items</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td><strong>{formatCurrency(item.totalPrice)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoice.paidAmount > 0 && (
          <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h2>Payment Information</h2>
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{invoice.paymentMethod || 'N/A'}</span>
            </div>
            {invoice.paidAt && (
              <div className="detail-row">
                <span className="detail-label">Paid At:</span>
                <span className="detail-value">{formatDate(invoice.paidAt)}</span>
              </div>
            )}
            {invoice.notes && (
              <div className="detail-row">
                <span className="detail-label">Notes:</span>
                <span className="detail-value">{invoice.notes}</span>
              </div>
            )}
          </div>
        )}

        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && !showPayment && (
          <div className="detail-card">
            <h2>Actions</h2>
            <button
              className="btn btn-success"
              onClick={() => setShowPayment(true)}
            >
              Record Payment
            </button>
          </div>
        )}

        {showPayment && (
          <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h2>Record Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    max={invoice.balanceAmount}
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                    required
                  />
                  <small>Balance: {formatCurrency(invoice.balanceAmount)}</small>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="UPI">UPI</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction ID</label>
                  <input
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows={2}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayment(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
