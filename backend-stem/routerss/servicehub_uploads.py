import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_SIZE = 5 * 1024 * 1024
ALLOWED = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


@router.post("/image", status_code=201)
async def upload_application_photo(file: UploadFile = File(...)):
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Разрешены JPG, PNG и WebP")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Файл пустой")
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Максимальный размер файла — 5 МБ")

    filename = f"{uuid.uuid4().hex}{ALLOWED[content_type]}"
    (UPLOAD_DIR / filename).write_bytes(data)
    return {"url": f"/uploads/{filename}"}
