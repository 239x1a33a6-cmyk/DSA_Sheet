import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, ChevronLeft, Layers, BookOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
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
    const { topics, fetchTopics, addTopic, subscribeTopics } = useTopicStore()

    const [showAdd, setShowAdd] = useState(false)
    const [showAddSub, setShowAddSub] = useState(false)
    const [topicName, setTopicName] = useState('')
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

        const unsubQ = subscribeQuestions()
        const unsubT = subscribeTopics()
        return () => {
            unsubQ?.()
            unsubT?.()
        }
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

        const getRecursiveQs = (tid) => {
            let directQs = questions.filter(q => q.topic_id === tid)
            const children = topics.filter(t => t.parent_id === tid)
            children.forEach(child => {
                directQs = [...directQs, ...getRecursiveQs(child.id)]
            })
            return directQs
        }

        topics.forEach(t => {
            const allQs = getRecursiveQs(t.id)
            const contributors = new Set(allQs.map(q => q.created_by).filter(Boolean))

            map[t.id] = {
                total: allQs.length,
                solved: allQs.filter(q => statuses[q.id]?.status === 'solved').length,
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

    // STRICT LOGIC: If a topic has subtopics, we ONLY show subtopics.
    // We only show questions if there are NO subtopics.
    const isShowingSubtopics = subTopics.length > 0
    const hasQuestions = filtered.length > 0

    const handleAddSubtopic = async (e) => {
        e.preventDefault()
        const name = topicName.trim()
        if (!name || !topicId) return

        setShowAddSub(false)
        setTopicName('')
        const toastId = toast.loading('Expanding cluster...')
        const { error } = await addTopic(name, user.id, topicId)
        if (error) {
            toast.error(`Expansion failed: ${error.message}. Please check if you ran the SQL migration.`, { id: toastId, duration: 5000 })
        } else {
            toast.success('✨ Sub-cluster launched', { id: toastId })
        }
    }

    const handleDeleteSubtopic = async (topic) => {
        const stats = topicStats[topic.id]
        const hasContent = stats?.total > 0
        const message = hasContent
            ? `🔥 WARNING: "${topic.name}" contains ${stats.total} challenges. Purging this cluster will ERASE ALL nested challenges and sub-clusters. Continue?`
            : `🔥 Purge sub-cluster "${topic.name}"?`

        if (!confirm(message)) return

        const toastId = toast.loading('Purging cluster...')
        const { error } = await deleteTopic(topic.id)
        if (error) toast.error(`Purge failed: ${error.message}`, { id: toastId })
        else toast.success('🗑️ Cluster erased from network', { id: toastId })
    }

    return (
        <Layout
            title={currentTopic ? currentTopic.name : "Question Library"}
            actions={
                <div className="flex gap-2">
                    {topicId && (
                        <>
                            <button onClick={() => navigate('/topics')} className="btn-secondary px-4 text-[10px] font-black uppercase tracking-widest hidden sm:flex">
                                <ChevronLeft size={14} /> Back
                            </button>
                            <button onClick={() => { setTopicName(''); setShowAddSub(true) }} className="btn-primary bg-indigo-600 hover:bg-indigo-700 px-4 text-[10px] font-black uppercase tracking-widest">
                                <Plus size={14} /> Add Sub
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowAdd(true)} className="btn-primary px-6 font-bold uppercase tracking-widest text-[10px]">
                        <Plus size={14} /> New Question
                    </button>
                </div>
            }
        >
            <div className="space-y-12 animate-in max-w-7xl mx-auto pb-20">
                {isShowingSubtopics ? (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Explore Sub-clusters</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a branch of {currentTopic?.name} to view challenges</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subTopics.map(st => (
                                <TopicCard
                                    key={st.id}
                                    topic={st}
                                    stats={topicStats[st.id]}
                                    canManage={user?.id === st.created_by || user?.id === currentTopic?.created_by}
                                    onDelete={handleDeleteSubtopic}
                                    onRename={() => { }}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Empty/Leaf State Header if topicId is present */}
                        {topicId && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Challenges</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct questions in {currentTopic?.name}</p>
                                </div>
                            </div>
                        )}

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

                        {/* Question List */}
                        <div className="space-y-4">
                            {hasQuestions ? (
                                <div className="grid gap-4">
                                    {filtered.map(q => (
                                        <QuestionCard key={q.id} question={q} showTopic />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                    <BookOpen size={48} className="text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">No direct challenges yet</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Create your first challenge or add a sub-cluster branch</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <button onClick={() => setShowAdd(true)} className="btn-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest">
                                            + Add Question
                                        </button>
                                        {topicId && (
                                            <button onClick={() => setShowAddSub(true)} className="btn-secondary px-6 py-2 text-[10px] font-black uppercase tracking-widest border-indigo-500/50 text-indigo-500">
                                                + Add Sub-cluster
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Question">
                <QuestionForm
                    topics={topics}
                    initialTopicId={topicId}
                    onSubmit={async (data) => {
                        setShowAdd(false)
                        const toastId = toast.loading('Syncing to group bank...')
                        const { error } = await addQuestion({ ...data, created_by: user.id })
                        if (error) toast.error(`Sync failed: ${error.message}`, { id: toastId })
                        else toast.success('✨ Challenge shared with group', { id: toastId })
                    }}
                    onCancel={() => setShowAdd(false)}
                />
            </Modal>

            <Modal isOpen={showAddSub} onClose={() => setShowAddSub(false)} title={`Add Sub-cluster to ${currentTopic?.name}`}>
                <form onSubmit={handleAddSubtopic} className="space-y-8 p-2">
                    <div className="space-y-2">
                        <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400">Sub-cluster Name</label>
                        <input className="input h-14 pl-6" placeholder="e.g. Tree Traversal" value={topicName}
                            onChange={e => setTopicName(e.target.value)} autoFocus required />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="btn-primary h-14 flex-1 font-black uppercase tracking-widest text-xs">Launch Sub-cluster</button>
                        <button type="button" onClick={() => setShowAddSub(false)} className="btn-secondary h-14 px-8 font-black uppercase tracking-widest text-xs">Abort</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    )
}
