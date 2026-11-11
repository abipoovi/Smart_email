from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

# ==================== Generate Email Schemas ====================
class EmailGenerateRequest(BaseModel):
    instruction: str = Field(..., description="Prompt or instructions for the email")
    tone: Optional[str] = Field("professional", description="Tone of the email")
    length: Optional[str] = Field("medium", description="Length: short, medium, or detailed")

    @field_validator("instruction")
    @classmethod
    def validate_instruction_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Instruction cannot be empty")
        return v.strip()

class EmailGenerateResponse(BaseModel):
    subject: str
    email_content: str

# ==================== Reply Email Schemas ====================
class EmailReplyRequest(BaseModel):
    incoming_email: str = Field(..., description="The incoming email to reply to")
    tone: Optional[str] = Field("professional", description="Tone of the reply")

    @field_validator("incoming_email")
    @classmethod
    def validate_incoming_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Incoming email cannot be empty")
        return v.strip()

class EmailReplyResponse(BaseModel):
    subject: str
    reply_content: str

# ==================== Improve Email Schemas ====================
class EmailImproveRequest(BaseModel):
    content: str = Field(..., description="Email draft content to improve")
    tone: Optional[str] = Field("professional", description="Target tone")

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Email content cannot be empty")
        return v.strip()

class EmailImproveResponse(BaseModel):
    improved_content: str

# ==================== Summarize Email Schemas ====================
class EmailSummarizeRequest(BaseModel):
    content: str = Field(..., description="Email content to summarize")

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Email content cannot be empty")
        return v.strip()

class EmailSummarizeResponse(BaseModel):
    summary: str
    action_items: List[str] = []

# ==================== Saved Email CRUD Schemas ====================
class EmailCreateSchema(BaseModel):
    subject: Optional[str] = ""
    content: str = Field(..., description="Email body content")
    tone: Optional[str] = "professional"
    email_type: Optional[str] = "generated"  # generated, reply, improved, summarized
    recipient: Optional[str] = None

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Email content cannot be empty")
        return v.strip()

class EmailUpdateSchema(BaseModel):
    subject: Optional[str] = None
    content: Optional[str] = None
    tone: Optional[str] = None
    recipient: Optional[str] = None

class EmailItemResponse(BaseModel):
    id: int
    subject: Optional[str] = ""
    content: str
    tone: Optional[str] = ""
    email_type: Optional[str] = ""
    recipient: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmailListResponse(BaseModel):
    items: List[EmailItemResponse]
    total: int
    page: int
    limit: int

