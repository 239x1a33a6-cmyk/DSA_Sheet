import { STATUS } from '../../utils/constants'

const STATUSES = ['unsolved', 'solved', 'revisit', 'hard']

export default function StatusToggle({ current, onChange, size = 'sm', disabled = false }) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-[9px]',
        md: 'px-4 py-1.5 text-[10px]',
        lg: 'px-6 py-3 text-xs',
        xl: 'px-8 py-4 text-xs',
    }

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {STATUSES.map((s) => {
                const isActive = current === s
                const conf = STATUS[s]
                return (
                    <button
                        key={s}
                        disabled={disabled}
                        onClick={() => onChange(s)}
                        className={`
                          ${sizeClasses[size]} rounded-lg font-bold uppercase tracking-wider border transition-all duration-200 active:scale-95 flex items-center gap-1.5
                          ${isActive
                                ? conf.color + ' border-transparent shadow-md'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-500'
                            }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}>
                            {conf.emoji}
                        </span>
                        <span>{conf.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
