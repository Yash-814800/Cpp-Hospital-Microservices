import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { Doctor } from '../types';
import '../styles/Detail.css';

const DoctorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadDoctor(id);
    }
  }, [id]);

  const loadDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      console.log('Loading doctor with ID:', doctorId);
      const data = await doctorService.getDoctorById(doctorId);
      console.log('Doctor data received:', data);
      setDoctor(data);
      setError('');
    } catch (err: any) {
      console.error('Error loading doctor:', err);
      setError(err.response?.data?.message || 'Failed to load doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await doctorService.deleteDoctor(id);
      navigate('/doctors');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
      setDeleteModal(false);
    }
  };

  const getSpecializationBadgeClass = (specialization: string) => {
    const colorMap: { [key: string]: string } = {
      CARDIOLOGY: 'badge-red',
      NEUROLOGY: 'badge-purple',
      ORTHOPEDICS: 'badge-blue',
      PEDIATRICS: 'badge-green',
      DERMATOLOGY: 'badge-orange',
      ONCOLOGY: 'badge-pink',
      PSYCHIATRY: 'badge-teal',
      GENERAL_MEDICINE: 'badge-gray',
    };
    return colorMap[specialization] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading doctor details...</div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Doctor not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/doctors')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="detail-header">
        <div>
          <h1>
            Dr. {doctor.firstName} {doctor.lastName}
          </h1>
          <span className={`badge ${getSpecializationBadgeClass(doctor.specialization)}`}>
            {doctor.specialization.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/doctors')}>
            Back to List
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/doctors/edit/${doctor.id}`)}>
            Edit Doctor
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h2>Personal Information</h2>
          <div className="detail-row">
            <span className="detail-label">Full Name:</span>
            <span className="detail-value">
              Dr. {doctor.firstName} {doctor.lastName}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">
              <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">
              <a href={`tel:${doctor.phone}`}>{doctor.phone}</a>
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Professional Information</h2>
          <div className="detail-row">
            <span className="detail-label">Specialization:</span>
            <span className="detail-value">
              <span className={`badge ${getSpecializationBadgeClass(doctor.specialization)}`}>
                {doctor.specialization.replace(/_/g, ' ')}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Experience:</span>
            <span className="detail-value">{doctor.experienceYears} years</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Qualifications:</span>
            <span className="detail-value">{doctor.qualifications}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Consultation Fee:</span>
            <span className="detail-value">${doctor.consultationFee}</span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Availability Schedule</h2>
          {doctor.availableFrom && doctor.availableTo ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Available From:</span>
                <span className="detail-value">{doctor.availableFrom}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Available To:</span>
                <span className="detail-value">{doctor.availableTo}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Hours:</span>
                <span className="detail-value">
                  {(() => {
                    const [fromHour, fromMin] = doctor.availableFrom.split(':').map(Number);
                    const [toHour, toMin] = doctor.availableTo.split(':').map(Number);
                    const totalMinutes = (toHour * 60 + toMin) - (fromHour * 60 + fromMin);
                    const hours = Math.floor(totalMinutes / 60);
                    const mins = totalMinutes % 60;
                    return `${hours}h ${mins}m`;
                  })()}
                </span>
              </div>
            </>
          ) : (
            <p className="no-data">No availability schedule set</p>
          )}
        </div>

        <div className="detail-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons-vertical">
            <button
              className="btn btn-info"
              onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}
            >
              Schedule Appointment
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/appointments?doctorId=${doctor.id}`)}
            >
              View Appointments
            </button>
            <button
              className="btn btn-warning"
              onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
            >
              Update Availability
            </button>
            <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>
              Delete Doctor
            </button>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete Dr. {doctor.firstName} {doctor.lastName}? This action
              cannot be undone and may affect existing appointments.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetail;
