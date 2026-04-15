export default function ProgressBar({ value, max, colorClass = 'bg-primary-600', showLabel = true, height = 'h-2' }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

    return (
        <div className="w-full">
            <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full ${height} overflow-hidden shadow-inner`}>
                <div
                    className={`${colorClass} ${height} rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{value} / {max} Completed</span>
                    <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{pct}%</span>
                </div>
            )}
        </div>
    )
}
