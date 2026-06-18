from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # noqa: F401 — registra todos los modelos antes de crear tablas

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FollowAudit API",
    description="Backend para el sistema de seguimiento de planes de acción post-auditoría",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "FollowAudit API funcionando", "version": "0.2.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
