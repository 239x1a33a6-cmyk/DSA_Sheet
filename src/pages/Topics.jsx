import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Layers, Library } from 'lucide-react'
import Layout from '../components/layout/Layout'
import TopicCard from '../components/topics/TopicCard'
import Modal from '../components/ui/Modal'
import { useTopicStore } from '../store/useTopicStore'
import { useQuestionStore } from '../store/useQuestionStore'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'

export default function Topics() {
    const { user } = useAuthStore()
    const { topics, fetchTopics, addTopic, deleteTopic, updateTopic, subscribeTopics } = useTopicStore()
    const { questions, statuses, fetchAllQuestions, fetchStatuses } = useQuestionStore()

    const [showAdd, setShowAdd] = useState(false)
    const [showRename, setShowRename] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState(null)
    const [topicName, setTopicName] = useState('')
    const [parentId, setParentId] = useState('')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchTopics()
        const unsubscribe = subscribeTopics()
        fetchAllQuestions()
        if (user) fetchStatuses(user.id)
        return () => unsubscribe?.()
    }, [user])

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
                revisit: allQs.filter(q => statuses[q.id]?.status === 'revisit').length,
                hard: allQs.filter(q => statuses[q.id]?.status === 'hard').length,
                contributors: contributors.size
            }
        })
        return map
    }, [topics, questions, statuses])

    const filtered = topics.filter(t =>
        !t.parent_id &&
        t.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddTopic = async (e) => {
        e.preventDefault()
        const name = topicName.trim()
        if (!name) return

        if (topics.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            return toast.error('Topic already exists in records')
        }

        // Eager UI updates
        setShowAdd(false)
        setTopicName('')
        setParentId('')
        const toastId = toast.loading('Establishing cluster...')

        const { error } = await addTopic(name, user?.id, parentId || null)
        if (error) toast.error(`Refraction failed: ${error.message}`, { id: toastId })
        else toast.success('✨ New cluster established', { id: toastId })
    }

    const handleRename = async (e) => {
        e.preventDefault()
        const name = topicName.trim()
        if (!name || !selectedTopic) return

        if (topics.some(t => t.id !== selectedTopic.id && t.name.toLowerCase() === name.toLowerCase())) {
            return toast.error('Topic name conflict')
        }

        // Eager UI updates
        setShowRename(false)
        setSelectedTopic(null)
        const toastId = toast.loading('Applying refactor...')

        const { error } = await updateTopic(selectedTopic.id, name)
        if (error) toast.error(`Update failed: ${error.message}`, { id: toastId })
        else toast.success('✨ Cluster refactored', { id: toastId })
    }

    const handleDelete = async (topic) => {
        const stats = topicStats[topic.id]
        const hasContent = stats?.total > 0
        const message = hasContent
            ? `🔥 WARNING: "${topic.name}" contains ${stats.total} challenges. Purging this cluster will ERASE ALL nested challenges and sub-clusters. Continue?`
            : `🔥 Purge knowledge cluster "${topic.name}"?`

        if (!confirm(message)) return

        const toastId = toast.loading('Erasing cluster...')
        const { error } = await deleteTopic(topic.id)
        if (error) toast.error(`Deletion failed: ${error.message}`, { id: toastId })
        else toast.success('🗑️ Cluster erased from knowledge base', { id: toastId })
    }

    const openRename = (topic) => {
        setSelectedTopic(topic)
        setTopicName(topic.name)
        setShowRename(true)
    }

    return (
        <Layout
            title="Knowledge Clusters"
            actions={
                <button onClick={() => { setTopicName(''); setShowAdd(true) }} className="btn-primary h-12 px-6 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary-500/20">
                    <Plus size={16} strokeWidth={3} /> NEW CLUSTER
                </button>
            }
        >
            <div className="space-y-10 animate-in max-w-7xl mx-auto pb-20">
                {/* Search & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative group w-full max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input className="input pl-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus:shadow-lg text-sm font-bold placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            placeholder="Find specific cluster..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map(topic => (
                        <TopicCard
                            key={topic.id}
                            topic={topic}
                            stats={topicStats[topic.id]}
                            onDelete={handleDelete}
                            onRename={openRename}
                            canManage={user?.id === topic.created_by}
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
                            <Library size={48} className="text-slate-200 dark:text-slate-800 mb-6" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No clusters detected in logs</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Cluster">
                <form onSubmit={handleAddTopic} className="space-y-8 p-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400">Cluster Designation</label>
                            <input className="input h-14 pl-6" placeholder="e.g. Dynamic Programming" value={topicName}
                                onChange={e => setTopicName(e.target.value)} autoFocus required />
                        </div>
                        <div className="space-y-2">
                            <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400">Parent Cluster (Optional)</label>
                            <select
                                className="input h-14 px-6 w-full appearance-none bg-white dark:bg-slate-900"
                                value={parentId}
                                onChange={e => setParentId(e.target.value)}
                            >
                                <option value="">No Parent (Top-level)</option>
                                {topics.filter(t => !t.parent_id).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="btn-primary h-14 flex-1 font-black uppercase tracking-widest text-xs">Establish Cluster</button>
                        <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary h-14 px-8 font-black uppercase tracking-widest text-xs">Abort</button>
                    </div>
                </form>
            </Modal>

            {/* Rename Modal */}
            <Modal isOpen={showRename} onClose={() => setShowRename(false)} title="Refactor Cluster">
                <form onSubmit={handleRename} className="space-y-8 p-2">
                    <div className="space-y-2">
                        <label className="label">New Designation</label>
                        <input className="input h-14 pl-6" placeholder="e.g. Advanced DP" value={topicName}
                            onChange={e => setTopicName(e.target.value)} autoFocus required />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="btn-primary h-14 flex-1 font-black uppercase tracking-widest text-xs">Apply Refactor</button>
                        <button type="button" onClick={() => setShowRename(false)} className="btn-secondary h-14 px-8 font-black uppercase tracking-widest text-xs">Abort</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    )
}
