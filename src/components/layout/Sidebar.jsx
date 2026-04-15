import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, List, RotateCcw, User,
    LogOut, ChevronLeft, ChevronRight, Zap, Sun, Moon, Hash
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useState, useEffect } from 'react'

const NAV = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/topics', icon: BookOpen, label: 'Topics' },
    { to: '/questions', icon: List, label: 'All Questions' },
    { to: '/revision', icon: RotateCcw, label: 'Revision Mode' },
    { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
    const { signOut, profile, user } = useAuthStore()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)
    const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [dark])

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    const avatarFallback = (profile?.name || user?.email || 'U')[0].toUpperCase()

    return (
        <aside className={`flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-500 ${collapsed ? 'w-20' : 'w-64'} flex-shrink-0 relative z-20 dark:bg-slate-900 dark:border-slate-800`}>
            {/* Logo */}
            <div className={`flex items-center gap-3 px-6 py-8 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
                    <Zap size={20} className="text-white fill-white" />
                </div>
                {!collapsed && (
                    <div className="animate-in">
                        <div className="text-lg font-black text-slate-900 leading-none dark:text-white">DSA Collab</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Revision Platform</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
                {NAV.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                            ${isActive
                                ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-500/10 dark:text-primary-400'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}
                            ${collapsed ? 'justify-center px-0' : ''}
                        `}
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={20} className="flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className={`p-4 border-t border-slate-100 dark:border-slate-800 space-y-4`}>
                {/* Theme Toggle */}
                <button
                    onClick={() => setDark(!dark)}
                    className={`nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-all ${collapsed ? 'justify-center px-0' : ''}`}
                >
                    {dark ? <Sun size={20} /> : <Moon size={20} />}
                    {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* User Info */}
                <div className={`bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl ${collapsed ? 'flex justify-center' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md">
                            {avatarFallback}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-slate-900 truncate dark:text-white">
                                    {profile?.name || user?.email?.split('@')[0]}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-wider">{user?.email}</div>
                            </div>
                        )}
                    </div>
                </div>

                {!collapsed && (
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">
                        <LogOut size={14} />
                        Sign Out
                    </button>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-all text-slate-400 hover:text-primary-500 group"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    )
}
