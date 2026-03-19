import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { calculateAge, formatDateTime, getErrorMessage } from '../utils/helpers';
import './PatientDetail.css';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    loadPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientById(Number(id));
      setPatient(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await patientService.deletePatient(Number(id));
      navigate('/patients');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="loading">Loading patient details...</div>;
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error-message">{error || 'Patient not found'}</div>
        <Link to="/patients" className="btn btn-secondary">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="page-header">
        <div>
          <h1>{patient.firstName} {patient.lastName}</h1>
          <p>Patient ID: {patient.id}</p>
        </div>
        <div className="header-actions">
          <Link to="/patients" className="btn btn-secondary">
            ← Back
          </Link>
          <Link to={`/patients/${patient.id}/edit`} className="btn btn-primary">
            ✏️ Edit
          </Link>
          <button onClick={() => setDeleteConfirm(true)} className="btn btn-danger">
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Personal Information Card */}
        <div className="detail-card">
          <h3>👤 Personal Information</h3>
          <div className="detail-row">
            <span className="label">Full Name:</span>
            <span className="value">{patient.firstName} {patient.lastName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Date of Birth:</span>
            <span className="value">{patient.dateOfBirth} ({calculateAge(patient.dateOfBirth)} years old)</span>
          </div>
          <div className="detail-row">
            <span className="label">Gender:</span>
            <span className="value">{patient.gender}</span>
          </div>
          <div className="detail-row">
            <span className="label">Blood Group:</span>
            <span className="value blood-group">{patient.bloodGroup}</span>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="detail-card">
          <h3>📞 Contact Information</h3>
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">
              <a href={`mailto:${patient.email}`}>{patient.email}</a>
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">
              <a href={`tel:${patient.phone}`}>{patient.phone}</a>
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Address:</span>
            <span className="value">{patient.address}</span>
          </div>
          {patient.emergencyContact && (
            <div className="detail-row">
              <span className="label">Emergency Contact:</span>
              <span className="value">
                <a href={`tel:${patient.emergencyContact}`}>{patient.emergencyContact}</a>
              </span>
            </div>
          )}
        </div>

        {/* Medical Information Card */}
        <div className="detail-card full-width">
          <h3>🏥 Medical Information</h3>
          
          {patient.medicalHistory ? (
            <div className="detail-row">
              <span className="label">Medical History:</span>
              <span className="value">{patient.medicalHistory}</span>
            </div>
          ) : (
            <div className="detail-row">
              <span className="label">Medical History:</span>
              <span className="value text-muted">No medical history recorded</span>
            </div>
          )}

          {patient.allergies ? (
            <div className="detail-row">
              <span className="label">Allergies:</span>
              <span className="value allergies">{patient.allergies}</span>
            </div>
          ) : (
            <div className="detail-row">
              <span className="label">Allergies:</span>
              <span className="value text-muted">No known allergies</span>
            </div>
          )}
        </div>

        {/* Record Information Card */}
        <div className="detail-card full-width">
          <h3>📋 Record Information</h3>
          <div className="detail-row">
            <span className="label">Created At:</span>
            <span className="value">{patient.createdAt ? formatDateTime(patient.createdAt) : 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Last Updated:</span>
            <span className="value">{patient.updatedAt ? formatDateTime(patient.updatedAt) : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to={`/appointments/new?patientId=${patient.id}`} className="action-btn">
            <span>📅</span>
            <div>
              <strong>Schedule Appointment</strong>
              <p>Book a new appointment</p>
            </div>
          </Link>
          <Link to={`/appointments?patientId=${patient.id}`} className="action-btn">
            <span>📋</span>
            <div>
              <strong>View Appointments</strong>
              <p>See appointment history</p>
            </div>
          </Link>
          <Link to={`/billing/new?patientId=${patient.id}`} className="action-btn">
            <span>💵</span>
            <div>
              <strong>Create Invoice</strong>
              <p>Generate new invoice</p>
            </div>
          </Link>
          <Link to={`/billing?patientId=${patient.id}`} className="action-btn">
            <span>💰</span>
            <div>
              <strong>View Invoices</strong>
              <p>Check billing history</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{patient.firstName} {patient.lastName}</strong>?
              <br />
              This action cannot be undone and will also delete all associated appointments and invoices.
            </p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
