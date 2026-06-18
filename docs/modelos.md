# Modelos de Base de Datos — FollowAudit

## Diagrama de relaciones

```
Usuario (auditor/gerente)
    │
    ├──crea──► Observacion ──tiene──► PlanAccion ──tiene──► Plazo
    │               │                     │                   │
    │            riesgo               estado              fecha_vencimiento
    │         alto/medio/bajo     pendiente/en_curso/     activo/vencido/
    │                             avanzado/implementado/  cumplido
    │                             vencido
    │
    └──es responsable de──► PlanAccion
```

## Tablas

### `usuarios`
| Campo | Tipo | Descripción |
|---|---|---|
| id | Integer | Clave primaria |
| nombre | String | Nombre completo |
| email | String | Email único — usado para login y avisos |
| password_hash | String | Contraseña encriptada |
| rol | Enum | `auditor` o `gerente` |
| area | Enum | Área de la empresa (solo para auditados en V2) |
| activo | String | S/N — para dar de baja sin borrar |

### `observaciones`
| Campo | Tipo | Descripción |
|---|---|---|
| id | Integer | Clave primaria |
| titulo | String | Título corto del hallazgo |
| descripcion | Text | Detalle completo de la observación |
| riesgo | Enum | `alto`, `medio`, `bajo` |
| area | String | Área auditada |
| auditoria_nombre | String | Nombre del proceso auditado |
| auditor_id | FK → usuarios | Quién cargó la observación |

### `planes_accion`
| Campo | Tipo | Descripción |
|---|---|---|
| id | Integer | Clave primaria |
| observacion_id | FK → observaciones | Observación que origina el plan |
| descripcion | Text | Qué debe hacer el auditado |
| responsable_email | String | Email del auditado responsable |
| responsable_nombre | String | Nombre del auditado |
| responsable_id | FK → usuarios | FK solo si el auditado tiene usuario (V2) |
| estado | Enum | `pendiente`, `en_curso`, `avanzado`, `implementado`, `vencido` |

### `plazos`
| Campo | Tipo | Descripción |
|---|---|---|
| id | Integer | Clave primaria |
| plan_accion_id | FK → planes_accion | Plan al que pertenece |
| fecha_vencimiento | Date | Fecha límite de este plazo |
| estado | Enum | `activo`, `vencido`, `cumplido` |
| respuesta | Text | Respuesta recibida del auditado |
| notas_auditor | Text | Notas internas del auditor |

## Regla de negocio clave

Un plan de acción **nunca desaparece** hasta llegar al estado `implementado`.
Si vence el plazo sin respuesta, se agrega un nuevo plazo manteniendo el historial completo.
Esto garantiza trazabilidad total para auditoría.
