import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { authRouter } from '../routes/auth'
import { projectsRouter } from '../routes/projects'
import { inquiriesRouter } from '../routes/inquiries'
import { uploadRouter } from '../routes/upload'
import { servicesRouter } from '../routes/services'
import { testimonialsRouter } from '../routes/testimonials'
import { usersRouter } from '../routes/users'
import { statsRouter } from '../routes/stats'
import { isSupabaseConfigured } from '../supabase'

async function runTests() {
  console.log('==================================================')
  console.log(' RUNNING CRESCENT FULL-STACK INTEGRATION SUITE')
  console.log('==================================================')

  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '15mb' }))
  app.use(express.urlencoded({ extended: true, limit: '15mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Crescent Construction API' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/projects', projectsRouter)
  app.use('/api/contact', inquiriesRouter)
  app.use('/api/admin/inquiries', inquiriesRouter)
  app.use('/api/admin/users', usersRouter)
  app.use('/api/admin/stats', statsRouter)
  app.use('/api/services', servicesRouter)
  app.use('/api/testimonials', testimonialsRouter)
  app.use('/api/upload', uploadRouter)

  const server = app.listen(5099)
  const baseUrl = 'http://localhost:5099'

  let testsPassed = 0
  let testsFailed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`)
      testsPassed++
    } else {
      console.error(`  [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`)
      testsFailed++
    }
  }

  try {
    // Test 1: Health check
    const healthRes = await fetch(`${baseUrl}/api/health`)
    const healthJson = await healthRes.json()
    assert(healthRes.status === 200 && healthJson.status === 'ok', 'GET /api/health returns 200 OK')

    // Test 2: Dual Engine status
    console.log(`\n  * Dual Engine Status: isSupabaseConfigured() = ${isSupabaseConfigured()}`)
    assert(typeof isSupabaseConfigured() === 'boolean', 'Dual Engine configuration detection is operational')

    // Test 3: Public Projects list
    const projRes = await fetch(`${baseUrl}/api/projects`)
    const projJson = await projRes.json()
    assert(projRes.status === 200 && Array.isArray(projJson.projects), 'GET /api/projects returns projects array')
    assert(projJson.projects.length > 0, `GET /api/projects has records (found ${projJson.projects?.length || 0})`)

    // Test 4: Public Services list
    const servRes = await fetch(`${baseUrl}/api/services`)
    const servJson = await servRes.json()
    assert(servRes.status === 200 && Array.isArray(servJson.services), 'GET /api/services returns services array')

    // Test 5: Public Testimonials list
    const testRes = await fetch(`${baseUrl}/api/testimonials`)
    const testJson = await testRes.json()
    assert(testRes.status === 200 && Array.isArray(testJson.testimonials), 'GET /api/testimonials returns testimonials array')

    // Test 6: Admin Login
    const adminEmail = (process.env.ADMIN_EMAIL || 'crescentconstructionofficial@gmail.com').toLowerCase().trim()
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'CrescentAdmin2026!'
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: defaultPassword }),
    })
    const loginJson = await loginRes.json()
    assert(loginRes.status === 200 && !!loginJson.token, 'POST /api/auth/login returns JWT token for admin')
    const token = loginJson.token

    // Test 7: Admin Session Me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const meJson = await meRes.json()
    assert(meRes.status === 200 && meJson.user?.role === 'admin', 'GET /api/auth/me returns admin role')

    // Test 8: Admin Stats
    const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const statsJson = await statsRes.json()
    assert(statsRes.status === 200 && typeof statsJson.totalProjects === 'number', 'GET /api/admin/stats returns statistics dashboard data')
    console.log(`  * Storage Type reported in stats: "${statsJson.storageType}"`)

    // Test 9: Public Contact / Inquiry Submission
    const contactRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Visitor',
        email: 'test.visitor@example.com',
        phone: '03001234567',
        project_type: 'Residential Construction',
        location: 'Karachi, DHA',
        message: 'This is an automated test inquiry verifying the contact form pipeline.',
      }),
    })
    const contactJson = await contactRes.json()
    assert(contactRes.status === 201 && !!contactJson.inquiryId, 'POST /api/contact saves inquiry successfully')

    // Test 10: Admin Project Creation Flow
    const newProjRes = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Automated Test Tower',
        category: 'Commercial',
        location: 'Clifton Block 5, Karachi',
        short_desc: 'High-end commercial structure built with reinforced concrete framing.',
        full_desc: 'High-end commercial structure built with reinforced concrete framing and energy-efficient glazing.',
        completion_year: '2026',
        status: 'Completed',
        featured: false,
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'],
      }),
    })
    const newProjJson = await newProjRes.json()
    assert(newProjRes.status === 201 && !!newProjJson.project?.id, 'POST /api/projects creates project in database')
    const createdId = newProjJson.project?.id

    // Test 11: Fetch Single Project by Slug or ID
    const singleProjRes = await fetch(`${baseUrl}/api/projects/${createdId}`)
    const singleProjJson = await singleProjRes.json()
    assert(singleProjRes.status === 200 && singleProjJson.project?.title === 'Automated Test Tower', 'GET /api/projects/:idOrSlug retrieves project')

    // Test 12: Delete Project
    const delProjRes = await fetch(`${baseUrl}/api/projects/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    assert(delProjRes.status === 200, 'DELETE /api/projects/:id deletes project successfully')

    // Test 13: Image Upload endpoint
    const formData = new FormData()
    const dummyBlob = new Blob(['PNG_FAKE_IMAGE_CONTENT'], { type: 'image/png' })
    formData.append('images', dummyBlob, 'test-upload.png')

    const uploadRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const uploadJson = await uploadRes.json()
    assert(
      uploadRes.status === 200 && Array.isArray(uploadJson.urls) && uploadJson.urls.length > 0,
      'POST /api/upload uploads images and returns valid URLs'
    )
    console.log(`  * Uploaded URL returned: ${uploadJson.urls?.[0]}`)

  } catch (err) {
    console.error('Test Suite encountered unexpected error:', err)
    testsFailed++
  } finally {
    server.close()
    console.log('==================================================')
    console.log(` RESULTS: ${testsPassed} passed, ${testsFailed} failed`)
    console.log('==================================================')
    process.exit(testsFailed > 0 ? 1 : 0)
  }
}

runTests()
