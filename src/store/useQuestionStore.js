import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useQuestionStore = create((set, get) => ({
    questions: [],
    statuses: {}, // { questionId: { status, attempts, last_updated, personal_notes } }
    questionSolvers: {}, // { questionId: [profile1, profile2] }
    loading: false,
    error: null,

    fetchQuestions: async (topicId = null) => {
        set({ loading: true })
        // Fetch questions along with the creator's profile and topic name
        let query = supabase.from('questions').select('*, topics(name), profiles:created_by(name, avatar_url)').order('created_at', { ascending: false })
        if (topicId) query = query.eq('topic_id', topicId)
        const { data, error } = await query
        if (error) set({ error: error.message })
        else set({ questions: data || [] })
        set({ loading: false })
    },

    fetchAllQuestions: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('questions')
            .select('*, topics(name), profiles:created_by(name, avatar_url)')
            .order('created_at', { ascending: false })
        if (error) set({ error: error.message })
        else set({ questions: data || [] })
        set({ loading: false })
    },

    fetchStatuses: async (userId) => {
        const { data } = await supabase
            .from('user_question_status')
            .select('*')
            .eq('user_id', userId)
        if (data) {
            const map = {}
            data.forEach(s => { map[s.question_id] = s })
            set({ statuses: map })
        }
    },

    fetchQuestionSolvers: async (questionId) => {
        const { data, error } = await supabase
            .from('user_question_status')
            .select('profiles:user_id(name, avatar_url)')
            .eq('question_id', questionId)
            .eq('status', 'solved')

        if (!error && data) {
            const solvers = data.map(d => d.profiles)
            set({ questionSolvers: { ...get().questionSolvers, [questionId]: solvers } })
        }
    },

    addQuestion: async (question) => {
        const { data, error } = await supabase
            .from('questions')
            .insert(question)
            .select('*, topics(name), profiles:created_by(name, avatar_url)')
            .single()
        if (!error && data) set({ questions: [data, ...get().questions] })
        return { data, error }
    },

    updateQuestion: async (id, updates) => {
        const { data, error } = await supabase
            .from('questions')
            .update(updates)
            .eq('id', id)
            .select('*, topics(name), profiles:created_by(name, avatar_url)')
            .single()
        if (!error && data) {
            set({ questions: get().questions.map(q => q.id === id ? data : q) })
        }
        return { data, error }
    },

    deleteQuestion: async (id) => {
        const { error } = await supabase.from('questions').delete().eq('id', id)
        if (!error) set({ questions: get().questions.filter(q => q.id !== id) })
        return { error }
    },

    setStatus: async (userId, questionId, status, personal_notes = null) => {
        const existing = get().statuses[questionId]
        const attempts = existing ? existing.attempts + 1 : 1
        const row = {
            user_id: userId,
            question_id: questionId,
            status,
            attempts,
            last_updated: new Date().toISOString(),
        }
        if (personal_notes !== null) row.personal_notes = personal_notes;

        const { data, error } = await supabase
            .from('user_question_status')
            .upsert(row, { onConflict: 'user_id,question_id' })
            .select()
            .single()
        if (!error && data) {
            set({ statuses: { ...get().statuses, [questionId]: data } })

            // Log streak/activity only on positive actions
            if (status === 'solved') {
                await supabase.from('streaks').upsert(
                    { user_id: userId, date: new Date().toISOString().split('T')[0] },
                    { onConflict: 'user_id,date' }
                )
            }
        }
        return { data, error }
    },

    toggleBookmark: async (userId, questionId) => {
        const existing = get().statuses[questionId]
        const bookmarked = !existing?.bookmarked
        const { data, error } = await supabase
            .from('user_question_status')
            .upsert(
                { user_id: userId, question_id: questionId, bookmarked, last_updated: new Date().toISOString() },
                { onConflict: 'user_id,question_id' }
            )
            .select()
            .single()
        if (!error && data) {
            set({ statuses: { ...get().statuses, [questionId]: { ...existing, ...data } } })
        }
        return { data, error }
    },

    // Global real-time subscription for questions
    subscribeQuestions: () => {
        const channel = supabase
            .channel('global-questions')
            .on('postgres_changes', { event: '*', table: 'questions' }, () => {
                get().fetchAllQuestions()
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }
}))
