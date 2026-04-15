import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (url) => {
    try {
        return url && (url.startsWith('http://') || url.startsWith('https://'))
    } catch {
        return false
    }
}

let supabaseClient;
let isPlaceholder = false;

if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })
} else {
    isPlaceholder = true;
    console.warn('⚠️ Supabase env vars not configured or invalid. Providing dummy client.')
    supabaseClient = createClient('https://placeholder-project.supabase.co', 'placeholder-key', {
        auth: { persistSession: false }
    })
}

export const supabase = supabaseClient
export const SUPABASE_IS_CONFIGURED = !isPlaceholder
