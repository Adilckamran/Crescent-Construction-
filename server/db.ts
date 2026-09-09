import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

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

function getInitialProjects(): Project[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'proj-1',
      title: 'Luxury Villa Grey Structure',
      slug: 'luxury-villa-grey-structure',
      category: 'Grey Structure',
      location: 'DHA Phase 8, Karachi',
      status: 'Completed',
      short_desc: 'Reinforced concrete framing, engineered columns, foundation footings and beam layout to seismic standards.',
      full_desc: 'Comprehensive grey structure execution for a high-end multi-storey private villa located in DHA Phase 8. Engineered under rigorous quality control standards using high-grade deformed steel and certified ready-mix concrete. Includes basement retaining walls, raft foundation, shear walls, and structural columns with precision alignment.',
      images: ['/uploads/project-2.jpg', '/uploads/project-3.jpg', '/uploads/project-4.jpg'],
      featured: true,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-2',
      title: 'Commercial Plaza Structural Framing',
      slug: 'commercial-plaza-structural-framing',
      category: 'Grey Structure',
      location: 'Bahria Town, Karachi',
      status: 'In Progress',
      short_desc: 'Heavy-duty commercial framing with wide-span concrete slabs and elevated parking structure.',
      full_desc: 'Multi-level commercial structure designed for commercial retail on ground floors and corporate executive suites on upper levels. Our team is executing structural concrete works, MEP conduits cast-in-slab, and specialized concrete vibratory curing to guarantee zero honeycombing and maximum load capacity.',
      images: ['/uploads/project-3.jpg', '/uploads/project-4.jpg', '/uploads/project-12.jpg'],
      featured: true,
      completion_year: '2025',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-3',
      title: 'Engineered Foundation & Piling',
      slug: 'engineered-foundation-piling',
      category: 'Grey Structure',
      location: 'Clifton Block 4, Karachi',
      status: 'Completed',
      short_desc: 'Sub-surface soil treatment, deep reinforced footings, and moisture barrier integration.',
      full_desc: 'Specialized foundation excavation and raft foundation engineering in coastal soil conditions. Engineered with sulfate-resistant cement, double-layer waterproofing membrane, and continuous structural soil compaction to ensure long-term stability against coastal groundwater pressure.',
      images: ['/uploads/project-4.jpg', '/uploads/project-2.jpg', '/uploads/project-8.jpg'],
      featured: false,
      completion_year: '2023',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-4',
      title: 'Contemporary Residence Construction',
      slug: 'contemporary-residence-construction',
      category: 'Residential',
      location: 'Gulshan-e-Iqbal Block 13-D, Karachi',
      status: 'Completed',
      short_desc: 'Turnkey residential home build spanning 500 sq yds with contemporary aesthetic design and high-end finishes.',
      full_desc: 'Turnkey construction of an elegant modern residence in Gulshan-e-Iqbal. Delivered from bare ground to complete turnkey handover including grey structure, exterior rendering, thermal insulation, luxury porcelain tile installations, custom hardwood doors, and concealed plumbing/electrical works.',
      images: ['/uploads/project-5.jpg', '/uploads/project-8.jpg', '/uploads/project-11.jpg', '/uploads/project-15.jpg'],
      featured: true,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-5',
      title: 'Commercial Executive Complex Finishing',
      slug: 'commercial-executive-complex-finishing',
      category: 'Commercial',
      location: 'PECHS Block 6, Karachi',
      status: 'Completed',
      short_desc: 'Comprehensive architectural finishing, modern facade work, and executive interior fit-outs.',
      full_desc: 'High-end interior and exterior finishing for a multi-tenant corporate office building in PECHS. Project included structural glazing support framing, Italian porcelain lobbies, acoustic ceiling panels, and precision drywall partitions.',
      images: ['/uploads/project-6.jpg', '/uploads/project-9.jpg', '/uploads/project-13.jpg'],
      featured: true,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-6',
      title: 'Architectural Staircase & Interior Renovation',
      slug: 'architectural-staircase-renovation',
      category: 'Renovation',
      location: 'KDA Scheme 1, Karachi',
      status: 'Completed',
      short_desc: 'Structural alteration of load-bearing staircase, bespoke wooden steps, and glass balustrades.',
      full_desc: 'Structural remodeling and architectural staircase reconstruction inside an existing luxury estate. The project involved reinforcement of slab openings with structural steel beams, cantilevered concrete steps, and seamless tempered glass railing installations.',
      images: ['/uploads/project-7.jpg', '/uploads/project-10.jpg'],
      featured: false,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-7',
      title: 'Modern Single-Family Estate',
      slug: 'modern-single-family-estate',
      category: 'Residential',
      location: 'DHA Phase 6, Karachi',
      status: 'Completed',
      short_desc: 'Turnkey luxury villa construction featuring cantilevered terraces and high ceilings.',
      full_desc: 'Architecturally designed 1000 sq yd home featuring open-plan living zones, thermally broken aluminium windows, rooftop entertainment area, and sustainable greywater plumbing.',
      images: ['/uploads/project-8.jpg', '/uploads/project-5.jpg', '/uploads/project-15.jpg'],
      featured: true,
      completion_year: '2025',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-8',
      title: 'Retail Storefront & Showroom Fit-Out',
      slug: 'retail-storefront-showroom-fit-out',
      category: 'Commercial',
      location: 'Tariq Road Commercial Area, Karachi',
      status: 'Completed',
      short_desc: 'Turnkey retail space renovation, structural storefront expansion, and commercial floor leveling.',
      full_desc: 'Complete commercial fit-out for a flagship fashion showroom. Works entailed structural beam insertion to open up retail frontage, heavy-duty epoxy terrazzo flooring, custom architectural lighting conduits, and centralized air conditioning ductwork.',
      images: ['/uploads/project-9.jpg', '/uploads/project-6.jpg', '/uploads/project-14.jpg'],
      featured: false,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-9',
      title: 'Bespoke Gourmet Kitchen Remodel',
      slug: 'bespoke-gourmet-kitchen-remodel',
      category: 'Renovation',
      location: 'Clifton Block 2, Karachi',
      status: 'Completed',
      short_desc: 'Structural masonry adjustments, concealed utility upgrades, and designer finish.',
      full_desc: 'Complete modernization of a spacious residential kitchen. We relocated plumbing and electrical mains, installed water-resistant backing boards, custom quartz countertops, and concealed ventilation exhausts.',
      images: ['/uploads/project-10.jpg', '/uploads/project-7.jpg'],
      featured: false,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-10',
      title: 'Multi-Unit Residential Development',
      slug: 'multi-unit-residential-development',
      category: 'Residential',
      location: 'Gulistan-e-Jauhar, Karachi',
      status: 'In Progress',
      short_desc: 'Multi-family residential complex with basement parking and premium apartments.',
      full_desc: 'Five-storey residential structure incorporating earthquake-resistant framing, underground water reservoir with membrane waterproofing, and overhead water tank casting.',
      images: ['/uploads/project-11.jpg', '/uploads/project-1.jpg', '/uploads/project-15.jpg'],
      featured: false,
      completion_year: '2025',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-11',
      title: 'Corporate Headquarters Facility',
      slug: 'corporate-headquarters-facility',
      category: 'Commercial',
      location: 'I.I. Chundrigar Road, Karachi',
      status: 'Completed',
      short_desc: 'Structural upgrading, floor rehabilitation, and modernization of financial institution offices.',
      full_desc: 'Structural retrofitting of an existing corporate office facility to enhance safety and modernize spatial flow. Work included carbon-fiber reinforced polymer (CFRP) beam strengthening, high-traffic fire-rated doors, and floor screeding.',
      images: ['/uploads/project-12.jpg', '/uploads/project-13.jpg', '/uploads/project-14.jpg'],
      featured: true,
      completion_year: '2023',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-12',
      title: 'Commercial Distribution Centre',
      slug: 'commercial-distribution-centre',
      category: 'Commercial',
      location: 'SITE Industrial Area, Karachi',
      status: 'Completed',
      short_desc: 'Heavy-duty industrial concrete slab casting with hardener topping and high-load civil boundary works.',
      full_desc: 'Industrial distribution facility construction covering 25,000 sq ft. Features laser-screeded concrete floors with metallic dry-shake hardeners for forklift traffic, reinforced loading bays, and deep drainage culverts.',
      images: ['/uploads/project-13.jpg', '/uploads/project-14.jpg'],
      featured: false,
      completion_year: '2023',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-13',
      title: 'Modern Office Tower Level Fit-Out',
      slug: 'modern-office-tower-level-fit-out',
      category: 'Commercial',
      location: 'Clifton Harbour Front, Karachi',
      status: 'Completed',
      short_desc: 'Full floor commercial execution with modern glass partitions and acoustic ceilings.',
      full_desc: 'Executive commercial interior construction completed on tight schedules. Included precision raised access flooring, server room fire-suppression structural barriers, and contemporary conference facilities.',
      images: ['/uploads/project-14.jpg', '/uploads/project-9.jpg', '/uploads/project-6.jpg'],
      featured: false,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-14',
      title: 'Private Custom Residence',
      slug: 'private-custom-residence',
      category: 'Residential',
      location: 'Navy Housing Scheme, Karachi',
      status: 'Completed',
      short_desc: 'Bespoke two-storey family residence built with top-tier brick masonry and custom finishes.',
      full_desc: 'Custom residential villa constructed with high attention to structural longevity and thermal comfort. Includes hollow-block exterior envelope for insulation, waterproofing across all wet zones, and premium woodwork.',
      images: ['/uploads/project-15.jpg', '/uploads/project-5.jpg', '/uploads/project-8.jpg'],
      featured: false,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'proj-15',
      title: 'High-Performance Roof & Terrace Waterproofing',
      slug: 'high-performance-waterproofing',
      category: 'Waterproofing',
      location: 'DHA Phase 5, Karachi',
      status: 'Completed',
      short_desc: 'Multi-layer elastomeric polymer and bitumen membrane waterproofing for 600 sq yd terrace.',
      full_desc: 'Specialized chemical waterproofing application targeting heavy monsoon leakage and thermal expansion. Surface preparation included crack stitching, polymer-modified cementitious basecoat, heavy-gauge APP bituminous membrane torching, and protective screed laying with slope correction.',
      images: ['/uploads/project-17.jpg', '/uploads/project-1.jpg'],
      featured: true,
      completion_year: '2024',
      created_at: now,
      updated_at: now,
    },
  ]
}

