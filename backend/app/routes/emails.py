from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.email import Email
from app.services.gemini_service import gemini_service
from app.prompts.email_prompts import (
    GENERATE_EMAIL_SYSTEM_PROMPT,
    REPLY_EMAIL_SYSTEM_PROMPT,
    IMPROVE_EMAIL_SYSTEM_PROMPT,
    SUMMARIZE_EMAIL_SYSTEM_PROMPT,
)
from app.schemas.email_schemas import (
    EmailGenerateRequest,
    EmailGenerateResponse,
    EmailReplyRequest,
    EmailReplyResponse,
    EmailImproveRequest,
    EmailImproveResponse,
    EmailSummarizeRequest,
    EmailSummarizeResponse,
    EmailCreateSchema,
    EmailUpdateSchema,
    EmailItemResponse,
    EmailListResponse,
)

router = APIRouter()

# ==================== Health / Test Route ====================
@router.get("/test")
def test_route():
    return {"message": "Email routes working"}

# ==================== AI Endpoints ====================

@router.post("/generate", response_model=EmailGenerateResponse)
async def generate_email(request: EmailGenerateRequest):
    """Generate a fresh email based on instructions, tone, and length."""
    user_prompt = (
        f"Instruction: {request.instruction}\n"
        f"Tone: {request.tone}\n"
        f"Length: {request.length}\n"
        "Generate the subject and email content in valid JSON format."
    )
    try:
        data = await gemini_service.generate_json(
            system_prompt=GENERATE_EMAIL_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )
        return EmailGenerateResponse(
            subject=data.get("subject", "No Subject"),
            email_content=data.get("email_content", ""),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating email: {str(e)}",
        )

@router.post("/reply", response_model=EmailReplyResponse)
async def reply_email(request: EmailReplyRequest):
    """Generate a reply to an incoming email adhering to the selected tone."""
    user_prompt = (
        f"Incoming Email:\n{request.incoming_email}\n\n"
        f"Requested Tone: {request.tone}\n"
        "Generate the reply subject and reply content in valid JSON format."
    )
    try:
        data = await gemini_service.generate_json(
            system_prompt=REPLY_EMAIL_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )
        return EmailReplyResponse(
            subject=data.get("subject", "Re: Follow up"),
            reply_content=data.get("reply_content", ""),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error replying to email: {str(e)}",
        )

@router.post("/improve", response_model=EmailImproveResponse)
async def improve_email(request: EmailImproveRequest):
    """Improve grammar, tone, and clarity of an email draft."""
    user_prompt = (
        f"Original Draft:\n{request.content}\n\n"
        f"Target Tone: {request.tone}\n"
        "Generate the improved version in valid JSON format."
    )
    try:
        data = await gemini_service.generate_json(
            system_prompt=IMPROVE_EMAIL_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )
        return EmailImproveResponse(
            improved_content=data.get("improved_content", request.content),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error improving email: {str(e)}",
        )

@router.post("/summarize", response_model=EmailSummarizeResponse)
async def summarize_email(request: EmailSummarizeRequest):
    """Summarize long emails and extract action items."""
    user_prompt = (
        f"Email to Summarize:\n{request.content}\n\n"
        "Summarize the content and extract all action items in valid JSON format."
    )
    try:
        data = await gemini_service.generate_json(
            system_prompt=SUMMARIZE_EMAIL_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )
        return EmailSummarizeResponse(
            summary=data.get("summary", ""),
            action_items=data.get("action_items", []),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error summarizing email: {str(e)}",
        )

# ==================== Email History / CRUD Endpoints ====================

@router.post("/emails", response_model=EmailItemResponse, status_code=status.HTTP_201_CREATED)
def save_email(email_in: EmailCreateSchema, db: Session = Depends(get_db)):
    """Save an email to the database."""
    db_email = Email(
        subject=email_in.subject,
        content=email_in.content,
        tone=email_in.tone,
        email_type=email_in.email_type,
        recipient=email_in.recipient,
    )
    db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email

@router.get("/emails", response_model=EmailListResponse)
def get_emails(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    email_type: Optional[str] = Query(None, description="Filter by email type"),
    db: Session = Depends(get_db),
):
    """Get paginated email history with optional type filter."""
    query = db.query(Email)
    if email_type:
        query = query.filter(Email.email_type == email_type)
    
    total = query.count()
    items = (
        query.order_by(Email.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return EmailListResponse(items=items, total=total, page=page, limit=limit)

@router.get("/emails/{email_id}", response_model=EmailItemResponse)
def get_email_by_id(email_id: int, db: Session = Depends(get_db)):
    """Get a single email by its ID."""
    db_email = db.query(Email).filter(Email.id == email_id).first()
    if not db_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID {email_id} not found",
        )
    return db_email

@router.put("/emails/{email_id}", response_model=EmailItemResponse)
def update_email(
    email_id: int,
    email_update: EmailUpdateSchema,
    db: Session = Depends(get_db),
):
    """Update an existing email record."""
    db_email = db.query(Email).filter(Email.id == email_id).first()
    if not db_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID {email_id} not found",
        )
    
    update_data = email_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_email, field, value)
    
    db.commit()
    db.refresh(db_email)
    return db_email

@router.delete("/emails/{email_id}", status_code=status.HTTP_200_OK)
def delete_email(email_id: int, db: Session = Depends(get_db)):
    """Delete an email record by ID."""
    db_email = db.query(Email).filter(Email.id == email_id).first()
    if not db_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID {email_id} not found",
        )
    db.delete(db_email)
    db.commit()
    return {"message": f"Email {email_id} successfully deleted", "id": email_id}
