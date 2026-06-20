import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date
import os


def _config():
    return {
        "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.getenv("SMTP_PORT", 587)),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
    }


def _enviar(destinatario: str, asunto: str, cuerpo_html: str):
    cfg = _config()
    if not cfg["user"] or not cfg["password"]:
        print(f"[EMAIL SIMULADO] Para: {destinatario} | Asunto: {asunto}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = asunto
    msg["From"] = f"FollowAudit <{cfg['user']}>"
    msg["To"] = destinatario
    msg.attach(MIMEText(cuerpo_html, "html", "utf-8"))

    with smtplib.SMTP(cfg["host"], cfg["port"]) as s:
        s.starttls()
        s.login(cfg["user"], cfg["password"])
        s.sendmail(cfg["user"], destinatario, msg.as_string())


def _base_html(contenido: str) -> str:
    return f"""
    <html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <div style="background:#1e40af;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:20px;">FollowAudit</h1>
        <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Sistema de seguimiento de auditorías</p>
      </div>
      <div style="padding:32px;">
        {contenido}
      </div>
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">Este es un mensaje automático de FollowAudit. No responder a este email.</p>
      </div>
    </div>
    </body></html>
    """


def email_plan_creado(responsable_email: str, responsable_nombre: str,
                      observacion_titulo: str, plan_descripcion: str,
                      fecha_vencimiento: date, area: str):
    contenido = f"""
    <p style="color:#374151;font-size:15px;">Hola <strong>{responsable_nombre}</strong>,</p>
    <p style="color:#374151;">Se te ha asignado un <strong>plan de acción</strong> como resultado de una auditoría interna en el área de <strong>{area.replace('_', ' ').title()}</strong>.</p>

    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="color:#1e40af;font-weight:bold;margin:0 0 8px;">Observación auditada</p>
      <p style="color:#374151;margin:0;">{observacion_titulo}</p>
    </div>

    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="color:#15803d;font-weight:bold;margin:0 0 8px;">Plan de acción asignado</p>
      <p style="color:#374151;margin:0;">{plan_descripcion}</p>
    </div>

    <div style="background:#fef9c3;border:1px solid #fbbf24;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="color:#92400e;margin:0;">
        <strong>Fecha límite de implementación:</strong> {fecha_vencimiento.strftime('%d/%m/%Y')}
      </p>
    </div>

    <p style="color:#374151;">Por favor, implementá las acciones indicadas antes de la fecha límite. El equipo de auditoría hará seguimiento de los avances y te contactará próximamente.</p>
    """
    _enviar(responsable_email, f"FollowAudit — Plan de acción asignado: {observacion_titulo}", _base_html(contenido))


def email_plazo_vencido(responsable_email: str, responsable_nombre: str,
                        observacion_titulo: str, plan_descripcion: str,
                        fecha_vencida: date, numero_plazo: int):
    contenido = f"""
    <p style="color:#374151;font-size:15px;">Hola <strong>{responsable_nombre}</strong>,</p>

    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="color:#b91c1c;font-weight:bold;margin:0 0 4px;">⚠ Plazo vencido — Acción requerida</p>
      <p style="color:#374151;margin:0;">El plazo #{numero_plazo} venció el <strong>{fecha_vencida.strftime('%d/%m/%Y')}</strong> sin que se registrara respuesta.</p>
    </div>

    <p style="color:#374151;">El siguiente plan de acción sigue <strong>pendiente de implementación</strong>:</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="color:#1e40af;font-weight:bold;margin:0 0 8px;">{observacion_titulo}</p>
      <p style="color:#374151;margin:0;">{plan_descripcion}</p>
    </div>

    <p style="color:#374151;">Se ha generado un <strong>nuevo plazo de seguimiento</strong>. El equipo de auditoría interna registrará la falta de respuesta en el historial del plan.</p>
    <p style="color:#374151;">Por favor, reportá tus avances a la brevedad posible.</p>
    """
    _enviar(responsable_email, f"FollowAudit — Plazo vencido: {observacion_titulo}", _base_html(contenido))


def email_recordatorio_proximo(responsable_email: str, responsable_nombre: str,
                               observacion_titulo: str, plan_descripcion: str,
                               fecha_vencimiento: date, dias_restantes: int):
    contenido = f"""
    <p style="color:#374151;font-size:15px;">Hola <strong>{responsable_nombre}</strong>,</p>

    <div style="background:#fef9c3;border-left:4px solid #d97706;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="color:#92400e;font-weight:bold;margin:0 0 4px;">Recordatorio — Plazo próximo a vencer</p>
      <p style="color:#374151;margin:0;">Quedan <strong>{dias_restantes} días</strong> para el vencimiento del plazo ({fecha_vencimiento.strftime('%d/%m/%Y')}).</p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="color:#1e40af;font-weight:bold;margin:0 0 8px;">{observacion_titulo}</p>
      <p style="color:#374151;margin:0;">{plan_descripcion}</p>
    </div>

    <p style="color:#374151;">Si ya realizaste avances, informá al equipo de auditoría para que pueda registrarlos en el sistema.</p>
    """
    _enviar(responsable_email, f"FollowAudit — Recordatorio: {dias_restantes} días para vencimiento", _base_html(contenido))
