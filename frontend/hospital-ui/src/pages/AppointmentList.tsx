import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { Appointment, AppointmentStatus } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import '../styles/List.css';

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      setAppointments(data);
      setFilteredAppointments(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (appt) =>
          appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((appt) => appt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentService.updateAppointmentStatus(id, 'CANCELLED');
      await loadAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleCompleteAppointment = async (id: number) => {
    try {
      await appointmentService.updateAppointmentStatus(id, 'COMPLETED');
      await loadAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete appointment');
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
        <div className="loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Appointment Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          Schedule New Appointment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by patient name, doctor name, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      <div className="results-info">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <strong>{formatDate(appointment.appointmentDate)}</strong>
                    <br />
                    <small>{formatTime(appointment.appointmentTime)}</small>
                  </td>
                  <td>{appointment.patientName || 'N/A'}</td>
                  <td>{appointment.doctorName || 'N/A'}</td>
                  <td>{appointment.doctorSpecialization?.replace(/_/g, ' ') || 'N/A'}</td>
                  <td>{appointment.reason || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                      >
                        View
                      </button>
                      {appointment.status === 'SCHEDULED' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => appointment.id && handleCompleteAppointment(appointment.id)}
                          >
                            Complete
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => appointment.id && handleCancelAppointment(appointment.id)}
                          >
                            Cancel
                          </button>
                        </>
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

export default AppointmentList;
