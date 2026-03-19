import apiClient from './apiClient';
import { ApiResponse, Appointment, AppointmentFormData } from '../types';

export const appointmentService = {
  // Get all appointments
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>('/appointments');
    return response.data.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id: number): Promise<Appointment> => {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data;
  },

  // Create appointment
  createAppointment: async (appointment: AppointmentFormData): Promise<Appointment> => {
    const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', appointment);
    return response.data.data;
  },

  // Update appointment
  updateAppointment: async (id: number, appointment: AppointmentFormData): Promise<Appointment> => {
    const response = await apiClient.put<ApiResponse<Appointment>>(
      `/appointments/${id}`,
      appointment
    );
    return response.data.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: number): Promise<void> => {
    await apiClient.patch(`/appointments/${id}/cancel`);
  },

  // Update appointment status
  updateAppointmentStatus: async (id: number, status: string): Promise<Appointment> => {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/status?status=${status}`
    );
    return response.data.data;
  },

  // Delete appointment
  deleteAppointment: async (id: number): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },

  // Get appointments by patient
  getAppointmentsByPatient: async (patientId: number): Promise<Appointment[]> => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      `/appointments/patient/${patientId}`
    );
    return response.data.data;
  },

  // Get appointments by doctor
  getAppointmentsByDoctor: async (doctorId: number): Promise<Appointment[]> => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      `/appointments/doctor/${doctorId}`
    );
    return response.data.data;
  },

  // Get appointments by date
  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      `/appointments/date/${date}`
    );
    return response.data.data;
  },
};
