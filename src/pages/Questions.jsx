import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, ChevronLeft, Layers, BookOpen } from 'lucide-react'
import Layout from '../components/layout/Layout'
import QuestionCard from '../components/questions/QuestionCard'
import TopicCard from '../components/topics/TopicCard'
import QuestionForm from '../components/questions/QuestionForm'
import Modal from '../components/ui/Modal'
import { useQuestionStore } from '../store/useQuestionStore'
import { useTopicStore } from '../store/useTopicStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Questions() {
    const { user } = useAuthStore()
    const { topicId } = useParams()
    const navigate = useNavigate()
    const { questions, fetchAllQuestions, statuses, fetchStatuses, subscribeQuestions, addQuestion } = useQuestionStore()
    const { topics, fetchTopics } = useTopicStore()

    const [showAdd, setShowAdd] = useState(false)
    const [search, setSearch] = useState('')
    const [diffFilter, setDiffFilter] = useState('All')
    const [topicFilter, setTopicFilter] = useState(topicId || 'All')

    useEffect(() => {
        setTopicFilter(topicId || 'All')
    }, [topicId])

    useEffect(() => {
        fetchAllQuestions()
        fetchTopics()
        if (user) fetchStatuses(user.id)

        const unsubscribe = subscribeQuestions()
        return unsubscribe
    }, [user])

    const currentTopic = useMemo(() => {
        return topics.find(t => t.id === topicId)
    }, [topics, topicId])

    const subTopics = useMemo(() => {
        if (!topicId) return []
        return topics.filter(t => t.parent_id === topicId)
    }, [topics, topicId])

    const topicStats = useMemo(() => {
        const map = {}
        topics.forEach(t => {
            const qs = questions.filter(q => q.topic_id === t.id)
            const contributors = new Set(qs.map(q => q.created_by).filter(Boolean))

            map[t.id] = {
                total: qs.length,
                solved: qs.filter(q => statuses[q.id]?.status === 'solved').length,
                contributors: contributors.size
            }
        })
        return map
    }, [topics, questions, statuses])

    const filtered = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase())
            const matchesDiff = diffFilter === 'All' || q.difficulty === diffFilter
            const matchesTopic = topicFilter === 'All' || q.topic_id === topicFilter
            return matchesSearch && matchesDiff && matchesTopic
        })
    }, [questions, search, diffFilter, topicFilter])

    const isShowingSubtopics = subTopics.length > 0 && (topicFilter === 'All' || topicFilter === topicId)

    return (
        <Layout
            title={currentTopic ? currentTopic.name : "Question Library"}
            actions={
                <div className="flex gap-2">
                    {topicId && (
                        <button onClick={() => navigate('/topics')} className="btn-secondary px-4 text-[10px] font-black uppercase tracking-widest">
                            <ChevronLeft size={14} /> Back
                        </button>
                    )}
                    <button onClick={() => setShowAdd(true)} className="btn-primary px-6 font-bold uppercase tracking-widest text-[10px]">
                        <Plus size={14} /> New Question
                    </button>
                </div>
            }
        >
            <div className="space-y-8 animate-in max-w-7xl mx-auto pb-20">
                {isShowingSubtopics ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Explore Sub-clusters</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a specific branch to view challenges</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subTopics.map(st => (
                                <TopicCard
                                    key={st.id}
                                    topic={st}
                                    stats={topicStats[st.id]}
                                    canManage={false}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
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
                                    <BookOpen size={48} className="text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">No challenges found here</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Question">
                <QuestionForm
                    topics={topics}
                    onSubmit={async (data) => {
                        // Close modal and show success message eagerly for better UX
                        setShowAdd(false)
                        const toastId = toast.loading('Syncing to group bank...')

                        const { error } = await addQuestion({ ...data, created_by: user.id })

                        if (error) {
                            toast.error(`Sync failed: ${error.message}`, { id: toastId })
                        } else {
                            toast.success('✨ Challenge shared with group', { id: toastId })
                        }
                    }}
                    onCancel={() => setShowAdd(false)}
                />
            </Modal>
        </Layout>
    )
}
