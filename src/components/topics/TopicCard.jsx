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
            className="group card overflow-hidden p-4 cursor-pointer transition-all duration-300 hover:shadow-md bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
            onClick={() => navigate(`/topics/${topic.id}`)}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shadow-inner flex-shrink-0`}>
                    {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate tracking-tight uppercase group-hover:text-primary-500 transition-colors leading-none">{topic.name}</h3>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{total} Qs</span>
                        <span className="text-slate-200 dark:text-slate-800">•</span>
                        <span className="text-emerald-500/80">{solved} Solved</span>
                        <span className="text-slate-200 dark:text-slate-800">•</span>
                        <span className="text-blue-500/80">{contributors} Friends</span>
                    </div>

                    <div className="mt-3">
                        <ProgressBar
                            value={solved}
                            max={total}
                            colorClass="bg-gradient-to-r from-primary-500 to-indigo-600"
                            showLabel={false}
                            height="h-1"
                        />
                    </div>
                </div>

                {canManage && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={(e) => { e.stopPropagation(); onRename(topic) }}
                            className="p-1.5 text-slate-300 hover:text-primary-500 dark:text-slate-600 dark:hover:text-primary-400"
                        >
                            <Edit2 size={13} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(topic) }}
                            className="p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
