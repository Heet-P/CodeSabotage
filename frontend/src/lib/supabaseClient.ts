import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Use sessionStorage so the user is logged out when the tab/window closes
const getStorage = () => {
    if (typeof window !== 'undefined') {
        return window.sessionStorage;
    }
    return undefined;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})
