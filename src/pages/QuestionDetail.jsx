import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Edit, Trash2, Lock, Share2, Save, User as UserIcon, Calendar, Target } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Layout from '../components/layout/Layout'
import StatusToggle from '../components/ui/StatusToggle'
import QuestionForm from '../components/questions/QuestionForm'
import Modal from '../components/ui/Modal'
import { useQuestionStore } from '../store/useQuestionStore'
import { useTopicStore } from '../store/useTopicStore'
import { useAuthStore } from '../store/useAuthStore'
import { DIFFICULTY, STATUS } from '../utils/constants'
import toast from 'react-hot-toast'

export default function QuestionDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { questions, statuses, setStatus, updateQuestion, deleteQuestion, fetchAllQuestions, fetchStatuses } = useQuestionStore()
    const { topics, fetchTopics } = useTopicStore()

    const [showEdit, setShowEdit] = useState(false)
    const [personalNotes, setPersonalNotes] = useState('')
    const [isEditingNotes, setIsEditingNotes] = useState(false)

    useEffect(() => {
        if (questions.length === 0) fetchAllQuestions()
        if (topics.length === 0) fetchTopics()
        if (user) fetchStatuses(user.id)
    }, [user])

    const question = questions.find(q => q.id === id)
    const qStatus = statuses[id]
    const currentStatus = qStatus?.status || 'unsolved'

    useEffect(() => {
        if (qStatus?.personal_notes) setPersonalNotes(qStatus.personal_notes)
    }, [qStatus])

    if (!question) return (
        <Layout title="Question Details">
            <div className="text-center py-20 flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating question data...</p>
            </div>
        </Layout>
    )

    const diff = DIFFICULTY[question.difficulty] || DIFFICULTY.Easy

    const handleStatusChange = async (newStatus) => {
        if (!user) return
        await setStatus(user.id, question.id, newStatus)
        toast.success(`${STATUS[newStatus].emoji} Syncing status: ${STATUS[newStatus].label}`)
    }

    const handleSavePersonalNotes = async () => {
        if (!user) return
        const { error } = await setStatus(user.id, question.id, currentStatus, personalNotes)
        if (!error) {
            toast.success('🔒 Personal vault updated')
            setIsEditingNotes(false)
        }
    }

    const handleUpdate = async (data) => {
        const { error } = await updateQuestion(id, data)
        if (error) toast.error(error.message)
        else { toast.success('✨ Entry modified successfully'); setShowEdit(false) }
    }

    const handleDelete = async () => {
        if (!confirm('🔥 WARNING: Permanent group-wide deletion. Proceed?')) return
        const { error } = await deleteQuestion(id)
        if (error) toast.error(error.message)
        else { toast.success('🗑️ Record purged'); navigate(-1) }
    }

    return (
        <Layout title="Knowledge Center">
            <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-[10px] font-black text-slate-400 hover:text-primary-600 transition-all uppercase tracking-widest group">
                        <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group-hover:shadow-md">
                            <ArrowLeft size={14} strokeWidth={3} />
                        </div>
                        Return to library
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowEdit(true)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary-500 transition-all shadow-sm">
                            <Edit size={18} />
                        </button>
                        <button onClick={handleDelete} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Primary Detail Card */}
                        <div className="card p-10 dark:bg-slate-900 border-none shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className={`badge ${diff.bg} ${diff.color}`}>{question.difficulty}</span>
                                    {question.topics?.name && (
                                        <span className="badge bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                            {question.topics.name}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                    {question.title}
                                </h1>
                                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                    <span className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <UserIcon size={12} strokeWidth={3} />
                                        </div>
                                        By {question.profiles?.name || 'Group Member'}
                                    </span>
                                    {question.link && (
                                        <a href={question.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline">
                                            <ExternalLink size={14} strokeWidth={3} />
                                            Source Link
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dual Note System */}
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Shared Notes */}
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                                    <div className="p-2 bg-blue-500 text-white rounded-lg"><Share2 size={14} strokeWidth={3} /></div>
                                    Shared Logic
                                </h3>
                                <div className="card p-8 bg-slate-50 dark:bg-slate-800/30 dark:border-slate-800/50 min-h-[300px] prose prose-slate dark:prose-invert prose-sm max-w-none">
                                    {question.shared_notes || question.notes ? (
                                        <ReactMarkdown>{question.shared_notes || question.notes}</ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                                            <MessageSquare size={32} />
                                            <p className="mt-4 text-[10px] uppercase font-black tracking-widest">No group wisdom here yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personal Notes */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="flex items-center gap-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                                        <div className="p-2 bg-amber-500 text-white rounded-lg"><Lock size={14} strokeWidth={3} /></div>
                                        Private Vault
                                    </h3>
                                    {!isEditingNotes ? (
                                        <button onClick={() => setIsEditingNotes(true)} className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-widest">Modify Vault</button>
                                    ) : (
                                        <div className="flex gap-4">
                                            <button onClick={handleSavePersonalNotes} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Encrypt & Save</button>
                                            <button onClick={() => { setIsEditingNotes(false); setPersonalNotes(qStatus?.personal_notes || '') }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abort</button>
                                        </div>
                                    )}
                                </div>

                                <div className="animate-in">
                                    {isEditingNotes ? (
                                        <textarea
                                            className="input w-full min-h-[300px] font-mono text-sm p-8 bg-amber-50/10 border-amber-500/30 focus:border-amber-500 ring-0 dark:bg-amber-500/5"
                                            value={personalNotes}
                                            onChange={(e) => setPersonalNotes(e.target.value)}
                                            placeholder="Confidential notes go here... (Only you can access these)"
                                        />
                                    ) : (
                                        <div className="card p-8 bg-amber-50/50 border-amber-500/10 dark:bg-amber-500/5 dark:border-amber-500/10 min-h-[300px] prose prose-slate dark:prose-invert prose-sm max-w-none shadow-inner">
                                            {personalNotes ? (
                                                <ReactMarkdown>{personalNotes}</ReactMarkdown>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                                                    <Lock size={32} />
                                                    <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-center">Your private space is empty</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-10">
                        {/* Status Card */}
                        <div className="card p-8 dark:bg-slate-900 border-none shadow-xl bg-gradient-to-br from-white to-slate-50/50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-6 px-1">Current Sync Status</label>
                            <StatusToggle current={currentStatus} onChange={handleStatusChange} size="md" />

                            <div className="mt-10 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary-500/10 text-primary-500 rounded-lg"><Target size={14} strokeWidth={3} /></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempts</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{qStatus?.attempts || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Calendar size={14} strokeWidth={3} /></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        {qStatus?.last_updated ? new Date(qStatus.last_updated).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modify Challenge" size="lg">
                <QuestionForm
                    topics={topics}
                    initial={question}
                    onSubmit={handleUpdate}
                    onSuccess={() => setShowEdit(false)}
                    onCancel={() => setShowEdit(false)}
                />
            </Modal>
        </Layout>
    )
}
