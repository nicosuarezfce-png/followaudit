from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import date
from app.database import get_db
from app.models.plan_accion import PlanAccion, EstadoPlan
from app.models.plazo import Plazo, EstadoPlazo
from app.models.observacion import Observacion
from app.models.usuario import RolUsuario
from app.schemas.plan_accion import PlanAccionCrear, PlanAccionActualizar, PlanAccionRespuesta
from app.schemas.plazo import PlazoCrear, PlazoActualizar, PlazoRespuesta
from app.auth import get_usuario_actual, require_rol
from app import email_service

router = APIRouter(prefix="/planes", tags=["Planes de Acción"])


@router.post("/observacion/{obs_id}", response_model=PlanAccionRespuesta, status_code=status.HTTP_201_CREATED)
def crear_plan(
    obs_id: int,
    datos: PlanAccionCrear,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _=Depends(require_rol(RolUsuario.auditor))
):
    obs = db.query(Observacion).filter(Observacion.id == obs_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observación no encontrada")

    plan = PlanAccion(
        observacion_id=obs_id,
        descripcion=datos.descripcion,
        responsable_email=datos.responsable_email,
        responsable_nombre=datos.responsable_nombre,
    )
    db.add(plan)
    db.flush()

    plazo = Plazo(plan_accion_id=plan.id, fecha_vencimiento=datos.plazo_inicial)
    db.add(plazo)
    db.commit()
    db.refresh(plan)

    # Email al responsable en segundo plano (no bloquea la respuesta)
    background_tasks.add_task(
        email_service.email_plan_creado,
        responsable_email=datos.responsable_email,
        responsable_nombre=datos.responsable_nombre,
        observacion_titulo=obs.titulo,
        plan_descripcion=datos.descripcion,
        fecha_vencimiento=datos.plazo_inicial,
        area=obs.area,
    )

    return plan


@router.get("/observacion/{obs_id}", response_model=List[PlanAccionRespuesta])
def listar_planes_por_observacion(
    obs_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_usuario_actual)
):
    return (
        db.query(PlanAccion)
        .options(joinedload(PlanAccion.plazos))
        .filter(PlanAccion.observacion_id == obs_id)
        .all()
    )


@router.get("/", response_model=List[PlanAccionRespuesta])
def listar_todos_los_planes(
    estado: EstadoPlan = None,
    db: Session = Depends(get_db),
    _=Depends(get_usuario_actual)
):
    query = db.query(PlanAccion).options(joinedload(PlanAccion.plazos))
    if estado:
        query = query.filter(PlanAccion.estado == estado)
    return query.order_by(PlanAccion.created_at.desc()).all()


@router.patch("/{id}", response_model=PlanAccionRespuesta)
def actualizar_plan(
    id: int,
    datos: PlanAccionActualizar,
    db: Session = Depends(get_db),
    _=Depends(require_rol(RolUsuario.auditor))
):
    plan = db.query(PlanAccion).options(joinedload(PlanAccion.plazos)).filter(PlanAccion.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de acción no encontrado")

    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(plan, campo, valor)
    db.commit()
    db.refresh(plan)
    return plan


@router.post("/{id}/plazos", response_model=PlazoRespuesta, status_code=status.HTTP_201_CREATED)
def agregar_plazo(
    id: int,
    datos: PlazoCrear,
    db: Session = Depends(get_db),
    _=Depends(require_rol(RolUsuario.auditor))
):
    plan = db.query(PlanAccion).filter(PlanAccion.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de acción no encontrado")
    if plan.estado == EstadoPlan.implementado:
        raise HTTPException(status_code=400, detail="No se pueden agregar plazos a un plan implementado")

    # Marca el plazo activo anterior como vencido
    plazo_activo = (
        db.query(Plazo)
        .filter(Plazo.plan_accion_id == id, Plazo.estado == EstadoPlazo.activo)
        .first()
    )
    if plazo_activo:
        plazo_activo.estado = EstadoPlazo.vencido
        if plan.estado != EstadoPlan.implementado:
            plan.estado = EstadoPlan.pendiente

    nuevo_plazo = Plazo(
        plan_accion_id=id,
        fecha_vencimiento=datos.fecha_vencimiento,
        notas_auditor=datos.notas_auditor
    )
    db.add(nuevo_plazo)
    db.commit()
    db.refresh(nuevo_plazo)
    return nuevo_plazo


@router.patch("/{plan_id}/plazos/{plazo_id}", response_model=PlazoRespuesta)
def actualizar_plazo(
    plan_id: int,
    plazo_id: int,
    datos: PlazoActualizar,
    db: Session = Depends(get_db),
    _=Depends(require_rol(RolUsuario.auditor))
):
    plazo = db.query(Plazo).filter(Plazo.id == plazo_id, Plazo.plan_accion_id == plan_id).first()
    if not plazo:
        raise HTTPException(status_code=404, detail="Plazo no encontrado")

    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(plazo, campo, valor)
    db.commit()
    db.refresh(plazo)
    return plazo
