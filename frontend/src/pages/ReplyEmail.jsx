import { useState } from 'react'
import { replyEmail, saveEmail } from '../services/api'
import { Reply, RefreshCw, Copy, Check, Bookmark, AlertCircle, Mail } from 'lucide-react'

export default function ReplyEmail() {
  const [incomingEmail, setIncomingEmail] = useState('')
  const [tone, setTone] = useState('professional')
  const [subject, setSubject] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [hasResult, setHasResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)

  const tones = ['professional', 'formal', 'friendly', 'polite', 'apologetic']

  const handleReply = async (e) => {
    if (e) e.preventDefault()
    if (!incomingEmail.trim()) {
      setError('Please enter the incoming email text to reply to.')
      return
    }

    setLoading(true)
    setError(null)
    setNotification(null)
    try {
      const response = await replyEmail({ incoming_email: incomingEmail, tone })
      setSubject(response.data.subject || 'Re: Follow up')
      setReplyContent(response.data.reply_content || '')
      setHasResult(true)
      setNotification({ type: 'success', message: 'Reply generated successfully!' })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate reply')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!replyContent.trim()) return
    setSaving(true)
    setError(null)
    try {
      await saveEmail({
        subject: subject || 'Email Reply',
        content: replyContent,
        tone: tone,
        email_type: 'reply',
      })
      setNotification({ type: 'success', message: 'Reply saved to history!' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save reply')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!replyContent) return
    const textToCopy = subject ? `Subject: ${subject}\n\n${replyContent}` : replyContent
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main-content">
      <h1 className="page-title">Reply to Email</h1>
      <p className="subtitle">Draft context-aware replies with Gemini AI</p>

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
          <h2>Incoming Email Details</h2>
          <form onSubmit={handleReply} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Incoming Email Content</label>
              <textarea
                rows={9}
                value={incomingEmail}
                onChange={(e) => setIncomingEmail(e.target.value)}
                placeholder="Paste the received email here..."
                required
              />
            </div>

            <div className="form-group">
              <label>Desired Reply Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Generating Reply...' : 'Generate Reply'}
            </button>
          </form>
        </div>

        {hasResult ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Generated Reply (Editable)</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleReply()}
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
                placeholder="Re: Subject"
              />
            </div>

            <div className="form-group">
              <label>Reply Body</label>
              <textarea
                rows={11}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Reply body..."
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
            <Reply size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 500 }}>No reply generated yet</p>
            <p style={{ fontSize: '0.85rem' }}>Paste the incoming message to draft an automated response.</p>
          </div>
        )}
      </div>
    </div>
  )
}
