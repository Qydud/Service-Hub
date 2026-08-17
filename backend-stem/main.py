from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from routerss import servicehub_admin, servicehub_applications, servicehub_auth

UPLOADS_DIR = Path("/app/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="ServiceHub API",
    version="1.0.0",
    description="API for the ServiceHub corporate service-request website.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
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


app.include_router(
    servicehub_applications.router,
    prefix="/api/applications",
    tags=["applications"],
)
app.include_router(
    servicehub_auth.router,
    prefix="/api/admin/auth",
    tags=["admin-auth"],
)
app.include_router(
    servicehub_admin.router,
    prefix="/api/admin",
    tags=["admin"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
