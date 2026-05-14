import { createBrowserClient } from '@supabase/ssr'

// Database types for our RCM application
export interface Patient {
  id?: string
  abha_id: string
  abha_address: string
  full_name: string
  gender?: string
  date_of_birth?: string
  mobile_number?: string
  is_abha_verified: boolean
  created_at?: string
  updated_at?: string
}

export interface ConsentLog {
  id?: string
  patient_id: string
  abha_address: string
  purpose: string
  record_types: string[]
  expiry_date: string
  status?: 'pending' | 'approved' | 'rejected' | 'expired'
  created_at?: string
}

// Singleton pattern for client-side Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.'
    )
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
