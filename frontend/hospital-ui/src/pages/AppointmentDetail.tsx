import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import '../styles/Detail.css';

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadAppointment(parseInt(id));
    }
  }, [id]);

  const loadAppointment = async (appointmentId: number) => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(data);
      setNotes(data.notes || '');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      await appointmentService.updateAppointmentStatus(parseInt(id), newStatus);
      await loadAppointment(parseInt(id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: { [key: string]: string } = {
      SCHEDULED: 'badge-blue',
      COMPLETED: 'badge-green',
      CANCELLED: 'badge-red',
      NO_SHOW: 'badge-gray',
    };
    return colorMap[status] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading appointment details...</div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Appointment not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="detail-header">
        <div>
          <h1>Appointment Details</h1>
          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
            {appointment.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
            Back to List
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h2>Appointment Information</h2>
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(appointment.appointmentDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{formatTime(appointment.appointmentTime)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">
              <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                {appointment.status.replace(/_/g, ' ')}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{appointment.reason || '-'}</span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Patient Information</h2>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{appointment.patientName || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Patient ID:</span>
            <span className="detail-value">
              <a href={`/patients/${appointment.patientId}`}>#{appointment.patientId}</a>
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Doctor Information</h2>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{appointment.doctorName || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Specialization:</span>
            <span className="detail-value">
              {appointment.doctorSpecialization?.replace(/_/g, ' ') || 'N/A'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Doctor ID:</span>
            <span className="detail-value">
              <a href={`/doctors/${appointment.doctorId}`}>#{appointment.doctorId}</a>
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Notes</h2>
          <p>{appointment.notes || 'No notes available'}</p>
        </div>

        {appointment.status === 'SCHEDULED' && (
          <div className="detail-card">
            <h2>Actions</h2>
            <div className="action-buttons-vertical">
              <button
                className="btn btn-success"
                onClick={() => handleStatusChange('COMPLETED')}
              >
                Mark as Completed
              </button>
              <button
                className="btn btn-warning"
                onClick={() => handleStatusChange('NO_SHOW')}
              >
                Mark as No Show
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleStatusChange('CANCELLED')}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;
