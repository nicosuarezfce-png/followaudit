from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.observacion import Observacion
from app.models.usuario import RolUsuario
from app.schemas.observacion import ObservacionCrear, ObservacionRespuesta, ObservacionDetalle
from app.auth import get_usuario_actual, require_rol

router = APIRouter(prefix="/observaciones", tags=["Observaciones"])


@router.post("/", response_model=ObservacionRespuesta, status_code=status.HTTP_201_CREATED)
def crear_observacion(
    datos: ObservacionCrear,
    db: Session = Depends(get_db),
    usuario_actual=Depends(require_rol(RolUsuario.auditor))
):
    nueva = Observacion(**datos.model_dump(), auditor_id=usuario_actual.id)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.get("/", response_model=List[ObservacionRespuesta])
def listar_observaciones(
    area: str = None,
    db: Session = Depends(get_db),
    _=Depends(get_usuario_actual)
):
    query = db.query(Observacion)
    if area:
        query = query.filter(Observacion.area == area)
    return query.order_by(Observacion.created_at.desc()).all()


@router.get("/{id}", response_model=ObservacionDetalle)
def obtener_observacion(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(get_usuario_actual)
):
    obs = (
        db.query(Observacion)
        .options(joinedload(Observacion.auditor), joinedload(Observacion.planes_accion))
        .filter(Observacion.id == id)
        .first()
    )
    if not obs:
        raise HTTPException(status_code=404, detail="Observación no encontrada")
    return obs


@router.put("/{id}", response_model=ObservacionRespuesta)
def actualizar_observacion(
    id: int,
    datos: ObservacionCrear,
    db: Session = Depends(get_db),
    _=Depends(require_rol(RolUsuario.auditor))
):
    obs = db.query(Observacion).filter(Observacion.id == id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observación no encontrada")
    for campo, valor in datos.model_dump().items():
        setattr(obs, campo, valor)
    db.commit()
    db.refresh(obs)
    return obs
