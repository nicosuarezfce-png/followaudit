from sqlalchemy import Column, Integer, Text, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class EstadoPlazo(str, enum.Enum):
    activo = "activo"
    vencido = "vencido"
    cumplido = "cumplido"


class Plazo(Base):
    __tablename__ = "plazos"

    id = Column(Integer, primary_key=True, index=True)
    plan_accion_id = Column(Integer, ForeignKey("planes_accion.id"), nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    estado = Column(SAEnum(EstadoPlazo), nullable=False, default=EstadoPlazo.activo)
    # Respuesta recibida del auditado (cargada por el auditor al recibir el email)
    respuesta = Column(Text, nullable=True)
    notas_auditor = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    plan_accion = relationship("PlanAccion", back_populates="plazos")
