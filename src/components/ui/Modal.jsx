import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-xl',
        xl: 'max-w-2xl',
        '2xl': 'max-w-4xl'
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={`relative w-full ${sizes[size]} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in`}>
                <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{title}</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-110">
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-10 scrollbar-hide bg-white dark:bg-slate-900">
                    {children}
                </div>
            </div>
        </div>
    )
}
