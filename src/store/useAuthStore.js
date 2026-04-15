import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    error: null,

    initialize: async () => {
        console.log('🗝️ Auth: Initializing session...')

        // Safety timeout for initialization
        const timeout = setTimeout(() => {
            if (get().loading) {
                console.warn('🕒 Auth: Initialization taking too long. Forcing loading state to false.')
                set({ loading: false })
            }
        }, 8000)

        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                console.error('❌ Auth: Session fetch error:', error)
                set({ loading: false })
                return
            }

            if (session?.user) {
                console.log('👤 Auth: Session restored for:', session.user.email)
                set({ user: session.user, loading: false })
                get().fetchProfile(session.user.id)
            } else {
                console.log('🚪 Auth: No active session found.')
                set({ loading: false })
            }

            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('🔄 Auth: State change event:', event)
                if (session?.user) {
                    set({ user: session.user })
                    get().fetchProfile(session.user.id)
                } else {
                    set({ user: null, profile: null })
                }
            })
        } catch (err) {
            console.error('💥 Auth: Critical initialization failure:', err)
            set({ loading: false })
        } finally {
            clearTimeout(timeout)
        }
    },

    fetchProfile: async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        if (data) set({ profile: data })
    },

    signUp: async ({ email, password, name }) => {
        set({ error: null })
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        })
        if (error) { set({ error: error.message }); return { error } }
        return { data }
    },

    signIn: async ({ email, password }) => {
        set({ error: null })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { set({ error: error.message }); return { error } }
        return { data }
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        })
        if (error) set({ error: error.message })
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
    },

    updateProfile: async (updates) => {
        const userId = get().user?.id
        if (!userId) return
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()
        if (!error && data) set({ profile: data })
        return { data, error }
    },
}))
