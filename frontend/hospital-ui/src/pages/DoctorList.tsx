import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { Doctor, Specialization } from '../types';
import '../styles/List.css';

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; doctorId: number | null }>({
    show: false,
    doctorId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, specializationFilter, doctors]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
      setFilteredDoctors(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.phone.includes(searchTerm) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (specializationFilter !== 'ALL') {
      filtered = filtered.filter((doctor) => doctor.specialization === specializationFilter);
    }

    setFilteredDoctors(filtered);
  };

  const handleDelete = async () => {
    if (!deleteModal.doctorId) return;

    try {
      await doctorService.deleteDoctor(deleteModal.doctorId);
      setDoctors(doctors.filter((d) => d.id !== deleteModal.doctorId));
      setDeleteModal({ show: false, doctorId: null });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
      setDeleteModal({ show: false, doctorId: null });
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
        <div className="loading">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Doctor Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/doctors/new')}>
          Add New Doctor
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, phone, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
        >
          <option value="ALL">All Specializations</option>
          {Object.values(Specialization).map((spec) => (
            <option key={spec} value={spec}>
              {spec.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="results-info">
        Showing {filteredDoctors.length} of {doctors.length} doctors
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Experience</th>
              <th>Consultation Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No doctors found
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <strong>
                      {doctor.firstName} {doctor.lastName}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${getSpecializationBadgeClass(doctor.specialization)}`}>
                      {doctor.specialization.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{doctor.email}</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.experienceYears} years</td>
                  <td>${doctor.consultationFee}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteModal({ show: true, doctorId: doctor.id || null })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, doctorId: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this doctor? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModal({ show: false, doctorId: null })}
              >
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

export default DoctorList;
