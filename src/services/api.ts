export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  created_at: string
  last_login_at: string | null
}

export interface Project {
  id: string
  title: string
  slug: string
  category: 'Residential' | 'Commercial' | 'Grey Structure' | 'Waterproofing' | 'Renovation'
  location: string
  status: 'Completed' | 'In Progress' | 'Upcoming'
  short_desc: string
  full_desc: string
  images: string[]
  featured: boolean
  completion_year: string
  created_at: string
  updated_at: string
}

export interface ContactInquiry {
  id: string
  name: string
  phone: string
  email: string
  project_type: string
  location: string
  budget: string
  message: string
  is_read: boolean
  created_at: string
}

export interface ServiceItem {
  id: string
  number: string
  title: string
  desc: string
  icon_name: string
  cta?: string
  sort_order: number
}

export interface TestimonialItem {
  id: string
  label: string
  type: string
  location: string
  quote: string
  is_sample: boolean
  rating: number
  created_at: string
}

export interface LoginActivity {
  id: string
  user_id?: string
  email: string
  status: 'success' | 'failed'
  ip_address: string
  user_agent: string
  created_at: string
}

export interface AdminStats {
  totalUsers: number
  totalProjects: number
  featuredProjects: number
  totalInquiries: number
  unreadInquiries: number
  totalLogins: number
  recentInquiries: ContactInquiry[]
  recentLogins: LoginActivity[]
  recentUsers: User[]
}

const API_BASE = '/api'

function getHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem('crescent_token')
  const headers: Record<string, string> = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...(options.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`)
  }

  return data as T
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    return request<{ message: string; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async register(name: string, email: string, password: string) {
    return request<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },

  async getMe() {
    return request<{ user: User }>('/auth/me')
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  async getLoginActivity(limit = 100) {
    return request<{ activity: LoginActivity[] }>(`/auth/activity?limit=${limit}`)
  },

  // Projects
  async getProjects(params?: { category?: string; featured?: boolean; search?: string }) {
    const query = new URLSearchParams()
    if (params?.category && params.category !== 'All') query.set('category', params.category)
    if (params?.featured !== undefined) query.set('featured', String(params.featured))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request<{ projects: Project[] }>(`/projects${qs}`)
  },

  async getProject(idOrSlug: string) {
    return request<{ project: Project }>(`/projects/${encodeURIComponent(idOrSlug)}`)
  },

  async createProject(data: Partial<Project>) {
    return request<{ message: string; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateProject(id: string, data: Partial<Project>) {
    return request<{ message: string; project: Project }>(`/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteProject(id: string) {
    return request<{ message: string }>(`/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  // Image Upload
  async uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach(f => formData.append('images', f))
    return request<{ message: string; urls: string[] }>('/upload', {
      method: 'POST',
      body: formData,
    })
  },

  async deleteUpload(url: string) {
    return request<{ message: string }>('/upload/delete', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  },

  // Contact Inquiries
  async submitContact(formData: {
    name: string
    phone: string
    email: string
    project_type?: string
    location?: string
    budget?: string
    message?: string
    _gotcha?: string
  }) {
    return request<{ success: boolean; message: string; inquiryId?: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  },

  async getInquiries(params?: { unread?: boolean; search?: string }) {
    const query = new URLSearchParams()
    if (params?.unread) query.set('unread', 'true')
    if (params?.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request<{ inquiries: ContactInquiry[] }>(`/admin/inquiries/admin/list${qs}`)
  },

  async toggleInquiryRead(id: string, is_read?: boolean) {
    return request<{ message: string; inquiry: ContactInquiry }>(`/admin/inquiries/admin/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read }),
    })
  },

  async deleteInquiry(id: string) {
    return request<{ message: string }>(`/admin/inquiries/admin/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  // Services
  async getServices() {
    return request<{ services: ServiceItem[] }>('/services')
  },

  async createService(data: Partial<ServiceItem>) {
    return request<{ message: string; service: ServiceItem }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateService(id: string, data: Partial<ServiceItem>) {
    return request<{ message: string; service: ServiceItem }>(`/services/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteService(id: string) {
    return request<{ message: string }>(`/services/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  // Testimonials
  async getTestimonials() {
    return request<{ testimonials: TestimonialItem[] }>('/testimonials')
  },

  async createTestimonial(data: Partial<TestimonialItem>) {
    return request<{ message: string; testimonial: TestimonialItem }>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateTestimonial(id: string, data: Partial<TestimonialItem>) {
    return request<{ message: string; testimonial: TestimonialItem }>(`/testimonials/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteTestimonial(id: string) {
    return request<{ message: string }>(`/testimonials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  // Users (Admin)
  async getUsers() {
    return request<{ users: User[] }>('/admin/users')
  },

  async updateUser(id: string, data: { status?: 'active' | 'inactive'; role?: 'admin' | 'user' }) {
    return request<{ message: string; user: User }>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteUser(id: string) {
    return request<{ message: string }>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  // Dashboard Stats (Admin)
  async getStats() {
    return request<AdminStats>('/admin/stats')
  },
}
