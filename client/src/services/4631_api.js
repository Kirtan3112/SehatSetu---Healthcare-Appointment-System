/**
 * API Service for Healthcare Appointment System Client
 */

const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('has_token');
export const setStoredToken = (token) => {
  if (token) localStorage.setItem('has_token', token);
  else localStorage.removeItem('has_token');
};

const request = async (endpoint, options = {}) => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `HTTP Error ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code;
    throw err;
  }

  return data;
};

const toQueryString = (params = {}) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'undefined' && value !== 'null') {
      cleaned[key] = value;
    }
  }
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Departments & Specializations
  getDepartments: () => request('/departments'),
  getSpecializations: (deptId) => request(`/specializations${toQueryString({ departmentId: deptId })}`),

  // Doctors
  searchDoctors: (params = {}) => request(`/doctors${toQueryString(params)}`),
  getDoctorById: (id) => request(`/doctors/${id}`),
  updateDoctorProfile: (id, payload) => request(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  approveDoctor: (id) => request(`/doctors/${id}/approve`, { method: 'PATCH' }),
  rejectDoctor: (id) => request(`/doctors/${id}/reject`, { method: 'PATCH' }),

  // Availability & Slots
  getDoctorAvailability: (doctorId) => request(`/availability/${doctorId}`),
  setWeeklyAvailability: (doctorId, schedule) => request(`/availability/${doctorId}`, {
    method: 'POST',
    body: JSON.stringify({ schedule })
  }),
  generateSlots: (doctorId, startDate, endDate) => request(`/availability/${doctorId}/generate-slots`, {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate })
  }),
  getSlots: (params = {}) => request(`/slots${toQueryString(params)}`),

  // Appointments
  bookAppointment: (slotId, reason, notes) => request('/appointments', {
    method: 'POST',
    body: JSON.stringify({ slotId, reason, notes })
  }),
  getMyAppointments: (status) => request(`/appointments/my${toQueryString({ status })}`),
  getDoctorSchedule: (params = {}) => request(`/appointments/doctor-schedule${toQueryString(params)}`),
  getAllAppointments: (params = {}) => request(`/appointments${toQueryString(params)}`),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  rescheduleAppointment: (id, newSlotId) => request(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ newSlotId })
  }),
  updateAppointmentStatus: (id, status, notes) => request(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes })
  }),

  // Notifications
  getNotifications: (unreadOnly = false) => request(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
  getUnreadCount: () => request('/notifications/unread-count'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PATCH' }),
  triggerReminders: () => request('/notifications/trigger-reminders', { method: 'POST' }),

  // Admin
  getAdminMetrics: () => request('/admin/metrics'),
  getAdminUsers: (params = {}) => request(`/admin/users${toQueryString(params)}`),
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle-status`, { method: 'PATCH' }),
  getAuditLogs: (params = {}) => request(`/admin/audit-logs${toQueryString(params)}`),
  createDoctorByAdmin: (payload) => request('/admin/doctors', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
