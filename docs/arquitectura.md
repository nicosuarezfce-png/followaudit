# Arquitectura de FollowAudit

## Estructura del proyecto

```
followaudit/
├── frontend/          # React + Vite (interfaz de usuario)
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas de la app
│   │   └── main.jsx      # Punto de entrada
│   └── package.json
│
├── backend/           # FastAPI (Python) — API REST
│   ├── app/
│   │   ├── main.py       # Punto de entrada de la API
│   │   ├── models/       # Modelos de base de datos
│   │   ├── routers/      # Endpoints por módulo
│   │   └── schemas/      # Validación de datos
│   └── requirements.txt
│
└── docs/              # Documentación del proyecto
```

## Flujo de datos

```
Usuario (browser)
    ↓
Frontend React (puerto 5173 en desarrollo)
    ↓ HTTP REST
Backend FastAPI (puerto 8000)
    ↓
PostgreSQL (base de datos)
```

## Módulos planificados (V1)

| Módulo | Descripción |
|---|---|
| Autenticación | Login con roles: Auditor / Gerente |
| Observaciones | CRUD de hallazgos y su riesgo |
| Planes de acción | CRUD con estados y responsables |
| Plazos | Historial de plazos por plan |
| Notificaciones | Envío de emails automáticos |
| Dashboard | Métricas y estado por área |

## Variables de entorno necesarias

Crear archivo `backend/.env` con:
```
DATABASE_URL=postgresql://usuario:password@localhost/followaudit
SECRET_KEY=clave-secreta-para-jwt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```
