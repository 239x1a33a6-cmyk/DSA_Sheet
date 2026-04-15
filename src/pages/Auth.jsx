import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Zap, CheckCircle2, Users, Target } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Auth() {
    const { signIn, signUp, signInWithGoogle, user, loading } = useAuthStore()
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [showPwd, setShowPwd] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    if (!loading && user) return <Navigate to="/" replace />

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (mode === 'login') {
                const res = await signIn({ email: form.email, password: form.password })
                if (res?.error) toast.error(res.error.message || res.error)
            } else {
                if (!form.name.trim()) {
                    toast.error('Identity is required')
                    setSubmitting(false)
                    return
                }
                const res = await signUp({ email: form.email, password: form.password, name: form.name })
                if (res?.error) toast.error(res.error.message || res.error)
                else toast.success('Verification link dispatched to your inbox.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const FEATURES = [
        { icon: CheckCircle2, text: 'Real-time group tracking' },
        { icon: Users, text: 'Collaborative note system' },
        { icon: Target, text: 'Vibrant progress analysis' },
    ]

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-500 font-sans">
            {/* Left Panel: High Impact Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-indigo-700 to-purple-800 p-16 flex-col justify-between relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-3xl -ml-64 -mb-64" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
                            <Zap size={24} className="text-white fill-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">DSA Collab</h1>
                    </div>

                    <div className="space-y-12 max-w-md">
                        <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                            Master DSA <br />
                            <span className="text-primary-300">Together.</span>
                        </h2>
                        <p className="text-xl text-primary-100/80 font-medium leading-relaxed">
                            Join the premier platform for collaborative problem solving and group progress tracking.
                        </p>

                        <div className="space-y-4 pt-8 border-t border-white/10">
                            {FEATURES.map((f, i) => (
                                <div key={i} className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-[0.2em] opacity-80">
                                    <f.icon size={18} className="text-primary-300" />
                                    {f.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="p-1 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/10 inline-flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-primary-600 bg-slate-200 shadow-xl`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Join 500+ active solvers</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 relative overflow-hidden">
                {/* Mobile specific background decoration */}
                <div className="lg:hidden absolute top-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -ml-32 -mt-32" />

                <div className="w-full max-w-md space-y-10 relative z-10 animate-in">
                    <div>
                        <h1 className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.3em] mb-4">
                            Welcome Solvers
                        </h1>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            {mode === 'login' ? 'Continue Your Journey' : 'Begin Your Quest'}
                        </h2>
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {mode === 'login' ? 'Please authenticate to resume' : 'Initialize your secure account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'register' && (
                            <div className="space-y-2">
                                <label className="label">Identity Marker</label>
                                <div className="relative group">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input className="input pl-12 h-14" placeholder="e.g. Knight Solver" value={form.name}
                                        onChange={e => set('name', e.target.value)} required />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="label">Access Link (Email)</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input className="input pl-12 h-14" type="email" placeholder="solver@vault.com"
                                    value={form.email} onChange={e => set('email', e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label">Security Key (Password)</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input className="input pl-12 pr-12 h-14" type={showPwd ? 'text' : 'password'}
                                    placeholder="••••••••" value={form.password}
                                    onChange={e => set('password', e.target.value)} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors">
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="btn-primary w-full h-14 font-black uppercase tracking-[.2em] text-xs shadow-2xl shadow-primary-500/30">
                            {submitting ? 'Authenticating...' : mode === 'login' ? 'ACCESS VAULT' : 'INITIALIZE ACCOUNT'}
                        </button>
                    </form>

                    <div className="flex items-center gap-6">
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest whitespace-nowrap">Integrated Channels</span>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    </div>

                    <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest pt-4">
                        {mode === 'login' ? "New to the collective? " : 'Already recognized? '}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-primary-600 dark:text-primary-400 hover:underline mx-2"
                        >
                            {mode === 'login' ? 'Join Now' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
