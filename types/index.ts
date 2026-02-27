// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'academic';
  userId?: string;
  rollNo?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Service Request Types
export type ServiceType = 'bonafide' | 'fee' | 'tc' | 'noc';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface ServiceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  department: string;
  serviceType: ServiceType;
  details: Record<string, string>;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  relatedRequestId?: string;
  createdAt: Date;
}

// Fee Structure Types
export interface FeeStructure {
  id: string;
  category: string;
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  totalFee: number;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

// Stats Types
export interface DashboardStats {
  totalStudents: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginForm {
  userId: string;
  password: string;
  name?: string;
}

export interface BonafideForm {
  purpose: string;
}

export interface FeeForm {
  paymentMode: string;
  category: string;
}

export interface ProfileForm {
  name: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  bloodGroup: string;
}
