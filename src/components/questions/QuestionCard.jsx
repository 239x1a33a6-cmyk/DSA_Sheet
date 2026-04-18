import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Bookmark, BookmarkCheck, Calendar, Hash, Users, User as UserIcon, MessageSquare, Trash2 } from 'lucide-react'
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
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-110"
    >
        <path d="M22 14.355c0-.742-.564-1.346-1.26-1.346H10.631c-.696 0-1.26.604-1.26 1.346s.564 1.346 1.26 1.346H20.74c.696 0 1.26-.604 1.26-1.346z" fill="#B3B3B3" />
        <path d="m3.482 18.187 4.313 4.361c.973.979 2.318.979 3.291 0l1.275-1.289c.973-.979.973-2.332 0-3.311L8.27 13.51a2.33 2.33 0 0 1 0-3.311L12.361 6.11c.973-.979.973-2.332 0-3.311L11.086 1.51c-.973-.979-2.318-.979-3.291 0l-4.313 4.361a6.43 6.43 0 0 0 0 9.005z" fill="#000" />
        <path d="M17.015 20.388c-.973.979-2.311.979-3.284 0l-.033-.033a2.29 2.29 0 0 1 0-3.275l1.896-1.929a1.28 1.28 0 0 0 0-1.821l-3.576-3.633c-.973-.979-.973-2.332 0-3.311l.033-.033a2.29 2.29 0 0 1 3.284 0l6.09 6.13a4.54 4.54 0 0 1 0 6.18l-1.41 1.425z" fill="#FFA116" />
    </svg>
)

export default function QuestionCard({ question, showTopic = false }) {
    const { user } = useAuthStore()
    const { statuses, setStatus, toggleBookmark, fetchQuestionSolvers, questionSolvers, deleteQuestion } = useQuestionStore()
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

    const handleDelete = async (e) => {
        e.stopPropagation()
        if (!confirm('🔥 Purge this challenge?')) return
        const toastId = toast.loading('Deleting...')
        const { error } = await deleteQuestion(question.id)
        if (error) toast.error(error.message, { id: toastId })
        else toast.success('🗑️ Challenge erased', { id: toastId })
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
                                        {isLeetCode ? <LeetCodeIcon size={10} /> : <ExternalLink size={10} />}
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
                                        {isLeetCode ? <LeetCodeIcon size={16} /> : <ExternalLink size={16} />}
                                    </a>
                                )}
                                {user?.id === question.created_by && (
                                    <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            <span className="flex items-center gap-1">
                                <UserIcon size={12} className="text-slate-300" />
                                {addedBy.split(' ')[0]}
                            </span>
                            {solvers.length > 0 && (
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
                                    <Users size={12} strokeWidth={3} />
                                    {solvers.length} SOLVED
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
