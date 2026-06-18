# FollowAudit

Sistema de gestión y seguimiento de planes de acción post-auditoría interna.

## ¿Qué problema resuelve?

En auditoría interna, cada hallazgo genera observaciones con riesgo asociado (Alto / Medio / Bajo) y un plan de acción para mitigarlo. El problema es que estos planes raramente se siguen de forma sistemática: viven en Excel o emails dispersos, los plazos vencen sin respuesta y no queda trazabilidad.

**FollowAudit** centraliza todo en un solo lugar, automatiza los avisos y deja registro permanente de cada avance o incumplimiento.

## Roles

| Rol | Descripción |
|---|---|
| **Auditor** | Carga observaciones, planes de acción, plazos y riesgo |
| **Auditado** | Recibe avisos por email y reporta avances (V2: login propio) |
| **Gerente de Auditoría** | Dashboard de lectura — avance general y rendimiento por área |

## Stack tecnológica

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL |
| Emails | SMTP / SendGrid |

## Estructura del proyecto

```
followaudit/
├── frontend/     # React + Vite
├── backend/      # FastAPI (Python)
└── docs/         # Documentación
```

## Estado del proyecto

🚧 En desarrollo — V1