function getInitialServices(): ServiceItem[] {
  return [
    {
      id: 'srv-1',
      number: '01',
      title: 'Grey Structure',
      desc: 'Column, beam, slab and structural framing carried out to engineering specification.',
      icon_name: 'Building2',
      sort_order: 1,
    },
    {
      id: 'srv-2',
      number: '02',
      title: 'Complete House Construction',
      desc: 'End-to-end residential builds — from foundation to final handover.',
      icon_name: 'Home',
      sort_order: 2,
    },
    {
      id: 'srv-3',
      number: '03',
      title: 'Civil Works',
      desc: 'Site development, boundary walls, drainage and general civil engineering works.',
      icon_name: 'Trowel',
      sort_order: 3,
    },
    {
      id: 'srv-4',
      number: '04',
      title: 'Structural & Concrete Work',
      desc: 'Reinforced concrete work engineered for load-bearing accuracy and durability.',
      icon_name: 'Boxes',
      sort_order: 4,
    },
    {
      id: 'srv-5',
      number: '05',
      title: 'Waterproofing',
      desc: 'Roof, terrace, basement and water-tank waterproofing against seepage and damage.',
      icon_name: 'Droplets',
      sort_order: 5,
    },
    {
      id: 'srv-6',
      number: '06',
      title: 'Foundation Work',
      desc: 'Footings and foundation systems engineered for site-specific soil conditions.',
      icon_name: 'Layers',
      sort_order: 6,
    },
    {
      id: 'srv-7',
      number: '07',
      title: 'Renovation',
      desc: 'Structural and cosmetic renovation for existing residential and commercial spaces.',
      icon_name: 'Hammer',
      sort_order: 7,
    },
    {
      id: 'srv-8',
      number: '08',
      title: 'Finishing Works',
      desc: 'Flooring, plaster, paint and interior finishing carried through to final detail.',
      icon_name: 'Paintbrush',
      sort_order: 8,
    },
    {
      id: 'srv-9',
      number: '09',
      title: 'Structural Drawing Review',
      desc: 'Reviewing drawings before construction begins to check coordination and clarify structural requirements.',
      icon_name: 'FileCheck',
      cta: 'Discuss Your Project',
      sort_order: 9,
    },
  ]
}

