import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { calculateAge, getErrorMessage } from '../utils/helpers';
import './PatientList.css';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await patientService.deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.phone.includes(query)
    );
  });

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>Manage patient records and information</p>
        </div>
        <Link to="/patients/new" className="btn btn-primary">
          ➕ Add New Patient
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <span className="search-results">
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          <p>No patients found</p>
          {searchQuery && <button onClick={() => setSearchQuery('')} className="btn btn-secondary">Clear Search</button>}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>
                    <strong>{patient.firstName} {patient.lastName}</strong>
                  </td>
                  <td>{calculateAge(patient.dateOfBirth)} years</td>
                  <td>{patient.gender}</td>
                  <td>{patient.bloodGroup}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.email}</td>
                  <td className="actions">
                    <button
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="btn-icon btn-view"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => navigate(`/patients/${patient.id}/edit`)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(patient.id!)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this patient? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
