import { createClient } from '@supabase/supabase-js'

// Function to get supabase client at runtime (for API routes)
export function getServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    const missingVars = []
    if (!url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!key) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
    throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}`)
  }
  
  return createClient(url, key)
}

// Function to get anon client at runtime (for client-side usage)  
export function getClientSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(url, key)
}

// Placeholder exports for build-time compatibility
export const supabase = {} as any
export const supabaseClient = {} as any
