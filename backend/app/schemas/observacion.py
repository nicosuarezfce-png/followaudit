from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.observacion import NivelRiesgo
from app.schemas.usuario import UsuarioRespuesta


class ObservacionCrear(BaseModel):
    titulo: str
    descripcion: str
    riesgo: NivelRiesgo
    area: str
    auditoria_nombre: Optional[str] = None


class ObservacionRespuesta(BaseModel):
    id: int
    titulo: str
    descripcion: str
    riesgo: NivelRiesgo
    area: str
    auditoria_nombre: Optional[str] = None
    auditor_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ObservacionDetalle(ObservacionRespuesta):
    auditor: UsuarioRespuesta
    planes_accion: List["PlanAccionRespuesta"] = []


from app.schemas.plan_accion import PlanAccionRespuesta  # noqa: E402
ObservacionDetalle.model_rebuild()
