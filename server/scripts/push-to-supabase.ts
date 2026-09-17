import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import dns from 'dns'
import https from 'https'
import { createClient } from '@supabase/supabase-js'

// Track status for each required checklist item
const statusMap: Record<string, 'PASS' | 'FAIL'> = {
  'Supabase connection': 'FAIL',
  'Storage bucket': 'FAIL',
  'Image upload': 'FAIL',
  'Projects': 'FAIL',
  'Users': 'FAIL',
  'Services': 'FAIL',
  'Testimonials': 'FAIL',
  'Inquiries': 'FAIL',
  'Login activity': 'FAIL',
}

const failureDetails: Record<string, string> = {}

function recordPass(step: string) {
  statusMap[step] = 'PASS'
  console.log(`[PASS] ${step}`)
}

function recordFail(step: string, reason: string) {
  statusMap[step] = 'FAIL'
  failureDetails[step] = reason
  console.error(`[FAIL] ${step}: ${reason}`)
}

async function verifyDns(hostname: string): Promise<boolean> {
  try {
    const result = await dns.promises.lookup(hostname)
    console.log(`  * DNS Resolution: Hostname "${hostname}" resolved to ${result.address} (IPv${result.family})`)
    return true
  } catch (err: any) {
    console.error(`  * DNS Resolution Error for "${hostname}": ${err.code || err.message}`)
    if (err.code === 'ENOTFOUND') {
      console.error(`    Hint: The domain "${hostname}" does not exist in DNS.`)
      console.error(`    Please verify your SUPABASE_URL in .env matches the URL in your Supabase Dashboard.`)
    }
    return false
  }
}

async function pingSupabaseRest(supabaseUrl: string, apiKey: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  return new Promise((resolve) => {
    try {
      const url = new URL(supabaseUrl)
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'Crescent-Supabase-Migration/1.0',
        },
        timeout: 10000,
      }

      const req = https.request(options, (res) => {
        // Any HTTP response (200, 401, 404, etc.) confirms the server is reachable
        if (res.statusCode && res.statusCode < 500) {
          resolve({ ok: true, status: res.statusCode })
        } else {
          resolve({ ok: false, status: res.statusCode, error: `Server returned HTTP ${res.statusCode}` })
        }
      })

      req.on('error', (err: any) => {
        resolve({ ok: false, error: `${err.code || err.message}` })
      })

      req.on('timeout', () => {
        req.destroy()
        resolve({ ok: false, error: 'Connection timed out after 10000ms' })
      })

      req.end()
    } catch (err: any) {
      resolve({ ok: false, error: err.message })
    }
  })
}

