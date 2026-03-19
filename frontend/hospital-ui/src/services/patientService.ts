import apiClient from './apiClient';
import { ApiResponse, Patient, PatientFormData } from '../types';

export const patientService = {
  // Get all patients
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/patients');
    return response.data.data;
  },

  // Get patient by ID
  getPatientById: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data;
  },

  // Create patient
  createPatient: async (patient: PatientFormData): Promise<Patient> => {
    const response = await apiClient.post<ApiResponse<Patient>>('/patients', patient);
    return response.data.data;
  },

  // Update patient
  updatePatient: async (id: number, patient: PatientFormData): Promise<Patient> => {
    const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, patient);
    return response.data.data;
  },

  // Delete patient
  deletePatient: async (id: number): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },

  // Search patients by name
  searchPatients: async (query: string): Promise<Patient[]> => {
    const response = await apiClient.get<ApiResponse<Patient[]>>(`/patients/search?q=${query}`);
    return response.data.data;
  },
};
