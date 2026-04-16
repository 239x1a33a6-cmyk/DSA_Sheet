import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, title, actions }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-mono text-slate-900 dark:text-slate-100 selection:bg-primary-500/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar title={title} actions={actions} />
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
