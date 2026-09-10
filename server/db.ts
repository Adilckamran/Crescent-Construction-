import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { supabase, isSupabaseConfigured } from './supabase'

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
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

export interface DatabaseSchema {
  users: User[]
  projects: Project[]
  inquiries: ContactInquiry[]
  services: ServiceItem[]
  testimonials: TestimonialItem[]
  login_activity: LoginActivity[]
}

const DB_DIR = path.resolve(process.cwd(), 'data')
const DB_FILE = path.join(DB_DIR, 'crescent_db.json')

class DatabaseManager {
  private data: DatabaseSchema

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8')
        this.data = JSON.parse(raw)
      } catch (err) {
        console.error('Error reading database file, initializing fresh schema:', err)
        this.data = this.getDefaultSchema()
        this.save()
      }
    } else {
      this.data = this.getDefaultSchema()
      this.save()
    }

    this.ensureAdminAccount()
  }

  private getDefaultSchema(): DatabaseSchema {
    return {
      users: [],
      projects: [],
      inquiries: [],
      services: [],
      testimonials: [],
      login_activity: [],
    }
  }

  private save(): void {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8')
      fs.renameSync(tempPath, DB_FILE)
    } catch (err) {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
    }
  }

  public async ensureAdminAccount(): Promise<void> {
    const adminEmail = (process.env.ADMIN_EMAIL || 'crescentconstructionofficial@gmail.com').toLowerCase().trim()
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'CrescentAdmin2026!'

    // Supabase check
    if (isSupabaseConfigured() && supabase) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .maybeSingle()

      if (!existingUser) {
        const salt = bcrypt.genSaltSync(10)
        const password_hash = bcrypt.hashSync(defaultPassword, salt)
        const newAdmin: User = {
          id: 'user-admin-1',
          name: 'Crescent Administrator',
          email: adminEmail,
          password_hash,
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          last_login_at: null,
        }
        await supabase.from('users').insert(newAdmin)
        console.log(`[SUPABASE] Seeded initial administrator account: ${adminEmail}`)
      }
    }

    // Local fallback check
    let localAdmin = this.data.users.find(u => u.email.toLowerCase() === adminEmail)
    if (!localAdmin) {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(defaultPassword, salt)
      const newAdmin: User = {
        id: 'user-admin-1',
        name: 'Crescent Administrator',
        email: adminEmail,
        password_hash: hash,
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        last_login_at: null,
      }
      this.data.users.push(newAdmin)
      this.save()
    }
  }

  // ==========================================
  // USER METHODS
  // ==========================================
  public async getUsers(): Promise<Omit<User, 'password_hash'>[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('id, name, email, role, status, created_at, last_login_at').order('created_at', { ascending: false })
      if (!error && data) return data as Omit<User, 'password_hash'>[]
    }
    return this.data.users.map(({ password_hash, ...rest }) => rest)
  }

  public async getUserById(id: string): Promise<User | undefined> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
      if (!error && data) return data as User
    }
    return this.data.users.find(u => u.id === id)
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const clean = email.toLowerCase().trim()
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('email', clean).maybeSingle()
      if (!error && data) return data as User
    }
    return this.data.users.find(u => u.email.toLowerCase() === clean)
  }

  public async createUser(user: Omit<User, 'id' | 'created_at' | 'last_login_at'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      last_login_at: null,
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('users').insert(newUser)
      if (error) console.error('[SUPABASE ERROR] createUser:', error.message)
    }

    this.data.users.push(newUser)
    this.save()
    return newUser
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('users').update(updates).eq('id', id)
      if (error) console.error('[SUPABASE ERROR] updateUser:', error.message)
    }

    const idx = this.data.users.findIndex(u => u.id === id)
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates }
      this.save()
      return this.data.users[idx]
    }
    return null
  }

  public async deleteUser(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) console.error('[SUPABASE ERROR] deleteUser:', error.message)
    }

    const before = this.data.users.length
    this.data.users = this.data.users.filter(u => u.id !== id)
    if (this.data.users.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // ==========================================
  // PROJECT METHODS
  // ==========================================
  public async getProjects(filter?: { category?: string; featured?: boolean; search?: string }): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false })

      if (filter?.category && filter.category !== 'All') {
        query = query.ilike('category', filter.category)
      }
      if (filter?.featured !== undefined) {
        query = query.eq('featured', filter.featured)
      }
      if (filter?.search) {
        query = query.or(`title.ilike.%${filter.search}%,location.ilike.%${filter.search}%,short_desc.ilike.%${filter.search}%`)
      }

      const { data, error } = await query
      if (!error && data) return data as Project[]
      console.warn('[SUPABASE ERROR] getProjects fallback:', error?.message)
    }

    // Local fallback
    let list = [...this.data.projects]
    if (filter?.category && filter.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === filter.category?.toLowerCase())
    }
    if (filter?.featured !== undefined) {
      list = list.filter(p => p.featured === filter.featured)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.short_desc.toLowerCase().includes(q)
      )
    }
    return list
  }

  public async getProjectByIdOrSlug(idOrSlug: string): Promise<Project | undefined> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle()

      if (!error && data) return data as Project
    }
    return this.data.projects.find(p => p.id === idOrSlug || p.slug === idOrSlug)
  }

  public async createProject(proj: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const now = new Date().toISOString()
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      created_at: now,
      updated_at: now,
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('projects').insert(newProj)
      if (error) console.error('[SUPABASE ERROR] createProject:', error.message)
    }

    this.data.projects.unshift(newProj)
    this.save()
    return newProj
  }

  public async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const now = new Date().toISOString()
    const payload = { ...updates, updated_at: now }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('projects').update(payload).eq('id', id)
      if (error) console.error('[SUPABASE ERROR] updateProject:', error.message)
    }

    const idx = this.data.projects.findIndex(p => p.id === id)
    if (idx !== -1) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...payload }
      this.save()
      return this.data.projects[idx]
    }
    return null
  }

  public async deleteProject(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) console.error('[SUPABASE ERROR] deleteProject:', error.message)
    }

    const before = this.data.projects.length
    this.data.projects = this.data.projects.filter(p => p.id !== id)
    if (this.data.projects.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // ==========================================
  // INQUIRY METHODS
  // ==========================================
  public async getInquiries(filter?: { unreadOnly?: boolean; search?: string }): Promise<ContactInquiry[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      if (filter?.unreadOnly) {
        query = query.eq('is_read', false)
      }
      if (filter?.search) {
        query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,message.ilike.%${filter.search}%`)
      }
      const { data, error } = await query
      if (!error && data) return data as ContactInquiry[]
    }

    let list = [...this.data.inquiries]
    if (filter?.unreadOnly) {
      list = list.filter(i => !i.is_read)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.phone.includes(q) ||
        i.message.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  public async getInquiryById(id: string): Promise<ContactInquiry | undefined> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('inquiries').select('*').eq('id', id).maybeSingle()
      if (!error && data) return data as ContactInquiry
    }
    return this.data.inquiries.find(i => i.id === id)
  }

  public async createInquiry(inquiry: Omit<ContactInquiry, 'id' | 'created_at' | 'is_read'>): Promise<ContactInquiry> {
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('inquiries').insert(newInquiry)
      if (error) console.error('[SUPABASE ERROR] createInquiry:', error.message)
    }

    this.data.inquiries.unshift(newInquiry)
    this.save()
    return newInquiry
  }

  public async updateInquiry(id: string, updates: Partial<ContactInquiry>): Promise<ContactInquiry | null> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('inquiries').update(updates).eq('id', id)
      if (error) console.error('[SUPABASE ERROR] updateInquiry:', error.message)
    }

    const idx = this.data.inquiries.findIndex(i => i.id === id)
    if (idx !== -1) {
      this.data.inquiries[idx] = { ...this.data.inquiries[idx], ...updates }
      this.save()
      return this.data.inquiries[idx]
    }
    return null
  }

  public async deleteInquiry(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('inquiries').delete().eq('id', id)
      if (error) console.error('[SUPABASE ERROR] deleteInquiry:', error.message)
    }

    const before = this.data.inquiries.length
    this.data.inquiries = this.data.inquiries.filter(i => i.id !== id)
    if (this.data.inquiries.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // ==========================================
  // SERVICES METHODS
  // ==========================================
  public async getServices(): Promise<ServiceItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('services').select('*').order('sort_order', { ascending: true })
      if (!error && data) return data as ServiceItem[]
    }
    return [...this.data.services].sort((a, b) => a.sort_order - b.sort_order)
  }

  public async createService(srv: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
    const newSrv: ServiceItem = {
      ...srv,
      id: `srv-${Date.now()}`,
    }

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('services').insert(newSrv)
    }

    this.data.services.push(newSrv)
    this.save()
    return newSrv
  }

  public async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem | null> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('services').update(updates).eq('id', id)
    }

    const idx = this.data.services.findIndex(s => s.id === id)
    if (idx !== -1) {
      this.data.services[idx] = { ...this.data.services[idx], ...updates }
      this.save()
      return this.data.services[idx]
    }
    return null
  }

  public async deleteService(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('services').delete().eq('id', id)
    }

    const before = this.data.services.length
    this.data.services = this.data.services.filter(s => s.id !== id)
    if (this.data.services.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // ==========================================
  // TESTIMONIALS METHODS
  // ==========================================
  public async getTestimonials(): Promise<TestimonialItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      if (!error && data) return data as TestimonialItem[]
    }
    return [...this.data.testimonials].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  public async createTestimonial(t: Omit<TestimonialItem, 'id' | 'created_at'>): Promise<TestimonialItem> {
    const newT: TestimonialItem = {
      ...t,
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('testimonials').insert(newT)
    }

    this.data.testimonials.unshift(newT)
    this.save()
    return newT
  }

  public async updateTestimonial(id: string, updates: Partial<TestimonialItem>): Promise<TestimonialItem | null> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('testimonials').update(updates).eq('id', id)
    }

    const idx = this.data.testimonials.findIndex(t => t.id === id)
    if (idx !== -1) {
      this.data.testimonials[idx] = { ...this.data.testimonials[idx], ...updates }
      this.save()
      return this.data.testimonials[idx]
    }
    return null
  }

  public async deleteTestimonial(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('testimonials').delete().eq('id', id)
    }

    const before = this.data.testimonials.length
    this.data.testimonials = this.data.testimonials.filter(t => t.id !== id)
    if (this.data.testimonials.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // ==========================================
  // LOGIN ACTIVITY
  // ==========================================
  public async recordLoginActivity(activity: Omit<LoginActivity, 'id' | 'created_at'>): Promise<LoginActivity> {
    const item: LoginActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('login_activity').insert(item)
    }

    this.data.login_activity.unshift(item)
    if (this.data.login_activity.length > 1000) {
      this.data.login_activity = this.data.login_activity.slice(0, 1000)
    }
    this.save()
    return item
  }

  public async getLoginActivity(limit = 100): Promise<LoginActivity[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('login_activity').select('*').order('created_at', { ascending: false }).limit(limit)
      if (!error && data) return data as LoginActivity[]
    }
    return this.data.login_activity.slice(0, limit)
  }

  // ==========================================
  // STATS
  // ==========================================
  public async getStats() {
    if (isSupabaseConfigured() && supabase) {
      const [
        { count: totalUsers },
        { count: totalProjects },
        { count: featuredProjects },
        { count: totalInquiries },
        { count: unreadInquiries },
        { count: totalLogins },
        { data: recentInquiries },
        { data: recentLogins },
        { data: recentUsers },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('featured', true),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('login_activity').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('login_activity').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('users').select('id, name, email, role, status, created_at, last_login_at').order('created_at', { ascending: false }).limit(5),
      ])

      return {
        totalUsers: totalUsers || 0,
        totalProjects: totalProjects || 0,
        featuredProjects: featuredProjects || 0,
        totalInquiries: totalInquiries || 0,
        unreadInquiries: unreadInquiries || 0,
        totalLogins: totalLogins || 0,
        recentInquiries: recentInquiries || [],
        recentLogins: recentLogins || [],
        recentUsers: recentUsers || [],
        storageType: 'Supabase PostgreSQL + Storage',
      }
    }

    // Local fallback stats
    const totalUsers = this.data.users.length
    const totalProjects = this.data.projects.length
    const featuredProjects = this.data.projects.filter(p => p.featured).length
    const totalInquiries = this.data.inquiries.length
    const unreadInquiries = this.data.inquiries.filter(i => !i.is_read).length
    const totalLogins = this.data.login_activity.length
    const recentInquiries = this.data.inquiries.slice(0, 5)
    const recentLogins = this.data.login_activity.slice(0, 5)
    const recentUsers = (await this.getUsers()).slice(-5).reverse()

    return {
      totalUsers,
      totalProjects,
      featuredProjects,
      totalInquiries,
      unreadInquiries,
      totalLogins,
      recentInquiries,
      recentLogins,
      recentUsers,
      storageType: 'Local JSON Store',
    }
  }
}

export const db = new DatabaseManager()
