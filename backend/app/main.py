from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FollowAudit API",
    description="Backend para el sistema de seguimiento de planes de acción post-auditoría",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend Vite en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "FollowAudit API funcionando", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
