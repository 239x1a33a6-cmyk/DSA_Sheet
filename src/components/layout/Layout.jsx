import Sidebar from './Sidebar'

export default function Layout({ children, title, actions }) {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background decorative elements for Premium feel */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none dark:bg-primary-900/10" />

                <header className="h-16 flex items-center justify-between px-8 glass border-b border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 z-10">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                    <div className="flex items-center gap-3">{actions}</div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
