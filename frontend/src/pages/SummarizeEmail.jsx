import { useState } from 'react'
import { summarizeEmail, saveEmail } from '../services/api'
import { FileText, Copy, Check, Bookmark, AlertCircle, ListChecks } from 'lucide-react'

export default function SummarizeEmail() {
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [actionItems, setActionItems] = useState([])
  const [hasResult, setHasResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)

  const handleSummarize = async (e) => {
    if (e) e.preventDefault()
    if (!content.trim()) {
      setError('Please provide email content or thread to summarize.')
      return
    }

    setLoading(true)
    setError(null)
    setNotification(null)
    try {
      const response = await summarizeEmail({ content })
      setSummary(response.data.summary || '')
      setActionItems(response.data.action_items || [])
      setHasResult(true)
      setNotification({ type: 'success', message: 'Summary generated successfully!' })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to summarize email')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!summary.trim()) return
    setSaving(true)
    setError(null)
    try {
      const formattedContent = actionItems.length > 0
        ? `${summary}\n\nAction Items:\n${actionItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}`
        : summary

      await saveEmail({
        subject: 'Email Summary & Action Items',
        content: formattedContent,
        tone: 'concise',
        email_type: 'summarize',
      })
      setNotification({ type: 'success', message: 'Summary saved to history!' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save summary')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!summary) return
    const textToCopy = actionItems.length > 0
      ? `${summary}\n\nAction Items:\n${actionItems.map((item, idx) => `- ${item}`).join('\n')}`
      : summary

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main-content">
      <h1 className="page-title">Summarize Email</h1>
      <p className="subtitle">Extract executive takeaways and actionable tasks from dense threads</p>

      {error && (
        <div className="error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {notification && notification.type === 'success' && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: '1px solid #a7f3d0',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h2>Email / Thread Content</h2>
          <form onSubmit={handleSummarize} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Paste Thread</label>
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the full email or conversation thread here..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Analyzing with Gemini...' : 'Summarize Email'}
            </button>
          </form>
        </div>

        {hasResult ? (
          <div className="card">
            <h2>Key Summary & Action Items</h2>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Executive Summary (Editable)</label>
              <textarea
                rows={6}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Summary..."
              />
            </div>

            {actionItems && actionItems.length > 0 && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ListChecks size={16} /> Action Items
                </label>
                <ul
                  style={{
                    background: '#f9fafb',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    listStyleType: 'disc',
                  }}
                >
                  {actionItems.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Bookmark size={16} />
                {saving ? 'Saving...' : 'Save to History'}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '260px',
              color: 'var(--muted)',
              textAlign: 'center',
              borderStyle: 'dashed',
            }}
          >
            <FileText size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 500 }}>No summary generated yet</p>
            <p style={{ fontSize: '0.85rem' }}>Input long content on the left to extract summaries and tasks.</p>
          </div>
        )}
      </div>
    </div>
  )
}
