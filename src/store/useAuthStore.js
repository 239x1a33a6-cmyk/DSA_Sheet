import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    error: null,

    initialize: async () => {
        // Safety timeout for initialization
        const timeout = setTimeout(() => {
            if (get().loading) {
                set({ loading: false })
            }
        }, 8000)

        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                set({ loading: false })
                return
            }

            if (session?.user) {
                set({ user: session.user, loading: false })
                get().fetchProfile(session.user.id)
            } else {
                set({ loading: false })
            }

            supabase.auth.onAuthStateChange(async (event, session) => {
                if (session?.user) {
                    set({ user: session.user })
                    get().fetchProfile(session.user.id)

                    // Log login or session restoration
                    if (event === 'SIGNED_IN') {
                        await supabase.from('activity_log').insert({
                            user_id: session.user.id,
                            type: 'login',
                            details: { event, email: session.user.email }
                        })
                    }
                } else {
                    set({ user: null, profile: null })
                }
            })
        } catch (err) {
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

        // Log activity
        if (data?.user) {
            await supabase.from('activity_log').insert({
                user_id: data.user.id,
                type: 'login',
                details: { method: 'password', email: data.user.email }
            })
        }

        return { data }
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        })
        if (error) set({ error: error.message })
        // Note: Google login activity is usually logged on the redirect-back initialize check
        // but we can add it here as an 'attempt' if needed. The actual session establishment 
        // is captured in initialize/onAuthStateChange.
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
