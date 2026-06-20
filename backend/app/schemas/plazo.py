from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.plazo import EstadoPlazo


class PlazoCrear(BaseModel):
    fecha_vencimiento: date
    notas_auditor: Optional[str] = None


class PlazoActualizar(BaseModel):
    estado: Optional[EstadoPlazo] = None
    respuesta: Optional[str] = None
    notas_auditor: Optional[str] = None


class PlazoRespuesta(BaseModel):
    id: int
    plan_accion_id: int
    fecha_vencimiento: date
    estado: EstadoPlazo
    respuesta: Optional[str] = None
    notas_auditor: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
