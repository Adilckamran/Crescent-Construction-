import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'projects'

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseKey &&
    supabaseKey.length > 20
  )
}

let client: SupabaseClient | null = null

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    console.log('[SUPABASE] Connected to Supabase backend at:', supabaseUrl)
  } catch (err) {
    console.error('[SUPABASE] Failed to initialize client:', err)
    client = null
  }
} else {
  console.log('[STORAGE] Supabase credentials not detected in .env. Operating in local persistent mode.')
}

export const supabase = client

export function getPublicStorageUrl(filePath: string): string {
  if (!supabaseUrl) return filePath
  const cleanPath = filePath.replace(/^\/+/, '').replace(/^projects\/+/, '')
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`
}
