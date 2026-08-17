from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Application, User
from routerss.servicehub_auth import get_current_admin

router = APIRouter()

ASTANA_TZ = timezone(timedelta(hours=5))
VALID_STATUSES = {"new", "processing", "completed"}
STATUS_LABELS_RU = {
    "new": "Новая",
    "processing": "В работе",
    "completed": "Выполнена",
}


class StatusUpdate(BaseModel):
    status: str


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


@router.get("/me")
def admin_me(current_admin: User = Depends(get_current_admin)):
    return {
        "id": current_admin.id,
        "name": current_admin.name,
        "email": current_admin.email,
        "phone": current_admin.phone,
        "is_admin": current_admin.is_admin,
    }


@router.get("/applications")
def list_applications(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    applications = db.query(Application).order_by(Application.id.desc()).all()
    return [_out(application) for application in applications]


@router.patch("/applications/{application_id}")
def update_application_status(
    application_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Допустимые статусы: new, processing, completed",
        )

    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    application.status = data.status
    application.updated_at = datetime.now(ASTANA_TZ).strftime("%Y-%m-%d %H:%M:%S")
    db.commit()
    db.refresh(application)
    return _out(application)


@router.delete("/applications/{application_id}", status_code=204)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    db.delete(application)
    db.commit()
