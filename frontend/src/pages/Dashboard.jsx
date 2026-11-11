import { useState } from 'react'
import { generateEmail, saveEmail } from '../services/api'
import { Mail, RefreshCw, Copy, Check, Bookmark, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [instruction, setInstruction] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [hasResult, setHasResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)

  const tones = ['professional', 'formal', 'friendly', 'polite', 'apologetic']
  const lengths = ['short', 'medium', 'detailed']

  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!instruction.trim()) {
      setError('Please provide instructions for the email.')
      return
    }

    setLoading(true)
    setError(null)
    setNotification(null)
    try {
      const response = await generateEmail({ instruction, tone, length })
      setSubject(response.data.subject || '')
      setContent(response.data.email_content || '')
      setHasResult(true)
      setNotification({ type: 'success', message: 'Email generated successfully!' })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate email')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    setError(null)
    try {
      await saveEmail({
        subject: subject || 'Generated Email',
        content: content,
        tone: tone,
        email_type: 'generated',
      })
      setNotification({ type: 'success', message: 'Email saved to history!' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save email to history')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!content) return
    const textToCopy = subject ? `Subject: ${subject}\n\n${content}` : content
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main-content">
      <h1 className="page-title">Generate Email</h1>
      <p className="subtitle">Craft tailored emails instantly with Google Gemini</p>

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
          <h2>Email Parameters</h2>
          <form onSubmit={handleGenerate} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>What is this email about?</label>
              <textarea
                rows={5}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g., Write a follow-up email to a prospective client after a demo presentation"
                required
              />
            </div>

            <div className="form-group">
              <label>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)}>
                {lengths.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Generating with Gemini...' : 'Generate Email'}
            </button>
          </form>
        </div>

        {hasResult ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Generated Email (Editable)</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleGenerate()}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                title="Regenerate"
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Regenerate
              </button>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject"
              />
            </div>

            <div className="form-group">
              <label>Email Body</label>
              <textarea
                rows={11}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Email Body Content..."
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
            <Mail size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 500 }}>No email generated yet</p>
            <p style={{ fontSize: '0.85rem' }}>Fill in instructions on the left and click Generate Email.</p>
          </div>
        )}
      </div>
    </div>
  )
}
