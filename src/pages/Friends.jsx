import { useEffect, useState } from 'react'
import { UserPlus, Search, Check, X, Users, Zap, Mail, Send } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Friends() {
    const { user } = useAuthStore()
    const [friends, setFriends] = useState([])
    const [pending, setPending] = useState([])
    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        if (!user) return
        fetchFriends()
        fetchPending()
    }, [user])

    const fetchFriends = async () => {
        const { data } = await supabase
            .from('friendships')
            .select('*, requester:user_id(id,name,email), receiver:friend_id(id,name,email)')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .eq('status', 'accepted')
        setFriends(data || [])
    }

    const fetchPending = async () => {
        const { data } = await supabase
            .from('friendships')
            .select('*, requester:user_id(id,name,email)')
            .eq('friend_id', user.id)
            .eq('status', 'pending')
        setPending(data || [])
    }

    const searchUser = async () => {
        if (!search.trim()) return
        setSearching(true)
        const { data } = await supabase
            .from('profiles')
            .select('id,name,email')
            .ilike('email', `%${search.trim()}%`)
            .neq('id', user.id)
            .limit(1)
            .single()
        setSearchResult(data || null)
        if (!data) toast.error('Identity not found in network')
        setSearching(false)
    }

    const sendRequest = async (toId) => {
        const { error } = await supabase.from('friendships').insert({
            user_id: user.id,
            friend_id: toId,
            status: 'pending',
        })
        if (error) toast.error(error.message)
        else { toast.success('📡 Connection request dispatched'); setSearchResult(null); setSearch('') }
    }

    const handleRequest = async (id, accept) => {
        if (accept) {
            await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id)
            toast.success('✨ Connection established')
        } else {
            await supabase.from('friendships').delete().eq('id', id)
            toast.success('🗑️ Request purged')
        }
        fetchPending()
        fetchFriends()
    }

    const getFriendProfile = (f) => {
        if (f.user_id === user.id) return f.receiver
        return f.requester
    }

    const avatarLetter = (name, email) => (name || email || 'U')[0].toUpperCase()

    return (
        <Layout title="Collaboration Network">
            <div className="max-w-4xl mx-auto space-y-12 animate-in pb-20">
                {/* Search Area */}
                <div className="space-y-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Expand Connections</h2>
                    <div className="card p-10 dark:bg-slate-900 border-none shadow-xl bg-gradient-to-br from-white to-primary-50/10">
                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1 group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input className="input pl-12 h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" placeholder="Enter target email address..."
                                        value={search} onChange={e => setSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchUser()} />
                                </div>
                                <button onClick={searchUser} disabled={searching} className="btn-primary h-14 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20">
                                    {searching ? 'SCANNING...' : 'SCAN NETWORK'}
                                </button>
                            </div>

                            {searchResult && (
                                <div className="animate-in flex items-center justify-between p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-md">
                                            {avatarLetter(searchResult.name, searchResult.email)}
                                        </div>
                                        <div>
                                            <div className="text-base font-black text-slate-900 dark:text-white leading-tight">{searchResult.name || 'Anonymous Solver'}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{searchResult.email}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => sendRequest(searchResult.id)} className="btn-primary h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        <UserPlus size={16} /> CONNECT
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Incoming Feed */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-3">
                            <Send size={14} className="text-amber-500" /> Incoming Waves {pending.length > 0 && `(${pending.length})`}
                        </h2>
                        {pending.length === 0 ? (
                            <div className="card p-10 dark:bg-slate-900/50 border-dashed border-slate-100 dark:border-slate-800 text-center rounded-3xl opacity-50">
                                <Zap size={24} className="mx-auto mb-4 text-slate-200" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No pending waves detected</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pending.map(p => (
                                    <div key={p.id} className="card p-6 border-none shadow-lg dark:bg-slate-900 flex items-center justify-between animate-in group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-lg font-black transition-transform group-hover:scale-110">
                                                {avatarLetter(p.requester?.name, p.requester?.email)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white">{p.requester?.name || 'Inbound Solver'}</div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.requester?.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRequest(p.id, true)}
                                                className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-all">
                                                <Check size={18} strokeWidth={3} />
                                            </button>
                                            <button onClick={() => handleRequest(p.id, false)}
                                                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 rounded-xl hover:text-rose-500 transition-all">
                                                <X size={18} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Network */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-3">
                            <Users size={14} className="text-primary-500" /> Synchronization Core ({friends.length})
                        </h2>
                        <div className="card border-none shadow-xl dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-3xl">
                            {friends.length === 0 ? (
                                <div className="p-20 text-center opacity-30">
                                    <Users size={32} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Network base is empty</p>
                                </div>
                            ) : (
                                friends.map(f => {
                                    const fp = getFriendProfile(f)
                                    return (
                                        <div key={f.id} className="flex items-center gap-5 p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xl font-black group-hover:scale-105 transition-transform shadow-inner">
                                                {avatarLetter(fp?.name, fp?.email)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-base font-black text-slate-900 dark:text-white truncate">{fp?.name || 'Network Node'}</div>
                                                <div className="text-[10px] font-black text-primary-500/60 dark:text-primary-400/60 uppercase tracking-[0.1em]">{fp?.email}</div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Synced</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
