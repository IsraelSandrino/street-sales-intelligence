import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

function readSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.')
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const { supabaseUrl, supabaseAnonKey } = readSupabaseConfig()
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}
