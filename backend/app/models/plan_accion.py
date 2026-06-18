from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class EstadoPlan(str, enum.Enum):
    pendiente = "pendiente"
    en_curso = "en_curso"
    avanzado = "avanzado"
    implementado = "implementado"
    vencido = "vencido"


class PlanAccion(Base):
    __tablename__ = "planes_accion"

    id = Column(Integer, primary_key=True, index=True)
    observacion_id = Column(Integer, ForeignKey("observaciones.id"), nullable=False)
    descripcion = Column(Text, nullable=False)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    responsable_email = Column(String(150), nullable=False)  # Email del auditado (puede no tener usuario)
    responsable_nombre = Column(String(100), nullable=False)
    estado = Column(SAEnum(EstadoPlan), nullable=False, default=EstadoPlan.pendiente)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    observacion = relationship("Observacion", back_populates="planes_accion")
    responsable = relationship("Usuario", back_populates="planes_responsable")
    plazos = relationship("Plazo", back_populates="plan_accion", order_by="Plazo.created_at")
