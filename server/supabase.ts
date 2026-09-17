import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const getSupabaseUrl = () => (process.env.SUPABASE_URL || '').trim()
const getSupabaseKey = () => (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim()
export const STORAGE_BUCKET = (process.env.SUPABASE_STORAGE_BUCKET || 'projects').trim()

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  return Boolean(
    url &&
    url.startsWith('http') &&
    key &&
    key.length > 20
  )
}

let client: SupabaseClient | null = null

export function getClient(): SupabaseClient | null {
  if (client) return client
  if (isSupabaseConfigured()) {
    try {
      const url = getSupabaseUrl()
      const key = getSupabaseKey()
      client = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
      console.log('[SUPABASE] Connected to Supabase backend at:', url)
    } catch (err) {
      console.error('[SUPABASE] Failed to initialize client:', err)
      client = null
    }
  }
  return client
}

// Initialize on module load if already configured
getClient()

export const supabase = client || getClient()

export function getPublicStorageUrl(filePath: string): string {
  const url = getSupabaseUrl()
  if (!url) return filePath
  const cleanPath = filePath.replace(/^\/+/, '').replace(/^projects\/+/, '')
  return `${url}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`
}
