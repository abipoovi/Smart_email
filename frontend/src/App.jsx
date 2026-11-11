import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
const GenerateEmail = Dashboard
import ReplyEmail from './pages/ReplyEmail'
import ImproveEmail from './pages/ImproveEmail'
import SummarizeEmail from './pages/SummarizeEmail'
import EmailHistory from './pages/EmailHistory'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="logo">SmartMail AI</div>
          <div className="nav-links">
            <a href="/">Dashboard</a>
            <a href="/generate">Generate Email</a>
            <a href="/reply">Reply Email</a>
            <a href="/improve">Improve Email</a>
            <a href="/summarize">Summarize</a>
            <a href="/history">Email History</a>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<GenerateEmail />} />
            <Route path="/reply" element={<ReplyEmail />} />
            <Route path="/improve" element={<ImproveEmail />} />
            <Route path="/summarize" element={<SummarizeEmail />} />
            <Route path="/history" element={<EmailHistory />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
