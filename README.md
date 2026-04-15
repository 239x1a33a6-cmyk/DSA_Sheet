# DSA Collaborative Revision Platform

A full-stack collaborative platform to track, solve, and revise Data Structures & Algorithms problems — combining LeetCode + Notion + a personal tracker.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v3 + Inter font
- **State**: Zustand
- **Router**: React Router v6
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **Icons**: Lucide React

---

## ⚡ Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/schema.sql`
3. Optionally run `supabase/seed.sql` for 30 sample questions
4. Copy your **Project URL** and **Anon Key** from Settings → API

### 2. Configure Environment

```bash
# Edit .env in project root
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/        # Sidebar, Topbar, Layout
│   ├── ui/            # StatusToggle, ProgressBar, Modal
│   ├── questions/     # QuestionCard, QuestionForm
│   └── topics/        # TopicCard
├── pages/
│   ├── Auth.jsx       # Login + Register
│   ├── Dashboard.jsx  # Stats, heatmap, progress
│   ├── Topics.jsx     # Topic grid
│   ├── Questions.jsx  # Q list with filters
│   ├── QuestionDetail.jsx
│   ├── Revision.jsx   # Revision mode session
│   ├── Friends.jsx    # Friend system
│   └── Profile.jsx    # User profile + stats
├── store/             # Zustand stores
├── lib/               # Supabase client
└── utils/             # Constants (topics, colors, etc.)
supabase/
├── schema.sql         # Full DB schema + RLS
└── seed.sql           # Sample questions
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Auth** | Email/password + Google OAuth |
| **Topics** | 10 predefined + custom topics |
| **Questions** | Add/Edit/Delete with markdown notes |
| **Status Tracking** | ✅ Solved / ❌ Unsolved / 🔁 Revisit / 🔥 Hard |
| **Revision Mode** | Fullscreen one-by-one session with keyboard nav |
| **Friends** | Search by email, send/accept requests |
| **Dashboard** | Stats, topic progress, heatmap |
| **Dark Mode** | Toggle in sidebar, persisted to localStorage |
| **Search** | Live search across all questions + tags |

---

## 🎨 Color System

| Status | Color |
|--------|-------|
| Solved ✅ | Green |
| Unsolved ❌ | Red |
| Revisit 🔁 | Yellow |
| Hard 🔥 | Purple |

---

## 🔐 Security (Supabase RLS)

- Users can only modify their own `user_question_status` rows
- Questions readable by all authenticated users
- Each user can only see their own status and streak data
- Friend requests only visible to involved parties

---

## 🛠️ Optional: Enable Google OAuth

In Supabase Dashboard → Authentication → Providers → Google:
1. Enable Google provider
2. Add your Google OAuth Client ID + Secret
3. Set redirect URL to `http://localhost:5173`
