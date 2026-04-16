import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Bookmark, BookmarkCheck, Calendar, Hash, Users, User as UserIcon, MessageSquare } from 'lucide-react'
import StatusToggle from '../ui/StatusToggle'
import { STATUS, DIFFICULTY } from '../../utils/constants'
import { useAuthStore } from '../../store/useAuthStore'
import { useQuestionStore } from '../../store/useQuestionStore'
import toast from 'react-hot-toast'

const LeetCodeIcon = ({ size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="transition-transform hover:scale-110"
    >
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.774 9.774a1.374 1.374 0 1 0 1.94 1.94L14.46 2.355a1.374 1.374 0 0 0-1.942-1.941l-.961-.414h-.074zm-3.21 21.312l-1.42 1.42a1.374 1.374 0 0 1-1.94 0l-3.35-3.35a1.374 1.374 0 0 1 0-1.94l1.42-1.42a1.374 1.374 0 0 1 1.94 0l3.35 3.35a1.374 1.374 0 0 1 0 1.94zM23.425 9.043l-2.03-2.03a1.374 1.374 0 0 0-1.94 0l-10.43 10.43a1.374 1.374 0 1 0 1.94 1.94l10.43-10.43a1.374 1.374 0 0 0 0-1.94zm-14.93 9.45l-1.94 1.94-1.94-1.94 1.94-1.94 1.94 1.94z" />
    </svg>
)

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

    const isLeetCode = question.link?.toLowerCase().includes('leetcode.com')

    return (
        <div
            className={`group card overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md dark:bg-slate-900/50 ${currentStatus === 'solved' ? 'border-emerald-500' : currentStatus === 'revisit' ? 'border-amber-500' : currentStatus === 'hard' ? 'border-purple-500' : 'border-slate-200 dark:border-slate-800'}`}
        >
            <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Header: Difficulty & Title */}
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${diff.bg} ${diff.color}`}>
                                {question.difficulty}
                            </span>
                            {showTopic && question.topics?.name && (
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    • {question.topics.name}
                                </span>
                            )}
                            <div className="flex items-center gap-1 flex-shrink-0 ml-auto md:hidden">
                                <button onClick={handleBookmark} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    {isBookmarked ? <BookmarkCheck size={16} className="text-amber-500 fill-amber-500" /> : <Bookmark size={16} className="text-slate-400" />}
                                </button>
                                {question.link && (
                                    <a href={question.link} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-[#FFA116]"
                                        onClick={e => e.stopPropagation()}>
                                        {isLeetCode ? <LeetCodeIcon size={16} /> : <ExternalLink size={16} />}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <button
                                onClick={() => navigate(`/questions/${question.id}`)}
                                className="text-base font-bold text-slate-900 hover:text-primary-600 transition-colors text-left dark:text-white dark:hover:text-primary-400 leading-snug tracking-tight"
                            >
                                {question.title}
                            </button>

                            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                                <button onClick={handleBookmark} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    {isBookmarked ? <BookmarkCheck size={16} className="text-amber-500 fill-amber-500" /> : <Bookmark size={16} className="text-slate-400" />}
                                </button>
                                {question.link && (
                                    <a href={question.link} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-[#FFA116]"
                                        onClick={e => e.stopPropagation()}>
                                        {isLeetCode ? <LeetCodeIcon size={18} /> : <ExternalLink size={18} />}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            <span className="flex items-center gap-1">
                                <UserIcon size={12} className="text-slate-300" />
                                {addedBy.split(' ')[0]}
                            </span>
                            {solvers.length > 0 && (
                                <span className="flex items-center gap-1.5 text-emerald-600/70 dark:text-emerald-400/70">
                                    <Users size={12} />
                                    {solvers.length} Solved
                                </span>
                            )}
                            {lastUpdated && (
                                <span className="text-slate-300 dark:text-slate-600">
                                    {lastUpdated}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Compact Status Toggle */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                        <StatusToggle current={currentStatus} onChange={handleStatusChange} size="sm" />
                    </div>
                </div>
            </div>
        </div>
    )
}
