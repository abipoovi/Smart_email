from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # Ensures models are registered before create_all
from app.routes import emails

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartMail AI Backend", version="1.0.0")

# Support both web client (5173) and Chrome Extension (chrome-extension://<id>)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"^chrome-extension://[a-z]{32}$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emails.router, prefix="/api")

@app.get("/api/health")
async def health():
    return {"status": "healthy", "message": "SmartMail AI backend is running"}

@app.get("/")
async def root():
    return {"message": "Welcome to SmartMail AI Backend"}
