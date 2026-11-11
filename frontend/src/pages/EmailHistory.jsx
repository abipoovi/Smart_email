import { useState, useEffect } from 'react'
import { getEmails, deleteEmail, updateEmail } from '../services/api'
import { Trash2, Calendar, Tag, User, Search, Edit2, Save, X, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react'

export default function EmailHistory() {
  const [emails, setEmails] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Inline editing state
  const [editingId, setEditingId] = useState(null)
  const [editSubject, setEditSubject] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Copy state
  const [copiedId, setCopiedId] = useState(null)

  const fetchEmails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getEmails(page, limit)
      setEmails(response.data.items || [])
      setTotal(response.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load email history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [page])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email record?')) {
      return
    }
    setError(null)
    try {
      await deleteEmail(id)
      setEmails((prev) => prev.filter((item) => item.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      setSuccessMsg('Email deleted successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete email')
    }
  }

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditSubject(item.subject || '')
    setEditContent(item.content || '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditSubject('')
    setEditContent('')
  }

  const handleUpdate = async (id) => {
    if (!editContent.trim()) {
      setError('Content cannot be empty')
      return
    }
    setEditSaving(true)
    setError(null)
    try {
      const res = await updateEmail(id, {
        subject: editSubject,
        content: editContent,
      })
      setEmails((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...res.data } : item))
      )
      setEditingId(null)
      setSuccessMsg('Email updated successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update email')
    } finally {
      setEditSaving(false)
    }
  }

  const handleCopy = (id, subject, content) => {
    const text = subject ? `Subject: ${subject}\n\n${content}` : content
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredEmails = emails.filter((item) => {
    const matchesType = filterType ? item.email_type === filterType : true
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = q
      ? (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q))
      : true
    return matchesType && matchesSearch
  })

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Email History</h1>
          <p className="subtitle" style={{ marginBottom: '1rem' }}>
            SQLite persistent archive of all generated, replied, and summarized emails
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={fetchEmails}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
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
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search saved emails by subject or body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              background: 'transparent',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)' }}
          >
            <option value="">All Types</option>
            <option value="generated">Generated</option>
            <option value="reply">Reply</option>
            <option value="improve">Improve</option>
            <option value="summarize">Summarize</option>
          </select>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>({filteredEmails.length} shown)</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading email history...</div>
      ) : filteredEmails.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--muted)',
            borderStyle: 'dashed',
          }}
        >
          <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>No email records found</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {searchQuery || filterType ? 'Try clearing your search filters.' : 'Generate or reply to emails to save them.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEmails.map((item) => {
            const isEditing = editingId === item.id
            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {isEditing ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Editing Email #{item.id}</h3>
                      <button
                        onClick={cancelEditing}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Subject</label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Body Content</label>
                      <textarea
                        rows={8}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdate(item.id)}
                        disabled={editSaving}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                      >
                        <Save size={14} />
                        {editSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button className="btn btn-secondary" onClick={cancelEditing} style={{ fontSize: '0.85rem' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
                          {item.subject || '(No Subject)'}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            color: 'var(--muted)',
                            fontSize: '0.85rem',
                            marginTop: '0.25rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Tag size={14} /> {item.email_type || 'generated'}
                          </span>
                          {item.tone && <span>Tone: {item.tone}</span>}
                          {item.recipient && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <User size={14} /> {item.recipient}
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={14} /> {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => startEditing(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            padding: '0.2rem',
                          }}
                          title="Edit email"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '0.2rem',
                          }}
                          title="Delete email"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f9fafb',
                        padding: '0.85rem 1rem',
                        borderRadius: '6px',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.95rem',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.content}
                    </div>

                    <div>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => handleCopy(item.id, item.subject, item.content)}
                      >
                        {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === item.id ? 'Copied!' : 'Copy Email'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
