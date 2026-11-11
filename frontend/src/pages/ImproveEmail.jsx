import { useState } from 'react'
import { improveEmail, saveEmail } from '../services/api'
import { Edit3, RefreshCw, Copy, Check, Bookmark, AlertCircle } from 'lucide-react'

export default function ImproveEmail() {
  const [content, setContent] = useState('')
  const [tone, setTone] = useState('professional')
  const [improvedContent, setImprovedContent] = useState('')
  const [hasResult, setHasResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)

  const tones = ['professional', 'formal', 'friendly', 'polite', 'apologetic']

  const handleImprove = async (e) => {
    if (e) e.preventDefault()
    if (!content.trim()) {
      setError('Please provide an email draft to improve.')
      return
    }

    setLoading(true)
    setError(null)
    setNotification(null)
    try {
      const response = await improveEmail({ content, tone })
      setImprovedContent(response.data.improved_content || '')
      setHasResult(true)
      setNotification({ type: 'success', message: 'Email improved successfully!' })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to improve email')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!improvedContent.trim()) return
    setSaving(true)
    setError(null)
    try {
      await saveEmail({
        subject: 'Polished Draft',
        content: improvedContent,
        tone: tone,
        email_type: 'improve',
      })
      setNotification({ type: 'success', message: 'Improved email saved to history!' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save improved email')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!improvedContent) return
    navigator.clipboard.writeText(improvedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main-content">
      <h1 className="page-title">Improve Email</h1>
      <p className="subtitle">Enhance tone, clarity, and grammatical precision with Gemini</p>

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
          <h2>Draft to Improve</h2>
          <form onSubmit={handleImprove} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Current Draft Content</label>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your rough draft here..."
                required
              />
            </div>

            <div className="form-group">
              <label>Target Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Polishing Draft...' : 'Improve Email'}
            </button>
          </form>
        </div>

        {hasResult ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Polished Result (Editable)</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleImprove()}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                title="Regenerate"
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Regenerate
              </button>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Polished Body</label>
              <textarea
                rows={13}
                value={improvedContent}
                onChange={(e) => setImprovedContent(e.target.value)}
                placeholder="Polished text..."
              />
            </div>

            <div className="actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
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
            <Edit3 size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 500 }}>No polished draft yet</p>
            <p style={{ fontSize: '0.85rem' }}>Paste any draft on the left to refine its clarity and phrasing.</p>
          </div>
        )}
      </div>
    </div>
  )
}
