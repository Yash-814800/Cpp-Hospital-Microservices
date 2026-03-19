import apiClient from './apiClient';
import { ApiResponse, Doctor, DoctorFormData, DoctorAvailability } from '../types';

export const doctorService = {
  // Get all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/doctors');
    return response.data.data;
  },

  // Get doctor by ID
  getDoctorById: async (id: string | number): Promise<Doctor> => {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data.data;
  },

  // Create doctor
  createDoctor: async (doctor: DoctorFormData): Promise<Doctor> => {
    const response = await apiClient.post<ApiResponse<Doctor>>('/doctors', doctor);
    return response.data.data;
  },

  // Update doctor
  updateDoctor: async (id: string | number, doctor: DoctorFormData): Promise<Doctor> => {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, doctor);
    return response.data.data;
  },

  // Delete doctor
  deleteDoctor: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  },

  // Update doctor availability
  updateAvailability: async (id: string | number, availability: DoctorAvailability): Promise<Doctor> => {
    const response = await apiClient.patch<ApiResponse<Doctor>>(
      `/doctors/${id}/availability`,
      availability
    );
    return response.data.data;
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization: string): Promise<Doctor[]> => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>(
      `/doctors/specialization/${specialization}`
    );
    return response.data.data;
  },
};
