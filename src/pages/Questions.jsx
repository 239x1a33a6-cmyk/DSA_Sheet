import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import Layout from '../components/layout/Layout'
import QuestionCard from '../components/questions/QuestionCard'
import QuestionForm from '../components/questions/QuestionForm'
import Modal from '../components/ui/Modal'
import { useQuestionStore } from '../store/useQuestionStore'
import { useTopicStore } from '../store/useTopicStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Questions() {
    const { user } = useAuthStore()
    const { questions, fetchAllQuestions, statuses, fetchStatuses } = useQuestionStore()
    const { topics, fetchTopics } = useTopicStore()

    const [showAdd, setShowAdd] = useState(false)
    const [search, setSearch] = useState('')
    const [diffFilter, setDiffFilter] = useState('All')
    const [topicFilter, setTopicFilter] = useState('All')

    useEffect(() => {
        fetchAllQuestions()
        fetchTopics()
        if (user) fetchStatuses(user.id)

        const unsubscribe = subscribeQuestions()
        return unsubscribe
    }, [user])

    const filtered = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase())
            const matchesDiff = diffFilter === 'All' || q.difficulty === diffFilter
            const matchesTopic = topicFilter === 'All' || q.topic_id === topicFilter
            return matchesSearch && matchesDiff && matchesTopic
        })
    }, [questions, search, diffFilter, topicFilter])

    return (
        <Layout
            title="Question Library"
            actions={
                <button onClick={() => setShowAdd(true)} className="btn-primary px-6 font-bold uppercase tracking-widest text-[10px]">
                    <Plus size={14} /> New Question
                </button>
            }
        >
            <div className="space-y-8 animate-in max-w-7xl mx-auto">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input className="input pl-10 h-10 text-xs font-semibold"
                            placeholder="Find questions..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <select className="input h-10 text-xs font-bold uppercase tracking-wider w-32 px-4"
                            value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
                            {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className="input h-10 text-xs font-bold uppercase tracking-wider min-w-[140px] px-4"
                            value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
                            <option value="All">All Topics</option>
                            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filtered.length > 0 ? (
                        <div className="grid gap-4">
                            {filtered.map(q => (
                                <QuestionCard key={q.id} question={q} showTopic />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-xl">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">No results found</span>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Question">
                <QuestionForm
                    topics={topics}
                    onSubmit={async (data) => {
                        const { error } = await addQuestion({ ...data, created_by: user.id })
                        if (error) toast.error(error.message)
                        else toast.success('✨ New challenge added to pool')
                    }}
                    onSuccess={() => setShowAdd(false)}
                    onCancel={() => setShowAdd(false)}
                />
            </Modal>
        </Layout>
    )
}