function getInitialTestimonials(): TestimonialItem[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'test-1',
      label: 'Residential Villa Owner',
      type: 'Residential Construction Client',
      location: 'DHA Phase 8, Karachi',
      quote: 'Crescent Construction handled our house grey structure with absolute professionalism. The structural engineer visited regularly, concrete testing was documented, and milestones were finished on schedule.',
      is_sample: false,
      rating: 5,
      created_at: now,
    },
    {
      id: 'test-2',
      label: 'Commercial Developer',
      type: 'Commercial Construction Client',
      location: 'Gulshan-e-Iqbal, Karachi',
      quote: 'Exceptional transparency regarding material procurement and engineering adherence. Finding honest contractors in Karachi is challenging; Crescent Construction earned our full trust.',
      is_sample: false,
      rating: 5,
      created_at: now,
    },
    {
      id: 'test-3',
      label: 'Homeowner',
      type: 'Waterproofing & Renovation Client',
      location: 'Clifton, Karachi',
      quote: 'We had persistent terrace seepage during monsoons for years. Crescent Construction diagnosed the root cause, applied multi-layer membrane waterproofing, and solved the problem permanently.',
      is_sample: false,
      rating: 5,
      created_at: now,
    },
  ]
}

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
    this.ensureInitialData()
  }

  private getDefaultSchema(): DatabaseSchema {
    return {
      users: [],
      projects: getInitialProjects(),
      inquiries: [],
      services: getInitialServices(),
      testimonials: getInitialTestimonials(),
      login_activity: [],
    }
  }

  private save(): void {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8')
      fs.renameSync(tempPath, DB_FILE)
    } catch (err) {
      console.error('Failed to atomically write DB file:', err)
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
    }
  }

  public ensureAdminAccount(): void {
    const adminEmail = (process.env.ADMIN_EMAIL || 'crescentconstructionofficial@gmail.com').toLowerCase().trim()
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'CrescentAdmin2026!'
    
    let admin = this.data.users.find(u => u.email.toLowerCase() === adminEmail)
    if (!admin) {
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
      console.log(`[DB] Seeded default administrator account: ${adminEmail}`)
    } else if (admin.role !== 'admin') {
      admin.role = 'admin'
      this.save()
    }
  }

  public ensureInitialData(): void {
    let changed = false
    if (!this.data.projects || this.data.projects.length === 0) {
      this.data.projects = getInitialProjects()
      changed = true
    }
    if (!this.data.services || this.data.services.length === 0) {
      this.data.services = getInitialServices()
      changed = true
    }
    if (!this.data.testimonials || this.data.testimonials.length === 0) {
      this.data.testimonials = getInitialTestimonials()
      changed = true
    }
    if (!this.data.inquiries) {
      this.data.inquiries = []
      changed = true
    }
    if (!this.data.login_activity) {
      this.data.login_activity = []
      changed = true
    }
    if (changed) {
      this.save()
    }
  }

  // User methods
  public getUsers(): Omit<User, 'password_hash'>[] {
    return this.data.users.map(({ password_hash, ...rest }) => rest)
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id)
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
  }

  public createUser(user: Omit<User, 'id' | 'created_at' | 'last_login_at'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      last_login_at: null,
    }
    this.data.users.push(newUser)
    this.save()
    return newUser
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id)
    if (idx === -1) return null
    this.data.users[idx] = { ...this.data.users[idx], ...updates }
    this.save()
    return this.data.users[idx]
  }

  public deleteUser(id: string): boolean {
    const before = this.data.users.length
    this.data.users = this.data.users.filter(u => u.id !== id)
    if (this.data.users.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // Project methods
  public getProjects(filter?: { category?: string; featured?: boolean; search?: string }): Project[] {
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

  public getProjectByIdOrSlug(idOrSlug: string): Project | undefined {
    return this.data.projects.find(p => p.id === idOrSlug || p.slug === idOrSlug)
  }

  public createProject(proj: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const now = new Date().toISOString()
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      created_at: now,
      updated_at: now,
    }
    this.data.projects.unshift(newProj)
    this.save()
    return newProj
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.data.projects.findIndex(p => p.id === id)
    if (idx === -1) return null
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    this.save()
    return this.data.projects[idx]
  }

  public deleteProject(id: string): boolean {
    const before = this.data.projects.length
    this.data.projects = this.data.projects.filter(p => p.id !== id)
    if (this.data.projects.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // Inquiry methods
  public getInquiries(filter?: { unreadOnly?: boolean; search?: string }): ContactInquiry[] {
    let list = [...this.data.inquiries]
    if (filter?.unreadOnly) {
      list = list.filter(i => !i.is_read)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  public getInquiryById(id: string): ContactInquiry | undefined {
    return this.data.inquiries.find(i => i.id === id)
  }

  public createInquiry(inquiry: Omit<ContactInquiry, 'id' | 'created_at' | 'is_read'>): ContactInquiry {
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    this.data.inquiries.unshift(newInquiry)
    this.save()
    return newInquiry
  }

  public updateInquiry(id: string, updates: Partial<ContactInquiry>): ContactInquiry | null {
    const idx = this.data.inquiries.findIndex(i => i.id === id)
    if (idx === -1) return null
    this.data.inquiries[idx] = { ...this.data.inquiries[idx], ...updates }
    this.save()
    return this.data.inquiries[idx]
  }

  public deleteInquiry(id: string): boolean {
    const before = this.data.inquiries.length
    this.data.inquiries = this.data.inquiries.filter(i => i.id !== id)
    if (this.data.inquiries.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // Services methods
  public getServices(): ServiceItem[] {
    return [...this.data.services].sort((a, b) => a.sort_order - b.sort_order)
  }

  public createService(srv: Omit<ServiceItem, 'id'>): ServiceItem {
    const newSrv: ServiceItem = {
      ...srv,
      id: `srv-${Date.now()}`,
    }
    this.data.services.push(newSrv)
    this.save()
    return newSrv
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.data.services.findIndex(s => s.id === id)
    if (idx === -1) return null
    this.data.services[idx] = { ...this.data.services[idx], ...updates }
    this.save()
    return this.data.services[idx]
  }

  public deleteService(id: string): boolean {
    const before = this.data.services.length
    this.data.services = this.data.services.filter(s => s.id !== id)
    if (this.data.services.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // Testimonials methods
  public getTestimonials(): TestimonialItem[] {
    return [...this.data.testimonials].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  public createTestimonial(t: Omit<TestimonialItem, 'id' | 'created_at'>): TestimonialItem {
    const newT: TestimonialItem = {
      ...t,
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    this.data.testimonials.unshift(newT)
    this.save()
    return newT
  }

  public updateTestimonial(id: string, updates: Partial<TestimonialItem>): TestimonialItem | null {
    const idx = this.data.testimonials.findIndex(t => t.id === id)
    if (idx === -1) return null
    this.data.testimonials[idx] = { ...this.data.testimonials[idx], ...updates }
    this.save()
    return this.data.testimonials[idx]
  }

  public deleteTestimonial(id: string): boolean {
    const before = this.data.testimonials.length
    this.data.testimonials = this.data.testimonials.filter(t => t.id !== id)
    if (this.data.testimonials.length !== before) {
      this.save()
      return true
    }
    return false
  }

  // Login activity methods
  public recordLoginActivity(activity: Omit<LoginActivity, 'id' | 'created_at'>): LoginActivity {
    const item: LoginActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    }
    this.data.login_activity.unshift(item)
    // Keep last 1000 activity items
    if (this.data.login_activity.length > 1000) {
      this.data.login_activity = this.data.login_activity.slice(0, 1000)
    }
    this.save()
    return item
  }

  public getLoginActivity(limit = 100): LoginActivity[] {
    return this.data.login_activity.slice(0, limit)
  }

  // Stats
  public getStats() {
    const totalUsers = this.data.users.length
    const totalProjects = this.data.projects.length
    const featuredProjects = this.data.projects.filter(p => p.featured).length
    const totalInquiries = this.data.inquiries.length
    const unreadInquiries = this.data.inquiries.filter(i => !i.is_read).length
    const totalLogins = this.data.login_activity.length
    const recentInquiries = this.data.inquiries.slice(0, 5)
    const recentLogins = this.data.login_activity.slice(0, 5)
    const recentUsers = this.getUsers().slice(-5).reverse()

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
    }
  }
}

export const db = new DatabaseManager()
