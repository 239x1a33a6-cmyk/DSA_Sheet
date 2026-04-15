import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Bookmark, BookmarkCheck, Calendar, Hash, Users, User as UserIcon, MessageSquare } from 'lucide-react'
import StatusToggle from '../ui/StatusToggle'
import { STATUS, DIFFICULTY } from '../../utils/constants'
import { useAuthStore } from '../../store/useAuthStore'
import { useQuestionStore } from '../../store/useQuestionStore'
import toast from 'react-hot-toast'

export default function QuestionCard({ question, showTopic = false }) {
    const { user } = useAuthStore()
    const { statuses, setStatus, toggleBookmark, fetchQuestionSolvers, questionSolvers } = useQuestionStore()
    const navigate = useNavigate()

    const qStatus = statuses[question.id]
    const currentStatus = qStatus?.status || 'unsolved'
    const isBookmarked = qStatus?.bookmarked || false

    const diff = DIFFICULTY[question.difficulty] || DIFFICULTY.Easy
    const statusMeta = STATUS[currentStatus]
    const solvers = questionSolvers[question.id] || []

    useEffect(() => {
        if (question.id) fetchQuestionSolvers(question.id)
    }, [question.id])

    const handleStatusChange = async (newStatus) => {
        if (!user) return
        const { error } = await setStatus(user.id, question.id, newStatus)
        if (!error) {
            toast.success(`${STATUS[newStatus].emoji} Marked as ${STATUS[newStatus].label}`)
            fetchQuestionSolvers(question.id)
        }
    }

    const handleBookmark = async (e) => {
        e.stopPropagation()
        if (!user) return
        await toggleBookmark(user.id, question.id)
        toast.success(isBookmarked ? '🔖 Removed bookmark' : '🔖 Bookmarked!')
    }

    const lastUpdated = qStatus?.last_updated
        ? new Date(qStatus.last_updated).toLocaleDateString()
        : null

    const addedBy = question.profiles?.name || 'Group member'

    return (
        <div
            className={`group card overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg dark:bg-slate-900 ${currentStatus === 'solved' ? 'border-emerald-500' : currentStatus === 'revisit' ? 'border-amber-500' : currentStatus === 'hard' ? 'border-purple-500' : 'border-slate-300 dark:border-slate-700'}`}
        >
            <div className="p-6">
                <div className="flex items-start gap-5">
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`badge ${diff.bg} ${diff.color}`}>{question.difficulty}</span>
                                    {showTopic && question.topics?.name && (
                                        <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded uppercase tracking-widest border border-primary-500/10">
                                            {question.topics.name}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate(`/questions/${question.id}`)}
                                    className="text-lg font-black text-slate-900 hover:text-primary-600 transition-colors text-left dark:text-white dark:hover:text-primary-400 leading-tight"
                                >
                                    {question.title}
                                </button>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1">
                                        <UserIcon size={12} />
                                        Added by {addedBy}
                                    </span>
                                    {solvers.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                            <Users size={12} />
                                            {solvers.length} Solved
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={handleBookmark} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-amber-500 dark:bg-slate-800 transition-all hover:scale-110">
                                    {isBookmarked ? <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" /> : <Bookmark size={18} />}
                                </button>
                                {question.link && (
                                    <a href={question.link} target="_blank" rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary-500 dark:bg-slate-800 transition-all hover:scale-110"
                                        onClick={e => e.stopPropagation()}>
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Status Toggle Area */}
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                            <StatusToggle current={currentStatus} onChange={handleStatusChange} />

                            <div className="flex items-center gap-3">
                                {lastUpdated && (
                                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                                        Last: {lastUpdated}
                                    </span>
                                )}
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm ${statusMeta.color}`}>
                                    <span>{statusMeta.emoji}</span>
                                    <span>{statusMeta.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
