import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { Doctor, Specialization } from '../types';
import '../styles/Form.css';

const DoctorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: Specialization.GENERAL_MEDICINE,
    licenseNumber: '',
    qualifications: '',
    experienceYears: 0,
    consultationFee: 0,
    availableFrom: '',
    availableTo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditMode && id) {
      loadDoctor(id);
    }
  }, [id, isEditMode]);

  const loadDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      const doctor = await doctorService.getDoctorById(doctorId);
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization as Specialization,
        licenseNumber: doctor.licenseNumber,
        qualifications: doctor.qualifications,
        experienceYears: doctor.experienceYears,
        consultationFee: doctor.consultationFee,
        availableFrom: doctor.availableFrom || '',
        availableTo: doctor.availableTo || '',
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load doctor');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone format';
    }

    if (!formData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
    if (!formData.qualifications.trim()) errors.qualifications = 'Qualifications are required';
    
    if (formData.experienceYears < 0) {
      errors.experienceYears = 'Experience cannot be negative';
    }

    if (formData.consultationFee <= 0) {
      errors.consultationFee = 'Consultation fee must be greater than 0';
    }

    if (formData.availableFrom && formData.availableTo) {
      if (formData.availableFrom >= formData.availableTo) {
        errors.availableTo = 'End time must be after start time';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experienceYears' || name === 'consultationFee' ? Number(value) : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditMode && id) {
        await doctorService.updateDoctor(id, formData);
      } else {
        await doctorService.createDoctor(formData);
      }

      navigate('/doctors');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} doctor`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="container">
        <div className="loading">Loading doctor...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Doctor' : 'Add New Doctor'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/doctors')}>
          Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={validationErrors.firstName ? 'error' : ''}
              />
              {validationErrors.firstName && (
                <span className="error-text">{validationErrors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={validationErrors.lastName ? 'error' : ''}
              />
              {validationErrors.lastName && (
                <span className="error-text">{validationErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? 'error' : ''}
              />
              {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={validationErrors.phone ? 'error' : ''}
              />
              {validationErrors.phone && <span className="error-text">{validationErrors.phone}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Professional Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialization">
                Specialization <span className="required">*</span>
              </label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              >
                {Object.values(Specialization).map((spec) => (
                  <option key={spec} value={spec}>
                    {spec.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber">
                License Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className={validationErrors.licenseNumber ? 'error' : ''}
                placeholder="e.g., LIC123456"
              />
              {validationErrors.licenseNumber && (
                <span className="error-text">{validationErrors.licenseNumber}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experienceYears">
                Experience (Years) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="experienceYears"
                name="experienceYears"
                min="0"
                value={formData.experienceYears}
                onChange={handleChange}
                className={validationErrors.experienceYears ? 'error' : ''}
              />
              {validationErrors.experienceYears && (
                <span className="error-text">{validationErrors.experienceYears}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">
              Qualifications <span className="required">*</span>
            </label>
            <textarea
              id="qualifications"
              name="qualifications"
              rows={3}
              value={formData.qualifications}
              onChange={handleChange}
              className={validationErrors.qualifications ? 'error' : ''}
              placeholder="e.g., MBBS, MD (Cardiology)"
            />
            {validationErrors.qualifications && (
              <span className="error-text">{validationErrors.qualifications}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="consultationFee">
              Consultation Fee ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="consultationFee"
              name="consultationFee"
              min="0"
              step="0.01"
              value={formData.consultationFee}
              onChange={handleChange}
              className={validationErrors.consultationFee ? 'error' : ''}
            />
            {validationErrors.consultationFee && (
              <span className="error-text">{validationErrors.consultationFee}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Availability Schedule</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="availableFrom">Available From</label>
              <input
                type="time"
                id="availableFrom"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="availableTo">Available To</label>
              <input
                type="time"
                id="availableTo"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                className={validationErrors.availableTo ? 'error' : ''}
              />
              {validationErrors.availableTo && (
                <span className="error-text">{validationErrors.availableTo}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/doctors')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Doctor' : 'Create Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
