import React, { useState, useEffect } from 'react'
import {
  generateEmail,
  replyEmail,
  improveEmail,
  summarizeEmail,
  saveEmail,
  checkHealth,
} from './services/api'
import {
  Mail,
  Send,
  Reply,
  Edit3,
  FileText,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react'
import './popup.css'

export default function Popup() {
  const [activeTab, setActiveTab] = useState('generate') // generate | reply | improve | summarize
  const [backendOnline, setBackendOnline] = useState(false)
  const [checkingBackend, setCheckingBackend] = useState(true)

  // Form Inputs
  const [instruction, setInstruction] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [inputText, setInputText] = useState('')

  // Outputs (Editable)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [actionItems, setActionItems] = useState([])
  const [hasResult, setHasResult] = useState(false)

  // Action states
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const tones = ['professional', 'formal', 'friendly', 'polite', 'apologetic']
  const lengths = ['short', 'medium', 'detailed']

  const verifyBackend = async () => {
    setCheckingBackend(true)
    try {
      await checkHealth()
      setBackendOnline(true)
    } catch {
      setBackendOnline(false)
    } finally {
      setCheckingBackend(false)
    }
  }

  useEffect(() => {
    verifyBackend()
  }, [])

  const resetOutputs = () => {
    setSubject('')
    setContent('')
    setActionItems([])
    setHasResult(false)
    setError(null)
    setSuccessMsg(null)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    resetOutputs()
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (activeTab === 'generate') {
        if (!instruction.trim()) throw new Error('Please enter instructions for the email.')
        const res = await generateEmail({ instruction, tone, length })
        setSubject(res.subject || '')
        setContent(res.email_content || '')
        setHasResult(true)
        setSuccessMsg('Email generated!')
      } else if (activeTab === 'reply') {
        if (!inputText.trim()) throw new Error('Please paste the incoming email.')
        const res = await replyEmail({ incoming_email: inputText, tone })
        setSubject(res.subject || 'Re: Follow up')
        setContent(res.reply_content || '')
        setHasResult(true)
        setSuccessMsg('Reply generated!')
      } else if (activeTab === 'improve') {
        if (!inputText.trim()) throw new Error('Please enter the email draft to improve.')
        const res = await improveEmail({ content: inputText, tone })
        setContent(res.improved_content || '')
        setHasResult(true)
        setSuccessMsg('Draft polished!')
      } else if (activeTab === 'summarize') {
        if (!inputText.trim()) throw new Error('Please enter email content to summarize.')
        const res = await summarizeEmail({ content: inputText })
        setContent(res.summary || '')
        setActionItems(res.action_items || [])
        setHasResult(true)
        setSuccessMsg('Summary created!')
      }
    } catch (err) {
      setError(err.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    setError(null)
    try {
      let finalContent = content
      if (activeTab === 'summarize' && actionItems.length > 0) {
        finalContent += `\n\nAction Items:\n${actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
      }

      await saveEmail({
        subject: subject || `${activeTab.toUpperCase()} Email`,
        content: finalContent,
        tone: tone,
        email_type: activeTab,
      })
      setSuccessMsg('Saved to history!')
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err) {
      setError(err.message || 'Failed to save email')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!content) return
    let text = subject ? `Subject: ${subject}\n\n${content}` : content
    if (activeTab === 'summarize' && actionItems.length > 0) {
      text += `\n\nAction Items:\n${actionItems.map((a) => `- ${a}`).join('\n')}`
    }
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="header">
        <div className="brand">
          <Mail size={20} />
          <span>SmartMail AI</span>
        </div>
        <div
          className={`badge ${backendOnline ? 'badge-connected' : 'badge-disconnected'}`}
          onClick={verifyBackend}
          style={{ cursor: 'pointer' }}
          title={backendOnline ? 'Connected to backend' : 'Backend offline - click to retry'}
        >
          {backendOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{checkingBackend ? 'Checking...' : backendOnline ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => handleTabChange('generate')}
        >
          <Send size={15} />
          <span>Generate</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'reply' ? 'active' : ''}`}
          onClick={() => handleTabChange('reply')}
        >
          <Reply size={15} />
          <span>Reply</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'improve' ? 'active' : ''}`}
          onClick={() => handleTabChange('improve')}
        >
          <Edit3 size={15} />
          <span>Improve</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'summarize' ? 'active' : ''}`}
          onClick={() => handleTabChange('summarize')}
        >
          <FileText size={15} />
          <span>Summarize</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="success-banner">
          <Check size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        {activeTab === 'generate' ? (
          <div className="form-group">
            <label>What should this email say?</label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Quick check-in on project status"
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label>
              {activeTab === 'reply'
                ? 'Incoming Email Content'
                : activeTab === 'improve'
                ? 'Draft to Polish'
                : 'Email / Thread Content'}
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste content here..."
              required
            />
          </div>
        )}

        {/* Tone and Length controls */}
        {activeTab !== 'summarize' && (
          <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'generate' ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
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

            {activeTab === 'generate' && (
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
            )}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={14} className="spin" />
              <span>Thinking with Gemini...</span>
            </>
          ) : (
            <span>Run {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          )}
        </button>
      </form>

      {/* Output Card */}
      {hasResult && (
        <div className="output-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>AI Output (Editable)</span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              title="Regenerate"
            >
              <RefreshCw size={12} className={loading ? 'spin' : ''} />
              <span>Regen</span>
            </button>
          </div>

          {(activeTab === 'generate' || activeTab === 'reply') && (
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>{activeTab === 'summarize' ? 'Summary' : 'Body'}</label>
            <textarea
              rows={activeTab === 'summarize' ? 4 : 6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {activeTab === 'summarize' && actionItems.length > 0 && (
            <div className="form-group">
              <label>Action Items</label>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text)', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                {actionItems.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '0.2rem' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ flex: 1, fontSize: '0.8rem' }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ flex: 1, fontSize: '0.8rem' }}
            >
              <Bookmark size={13} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

