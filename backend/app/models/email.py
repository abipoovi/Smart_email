from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subject = Column(String(255), nullable=True, default="")
    content = Column(Text, nullable=False)
    tone = Column(String(50), nullable=True, default="professional")
    email_type = Column(String(50), nullable=True, default="generated")  # generated, reply, improve, summarize
    recipient = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

