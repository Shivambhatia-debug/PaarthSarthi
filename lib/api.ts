// API Configuration for ParthSarthi Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ps_token');
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ============ AUTH API ============
export const authAPI = {
  register: (userData: any) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiCall('/auth/me'),
  updateProfile: (data: any) => apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) => apiCall('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
};

// ============ ALUMNI API ============
export const alumniAPI = {
  getAll: (params?: string) => apiCall(`/alumni${params ? `?${params}` : ''}`),
  getById: (id: string) => apiCall(`/alumni/${id}`),
  create: (formData: FormData) => apiCall('/alumni', { method: 'POST', body: formData }),
  update: (id: string, formData: FormData) => apiCall(`/alumni/${id}`, { method: 'PUT', body: formData }),
  delete: (id: string) => apiCall(`/alumni/${id}`, { method: 'DELETE' }),
  toggleStatus: (id: string) => apiCall(`/alumni/${id}/toggle`, { method: 'PATCH' }),
};

// ============ MENTOR API ============
export const mentorAPI = {
  getAll: (params?: string) => apiCall(`/mentors${params ? `?${params}` : ''}`),
  getById: (id: string) => apiCall(`/mentors/${id}`),
  getFeatured: () => apiCall('/mentors/featured'),
  create: (formData: FormData) => apiCall('/mentors', { method: 'POST', body: formData }),
  update: (id: string, formData: FormData) => apiCall(`/mentors/${id}`, { method: 'PUT', body: formData }),
  delete: (id: string) => apiCall(`/mentors/${id}`, { method: 'DELETE' }),
  toggleStatus: (id: string) => apiCall(`/mentors/${id}/toggle`, { method: 'PATCH' }),
};

// ============ COURSE API ============
export const courseAPI = {
  getAll: (params?: string) => apiCall(`/courses${params ? `?${params}` : ''}`),
  getById: (id: string) => apiCall(`/courses/${id}`),
  getBySlug: (slug: string) => apiCall(`/courses/slug/${slug}`),
  getWebinars: () => apiCall('/courses/webinars'),
  create: (formData: FormData) => apiCall('/courses', { method: 'POST', body: formData }),
  update: (id: string, formData: FormData) => apiCall(`/courses/${id}`, { method: 'PUT', body: formData }),
  delete: (id: string) => apiCall(`/courses/${id}`, { method: 'DELETE' }),
  togglePublish: (id: string) => apiCall(`/courses/${id}/publish`, { method: 'PATCH' }),
};

// ============ STARTUP API ============
export const startupAPI = {
  getAll: (params?: string) => apiCall(`/startups${params ? `?${params}` : ''}`),
  getById: (id: string) => apiCall(`/startups/${id}`),
  create: (formData: FormData) => apiCall('/startups', { method: 'POST', body: formData }),
  update: (id: string, formData: FormData) => apiCall(`/startups/${id}`, { method: 'PUT', body: formData }),
  delete: (id: string) => apiCall(`/startups/${id}`, { method: 'DELETE' }),
  addMilestone: (id: string, data: any) => apiCall(`/startups/${id}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
};

// ============ BLOG API ============
export const blogAPI = {
  getAll: (params?: string) => apiCall(`/blogs${params ? `?${params}` : ''}`),
  getById: (id: string) => apiCall(`/blogs/${id}`),
  getBySlug: (slug: string) => apiCall(`/blogs/slug/${slug}`),
  getCategories: () => apiCall('/blogs/categories'),
  create: (formData: FormData) => apiCall('/blogs', { method: 'POST', body: formData }),
  update: (id: string, formData: FormData) => apiCall(`/blogs/${id}`, { method: 'PUT', body: formData }),
  delete: (id: string) => apiCall(`/blogs/${id}`, { method: 'DELETE' }),
  like: (id: string) => apiCall(`/blogs/${id}/like`, { method: 'POST' }),
};

// ============ MEETING API ============
export const meetingAPI = {
  book: (data: any) => apiCall('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  getAll: (params?: string) => apiCall(`/meetings${params ? `?${params}` : ''}`),
  getMyMeetings: () => apiCall('/meetings/my'),
  getById: (id: string) => apiCall(`/meetings/${id}`),
  updateStatus: (id: string, data: any) => apiCall(`/meetings/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id: string, reason?: string) => apiCall(`/meetings/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  addFeedback: (id: string, data: any) => apiCall(`/meetings/${id}/feedback`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ============ NOTIFICATION API ============
export const notificationAPI = {
  getAll: (params?: string) => apiCall(`/notifications${params ? `?${params}` : ''}`),
  getUnreadCount: () => apiCall('/notifications/unread-count'),
  markAsRead: (id: string) => apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => apiCall('/notifications/read-all', { method: 'PUT' }),
  delete: (id: string) => apiCall(`/notifications/${id}`, { method: 'DELETE' }),
};

// ============ CONTACT API ============
export const contactAPI = {
  submit: (data: any) => apiCall('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getAll: (params?: string) => apiCall(`/contact${params ? `?${params}` : ''}`),
  update: (id: string, data: any) => apiCall(`/contact/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/contact/${id}`, { method: 'DELETE' }),
};

// ============ ADMIN API ============
export const adminAPI = {
  getDashboard: () => apiCall('/admin/dashboard'),
  getUsers: (params?: string) => apiCall(`/admin/users${params ? `?${params}` : ''}`),
  updateUser: (id: string, data: any) => apiCall(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
  createAdmin: (data: any) => apiCall('/admin/create-admin', { method: 'POST', body: JSON.stringify(data) }),
};

export default apiCall;
