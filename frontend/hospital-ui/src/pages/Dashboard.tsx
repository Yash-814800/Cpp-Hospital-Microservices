import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { billingService } from '../services/billingService';
import './Dashboard.css';

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalInvoices: number;
  pendingAmount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalInvoices: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patients, doctors, appointments, invoices] = await Promise.all([
        patientService.getAllPatients(),
        doctorService.getAllDoctors(),
        appointmentService.getAllAppointments(),
        billingService.getAllInvoices(),
      ]);

      const pendingAmount = invoices
        .filter(inv => inv.status === 'PENDING' || inv.status === 'PARTIALLY_PAID')
        .reduce((sum, inv) => sum + inv.balanceAmount, 0);

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalAppointments: appointments.length,
        totalInvoices: invoices.length,
        pendingAmount,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Hospital Management System</p>
      </div>

      <div className="stats-grid">
        <Link to="/patients" className="stat-card patients">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </Link>

        <Link to="/doctors" className="stat-card doctors">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>{stats.totalDoctors}</h3>
            <p>Total Doctors</p>
          </div>
        </Link>

        <Link to="/appointments" className="stat-card appointments">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.totalAppointments}</h3>
            <p>Total Appointments</p>
          </div>
        </Link>

        <Link to="/billing" className="stat-card billing">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats.totalInvoices}</h3>
            <p>Total Invoices</p>
          </div>
        </Link>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/patients/new" className="action-button">
            <span>➕</span> Add New Patient
          </Link>
          <Link to="/appointments/new" className="action-button">
            <span>📅</span> Schedule Appointment
          </Link>
          <Link to="/billing/new" className="action-button">
            <span>💵</span> Create Invoice
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
