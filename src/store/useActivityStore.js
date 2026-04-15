import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useActivityStore = create((set, get) => ({
    activities: [],
    loading: false,

    fetchActivities: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('activity_log')
            .select(`
                *,
                profiles (name, avatar_url),
                questions (title)
            `)
            .order('created_at', { ascending: false })
            .limit(20)

        if (!error && data) set({ activities: data })
        set({ loading: false })
    },

    // Subscriptions for real-time updates
    subscribe: () => {
        const channel = supabase
            .channel('activity-feed')
            .on('postgres_changes', { event: 'INSERT', table: 'activity_log' }, (payload) => {
                get().fetchActivities() // Refetch to get related profile/question data
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }
}))
