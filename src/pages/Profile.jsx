import { useEffect, useMemo, useState } from 'react'
import { Save, User, Hash, Info, Target, Zap, Waves } from 'lucide-react'
import Layout from '../components/layout/Layout'
import ProgressBar from '../components/ui/ProgressBar'
import { useAuthStore } from '../store/useAuthStore'
import { useQuestionStore } from '../store/useQuestionStore'
import { useTopicStore } from '../store/useTopicStore'
import toast from 'react-hot-toast'

export default function Profile() {
    const { user, profile, updateProfile } = useAuthStore()
    const { questions, statuses, fetchAllQuestions, fetchStatuses } = useQuestionStore()
    const { topics, fetchTopics } = useTopicStore()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: '', bio: '' })

    useEffect(() => {
        fetchAllQuestions()
        fetchTopics()
        if (user) fetchStatuses(user.id)
    }, [user])

    useEffect(() => {
        if (profile) setForm({ name: profile.name || '', bio: profile.bio || '' })
    }, [profile])

    const stats = useMemo(() => {
        const all = Object.values(statuses)
        return {
            solved: all.filter(s => s?.status === 'solved').length,
            revisit: all.filter(s => s?.status === 'revisit').length,
            hard: all.filter(s => s?.status === 'hard').length,
            total: questions.length,
            contributions: profile?.contribution_count || 0
        }
    }, [statuses, questions, profile])

    const topicStats = useMemo(() => {
        return topics.map(t => {
            const qs = questions.filter(q => q.topic_id === t.id)
            const solved = qs.filter(q => statuses[q.id]?.status === 'solved').length
            return { ...t, total: qs.length, solved }
        }).filter(t => t.total > 0)
    }, [topics, questions, statuses])

    const handleSave = async () => {
        setEditing(false)
        const toastId = toast.loading('Synchronizing identity...')
        const { error } = await updateProfile(form)
        if (error) toast.error(`Refraction failed: ${error.message}`, { id: toastId })
        else toast.success('✨ Profile synchronized', { id: toastId })
    }

    const avatarLetter = (profile?.name || user?.email || 'U')[0].toUpperCase()

    const STAT_ITEMS = [
        { label: 'Solved Items', value: stats.solved, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Review List', value: stats.hard + stats.revisit, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Contributions', value: stats.contributions, color: 'text-primary-500', bg: 'bg-primary-500/10' },
        { label: 'Group Bank', value: stats.total, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    ]

    return (
        <Layout title="User Preferences">
            <div className="max-w-5xl mx-auto space-y-12 animate-in pb-20">
                {/* Header Section */}
                <div className="card p-10 dark:bg-slate-900 border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-primary-500/30">
                            {avatarLetter}
                        </div>
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            {editing ? (
                                <div className="space-y-6 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="label">Public Designation</label>
                                        <input className="input h-14" placeholder="Your name"
                                            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label">Professional Brief</label>
                                        <textarea className="input resize-none py-4" rows={3} placeholder="Tell us about your DSA journey..."
                                            value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                                    </div>
                                    <div className="flex gap-3 justify-center md:justify-start pt-2">
                                        <button onClick={handleSave} className="btn-primary px-8 h-12 font-black uppercase tracking-widest text-xs">Commit Changes</button>
                                        <button onClick={() => setEditing(false)} className="btn-secondary px-8 h-12 font-black uppercase tracking-widest text-xs">Abort</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{profile?.name || 'Anonymous Solver'}</h2>
                                        <p className="text-sm font-black text-primary-500 uppercase tracking-[0.2em]">{user?.email}</p>
                                    </div>
                                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-medium italic">
                                        "{profile?.bio || "This solver has not yet shared their professional brief."}"
                                    </p>
                                    <button onClick={() => setEditing(true)} className="btn-secondary h-12 px-6 font-black uppercase tracking-widest text-[10px] group">
                                        <User size={16} className="group-hover:rotate-12 transition-transform" /> Edit Identity
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid for Stats and Topic mastery */}
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Performance Overview */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                                <Target size={14} className="text-primary-500" /> Intel Summary
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {STAT_ITEMS.map((s, i) => (
                                    <div key={s.label} className="card p-6 dark:bg-slate-900 border-none shadow-lg flex items-center justify-between group overflow-hidden relative">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.color.replace('text-', 'bg-')}`} />
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{s.label}</div>
                                            <div className={`text-3xl font-black ${s.color} tracking-tight`}>{s.value}</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl ${s.bg} ${s.color} opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0`}>
                                            <Info size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="card p-8 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[.2em]">Deployment Tier</label>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={14} className="text-amber-500 fill-amber-500" /> Premium Access
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[.2em]">Operational Since</label>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Alpha Era'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Topic Mastery breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                            <Hash size={14} className="text-indigo-500" /> Mastery Vectors
                        </h3>
                        <div className="card p-10 dark:bg-slate-900 border-none shadow-xl space-y-10">
                            {topicStats.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <Waves size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting field data...</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-1 gap-12">
                                    {topicStats.sort((a, b) => b.solved - a.solved).map(t => (
                                        <div key={t.id} className="space-y-4 group">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">{t.name}</span>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery Efficiency: {Math.round((t.solved / t.total) * 100)}%</div>
                                                </div>
                                                <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                                                    {t.solved} / {t.total}
                                                </span>
                                            </div>
                                            <ProgressBar value={t.solved} max={t.total} showLabel={false} height="h-3" colorClass="bg-gradient-to-r from-primary-500 to-indigo-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