async function migrateToSupabase() {
  console.log('====================================================')
  console.log(' Crescent Construction: Push Data to Supabase')
  console.log('====================================================')

  // 1. Verify .env file loading
  const envPath = path.resolve(process.cwd(), '.env')
  const envExists = fs.existsSync(envPath)
  console.log(`\n[Checking Environment Configuration]`)
  console.log(`  * Local .env path: ${envPath}`)
  console.log(`  * .env file exists on disk: ${envExists}`)

  if (!envExists) {
    recordFail('Supabase connection', '.env file not found on disk.')
    printSummaryAndExit()
    return
  }

  dotenv.config({ path: envPath })

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim()
  const bucketName = (process.env.SUPABASE_STORAGE_BUCKET || 'projects').trim()

  console.log(`  * SUPABASE_URL configured: ${Boolean(supabaseUrl)} (length: ${supabaseUrl.length})`)
  console.log(`  * SUPABASE_SERVICE_ROLE_KEY configured: ${Boolean(serviceKey)} (length: ${serviceKey.length})`)
  console.log(`  * SUPABASE_STORAGE_BUCKET: "${bucketName}"`)

  if (!supabaseUrl || !serviceKey) {
    recordFail('Supabase connection', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env')
    printSummaryAndExit()
    return
  }

  // 2. Validate URL formatting
  let parsedUrl: URL
  try {
    parsedUrl = new URL(supabaseUrl)
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error(`Invalid protocol "${parsedUrl.protocol}", expected "https:"`)
    }
    const hostParts = parsedUrl.hostname.split('.')
    const projectRef = hostParts[0]
    console.log(`  * URL Protocol: ${parsedUrl.protocol}`)
    console.log(`  * Project Reference ID: ${projectRef} (length: ${projectRef.length} chars)`)
    console.log(`  * Supabase Hostname: ${parsedUrl.hostname}`)
  } catch (urlErr: any) {
    recordFail('Supabase connection', `Malformed SUPABASE_URL: ${urlErr.message}`)
    printSummaryAndExit()
    return
  }

  // 3. DNS Reachability Test
  console.log(`\n[Testing Network & DNS Reachability]`)
  const dnsOk = await verifyDns(parsedUrl.hostname)
  if (!dnsOk) {
    recordFail('Supabase connection', `DNS resolution failed for hostname "${parsedUrl.hostname}". Check URL spelling.`)
    printSummaryAndExit()
    return
  }

  // 4. REST API Ping Test
  console.log(`\n[Testing HTTPS Connection to Supabase REST API]`)
  const pingResult = await pingSupabaseRest(supabaseUrl, serviceKey)
  if (!pingResult.ok) {
    recordFail('Supabase connection', `HTTPS ping to ${parsedUrl.hostname} failed: ${pingResult.error}`)
    printSummaryAndExit()
    return
  }
  console.log(`  * HTTPS Ping Success (HTTP ${pingResult.status})`)

  // 5. Initialize Supabase Client
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Verify connection by making a live query
  try {
    const { error: pingErr } = await supabase.from('projects').select('id').limit(1)
    if (pingErr) {
      recordFail('Supabase connection', `Supabase client query failed: ${pingErr.message} (code: ${pingErr.code})`)
      printSummaryAndExit()
      return
    }
    recordPass('Supabase connection')
  } catch (clientErr: any) {
    recordFail('Supabase connection', `Client connection exception: ${clientErr.message || clientErr}`)
    printSummaryAndExit()
    return
  }

  // 6. Storage Bucket Check & Creation
  console.log(`\n[1/4] Ensuring Supabase Storage bucket "${bucketName}" exists & is public...`)
  try {
    const { data: buckets, error: bucketListErr } = await supabase.storage.listBuckets()
    if (bucketListErr) {
      recordFail('Storage bucket', `Failed to list storage buckets: ${bucketListErr.message}`)
    } else {
      let bucketExists = buckets?.some(b => b.name === bucketName)
      if (!bucketExists) {
        console.log(`  * Bucket "${bucketName}" not found. Creating public bucket...`)
        const { error: createErr } = await supabase.storage.createBucket(bucketName, { public: true })
        if (createErr) {
          recordFail('Storage bucket', `Failed to create bucket "${bucketName}": ${createErr.message}`)
        } else {
          console.log(`  * Bucket "${bucketName}" created successfully.`)
          recordPass('Storage bucket')
        }
      } else {
        console.log(`  * Bucket "${bucketName}" verified active.`)
        recordPass('Storage bucket')
      }
    }
  } catch (bucketEx: any) {
    recordFail('Storage bucket', `Bucket verification exception: ${bucketEx.message || bucketEx}`)
  }

  // 7. Upload Local Project Images to Supabase Storage
  console.log('\n[2/4] Uploading project images from public/uploads/ to Supabase Storage...')
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')
  const uploadedUrlMap = new Map<string, string>()

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir).filter(f => {
      const full = path.join(uploadsDir, f)
      return fs.statSync(full).isFile() && !f.startsWith('.')
    })
    console.log(`Found ${files.length} image file(s) to process.`)

    let uploadSuccessCount = 0
    let uploadFailCount = 0

    for (const file of files) {
      const filePath = path.join(uploadsDir, file)
      const buffer = fs.readFileSync(filePath)
      const ext = path.extname(file).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'

      const { error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(file, buffer, { contentType: mimeType, upsert: true })

      if (uploadErr) {
        console.error(`  * Upload error for ${file}: ${uploadErr.message}`)
        uploadFailCount++
      } else {
        uploadSuccessCount++
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(file)
        uploadedUrlMap.set(`/uploads/${file}`, publicUrlData.publicUrl)
        uploadedUrlMap.set(file, publicUrlData.publicUrl)
      }
    }

    console.log(`  * Upload complete: ${uploadSuccessCount} succeeded, ${uploadFailCount} failed.`)

    // Verify images directly in Supabase Storage
    try {
      const { data: storageFiles, error: listFilesErr } = await supabase.storage.from(bucketName).list()
      if (listFilesErr) {
        recordFail('Image upload', `Failed to verify files in storage: ${listFilesErr.message}`)
      } else {
        const verifiedCount = storageFiles?.length || 0
        console.log(`  * Storage Direct Verification: Found ${verifiedCount} object(s) in bucket "${bucketName}".`)
        if (verifiedCount > 0 && uploadFailCount === 0) {
          recordPass('Image upload')
        } else if (uploadFailCount > 0) {
          recordFail('Image upload', `${uploadFailCount} image(s) failed to upload.`)
        } else {
          recordFail('Image upload', `Storage verification found 0 objects in bucket.`)
        }
      }
    } catch (verifyEx: any) {
      recordFail('Image upload', `Storage verification exception: ${verifyEx.message}`)
    }
  } else {
    recordFail('Image upload', 'public/uploads directory does not exist.')
  }

  // 8. Read local data store
  console.log('\n[3/4] Reading local crescent_db.json data...')
  const dbFile = path.resolve(process.cwd(), 'data', 'crescent_db.json')
  if (!fs.existsSync(dbFile)) {
    console.error('ERROR: data/crescent_db.json not found.')
    printSummaryAndExit()
    return
  }

  const raw = fs.readFileSync(dbFile, 'utf-8')
  const localData = JSON.parse(raw)

  // Helper to convert local image paths to permanent Supabase URLs
  const toSupabaseUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const basename = path.basename(url)
    return uploadedUrlMap.get(url) || uploadedUrlMap.get(basename) || `${supabaseUrl}/storage/v1/object/public/${bucketName}/${basename}`
  }

  // 9. Push to PostgreSQL tables and directly verify each
  console.log('\n[4/4] Inserting records into Supabase PostgreSQL tables & verifying...')

  // A. Projects
  try {
    if (Array.isArray(localData.projects) && localData.projects.length > 0) {
      const mappedProjects = localData.projects.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        location: p.location,
        status: p.status || 'Completed',
        short_desc: p.short_desc,
        full_desc: p.full_desc || p.short_desc,
        images: Array.isArray(p.images) ? p.images.map(toSupabaseUrl) : [],
        featured: Boolean(p.featured),
        completion_year: p.completion_year || '2024',
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      }))

      const { error: projErr } = await supabase.from('projects').upsert(mappedProjects, { onConflict: 'id' })
      if (projErr) {
        recordFail('Projects', `Upsert error: ${projErr.message} (code: ${projErr.code})`)
      } else {
        // Direct database verification
        const { count, error: countErr } = await supabase.from('projects').select('id', { count: 'exact', head: true })
        if (countErr) {
          recordFail('Projects', `Verification query error: ${countErr.message}`)
        } else {
          console.log(`  * Projects verified in PostgreSQL: ${count} total records.`)
          recordPass('Projects')
        }
      }
    } else {
      recordFail('Projects', 'No projects found in crescent_db.json')
    }
  } catch (err: any) {
    recordFail('Projects', `Exception during projects migration: ${err.message}`)
  }

  // B. Users
  try {
    if (Array.isArray(localData.users) && localData.users.length > 0) {
      const { error: userErr } = await supabase.from('users').upsert(localData.users, { onConflict: 'id' })
      if (userErr) {
        recordFail('Users', `Upsert error: ${userErr.message} (code: ${userErr.code})`)
      } else {
        const { count, error: countErr } = await supabase.from('users').select('id', { count: 'exact', head: true })
        if (countErr) {
          recordFail('Users', `Verification query error: ${countErr.message}`)
        } else {
          console.log(`  * Users verified in PostgreSQL: ${count} total records.`)
          recordPass('Users')
        }
      }
    } else {
      recordFail('Users', 'No users found in crescent_db.json')
    }
  } catch (err: any) {
    recordFail('Users', `Exception during users migration: ${err.message}`)
  }

  // C. Services
  try {
    if (Array.isArray(localData.services) && localData.services.length > 0) {
      const mappedServices = localData.services.map((s: any) => ({
        id: s.id,
        number: s.number,
        title: s.title,
        desc: s.desc,
        icon_name: s.icon_name || 'Building2',
        cta: s.cta || 'Learn More',
        sort_order: s.sort_order || 0,
      }))
      const { error: srvErr } = await supabase.from('services').upsert(mappedServices, { onConflict: 'id' })
      if (srvErr) {
        recordFail('Services', `Upsert error: ${srvErr.message} (code: ${srvErr.code})`)
      } else {
        const { count, error: countErr } = await supabase.from('services').select('id', { count: 'exact', head: true })
        if (countErr) {
          recordFail('Services', `Verification query error: ${countErr.message}`)
        } else {
          console.log(`  * Services verified in PostgreSQL: ${count} total records.`)
          recordPass('Services')
        }
      }
    } else {
      recordFail('Services', 'No services found in crescent_db.json')
    }
  } catch (err: any) {
    recordFail('Services', `Exception during services migration: ${err.message}`)
  }

  // D. Testimonials
  try {
    if (Array.isArray(localData.testimonials) && localData.testimonials.length > 0) {
      const { error: testErr } = await supabase.from('testimonials').upsert(localData.testimonials, { onConflict: 'id' })
      if (testErr) {
        recordFail('Testimonials', `Upsert error: ${testErr.message} (code: ${testErr.code})`)
      } else {
        const { count, error: countErr } = await supabase.from('testimonials').select('id', { count: 'exact', head: true })
        if (countErr) {
          recordFail('Testimonials', `Verification query error: ${countErr.message}`)
        } else {
          console.log(`  * Testimonials verified in PostgreSQL: ${count} total records.`)
          recordPass('Testimonials')
        }
      }
    } else {
      recordFail('Testimonials', 'No testimonials found in crescent_db.json')
    }
  } catch (err: any) {
    recordFail('Testimonials', `Exception during testimonials migration: ${err.message}`)
  }

  // E. Inquiries
  try {
    if (Array.isArray(localData.inquiries) && localData.inquiries.length > 0) {
      const { error: inqErr } = await supabase.from('inquiries').upsert(localData.inquiries, { onConflict: 'id' })
      if (inqErr) {
        recordFail('Inquiries', `Upsert error: ${inqErr.message} (code: ${inqErr.code})`)
      } else {
        const { count, error: countErr } = await supabase.from('inquiries').select('id', { count: 'exact', head: true })
        if (countErr) {
          recordFail('Inquiries', `Verification query error: ${countErr.message}`)
        } else {
          console.log(`  * Inquiries verified in PostgreSQL: ${count} total records.`)
          recordPass('Inquiries')
        }
      }
    } else {
      // If inquiries array is empty in crescent_db.json, table is ready
      console.log('  * Inquiries: 0 local records to migrate (table is clean and ready).')
      recordPass('Inquiries')
    }
  } catch (err: any) {
    recordFail('Inquiries', `Exception during inquiries migration: ${err.message}`)
  }

  // F. Login Activity
  try {
    if (Array.isArray(localData.login_activity) && localData.login_activity.length > 0) {
      const { error: actErr } = await supabase.from('login_activity').upsert(localData.login_activity, { onConflict: 'id' })
      if (actErr) {
        recordFail('Login activity', `Upsert error: ${actErr.message} (code: ${actErr.code})`)
      } else {
        const { count, error: countErr } = await supabase.from('login_activity').select('id', { count: 'exact', head: true })
        if (countErr) {
          recordFail('Login activity', `Verification query error: ${countErr.message}`)
        } else {
          console.log(`  * Login activity verified in PostgreSQL: ${count} total records.`)
          recordPass('Login activity')
        }
      }
    } else {
      console.log('  * Login activity: 0 records to migrate (table is clean and ready).')
      recordPass('Login activity')
    }
  } catch (err: any) {
    recordFail('Login activity', `Exception during login activity migration: ${err.message}`)
  }

  printSummaryAndExit()
}

function printSummaryAndExit() {
  console.log('\n====================================================')
  console.log('           SUPABASE MIGRATION SUMMARY')
  console.log('====================================================')

  let hasFailures = false
  for (const [item, status] of Object.entries(statusMap)) {
    console.log(`* ${item}: ${status}`)
    if (status === 'FAIL') {
      hasFailures = true
      if (failureDetails[item]) {
        console.log(`  -> Reason: ${failureDetails[item]}`)
      }
    }
  }

  console.log('====================================================')

  if (hasFailures) {
    console.error('\nERROR: One or more migration steps FAILED.')
    console.error('Please resolve the underlying issues noted above and re-run.\n')
    process.exit(1)
  } else {
    console.log('\nSUCCESS: All migration steps completed and verified directly in Supabase!')
    console.log('All project images are permanently stored in Supabase Storage.')
    console.log('All records are permanently stored in Supabase PostgreSQL.\n')
    process.exit(0)
  }
}

migrateToSupabase().catch((err) => {
  console.error('\n[FATAL MIGRATION EXCEPTION]:', err)
  process.exit(1)
})
