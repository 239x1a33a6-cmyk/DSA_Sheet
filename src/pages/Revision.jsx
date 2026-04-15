import { useEffect, useMemo, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, X, ExternalLink, Zap, Target, BookOpen, Layers, Flame } from 'lucide-react'
import Layout from '../components/layout/Layout'
import StatusToggle from '../components/ui/StatusToggle'
import { useQuestionStore } from '../store/useQuestionStore'
import { useTopicStore } from '../store/useTopicStore'
import { useAuthStore } from '../store/useAuthStore'
import { STATUS } from '../utils/constants'
import toast from 'react-hot-toast'

const FILTERS = [
    { id: 'revisit', label: 'Revisit', desc: 'Vaulted items', emoji: '🔁', color: 'from-amber-400 to-amber-600' },
    { id: 'hard', label: 'Hard', desc: 'The challenges', emoji: '🔥', color: 'from-purple-400 to-purple-600' },
    { id: 'unsolved', label: 'Unsolved', desc: 'New territory', emoji: '⏳', color: 'from-slate-400 to-slate-600' },
    { id: 'all', label: 'All', desc: 'The database', emoji: '📚', color: 'from-primary-400 to-primary-600' },
]

export default function Revision() {
    const { user } = useAuthStore()
    const { questions, statuses, fetchAllQuestions, fetchStatuses, setStatus } = useQuestionStore()
    const { topics, fetchTopics } = useTopicStore()
    const [filter, setFilter] = useState('revisit')
    const [sessionActive, setSessionActive] = useState(false)
    const [idx, setIdx] = useState(0)
    const [topicFilter, setTopicFilter] = useState('all')
    const [diffFilter, setDiffFilter] = useState('All')

    useEffect(() => {
        fetchAllQuestions()
        fetchTopics()
        if (user) fetchStatuses(user.id)
    }, [user])

    const pool = useMemo(() => {
        let qs = questions.filter(q => {
            const s = statuses[q.id]?.status || 'unsolved'
            if (filter === 'all') return true
            return s === filter
        })
        if (topicFilter !== 'all') qs = qs.filter(q => q.topic_id === topicFilter)
        if (diffFilter !== 'All') qs = qs.filter(q => q.difficulty === diffFilter)
        return qs
    }, [questions, statuses, filter, topicFilter, diffFilter])

    const [sessionPool, setSessionPool] = useState([])

    const startSession = () => {
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        setSessionPool(shuffled)
        setIdx(0)
        setSessionActive(true)
    }

    const current = sessionPool[idx]
    const currentStatus = current ? (statuses[current.id]?.status || 'unsolved') : null

    const handleStatusChange = async (newStatus) => {
        if (!user || !current) return
        await setStatus(user.id, current.id, newStatus)
        toast.success(`${STATUS[newStatus].emoji} Syncing: ${STATUS[newStatus].label}`)
    }

    const next = () => { if (idx < sessionPool.length - 1) setIdx(i => i + 1) }
    const prev = () => { if (idx > 0) setIdx(i => i - 1) }

    useEffect(() => {
        if (!sessionActive) return
        const handler = (e) => {
            if (e.key === 'ArrowRight') next()
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'Escape') setSessionActive(false)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [sessionActive, idx, sessionPool.length])

    if (sessionActive && current) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 z-50 animate-in transition-colors duration-500">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl -mr-80 -mt-80 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -ml-80 -mb-80 pointer-events-none" />

                <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${((idx + 1) / sessionPool.length) * 100}%` }}
                    />
                </div>

                <div className="absolute top-10 left-10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none">Focus Mode</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Challenge {idx + 1} of {sessionPool.length}</div>
                    </div>
                </div>

                <button onClick={() => setSessionActive(false)}
                    className="absolute top-10 right-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-all hover:scale-110">
                    <X size={20} strokeWidth={3} />
                </button>

                <div className="w-full max-w-2xl space-y-10 relative z-10">
                    <div className="card-hover p-12 dark:bg-slate-900 border-none shadow-2xl relative overflow-hidden text-center group">
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                            <span className={`badge ${current.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                                current.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                                    'bg-rose-500/10 text-rose-600'
                                } px-4 py-1.5 rounded-full`}>{current.difficulty}</span>
                            <span className="badge bg-primary-500/10 text-primary-600 dark:text-primary-400 px-4 py-1.5 rounded-full">
                                {current.topics?.name}
                            </span>
                        </div>

                        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-12 leading-tight tracking-tight px-4">{current.title}</h2>

                        <div className="space-y-10 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col items-center gap-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Update Mastery Status</label>
                                <StatusToggle current={currentStatus} onChange={handleStatusChange} size="xl" />
                            </div>

                            {current.link && (
                                <a href={current.link} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:shadow-lg transition-all hover:-translate-y-0.5">
                                    <ExternalLink size={16} strokeWidth={3} /> Open Source Material
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-12 px-2">
                        <button onClick={prev} disabled={idx === 0}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                                ${idx === 0 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                            <ChevronLeft size={20} strokeWidth={3} /> Previous
                        </button>

                        <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                            Use <span className="p-1 px-2 border rounded-lg bg-slate-50 dark:bg-slate-900">←</span> <span className="p-1 px-2 border rounded-lg bg-slate-50 dark:bg-slate-900">→</span> to navigate
                        </div>

                        {idx < sessionPool.length - 1 ? (
                            <button onClick={next} className="btn-primary flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30">
                                NEXT CHALLENGE <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        ) : (
                            <button onClick={() => setSessionActive(false)} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95">
                                <CheckCircle size={20} strokeWidth={3} /> FINISH SESSION
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Layout title="Session Intel">
            <div className="max-w-6xl mx-auto space-y-16 animate-in pb-20">
                <div className="text-center space-y-4">
                    <h2 className="text-xs font-black text-primary-500 uppercase tracking-[0.3em]">Initialize Training</h2>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Revision Sub-system</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FILTERS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`group relative p-8 rounded-3xl text-left transition-all duration-500 border-2 overflow-hidden
                                ${filter === f.id
                                    ? 'border-primary-500 bg-white dark:bg-slate-900 shadow-2xl shadow-primary-500/10'
                                    : 'bg-white/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-full -mr-12 -mt-12`} />

                            <div className="relative z-10">
                                <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{f.emoji}</div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${filter === f.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>{f.label}</div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white mb-6 leading-tight">{f.desc}</div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${filter === f.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {questions.filter(q => {
                                        const s = statuses[q.id]?.status || 'unsolved'
                                        return f.id === 'all' ? true : s === f.id
                                    }).length} ITEMS
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="card p-10 bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 space-y-4">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <Layers size={14} className="text-primary-500" /> Filter by Knowledge Area
                            </label>
                            <select className="input h-14 pl-6 text-sm font-bold uppercase tracking-wider dark:bg-slate-900" value={topicFilter}
                                onChange={e => setTopicFilter(e.target.value)}>
                                <option value="all">Unrestricted (All Clusters)</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 space-y-4">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <Flame size={14} className="text-orange-500" /> Filter by Intensity
                            </label>
                            <select className="input h-14 pl-6 text-sm font-bold uppercase tracking-wider dark:bg-slate-900" value={diffFilter}
                                onChange={e => setDiffFilter(e.target.value)}>
                                {['All Intensities', 'Easy', 'Medium', 'Hard'].map(d => (
                                    <option key={d} value={d === 'All Intensities' ? 'All' : d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8">
                    <button
                        onClick={startSession}
                        disabled={pool.length === 0}
                        className="btn-primary group h-20 px-16 rounded-3xl font-black text-sm uppercase tracking-[.3em] shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        INITIALIZE SESSION
                    </button>
                    {pool.length === 0 && (
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mt-6 animate-pulse">Filter parameters return empty pool</p>
                    )}
                </div>
            </div>
        </Layout>
    )
}
