import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, X } from 'lucide-react'
import { useQuestionStore } from '../../store/useQuestionStore'

export default function Topbar({ title, actions }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [showResults, setShowResults] = useState(false)
    const { questions } = useQuestionStore()
    const navigate = useNavigate()

    const handleSearch = (val) => {
        setQuery(val)
        if (!val.trim()) { setResults([]); setShowResults(false); return }
        const filtered = questions.filter(q =>
            q.title.toLowerCase().includes(val.toLowerCase()) ||
            q.tags?.some(t => t.toLowerCase().includes(val.toLowerCase()))
        ).slice(0, 8)
        setResults(filtered)
        setShowResults(true)
    }

    const DIFF_COLORS = { Easy: 'text-green-500', Medium: 'text-yellow-500', Hard: 'text-red-500' }

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 glass">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h1>

            <div className="flex items-center gap-3 flex-1 max-w-md mx-6 relative">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search questions, tags..."
                        value={query}
                        onChange={e => handleSearch(e.target.value)}
                        onFocus={() => query && setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        className="input pl-9 pr-8 h-9 text-sm"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setResults([]); setShowResults(false) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={13} />
                        </button>
                    )}

                    {showResults && results.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 card shadow-xl py-1 z-50 animate-fade-in max-h-80 overflow-y-auto">
                            {results.map(q => (
                                <button
                                    key={q.id}
                                    onClick={() => { navigate(`/questions/${q.id}`); setShowResults(false); setQuery('') }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                                >
                                    <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{q.title}</span>
                                    <span className={`text-xs ml-2 flex-shrink-0 font-medium ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showResults && query && results.length === 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 card shadow-xl py-4 z-50 text-center text-sm text-slate-500 dark:text-slate-400">
                            No questions found
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {actions}
            </div>
        </header>
    )
}
