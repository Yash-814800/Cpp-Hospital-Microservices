import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../services/billingService';
import { patientService } from '../services/patientService';
import { Patient, InvoiceItem } from '../types';
import '../styles/Form.css';

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err: any) {
      setError('Failed to load patients');
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.patientId === 0) {
      setError('Please select a patient');
      return;
    }

    if (items.length === 0 || items.every(item => !item.description)) {
      setError('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      const invoiceData = {
        ...formData,
        items: items.filter(item => item.description),
        totalAmount: getTotalAmount(),
        paidAmount: 0,
        balanceAmount: getTotalAmount(),
        status: 'PENDING' as const,
      };

      await billingService.createInvoice(invoiceData);
      navigate('/billing');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-header">
        <h1>Create New Invoice</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/billing')}>
          Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-section">
          <h2>Invoice Information</h2>
          
          <div className="form-group">
            <label htmlFor="patientId">
              Patient <span className="required">*</span>
            </label>
            <select
              id="patientId"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: parseInt(e.target.value) })}
            >
              <option value="0">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} - {patient.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invoiceDate">Invoice Date</label>
              <input
                type="date"
                id="invoiceDate"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Line Items</h2>
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="invoice-item">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Service or item description"
                  />
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Total</label>
                  <input type="text" value={`$${item.totalPrice.toFixed(2)}`} disabled />
                </div>

                {items.length > 1 && (
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="invoice-total">
            <h3>Total Amount: ${getTotalAmount().toFixed(2)}</h3>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/billing')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
