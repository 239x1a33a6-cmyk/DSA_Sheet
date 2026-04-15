export const PREDEFINED_TOPICS = [
    { name: 'Arrays', icon: '📦', color: 'from-blue-500/20 to-blue-600/10' },
    { name: 'Strings', icon: '🧵', color: 'from-purple-500/20 to-purple-600/10' },
    { name: 'Linked List', icon: '🔗', color: 'from-indigo-500/20 to-indigo-600/10' },
    { name: 'Stack', icon: '🥞', color: 'from-cyan-500/20 to-cyan-600/10' },
    { name: 'Queue', icon: '🏎️', color: 'from-teal-500/20 to-teal-600/10' },
    { name: 'Trees', icon: '🌳', color: 'from-green-500/20 to-green-600/10' },
    { name: 'Graphs', icon: '🕸️', color: 'from-yellow-500/20 to-yellow-600/10' },
    { name: 'Dynamic Programming', icon: '⚡', color: 'from-orange-500/20 to-orange-600/10' },
    { name: 'Greedy', icon: '💰', color: 'from-red-500/20 to-red-600/10' },
    { name: 'Bit Manipulation', icon: '🔢', color: 'from-pink-500/20 to-pink-600/10' },
]

export const DIFFICULTY = {
    Easy: { label: 'Easy', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    Medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    Hard: { label: 'Hard', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
}

export const STATUS = {
    solved: {
        label: 'Solved',
        emoji: '✅',
        color: 'bg-emerald-500 text-white',
        lightColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
    },
    unsolved: {
        label: 'Unsolved',
        emoji: '⏳',
        color: 'bg-slate-500 text-white',
        lightColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-500',
    },
    revisit: {
        label: 'Revisit',
        emoji: '🔁',
        color: 'bg-amber-500 text-white',
        lightColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
    },
    hard: {
        label: 'Hard',
        emoji: '🔥',
        color: 'bg-purple-500 text-white',
        lightColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        dot: 'bg-purple-500',
    },
}

export const PLATFORMS = [
    'LeetCode', 'Codeforces', 'HackerRank', 'GeeksForGeeks',
    'AtCoder', 'CodeChef', 'SPOJ', 'Other'
]
