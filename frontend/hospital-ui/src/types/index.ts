// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

// Patient types
export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  bloodGroup: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Doctor types
export enum Specialization {
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  PEDIATRICS = 'PEDIATRICS',
  PSYCHIATRY = 'PSYCHIATRY',
  ONCOLOGY = 'ONCOLOGY',
  GENERAL_MEDICINE = 'GENERAL_MEDICINE'
}

export interface Doctor {
  id?: number;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  email: string;
  consultationFee: number;
  qualifications: string;
  experienceYears: number;
  availableFrom?: string;
  availableTo?: string;
  availableDays?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorAvailability {
  availableFrom: string;
  availableTo: string;
  availableDays: string[];
}

// Appointment types
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  patientName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

// Billing types
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'INSURANCE' | 'UPI' | 'OTHER';

export interface Invoice {
  id?: number;
  patientId: number;
  appointmentId?: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: PaymentStatus;
  items?: InvoiceItem[];
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  patientName?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id?: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
}

// Form types
export interface PatientFormData extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {}
export interface DoctorFormData extends Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'> {}
export interface AppointmentFormData extends Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> {}
