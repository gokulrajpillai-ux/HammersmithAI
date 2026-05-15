import { createBrowserClient } from '@supabase/ssr'

// Database types for our RCM application - matches backend schema
export interface Patient {
  id?: string
  org_id: string
  abha_id: string
  abha_address: string
  first_name: string
  last_name: string
  gender?: string
  dob?: string
  mobile?: string
  is_abha_verified: boolean
  created_at?: string
  updated_at?: string
}

export interface ConsentLog {
  id?: string
  org_id: string
  patient_id?: string | null
  abha_address: string
  purpose: string
  record_types: string[]
  expiry_date: string
  hip_id?: string
  status?: 'pending' | 'approved' | 'rejected' | 'expired'
  created_at?: string
}

export interface Profile {
  id: string
  org_id: string
  first_name?: string
  last_name?: string
  role?: string
}

export interface MedicalPackage {
  id: string
  package_code: string
  procedure_name: string
  kasp_rate_2026: number
  category?: string
}

export interface Claim {
  id: string
  org_id: string
  patient_id: string
  package_id: string
  hospital_bill_amount: number
  status: 'pending' | 'approved' | 'denied' | 'under_review' | 'AI-AUDITED'
  admission_date?: string
  clinical_notes?: string
  created_at?: string
  // Private insurance columns
  insurance_provider?: string | null
  policy_number?: string | null
  pre_auth_status?: 'pending' | 'approved' | 'rejected' | 'info_requested' | null
  pre_auth_requested_at?: string | null
  tpa_queries?: TPAQuery[] | null
  ai_response_draft?: string | null
  // Joined data
  patients?: {
    id: string
    first_name: string
    last_name: string
    abha_id: string
  }
  medical_packages?: {
    id: string
    package_code: string
    procedure_name: string
    kasp_rate_2026: number
  }
}

export interface TPAQuery {
  id: string
  query_text: string
  query_type: 'medical_necessity' | 'documentation' | 'coding' | 'pricing' | 'other'
  raised_at: string
  responded_at?: string | null
  response_text?: string | null
  status: 'open' | 'responded' | 'resolved'
}

// Default organization ID for Hammersmith AI Clinic (demo fallback)
export const DEFAULT_ORG_ID = '0ec1ab3d-4a89-4dea-aa25-23e8b4016b5d'

// Helper function to get current user's org_id from profiles table
// Falls back to Hammersmith AI Clinic org_id for demo purposes
export async function getCurrentUserOrgId(): Promise<string> {
  if (!isSupabaseConfigured()) return DEFAULT_ORG_ID
  
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return DEFAULT_ORG_ID
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()
  
  return profile?.org_id || DEFAULT_ORG_ID
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
