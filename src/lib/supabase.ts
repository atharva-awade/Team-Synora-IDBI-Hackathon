import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// The client is created only when the environment is configured. When it isn't,
// the app runs entirely on its bundled datastore — so the experience is
// identical and resilient even without a network connection.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null
