import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CheckCircle, RotateCcw, ArrowRight, BookOpen, PlusCircle,
    Activity, TrendingUp, Target, Zap, Waves, Flame
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import ProgressBar from '../components/ui/ProgressBar'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import { useAuthStore } from '../store/useAuthStore'
import { useQuestionStore } from '../store/useQuestionStore'
import { useTopicStore } from '../store/useTopicStore'
import { PREDEFINED_TOPICS } from '../utils/constants'

function Heatmap({ statuses }) {
    const weeks = 26
    const today = new Date()
    const cells = []
    for (let w = weeks - 1; w >= 0; w--) {
        for (let d = 0; d < 7; d++) {
            const date = new Date(today)
            date.setDate(today.getDate() - (w * 7 + (6 - d)))
            cells.push(date.toISOString().split('T')[0])
        }
    }

    const activityMap = {}
    Object.values(statuses).forEach(s => {
        if (s?.last_updated) {
            const day = s.last_updated.split('T')[0]
            activityMap[day] = (activityMap[day] || 0) + 1
        }
    })

    const getColor = (count) => {
        if (!count) return 'bg-slate-100 dark:bg-slate-800'
        if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/40'
        if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-600'
        if (count <= 5) return 'bg-emerald-600 dark:bg-emerald-500'
        return 'bg-emerald-800 dark:bg-emerald-400'
    }

    return (
        <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: weeks }).map((_, w) => (
                <div key={w} className="flex flex-col gap-1.5">
                    {Array.from({ length: 7 }).map((_, d) => {
                        const date = cells[w * 7 + d]
                        const count = activityMap[date] || 0
                        return (
                            <div
                                key={d}
                                title={`${date}: ${count} updates`}
                                className={`w-3.5 h-3.5 rounded-sm ${getColor(count)} transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer`}
                            />
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const { user, profile } = useAuthStore()
    const { questions, statuses, fetchAllQuestions, fetchStatuses } = useQuestionStore()
    const { topics, fetchTopics } = useTopicStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchAllQuestions()
        fetchTopics()
        if (user) fetchStatuses(user.id)
    }, [user])

    const stats = useMemo(() => {
        const total = questions.length
        const solved = Object.values(statuses).filter(s => s?.status === 'solved').length
        const rethink = Object.values(statuses).filter(s => s?.status === 'revisit').length
        const contribution = profile?.contribution_count || 0
        return { total, solved, rethink, contribution }
    }, [questions, statuses, profile])

    const topicStats = useMemo(() => {
        const map = {}
        topics.forEach(t => {
            const qs = questions.filter(q => q.topic_id === t.id)
            const solvedCount = qs.filter(q => statuses[q.id]?.status === 'solved').length
            map[t.id] = { total: qs.length, solved: solvedCount }
        })
        return map
    }, [topics, questions, statuses])

    const recentlySolved = useMemo(() => {
        return Object.entries(statuses)
            .filter(([, s]) => s?.status === 'solved')
            .sort((a, b) => new Date(b[1].last_updated) - new Date(a[1].last_updated))
            .slice(0, 5)
            .map(([qId]) => questions.find(q => q.id === qId))
            .filter(Boolean)
    }, [statuses, questions])

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning ☀️'
        if (h < 18) return 'Good afternoon 🌤️'
        return 'Good evening 🌙'
    }

    const STATS = [
        { label: 'Total Solved', value: stats.solved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Revisit Later', value: stats.rethink, icon: RotateCcw, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Your Adds', value: stats.contribution, icon: PlusCircle, color: 'text-primary-500', bg: 'bg-primary-500/10' },
        { label: 'Group Bank', value: stats.total, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    ]

    return (
        <Layout title={`${greeting()}, ${profile?.name || user?.email?.split('@')[0] || 'Member'}`}>
            <div className="space-y-10 pb-20">
                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map(s => (
                        <div key={s.label} className="card p-6 border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                                        <s.icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">{s.label}</span>
                                </div>
                                <div className={`text-4xl font-black ${s.color} tracking-tight`}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Topic Breakdown */}
                        <div className="card p-8 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-500 text-white rounded-lg shadow-lg shadow-primary-500/20">
                                        <Target size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Focus Areas</h2>
                                </div>
                                <button onClick={() => navigate('/topics')} className="text-xs font-black text-primary-600 dark:text-primary-400 hover:underline uppercase tracking-widest flex items-center gap-1.5">
                                    All Topics <ArrowRight size={14} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                                {topics.slice(0, 8).map(t => {
                                    const ts = topicStats[t.id] || { total: 0, solved: 0 }
                                    const meta = PREDEFINED_TOPICS.find(pt => pt.name.toLowerCase() === t.name.toLowerCase())
                                    return (
                                        <div key={t.id} className="group cursor-pointer space-y-3" onClick={() => navigate(`/topics/${t.id}`)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{meta?.icon || '📚'}</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{t.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest">{ts.solved}/{ts.total} SOLVED</span>
                                            </div>
                                            <ProgressBar value={ts.solved} max={ts.total} showLabel={false} height="h-2.5" colorClass="bg-gradient-to-r from-primary-500 to-indigo-600" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Analysis Heatmap */}
                        <div className="card p-8 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20">
                                        <Flame size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Consistency Feed</h2>
                                </div>
                                <div className="flex items-center gap-3 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Cold</span>
                                    {[0, 1, 3, 5, 8].map((c, i) => (
                                        <div key={i} className={`w-3.5 h-3.5 rounded-sm ${i === 0 ? 'bg-slate-100 dark:bg-slate-700' : i === 1 ? 'bg-emerald-200 dark:bg-emerald-900/40' : i === 2 ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-600 dark:bg-emerald-400'}`} />
                                    ))}
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-1">Hot</span>
                                </div>
                            </div>
                            <Heatmap statuses={statuses} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-10">
                        {/* Quick Actions */}
                        <div className="card p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-xl shadow-primary-600/20 border-none relative overflow-hidden group">
                            <Waves className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 group-hover:animate-pulse" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-2 tracking-tight">Ready for a session?</h3>
                                <p className="text-primary-100 text-xs font-bold uppercase tracking-wider mb-8 opacity-80">Daily revision increases retention</p>
                                <div className="space-y-3">
                                    <button onClick={() => navigate('/revision')}
                                        className="w-full bg-white text-primary-600 font-black py-4 px-6 rounded-2xl text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-lg">
                                        <RotateCcw size={18} strokeWidth={3} />
                                        ENTER REVISION MODE
                                    </button>
                                    <button onClick={() => navigate('/topics')}
                                        className="w-full bg-primary-700/50 text-white font-black py-4 px-6 rounded-2xl text-sm border border-white/20 hover:bg-primary-700/80 transition-all flex items-center justify-center gap-3">
                                        <BookOpen size={18} strokeWidth={3} />
                                        PICK A TOPIC
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Wins */}
                        <div className="card p-8 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
                            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Target size={14} strokeWidth={3} className="text-primary-500" /> Recent Solves
                            </h2>
                            {recentlySolved.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No solved items yet</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {recentlySolved.map(q => (
                                        <button
                                            key={q.id}
                                            onClick={() => navigate(`/questions/${q.id}`)}
                                            className="w-full text-left group"
                                        >
                                            <div className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition-colors leading-tight mb-1">{q.title}</div>
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded font-black text-[9px] text-slate-400 uppercase tracking-widest">
                                                {q.topics?.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Activity Stream */}
                        <div className="card p-8 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
                            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                                <Activity size={14} strokeWidth={3} className="text-emerald-500" /> Pulse Feed
                            </h2>
                            <ActivityFeed />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
