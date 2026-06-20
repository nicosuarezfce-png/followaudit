from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date, timedelta
from app.database import SessionLocal
from app.models.plan_accion import PlanAccion, EstadoPlan
from app.models.plazo import Plazo, EstadoPlazo
from app.models.observacion import Observacion
from app import email_service

scheduler = BackgroundScheduler()


def verificar_plazos():
    """Corre diariamente: marca plazos vencidos y envía emails."""
    db = SessionLocal()
    try:
        hoy = date.today()

        plazos_activos = (
            db.query(Plazo)
            .filter(Plazo.estado == EstadoPlazo.activo)
            .all()
        )

        for plazo in plazos_activos:
            plan = db.query(PlanAccion).filter(PlanAccion.id == plazo.plan_accion_id).first()
            if not plan or plan.estado == EstadoPlan.implementado:
                continue

            obs = db.query(Observacion).filter(Observacion.id == plan.observacion_id).first()
            if not obs:
                continue

            dias_restantes = (plazo.fecha_vencimiento - hoy).days

            if dias_restantes < 0:
                # Vencido — marcar y notificar
                plazo.estado = EstadoPlazo.vencido
                plan.estado = EstadoPlan.vencido
                num_plazo = db.query(Plazo).filter(Plazo.plan_accion_id == plan.id).count()

                email_service.email_plazo_vencido(
                    responsable_email=plan.responsable_email,
                    responsable_nombre=plan.responsable_nombre,
                    observacion_titulo=obs.titulo,
                    plan_descripcion=plan.descripcion,
                    fecha_vencida=plazo.fecha_vencimiento,
                    numero_plazo=num_plazo,
                )
                print(f"[Scheduler] Plazo vencido notificado → {plan.responsable_email}")

            elif dias_restantes in (7, 3, 1):
                # Recordatorio anticipado
                email_service.email_recordatorio_proximo(
                    responsable_email=plan.responsable_email,
                    responsable_nombre=plan.responsable_nombre,
                    observacion_titulo=obs.titulo,
                    plan_descripcion=plan.descripcion,
                    fecha_vencimiento=plazo.fecha_vencimiento,
                    dias_restantes=dias_restantes,
                )
                print(f"[Scheduler] Recordatorio {dias_restantes}d → {plan.responsable_email}")

        db.commit()
    finally:
        db.close()


def iniciar_scheduler():
    scheduler.add_job(verificar_plazos, "cron", hour=8, minute=0, id="verificar_plazos")
    scheduler.start()
    print("[Scheduler] Iniciado — verificación diaria a las 08:00")


def detener_scheduler():
    scheduler.shutdown()
