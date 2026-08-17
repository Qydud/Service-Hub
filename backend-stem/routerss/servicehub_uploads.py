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


def _matches_signature(content_type: str, data: bytes) -> bool:
    if content_type == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    return False


@router.post("/image", status_code=201)
async def upload_application_photo(file: UploadFile = File(...)):
    """Public upload used by the application form; never trusts the filename alone."""
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Разрешены JPG, PNG и WebP")

    data = await file.read(MAX_SIZE + 1)
    if not data:
        raise HTTPException(status_code=400, detail="Файл пустой")
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Максимальный размер файла — 5 МБ")
    if not _matches_signature(content_type, data):
        raise HTTPException(status_code=400, detail="Файл не соответствует заявленному типу изображения")

    filename = f"{uuid.uuid4().hex}{ALLOWED[content_type]}"
    (UPLOAD_DIR / filename).write_bytes(data)
    return {"url": f"/uploads/{filename}"}
