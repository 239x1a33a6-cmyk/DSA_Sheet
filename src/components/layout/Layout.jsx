import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { SUPABASE_IS_CONFIGURED } from '../../lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function Layout({ children, title, actions }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-mono">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar title={title} actions={actions} />
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                    {!SUPABASE_IS_CONFIGURED && (
                        <div className="mb-8 p-6 bg-red-500/10 border-2 border-dashed border-red-500/20 rounded-3xl animate-pulse">
                            <div className="flex items-center gap-4 text-red-600 dark:text-red-400">
                                <AlertCircle size={24} strokeWidth={3} />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Connection Core Error</h3>
                                    <p className="text-[10px] font-bold mt-1 max-w-lg leading-relaxed">
                                        Supabase environment variables are missing in your deployment.
                                        Please add <code className="bg-red-500/10 px-1 rounded">VITE_SUPABASE_URL</code> and
                                        <code className="bg-red-500/10 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>
                                        to your Vercel Project Settings and redeploy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
