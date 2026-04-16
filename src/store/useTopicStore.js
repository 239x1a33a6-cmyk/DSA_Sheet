import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useTopicStore = create((set, get) => ({
    topics: [],
    loading: false,
    error: null,

    fetchTopics: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('topics')
            .select('*, profiles(name)')
            .order('is_predefined', { ascending: false })
            .order('name')
        if (error) set({ error: error.message })
        else set({ topics: data || [] })
        set({ loading: false })
    },

    addTopic: async (name, userId, parentId = null) => {
        const { data, error } = await supabase
            .from('topics')
            .insert({ name, created_by: userId, is_predefined: false, parent_id: parentId })
            .select()
            .single()
        if (!error && data) set({ topics: [...get().topics, data] })
        return { data, error }
    },

    updateTopic: async (id, name, parentId = null) => {
        const updateData = { name }
        if (parentId !== undefined) updateData.parent_id = parentId

        const { data, error } = await supabase
            .from('topics')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
        if (!error && data) {
            set({ topics: get().topics.map(t => t.id === id ? data : t) })
        }
        return { data, error }
    },

    deleteTopic: async (id) => {
        const { error } = await supabase.from('topics').delete().eq('id', id)
        if (!error) set({ topics: get().topics.filter(t => t.id !== id) })
        return { error }
    },

    subscribeTopics: () => {
        const channel = supabase
            .channel('global-topics')
            .on('postgres_changes', { event: '*', table: 'topics' }, () => {
                get().fetchTopics()
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }
}))
