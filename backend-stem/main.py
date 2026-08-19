import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from routerss import servicehub_admin, servicehub_applications, servicehub_auth, servicehub_uploads

UPLOADS_DIR = Path("/app/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="ServiceHub API",
    version="1.0.0",
    description="API for the ServiceHub corporate service-request website.",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin"],
)


@app.on_event("startup")
async def startup_event():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ServiceHub"}


app.include_router(servicehub_applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(servicehub_auth.router, prefix="/api/admin/auth", tags=["admin-auth"])
app.include_router(servicehub_admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(servicehub_uploads.router, prefix="/api/uploads", tags=["uploads"])

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
