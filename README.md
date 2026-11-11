# SmartMail AI ✉️🤖

**SmartMail AI** is an intelligent email productivity assistant powered by **Google Gemini AI**. It enables users to generate, reply to, improve, and summarize emails seamlessly via a modern **React Web Application** and a **Chrome Browser Extension** (Manifest V3), backed by a high-performance **FastAPI** server and **SQLite** database.

---

## 🌟 Key Features

- **Generate Email**: Craft tailored, professional emails from brief natural language instructions with customizable tones and lengths.
- **Contextual Reply**: Generate polite, context-aware responses to incoming emails.
- **Improve Draft**: Polish rough drafts for better grammar, clarity, and tone alignment.
- **Summarize & Action Items**: Distill long threads into executive summaries and extracted bulleted action items.
- **Email History & Management**: Full SQLite persistence with instant search, email type filtering, inline editing, and deletion.
- **Chrome Extension (Manifest V3)**: Compact browser popup allowing you to use SmartMail AI directly from your browser with optional Gmail integration hooks.

---

## 🏗️ Architecture

```
SmartMail-AI/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── models/           # SQLAlchemy models (Email)
│   │   ├── prompts/          # Gemini AI prompt templates
│   │   ├── routes/           # FastAPI endpoints (/generate, /reply, /improve, /summarize, /emails)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Gemini AI Service (google-genai SDK)
│   │   ├── database.py       # SQLite engine and session management
│   │   └── main.py           # FastAPI application entry & CORS
│   ├── .env                  # Environment variables (GEMINI_API_KEY)
│   ├── requirements.txt      # Python dependencies
│   └── smartmail.db          # SQLite database
│
├── frontend/                 # React + Vite Web Application
│   ├── src/
│   │   ├── pages/            # Dashboard, Reply, Improve, Summarize, EmailHistory
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # Routing & Navigation
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── extension/                # Chrome Extension (Manifest V3)
    ├── public/               # manifest.json, extension icons
    ├── src/
    │   ├── background/       # Background service worker
    │   ├── content/          # Gmail content script integration
    │   ├── services/         # Extension API client
    │   ├── Popup.jsx         # Extension popup React UI
    │   └── popup.css
    ├── dist/                 # Built unpacked extension for Chrome
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows**:
     ```powershell
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   HOST=0.0.0.0
   PORT=8000
   ```
5. Start the server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Health: `http://127.0.0.1:8000/api/health`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (Web App)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. Chrome Extension Setup

1. Open a new terminal and navigate to `extension`:
   ```bash
   cd extension
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
   *(This outputs the unpacked extension bundle to `extension/dist/`)*.
3. Load in Google Chrome:
   1. Open Chrome and go to `chrome://extensions/`.
   2. Turn on **Developer mode** (top-right toggle).
   3. Click **Load unpacked** (top-left button).
   4. Select the folder:
      ```text
      SmartMail-AI/extension/dist
      ```
   5. Pin **SmartMail AI** to your browser toolbar and click the icon to launch!

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate` | Generates a new email based on instruction, tone, and length |
| `POST` | `/api/reply` | Generates a reply to an incoming email |
| `POST` | `/api/improve` | Polishes and enhances existing draft |
| `POST` | `/api/summarize` | Summarizes dense email thread & extracts action items |
| `GET` | `/api/emails` | Fetches paginated email history with optional type filter |
| `POST` | `/api/emails` | Saves an email record to SQLite |
| `GET` | `/api/emails/{id}` | Fetches a single email record by ID |
| `PUT` | `/api/emails/{id}` | Updates a saved email record |
| `DELETE`| `/api/emails/{id}` | Deletes a saved email record |
| `GET` | `/api/health` | Health check endpoint |

---

## 🛡️ Privacy & Security

- All API keys are securely stored server-side in `backend/.env`.
- The Chrome Extension communicates strictly with your local FastAPI instance (`http://localhost:8000`).
- No email data is sent to third parties other than Google Gemini for processing via your own API key.

