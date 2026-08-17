import re
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from database import get_db
from models import Application

router = APIRouter()

ASTANA_TZ = timezone(timedelta(hours=5))
VALID_STATUSES = {"new", "processing", "completed"}
STATUS_LABELS_RU = {
    "new": "Новая",
    "processing": "В работе",
    "completed": "Выполнена",
}


class ApplicationCreate(BaseModel):
    company: str = Field(..., min_length=2, max_length=150)
    contact_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=30)
    email: EmailStr
    object_address: str = Field(..., min_length=2, max_length=300)
    service: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=5000)
    photo: Optional[str] = Field(default=None, max_length=500)

    @field_validator("company", "contact_name", "object_address", "service")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Поле не может быть пустым")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if not 10 <= len(digits) <= 15:
            raise ValueError("Некорректный номер телефона")
        return value.strip()

    @field_validator("description", "photo")
    @classmethod
    def strip_optional_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ApplicationStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in VALID_STATUSES:
            raise ValueError("Допустимые статусы: new, processing, completed")
        return value


def _out(application: Application) -> dict:
    return {
        "id": application.id,
        "company": application.company,
        "contact_name": application.contact_name,
        "phone": application.phone,
        "email": application.email,
        "object_address": application.object_address,
        "service": application.service,
        "description": application.description,
        "photo": application.photo,
        "status": application.status,
        "status_label": STATUS_LABELS_RU.get(application.status, "Неизвестно"),
        "created_at": application.created_at,
        "updated_at": application.updated_at,
    }


def _now() -> str:
    return datetime.now(ASTANA_TZ).strftime("%Y-%m-%d %H:%M:%S")


@router.post("", status_code=201)
@router.post("/", status_code=201)
def create_application(
    data: ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    application = Application(
        company=data.company,
        contact_name=data.contact_name,
        phone=data.phone,
        email=str(data.email),
        object_address=data.object_address,
        service=data.service,
        description=data.description,
        photo=data.photo,
        status="new",
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {"status": "ok", "application": _out(application)}


@router.get("/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return _out(application)
