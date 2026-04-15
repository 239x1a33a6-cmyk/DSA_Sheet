import { STATUS } from '../../utils/constants'

const STATUSES = ['unsolved', 'solved', 'revisit', 'hard']

export default function StatusToggle({ current, onChange, size = 'sm', disabled = false }) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-[10px]',
        md: 'px-5 py-2 text-[10px]',
        lg: 'px-6 py-3 text-xs',
        xl: 'px-8 py-4 text-xs',
    }

    return (
        <div className="flex items-center gap-2.5 flex-wrap">
            {STATUSES.map((s) => {
                const isActive = current === s
                const conf = STATUS[s]
                return (
                    <button
                        key={s}
                        disabled={disabled}
                        onClick={() => onChange(s)}
                        className={`
                          ${sizeClasses[size]} rounded-xl font-black uppercase tracking-[0.1em] border-2 transition-all duration-300 active:scale-95 flex items-center gap-2
                          ${isActive
                                ? conf.color + ' border-transparent shadow-lg transform -translate-y-0.5'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200'
                            }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <span className={`transition-transform duration-300 ${isActive ? 'scale-125' : 'grayscale group-hover:grayscale-0'}`}>
                            {conf.emoji}
                        </span>
                        <span>{conf.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
