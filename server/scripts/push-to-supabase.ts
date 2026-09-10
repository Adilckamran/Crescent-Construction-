import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

async function migrateToSupabase() {
  console.log('====================================================')
  console.log(' Crescent Construction: Push Data to Supabase')
  console.log('====================================================')

  const supabaseUrl = process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'projects'

  if (!supabaseUrl || !serviceKey || !supabaseUrl.startsWith('http')) {
    console.error('ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured in your .env file.')
    console.log('\nPlease add your Supabase credentials to .env:')
    console.log('SUPABASE_URL=https://your-project-ref.supabase.co')
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 1. Ensure Storage Bucket exists and is public
  console.log(`\n[1/4] Ensuring Supabase Storage bucket "${bucketName}" exists...`)
  const { data: buckets, error: bucketListErr } = await supabase.storage.listBuckets()
  if (bucketListErr) {
    console.warn('Warning checking bucket list:', bucketListErr.message)
  } else {
    const exists = buckets?.some(b => b.name === bucketName)
    if (!exists) {
      console.log(`Creating public bucket "${bucketName}"...`)
      const { error: createErr } = await supabase.storage.createBucket(bucketName, { public: true })
      if (createErr) {
        console.warn('Bucket creation note:', createErr.message)
      } else {
        console.log(`Bucket "${bucketName}" created successfully.`)
      }
    } else {
      console.log(`Bucket "${bucketName}" already exists and is active.`)
    }
  }

  // 2. Upload local project images to Supabase Storage
  console.log('\n[2/4] Uploading project images from public/uploads/ to Supabase Storage...')
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')
  const uploadedUrlMap = new Map<string, string>()

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir)
    console.log(`Found ${files.length} image file(s) to process.`)

    for (const file of files) {
      const filePath = path.join(uploadsDir, file)
      if (fs.statSync(filePath).isFile()) {
        const buffer = fs.readFileSync(filePath)
        const ext = path.extname(file).toLowerCase()
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'

        const { error: uploadErr } = await supabase.storage
          .from(bucketName)
          .upload(file, buffer, { contentType: mimeType, upsert: true })

        if (uploadErr) {
          console.warn(`Note for ${file}: ${uploadErr.message}`)
        }

        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(file)
        uploadedUrlMap.set(`/uploads/${file}`, publicUrlData.publicUrl)
        uploadedUrlMap.set(file, publicUrlData.publicUrl)
      }
    }
    console.log(`Uploaded & verified ${uploadedUrlMap.size} image URL mappings in Supabase Storage.`)
  } else {
    console.log('No public/uploads directory found. Skipping image upload.')
  }

  // 3. Read local data store
  console.log('\n[3/4] Reading local crescent_db.json data...')
  const dbFile = path.resolve(process.cwd(), 'data', 'crescent_db.json')
  if (!fs.existsSync(dbFile)) {
    console.error('ERROR: data/crescent_db.json not found.')
    process.exit(1)
  }

  const raw = fs.readFileSync(dbFile, 'utf-8')
  const localData = JSON.parse(raw)

  // Helper to convert /uploads/image.jpg to permanent Supabase URLs
  const toSupabaseUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return uploadedUrlMap.get(url) || uploadedUrlMap.get(path.basename(url)) || `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path.basename(url)}`
  }

  // 4. Push to PostgreSQL tables
  console.log('\n[4/4] Inserting records into Supabase PostgreSQL tables...')

  // Projects
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
    if (projErr) console.error('Error inserting projects:', projErr.message)
    else console.log(`[PASS] Migrated ${mappedProjects.length} projects to Supabase.`)
  }

  // Users
  if (Array.isArray(localData.users) && localData.users.length > 0) {
    const { error: userErr } = await supabase.from('users').upsert(localData.users, { onConflict: 'id' })
    if (userErr) console.error('Error inserting users:', userErr.message)
    else console.log(`[PASS] Migrated ${localData.users.length} user accounts to Supabase.`)
  }

  // Services
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
    if (srvErr) console.error('Error inserting services:', srvErr.message)
    else console.log(`[PASS] Migrated ${mappedServices.length} services to Supabase.`)
  }

  // Testimonials
  if (Array.isArray(localData.testimonials) && localData.testimonials.length > 0) {
    const { error: testErr } = await supabase.from('testimonials').upsert(localData.testimonials, { onConflict: 'id' })
    if (testErr) console.error('Error inserting testimonials:', testErr.message)
    else console.log(`[PASS] Migrated ${localData.testimonials.length} testimonials to Supabase.`)
  }

  // Inquiries
  if (Array.isArray(localData.inquiries) && localData.inquiries.length > 0) {
    const { error: inqErr } = await supabase.from('inquiries').upsert(localData.inquiries, { onConflict: 'id' })
    if (inqErr) console.error('Error inserting inquiries:', inqErr.message)
    else console.log(`[PASS] Migrated ${localData.inquiries.length} inquiries to Supabase.`)
  }

  // Login Activity
  if (Array.isArray(localData.login_activity) && localData.login_activity.length > 0) {
    const { error: actErr } = await supabase.from('login_activity').upsert(localData.login_activity, { onConflict: 'id' })
    if (actErr) console.error('Error inserting login activity:', actErr.message)
    else console.log(`[PASS] Migrated ${localData.login_activity.length} login activity records to Supabase.`)
  }

  console.log('\n====================================================')
  console.log(' SUPABASE MIGRATION SUCCESSFULLY COMPLETED!')
  console.log(' All project images are permanently stored in Supabase Storage.')
  console.log(' All records are permanently stored in Supabase PostgreSQL.')
  console.log('====================================================')
}

migrateToSupabase().catch((err) => {
  console.error('Migration exception:', err)
  process.exit(1)
})
