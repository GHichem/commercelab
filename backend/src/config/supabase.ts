import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is missing')
}

if (!supabaseSecretKey) {
  throw new Error('SUPABASE_SECRET_KEY is missing')
}

if (!storageBucket) {
  throw new Error('SUPABASE_STORAGE_BUCKET is missing')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)

export const PRODUCT_IMAGES_BUCKET = storageBucket