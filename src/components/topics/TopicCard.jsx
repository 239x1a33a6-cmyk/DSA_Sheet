import { useNavigate } from 'react-router-dom'
import { Trash2, Edit2, ChevronRight, Users, BookOpen } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'
import { PREDEFINED_TOPICS } from '../../utils/constants'

export default function TopicCard({ topic, stats, onDelete, onRename, canManage }) {
    const navigate = useNavigate()

    const total = stats?.total || 0
    const solved = stats?.solved || 0
    const contributors = stats?.contributors || 0
    const pct = Math.round((solved / total) * 100 || 0)

    // Match topic with predefined to get emoji and gradient
    const meta = PREDEFINED_TOPICS.find(t => t.name.toLowerCase() === topic.name.toLowerCase()) || {
        icon: '📚',
        color: 'from-slate-500/20 to-slate-600/10'
    }

    return (
        <div
            className="group card-hover p-6 cursor-pointer flex flex-col justify-between h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            onClick={() => navigate(`/topics/${topic.id}`)}
        >
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-inner`}>
                            {meta.icon}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">{topic.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{total} Questions</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-black text-primary-600 dark:text-primary-400">{pct}%</span>
                    </div>
                    <ProgressBar
                        value={solved}
                        max={total}
                        colorClass="bg-gradient-to-r from-primary-500 to-indigo-600"
                        showLabel={false}
                        height="h-2"
                    />
                </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-lg">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            {solved} Solved
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-lg">
                        <Users size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            {contributors} Friends
                        </span>
                    </div>
                </div>

                <div className="flex gap-1">
                    {canManage && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); onRename(topic) }}
                                className="p-2 text-slate-300 hover:text-primary-500 dark:text-slate-600 dark:hover:text-primary-400"
                            >
                                <Edit2 size={15} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(topic) }}
                                className="p-2 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    )}
                    <div className="p-2 text-slate-300 group-hover:text-primary-500 dark:text-slate-700 transition-colors">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    )
}
