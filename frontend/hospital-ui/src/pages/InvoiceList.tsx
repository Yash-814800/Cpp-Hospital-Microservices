import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../services/billingService';
import { Invoice, PaymentStatus } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';
import '../styles/List.css';

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await billingService.getAllInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
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
        <div className="loading">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Billing Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/billing/new')}>
          Create New Invoice
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by invoice number or patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="results-info">
        Showing {filteredInvoices.length} of {invoices.length} invoices
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.invoiceNumber}</strong>
                  </td>
                  <td>{invoice.patientName || 'N/A'}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td>{formatCurrency(invoice.totalAmount)}</td>
                  <td>{formatCurrency(invoice.paidAmount)}</td>
                  <td>
                    <strong>{formatCurrency(invoice.balanceAmount)}</strong>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/billing/${invoice.id}`)}
                      >
                        View
                      </button>
                      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => navigate(`/billing/${invoice.id}?payment=true`)}
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
