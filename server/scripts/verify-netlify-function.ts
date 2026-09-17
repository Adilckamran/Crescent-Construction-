import dotenv from 'dotenv'
dotenv.config()

import { handler } from '../../netlify/functions/api'

async function runNetlifyFunctionTests() {
  console.log('====================================================')
  console.log(' TESTING NETLIFY SERVERLESS FUNCTION HANDLER')
  console.log('====================================================')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, name: string, details?: any) {
    if (condition) {
      console.log(`  [PASS] ${name}`)
      passed++
    } else {
      console.error(`  [FAIL] ${name}`, details || '')
      failed++
    }
  }

  // Helper to create mock Netlify/Lambda events
  function makeEvent(httpMethod: string, path: string, body?: any, headers: Record<string, string> = {}) {
    const isJson = body && typeof body === 'object'
    return {
      httpMethod,
      path,
      headers: {
        'content-type': isJson ? 'application/json' : 'text/plain',
        ...headers,
      },
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      body: isJson ? JSON.stringify(body) : body || '',
      isBase64Encoded: false,
    } as any
  }

  try {
    // Test 1: Health check via /api/health
    const healthEvent = makeEvent('GET', '/api/health')
    const healthRes = await (handler as any)(healthEvent, {} as any)
    const healthData = JSON.parse(healthRes.body || '{}')
    assert(healthRes.statusCode === 200 && healthData.status === 'ok', 'GET /api/health returns 200 OK')

    // Test 2: Netlify rewrite path /.netlify/functions/api/health
    const rewrittenEvent = makeEvent('GET', '/.netlify/functions/api/health')
    const rewrittenRes = await (handler as any)(rewrittenEvent, {} as any)
    const rewrittenData = JSON.parse(rewrittenRes.body || '{}')
    assert(rewrittenRes.statusCode === 200 && rewrittenData.status === 'ok', 'GET /.netlify/functions/api/health path rewrite is functional')

    // Test 3: Public projects via serverless function
    const projEvent = makeEvent('GET', '/.netlify/functions/api/projects')
    const projRes = await (handler as any)(projEvent, {} as any)
    const projData = JSON.parse(projRes.body || '{}')
    assert(projRes.statusCode === 200 && Array.isArray(projData.projects), 'GET /.netlify/functions/api/projects returns projects list')
    assert(projData.projects?.length > 0, `Projects count in Supabase: ${projData.projects?.length}`)

    // Test 4: Services list
    const servEvent = makeEvent('GET', '/.netlify/functions/api/services')
    const servRes = await (handler as any)(servEvent, {} as any)
    const servData = JSON.parse(servRes.body || '{}')
    assert(servRes.statusCode === 200 && Array.isArray(servData.services), 'GET /.netlify/functions/api/services returns services list')

    // Test 5: Testimonials list
    const testEvent = makeEvent('GET', '/.netlify/functions/api/testimonials')
    const testRes = await (handler as any)(testEvent, {} as any)
    const testData = JSON.parse(testRes.body || '{}')
    assert(testRes.statusCode === 200 && Array.isArray(testData.testimonials), 'GET /.netlify/functions/api/testimonials returns testimonials list')

    // Test 6: Admin Login via serverless function
    const adminEmail = (process.env.ADMIN_EMAIL || 'crescentconstructionofficial@gmail.com').toLowerCase().trim()
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'CrescentAdmin2026!'
    const loginEvent = makeEvent('POST', '/.netlify/functions/api/auth/login', {
      email: adminEmail,
      password: defaultPassword,
    })
    const loginRes = await (handler as any)(loginEvent, {} as any)
    const loginData = JSON.parse(loginRes.body || '{}')
    assert(loginRes.statusCode === 200 && !!loginData.token, 'POST /.netlify/functions/api/auth/login succeeds & returns JWT token')
    const token = loginData.token

    // Test 7: Authenticated me
    const meEvent = makeEvent('GET', '/.netlify/functions/api/auth/me', undefined, {
      authorization: `Bearer ${token}`,
    })
    const meRes = await (handler as any)(meEvent, {} as any)
    const meData = JSON.parse(meRes.body || '{}')
    assert(meRes.statusCode === 200 && meData.user?.role === 'admin', 'GET /.netlify/functions/api/auth/me returns admin user')

    // Test 8: Admin stats
    const statsEvent = makeEvent('GET', '/.netlify/functions/api/admin/stats', undefined, {
      authorization: `Bearer ${token}`,
    })
    const statsRes = await (handler as any)(statsEvent, {} as any)
    const statsData = JSON.parse(statsRes.body || '{}')
    assert(statsRes.statusCode === 200 && typeof statsData.totalProjects === 'number', 'GET /.netlify/functions/api/admin/stats returns statistics')
    console.log(`  * Active Storage Type: ${statsData.storageType}`)

    // Test 9: Contact form submission via serverless function
    const contactEvent = makeEvent('POST', '/.netlify/functions/api/contact', {
      name: 'Netlify Serverless Test Visitor',
      phone: '03272834501',
      email: 'crescentconstructionofficial@gmail.com',
      project_type: 'Commercial Construction',
      location: 'Karachi, Pakistan',
      budget: 'PKR 1 Crore',
      message: 'Testing contact inquiry pipeline inside Netlify serverless function.',
    })
    const contactRes = await (handler as any)(contactEvent, {} as any)
    const contactData = JSON.parse(contactRes.body || '{}')
    assert(contactRes.statusCode === 201 && !!contactData.inquiryId, 'POST /.netlify/functions/api/contact saves inquiry in Supabase')

    // Test 10: Create project via serverless function
    const createProjEvent = makeEvent('POST', '/.netlify/functions/api/projects', {
      title: 'Netlify Test Project',
      category: 'Residential',
      location: 'Clifton, Karachi',
      short_desc: 'Testing Netlify Serverless project creation.',
      full_desc: 'Detailed description for test project in Netlify serverless execution.',
      completion_year: '2026',
      featured: false,
      images: ['https://cmqhdyjtqreimwldtraw.supabase.co/storage/v1/object/public/projects/project-1.jpg'],
    }, {
      authorization: `Bearer ${token}`,
    })
    const createProjRes = await (handler as any)(createProjEvent, {} as any)
    const createProjData = JSON.parse(createProjRes.body || '{}')
    assert(createProjRes.statusCode === 201 && !!createProjData.project?.id, 'POST /.netlify/functions/api/projects creates project in Supabase')
    const createdId = createProjData.project?.id

    // Test 11: Cleanup created project
    if (createdId) {
      const delEvent = makeEvent('DELETE', `/.netlify/functions/api/projects/${createdId}`, undefined, {
        authorization: `Bearer ${token}`,
      })
      const delRes = await (handler as any)(delEvent, {} as any)
      assert(delRes.statusCode === 200, 'DELETE /.netlify/functions/api/projects/:id cleans up project')
    }

    // Test 12: Image Upload via Netlify Function
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2)
    const rawMultipart = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="images"; filename="netlify-test.png"',
      'Content-Type: image/png',
      '',
      'FAKE_IMAGE_BINARY_DATA',
      `--${boundary}--`,
      '',
    ].join('\r\n')

    const uploadEvent = {
      httpMethod: 'POST',
      path: '/.netlify/functions/api/upload',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        authorization: `Bearer ${token}`,
      },
      body: Buffer.from(rawMultipart).toString('base64'),
      isBase64Encoded: true,
    } as any

    const uploadRes = await (handler as any)(uploadEvent, {} as any)
    const uploadData = JSON.parse(uploadRes.body || '{}')
    assert(
      uploadRes.statusCode === 200 && Array.isArray(uploadData.urls) && uploadData.urls.length > 0,
      'POST /.netlify/functions/api/upload processes multipart image and uploads to Supabase Storage'
    )
    console.log(`  * Serverless Uploaded CDN URL: ${uploadData.urls?.[0]}`)

    // Cleanup uploaded test image from Supabase Storage
    if (uploadData.urls?.[0]) {
      const { supabase, STORAGE_BUCKET } = await import('../supabase')
      if (supabase) {
        const fname = uploadData.urls[0].split('/').pop()?.split('?')[0]
        if (fname) {
          await supabase.storage.from(STORAGE_BUCKET).remove([fname])
        }
      }
    }

  } catch (err) {
    console.error('Test suite caught exception:', err)
    failed++
  }

  console.log('====================================================')
  console.log(` RESULTS: ${passed} passed, ${failed} failed`)
  console.log('====================================================')
  process.exit(failed > 0 ? 1 : 0)
}

runNetlifyFunctionTests()
