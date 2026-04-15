import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { useQuestionStore } from './store/useQuestionStore'

// Pages
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Topics from './pages/Topics'
import Questions from './pages/Questions'
import QuestionDetail from './pages/QuestionDetail'
import Revision from './pages/Revision'
import Friends from './pages/Friends'
import Profile from './pages/Profile'

// Protected route wrapper
function Protected({ children }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  const { initialize, user, loading } = useAuthStore()

  useEffect(() => {
    initialize().catch(err => console.error('App: initialize failed', err));
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/topics" element={<Protected><Topics /></Protected>} />
        <Route path="/topics/:topicId" element={<Protected><Questions /></Protected>} />
        <Route path="/questions" element={<Protected><Questions /></Protected>} />
        <Route path="/questions/:id" element={<Protected><QuestionDetail /></Protected>} />
        <Route path="/revision" element={<Protected><Revision /></Protected>} />
        <Route path="/friends" element={<Protected><Friends /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
