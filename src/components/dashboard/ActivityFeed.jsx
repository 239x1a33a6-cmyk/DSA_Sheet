import { useEffect } from 'react'
import { useActivityStore } from '../../store/useActivityStore'
import { Clock, Plus, Check, Zap } from 'lucide-react'

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
                        const isSolved = item.action === 'solved_question'
                        return (
                            <div key={item.id} className="flex gap-4 group">
                                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${isSolved ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'}`}>
                                    {isSolved ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                        <span className="font-black text-slate-900 dark:text-white">
                                            {item.profiles?.name || 'User'}
                                        </span>
                                        {' '}
                                        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                                            {isSolved ? 'mastered' : 'shared'}
                                        </span>
                                        {' '}
                                        <span className="font-black text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                                            {item.questions?.title || 'a challenge'}
                                        </span>
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
