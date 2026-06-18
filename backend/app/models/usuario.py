from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class RolUsuario(str, enum.Enum):
    auditor = "auditor"
    gerente = "gerente"


class AreaEmpresa(str, enum.Enum):
    finanzas = "finanzas"
    logistica = "logistica"
    compras = "compras"
    comercial = "comercial"
    pago_proveedores = "pago_proveedores"
    auditoria = "auditoria"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(SAEnum(RolUsuario), nullable=False)
    area = Column(SAEnum(AreaEmpresa), nullable=True)  # Solo relevante para auditados (futuro)
    activo = Column(String(1), default="S")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    observaciones_creadas = relationship("Observacion", back_populates="auditor")
    planes_responsable = relationship("PlanAccion", back_populates="responsable")
