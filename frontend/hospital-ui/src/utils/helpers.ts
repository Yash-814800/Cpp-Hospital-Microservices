// Format date to YYYY-MM-DD
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toISOString().split('T')[0];
};

// Format time to HH:MM
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    const time = date.split('T')[1];
    return time ? time.substring(0, 5) : date;
  }
  return date.toTimeString().substring(0, 5);
};

// Format datetime for display
export const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone (10 digits)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    SCHEDULED: '#3b82f6',    // blue
    COMPLETED: '#10b981',    // green
    CANCELLED: '#ef4444',    // red
    NO_SHOW: '#f59e0b',      // orange
    PENDING: '#f59e0b',      // orange
    PAID: '#10b981',         // green
    PARTIALLY_PAID: '#3b82f6', // blue
  };
  
  return statusColors[status] || '#6b7280'; // gray default
};

// Get specialization display name
export const getSpecializationName = (specialization: string): string => {
  return specialization
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Handle API errors
export const getErrorMessage = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const data = error.response.data;
    if (typeof data.message === 'string') {
      return data.message;
    } else if (typeof data.message === 'object') {
      // Validation errors object
      return Object.values(data.message).join(', ');
    }
    return data.error || 'An error occurred';
  } else if (error.request) {
    return 'Network error - unable to reach server';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
