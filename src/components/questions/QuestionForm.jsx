import { useState } from 'react'
import { DIFFICULTY } from '../../utils/constants'

export default function QuestionForm({ onSubmit, onSuccess, onCancel, initial = {}, topics, initialTopicId }) {
    const [form, setForm] = useState({
        title: initial.title || '',
        link: initial.link || '',
        difficulty: initial.difficulty || 'Easy',
        topic_id: initial.topic_id || initialTopicId || (topics[0]?.id || ''),
        tags: initial.tags?.join(', ') || '',
        shared_notes: initial.shared_notes || initial.notes || '',
    })
    const [loading, setLoading] = useState(false)

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim() || !form.topic_id) return
        setLoading(true)
        const payload = {
            title: form.title,
            link: form.link,
            difficulty: form.difficulty,
            topic_id: form.topic_id,
            shared_notes: form.shared_notes,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }
        await onSubmit(payload)
        setLoading(false)
        if (onSuccess) onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1.5">
                <label className="label">Primary Title</label>
                <input className="input" placeholder="e.g. Find First and Last Position of Element" value={form.title}
                    onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="label">Complexity</label>
                    <select className="input h-10 font-bold uppercase tracking-widest text-[10px]" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                        {Object.keys(DIFFICULTY).map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="label">Topic Category</label>
                    <select className="input h-10 font-bold uppercase tracking-widest text-[10px]" value={form.topic_id} onChange={e => set('topic_id', e.target.value)} required>
                        {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="label">Resource Link</label>
                <input className="input" type="url" placeholder="https://leetcode.com/problems/..."
                    value={form.link} onChange={e => set('link', e.target.value)} />
            </div>

            <div className="space-y-1.5">
                <label className="label">Categorization Tags (comma separated)</label>
                <input className="input" placeholder="binary-search, arrays, optimization"
                    value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>

            <div className="space-y-1.5">
                <label className="label">Internal Shared Documentation</label>
                <textarea
                    className="input resize-none font-mono text-[13px] leading-relaxed p-4"
                    rows={8}
                    placeholder="Document your collaborative approach here..."
                    value={form.shared_notes}
                    onChange={e => set('shared_notes', e.target.value)}
                />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 font-bold uppercase tracking-widest text-[10px]">
                    {loading ? 'Processing...' : initial.id ? 'Save Changes' : 'Add to Bank'}
                </button>
                <button type="button" onClick={onCancel} className="btn-ghost px-8 font-bold uppercase tracking-widest text-[10px]">Cancel</button>
            </div>
        </form>
    )
}
