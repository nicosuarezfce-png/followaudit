from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # noqa: F401
from app.routers import auth, observaciones, planes
from app.scheduler import iniciar_scheduler, detener_scheduler

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    iniciar_scheduler()
    yield
    detener_scheduler()


app = FastAPI(
    title="FollowAudit API",
    description="Backend para el sistema de seguimiento de planes de acción post-auditoría",
    version="0.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(observaciones.router)
app.include_router(planes.router)


@app.get("/")
def root():
    return {"message": "FollowAudit API funcionando", "version": "0.5.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
