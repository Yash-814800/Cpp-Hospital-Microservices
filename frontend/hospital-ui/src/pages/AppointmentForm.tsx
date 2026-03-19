import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { Patient, Doctor, Specialization } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Form.css';

const AppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId');

  const [formData, setFormData] = useState({
    patientId: 0,
    doctorId: preselectedDoctorId ? parseInt(preselectedDoctorId) : 0,
    appointmentDate: new Date(),
    appointmentTime: '',
    reason: '',
    status: 'SCHEDULED',
    notes: '',
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specializationFilter, setSpecializationFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPatientsAndDoctors();
  }, []);

  useEffect(() => {
    filterDoctorsBySpecialization();
  }, [specializationFilter, doctors]);

  const loadPatientsAndDoctors = async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        patientService.getAllPatients(),
        doctorService.getAllDoctors(),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
    } catch (err: any) {
      setError('Failed to load patients or doctors');
    }
  };

  const filterDoctorsBySpecialization = () => {
    if (specializationFilter === 'ALL') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter((d) => d.specialization === specializationFilter));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (formData.patientId === 0) errors.patientId = 'Please select a patient';
    if (formData.doctorId === 0) errors.doctorId = 'Please select a doctor';
    if (!formData.appointmentTime) errors.appointmentTime = 'Please select a time';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const appointmentData = {
        ...formData,
        appointmentDate: formData.appointmentDate.toISOString().split('T')[0],
        status: 'SCHEDULED' as const,
      };

      await appointmentService.createAppointment(appointmentData);
      navigate('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-header">
        <h1>Schedule New Appointment</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
          Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-section">
          <h2>Appointment Details</h2>
          
          <div className="form-group">
            <label htmlFor="patientId">
              Patient <span className="required">*</span>
            </label>
            <select
              id="patientId"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: parseInt(e.target.value) })}
              className={validationErrors.patientId ? 'error' : ''}
            >
              <option value="0">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} - {patient.email}
                </option>
              ))}
            </select>
            {validationErrors.patientId && (
              <span className="error-text">{validationErrors.patientId}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Filter by Specialization</label>
              <select
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

            <div className="form-group">
              <label htmlFor="doctorId">
                Doctor <span className="required">*</span>
              </label>
              <select
                id="doctorId"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: parseInt(e.target.value) })}
                className={validationErrors.doctorId ? 'error' : ''}
              >
                <option value="0">Select a doctor</option>
                {filteredDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {validationErrors.doctorId && (
                <span className="error-text">{validationErrors.doctorId}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Appointment Date <span className="required">*</span>
              </label>
              <DatePicker
                selected={formData.appointmentDate}
                onChange={(date) => setFormData({ ...formData, appointmentDate: date || new Date() })}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">
                Appointment Time <span className="required">*</span>
              </label>
              <input
                type="time"
                id="appointmentTime"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                className={validationErrors.appointmentTime ? 'error' : ''}
              />
              {validationErrors.appointmentTime && (
                <span className="error-text">{validationErrors.appointmentTime}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit</label>
            <textarea
              id="reason"
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Brief description of the reason for appointment"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/appointments')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
