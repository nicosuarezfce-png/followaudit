from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from app.models.plan_accion import EstadoPlan
from app.schemas.plazo import PlazoCrear, PlazoRespuesta


class PlanAccionCrear(BaseModel):
    descripcion: str
    responsable_email: EmailStr
    responsable_nombre: str
    plazo_inicial: date  # Primer plazo obligatorio al crear el plan


class PlanAccionActualizar(BaseModel):
    descripcion: Optional[str] = None
    estado: Optional[EstadoPlan] = None


class PlanAccionRespuesta(BaseModel):
    id: int
    observacion_id: int
    descripcion: str
    responsable_email: str
    responsable_nombre: str
    estado: EstadoPlan
    created_at: datetime
    plazos: List[PlazoRespuesta] = []

    model_config = {"from_attributes": True}
