import { useEffect } from 'react'
import { useActivityStore } from '../../store/useActivityStore'
import { Clock, Plus, Check, Zap, LogIn } from 'lucide-react'

export default function ActivityFeed() {
    const { activities, loading, fetchActivities, subscribe } = useActivityStore()

    useEffect(() => {
        fetchActivities()
        const unsubscribe = subscribe()
        return unsubscribe
    }, [])

    if (loading && activities.length === 0) {
        return (
            <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />

            {activities.length === 0 ? (
                <div className="text-center py-10">
                    <Zap size={24} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting pulse...</p>
                </div>
            ) : (
                <div className="space-y-8 relative">
                    {activities.map((item) => {
                        const isLogin = item.type === 'login'
                        const isSolved = item.type === 'solved_question' || item.action === 'solved_question'

                        let bgColor = 'bg-primary-500'
                        let Icon = Plus
                        let actionLabel = 'shared'
                        let detail = item.questions?.title || 'a challenge'

                        if (isLogin) {
                            bgColor = 'bg-indigo-500'
                            Icon = LogIn
                            actionLabel = 'entered the arena'
                            detail = ''
                        } else if (isSolved) {
                            bgColor = 'bg-emerald-500'
                            Icon = Check
                            actionLabel = 'mastered'
                        }

                        return (
                            <div key={item.id} className="flex gap-4 group">
                                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${bgColor} text-white`}>
                                    <Icon size={14} strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                        <span className="font-black text-slate-900 dark:text-white">
                                            {item.profiles?.name || 'User'}
                                        </span>
                                        {' '}
                                        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                                            {actionLabel}
                                        </span>
                                        {' '}
                                        {detail && (
                                            <span className="font-black text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                                                {detail}
                                            </span>
                                        )}
                                    </p>
                                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                        <Clock size={10} strokeWidth={3} />
                                        <span>
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
