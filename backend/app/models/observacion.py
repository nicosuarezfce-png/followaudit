from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class NivelRiesgo(str, enum.Enum):
    alto = "alto"
    medio = "medio"
    bajo = "bajo"


class Observacion(Base):
    __tablename__ = "observaciones"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    riesgo = Column(SAEnum(NivelRiesgo), nullable=False)
    area = Column(String(50), nullable=False)
    auditoria_nombre = Column(String(200), nullable=True)  # Nombre del proceso auditado
    auditor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    auditor = relationship("Usuario", back_populates="observaciones_creadas")
    planes_accion = relationship("PlanAccion", back_populates="observacion")
