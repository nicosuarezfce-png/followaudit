"""
Script de datos de prueba para FollowAudit.
Ejecutar con: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
from app.database import engine, SessionLocal, Base
import app.models  # noqa
from app.models.usuario import Usuario, RolUsuario
from app.models.observacion import Observacion, NivelRiesgo
from app.models.plan_accion import PlanAccion, EstadoPlan
from app.models.plazo import Plazo, EstadoPlazo
from app.auth import hashear_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Limpiar datos previos
for tabla in [Plazo, PlanAccion, Observacion, Usuario]:
    db.query(tabla).delete()
db.commit()

# --- USUARIOS ---
auditor1 = Usuario(nombre="María González", email="maria@followaudit.com",
                   password_hash=hashear_password("auditora123"), rol=RolUsuario.auditor)
auditor2 = Usuario(nombre="Carlos Ramírez", email="carlos@followaudit.com",
                   password_hash=hashear_password("auditor123"), rol=RolUsuario.auditor)
gerente = Usuario(nombre="Roberto Pérez", email="gerente@followaudit.com",
                  password_hash=hashear_password("gerente123"), rol=RolUsuario.gerente)

db.add_all([auditor1, auditor2, gerente])
db.flush()

# --- OBSERVACIONES ---
obs_datos = [
    dict(titulo="Falta de conciliación bancaria mensual", area="finanzas",
         riesgo=NivelRiesgo.alto, auditoria_nombre="Auditoría Finanzas Q1 2025",
         descripcion="Se detectó que el área de Finanzas no realiza conciliaciones bancarias mensuales de manera sistemática, generando riesgo de inconsistencias contables no detectadas a tiempo.",
         auditor_id=auditor1.id),
    dict(titulo="Stock sin control en depósito central", area="logistica",
         riesgo=NivelRiesgo.alto, auditoria_nombre="Auditoría Logística 2025",
         descripcion="El depósito central no cuenta con sistema de control de stock actualizado. Los ingresos y egresos se registran manualmente en planillas sin validación.",
         auditor_id=auditor1.id),
    dict(titulo="Proveedores sin evaluación de desempeño", area="compras",
         riesgo=NivelRiesgo.medio, auditoria_nombre="Auditoría Compras 2025",
         descripcion="No se realiza evaluación periódica del desempeño de proveedores críticos. Ausencia de indicadores de calidad y cumplimiento de entrega.",
         auditor_id=auditor2.id),
    dict(titulo="Proceso de cobranza sin seguimiento formal", area="comercial",
         riesgo=NivelRiesgo.medio, auditoria_nombre="Auditoría Comercial 2025",
         descripcion="El área comercial no tiene un proceso formal para el seguimiento de cobranzas vencidas. La gestión depende de criterios individuales de cada vendedor.",
         auditor_id=auditor2.id),
    dict(titulo="Pagos sin doble autorización", area="pago_proveedores",
         riesgo=NivelRiesgo.alto, auditoria_nombre="Auditoría Pagos 2025",
         descripcion="Se detectaron pagos a proveedores aprobados por una sola firma. El procedimiento vigente exige doble autorización para pagos superiores a $500.000.",
         auditor_id=auditor1.id),
    dict(titulo="Ausencia de política de descuentos documentada", area="comercial",
         riesgo=NivelRiesgo.bajo, auditoria_nombre="Auditoría Comercial 2025",
         descripcion="Los descuentos otorgados a clientes no están respaldados por una política formal. Se otorgan discrecionalmente sin límites definidos por categoría de cliente.",
         auditor_id=auditor2.id),
]

observaciones = []
for d in obs_datos:
    o = Observacion(**d)
    db.add(o)
    db.flush()
    observaciones.append(o)

# --- PLANES DE ACCIÓN ---
hoy = date.today()

planes_datos = [
    # Obs 0 — conciliación bancaria (alto riesgo)
    dict(obs=observaciones[0], descripcion="Implementar procedimiento mensual de conciliación bancaria con checklist de verificación y responsable designado.",
         responsable_email="jefe.finanzas@empresa.com", responsable_nombre="Laura Méndez",
         estado=EstadoPlan.en_curso,
         plazos=[
             dict(fecha=hoy - timedelta(days=60), estado=EstadoPlazo.vencido, respuesta="Se inició el proceso pero aún no está formalizado."),
             dict(fecha=hoy + timedelta(days=15), estado=EstadoPlazo.activo, respuesta=None),
         ]),
    # Obs 1 — stock (alto riesgo)
    dict(obs=observaciones[1], descripcion="Implementar sistema de gestión de stock con código de barras y control de ingresos/egresos en tiempo real.",
         responsable_email="jefe.logistica@empresa.com", responsable_nombre="Martín Torres",
         estado=EstadoPlan.pendiente,
         plazos=[
             dict(fecha=hoy - timedelta(days=30), estado=EstadoPlazo.vencido, respuesta=None),
             dict(fecha=hoy - timedelta(days=5), estado=EstadoPlazo.vencido, respuesta=None),
             dict(fecha=hoy + timedelta(days=20), estado=EstadoPlazo.activo, respuesta=None),
         ]),
    # Obs 2 — proveedores (medio)
    dict(obs=observaciones[2], descripcion="Diseñar ficha de evaluación de proveedores con indicadores de calidad, precio y cumplimiento. Aplicar en próximas renovaciones.",
         responsable_email="jefe.compras@empresa.com", responsable_nombre="Ana Lucía Sosa",
         estado=EstadoPlan.avanzado,
         plazos=[
             dict(fecha=hoy - timedelta(days=45), estado=EstadoPlazo.cumplido, respuesta="Ficha de evaluación diseñada y aprobada por gerencia."),
             dict(fecha=hoy + timedelta(days=30), estado=EstadoPlazo.activo, respuesta=None),
         ]),
    # Obs 3 — cobranzas (medio)
    dict(obs=observaciones[3], descripcion="Definir protocolo de gestión de cobranzas con etapas, plazos y responsables. Capacitar al equipo comercial.",
         responsable_email="jefe.comercial@empresa.com", responsable_nombre="Diego Fernández",
         estado=EstadoPlan.implementado,
         plazos=[
             dict(fecha=hoy - timedelta(days=90), estado=EstadoPlazo.cumplido, respuesta="Protocolo redactado y aprobado."),
             dict(fecha=hoy - timedelta(days=30), estado=EstadoPlazo.cumplido, respuesta="Capacitación realizada. Todo el equipo entrenado."),
         ]),
    # Obs 4 — pagos (alto riesgo)
    dict(obs=observaciones[4], descripcion="Modificar flujo de aprobación de pagos para exigir doble firma electrónica en el sistema ERP para montos mayores a $500.000.",
         responsable_email="jefe.pagos@empresa.com", responsable_nombre="Patricia Vidal",
         estado=EstadoPlan.pendiente,
         plazos=[
             dict(fecha=hoy - timedelta(days=15), estado=EstadoPlazo.vencido, respuesta=None),
         ]),
    # Obs 5 — descuentos (bajo riesgo)
    dict(obs=observaciones[5], descripcion="Redactar política de descuentos por categoría de cliente con límites máximos y flujo de aprobación para excepciones.",
         responsable_email="jefe.comercial@empresa.com", responsable_nombre="Diego Fernández",
         estado=EstadoPlan.en_curso,
         plazos=[
             dict(fecha=hoy + timedelta(days=45), estado=EstadoPlazo.activo, respuesta=None),
         ]),
]

for p in planes_datos:
    plan = PlanAccion(
        observacion_id=p["obs"].id,
        descripcion=p["descripcion"],
        responsable_email=p["responsable_email"],
        responsable_nombre=p["responsable_nombre"],
        estado=p["estado"],
    )
    db.add(plan)
    db.flush()
    for pl in p["plazos"]:
        db.add(Plazo(plan_accion_id=plan.id, fecha_vencimiento=pl["fecha"],
                     estado=pl["estado"], respuesta=pl["respuesta"]))

db.commit()
db.close()

print("OK - Datos de prueba cargados correctamente")
print("  Usuarios:")
print("    Auditora:  maria@followaudit.com   / auditora123")
print("    Auditor:   carlos@followaudit.com  / auditor123")
print("    Gerente:   gerente@followaudit.com / gerente123")
print(f"  {len(observaciones)} observaciones creadas")
print(f"  {len(planes_datos)} planes de acción creados")
