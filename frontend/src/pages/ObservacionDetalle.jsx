import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const RIESGO_BADGE = {
  alto: 'bg-red-100 text-red-700 border-red-200',
  medio: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  bajo: 'bg-green-100 text-green-700 border-green-200',
}

const COLORES_ESTADO = {
  pendiente: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  avanzado: 'bg-purple-100 text-purple-700',
  implementado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
}

const COLORES_PLAZO = {
  activo: 'border-blue-300 bg-blue-50',
  vencido: 'border-red-300 bg-red-50',
  cumplido: 'border-green-300 bg-green-50',
}

const ESTADOS_PLAN = ['pendiente', 'en_curso', 'avanzado', 'implementado']

const MESES_OPCIONES = [1, 2, 3, 6, 12]

function agregarMeses(meses) {
  const d = new Date()
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().split('T')[0]
}

function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

export default function ObservacionDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [obs, setObs] = useState(null)
  const [planes, setPlanes] = useState([])
  const [cargando, setCargando] = useState(true)

  // Estados para acciones inline
  const [planEditando, setPlanEditando] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [mostrarNuevoPlazo, setMostrarNuevoPlazo] = useState(null)
  const [mesesNuevoPlazo, setMesesNuevoPlazo] = useState(3)
  const [notasPlazo, setNotasPlazo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = async () => {
    const [obsRes, planesRes] = await Promise.all([
      api.get(`/observaciones/${id}`),
      api.get(`/planes/observacion/${id}`),
    ])
    setObs(obsRes.data)
    setPlanes(planesRes.data)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [id])

  const actualizarEstadoPlan = async (planId) => {
    setGuardando(true)
    await api.patch(`/planes/${planId}`, { estado: nuevoEstado })
    setPlanEditando(null)
    setNuevoEstado('')
    await cargar()
    setGuardando(false)
  }

  const registrarRespuesta = async (planId, plazoId) => {
    setGuardando(true)
    await api.patch(`/planes/${planId}/plazos/${plazoId}`, {
      estado: 'cumplido',
      respuesta,
    })
    setRespuesta('')
    setPlanEditando(null)
    await cargar()
    setGuardando(false)
  }

  const agregarNuevoPlazo = async (planId) => {
    setGuardando(true)
    await api.post(`/planes/${planId}/plazos`, {
      fecha_vencimiento: agregarMeses(mesesNuevoPlazo),
      notas_auditor: notasPlazo || null,
    })
    setMostrarNuevoPlazo(null)
    setMesesNuevoPlazo(3)
    setNotasPlazo('')
    await cargar()
    setGuardando(false)
  }

  if (cargando) return <div className="text-slate-400 py-10">Cargando...</div>
  if (!obs) return <div className="text-slate-400 py-10">Observación no encontrada.</div>

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Encabezado */}
      <div>
        <button onClick={() => navigate('/observaciones')}
          className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
          ← Volver a observaciones
        </button>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {obs.auditoria_nombre && (
                <p className="text-xs text-slate-400 mb-1">{obs.auditoria_nombre}</p>
              )}
              <h2 className="text-xl font-bold text-slate-800">{obs.titulo}</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{obs.descripcion}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${RIESGO_BADGE[obs.riesgo]}`}>
                Riesgo {obs.riesgo}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                {obs.area?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-4">
            Cargado el {obs.created_at ? new Date(obs.created_at).toLocaleDateString('es-AR') : '—'}
            {obs.auditor && ` por ${obs.auditor.nombre}`}
          </p>
        </div>
      </div>

      {/* Planes de acción */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3">
          Planes de acción <span className="text-slate-400 font-normal">({planes.length})</span>
        </h3>

        {planes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
            No hay planes de acción asociados.
          </div>
        ) : planes.map(plan => {
          const plazoActivo = plan.plazos?.find(p => p.estado === 'activo')
          const editando = planEditando === plan.id

          return (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4">

              {/* Cabecera del plan */}
              <div className="px-6 py-5 border-b border-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 leading-relaxed">{plan.descripcion}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">
                        Responsable: <span className="font-medium text-slate-600">{plan.responsable_nombre}</span>
                      </span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{plan.responsable_email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${COLORES_ESTADO[plan.estado]}`}>
                      {plan.estado.replace('_', ' ')}
                    </span>
                    {usuario?.rol === 'auditor' && plan.estado !== 'implementado' && (
                      <button
                        onClick={() => { setPlanEditando(editando ? null : plan.id); setNuevoEstado(plan.estado) }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                      >
                        {editando ? 'Cancelar' : 'Actualizar estado'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Panel de actualización de estado */}
                {editando && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Nuevo estado del plan</p>
                      <div className="flex gap-2 flex-wrap">
                        {ESTADOS_PLAN.map(e => (
                          <button key={e} type="button"
                            onClick={() => setNuevoEstado(e)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${
                              nuevoEstado === e
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-slate-200 text-slate-600 hover:border-blue-300'
                            }`}>
                            {e.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => actualizarEstadoPlan(plan.id)}
                      disabled={guardando || nuevoEstado === plan.estado}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-40"
                    >
                      {guardando ? 'Guardando...' : 'Confirmar cambio'}
                    </button>
                  </div>
                )}
              </div>

              {/* Historial de plazos */}
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Historial de plazos
                </p>
                <div className="space-y-2">
                  {plan.plazos?.map((plazo, idx) => (
                    <div key={plazo.id} className={`rounded-lg border px-4 py-3 ${COLORES_PLAZO[plazo.estado]}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              plazo.estado === 'activo' ? 'bg-blue-400' :
                              plazo.estado === 'vencido' ? 'bg-red-400' : 'bg-green-400'
                            }`} />
                            <span className="text-xs font-medium text-slate-700">
                              Plazo #{idx + 1} — Vence el {formatFecha(plazo.fecha_vencimiento)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                              plazo.estado === 'activo' ? 'bg-blue-100 text-blue-600' :
                              plazo.estado === 'vencido' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {plazo.estado}
                            </span>
                          </div>
                          {plazo.respuesta && (
                            <p className="text-xs text-slate-600 mt-1.5 ml-4">
                              Respuesta: {plazo.respuesta}
                            </p>
                          )}
                          {plazo.notas_auditor && (
                            <p className="text-xs text-slate-400 mt-1 ml-4 italic">
                              Nota auditor: {plazo.notas_auditor}
                            </p>
                          )}
                        </div>

                        {/* Registrar respuesta en plazo activo */}
                        {usuario?.rol === 'auditor' && plazo.estado === 'activo' && planEditando !== `resp-${plan.id}` && (
                          <button
                            onClick={() => setPlanEditando(`resp-${plan.id}`)}
                            className="text-xs text-green-700 hover:text-green-900 font-medium ml-3 shrink-0"
                          >
                            Registrar respuesta
                          </button>
                        )}
                      </div>

                      {/* Formulario de respuesta */}
                      {usuario?.rol === 'auditor' && plazo.estado === 'activo' && planEditando === `resp-${plan.id}` && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={respuesta}
                            onChange={e => setRespuesta(e.target.value)}
                            placeholder="Describí la respuesta recibida del auditado..."
                            rows={2}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => registrarRespuesta(plan.id, plazo.id)}
                              disabled={!respuesta || guardando}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-40">
                              Guardar respuesta
                            </button>
                            <button onClick={() => setPlanEditando(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Agregar nuevo plazo */}
                {usuario?.rol === 'auditor' && plan.estado !== 'implementado' && (
                  <div className="mt-3">
                    {mostrarNuevoPlazo === plan.id ? (
                      <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-medium text-slate-600">Nuevo plazo de seguimiento</p>
                        <div className="flex gap-2 flex-wrap">
                          {MESES_OPCIONES.map(m => (
                            <button key={m} type="button"
                              onClick={() => setMesesNuevoPlazo(m)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                mesesNuevoPlazo === m
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}>
                              {m} {m === 1 ? 'mes' : 'meses'}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400">
                          Vence el: <span className="font-medium text-slate-600">{formatFecha(agregarMeses(mesesNuevoPlazo))}</span>
                        </p>
                        <input
                          value={notasPlazo}
                          onChange={e => setNotasPlazo(e.target.value)}
                          placeholder="Nota opcional (ej: tercer aviso enviado por email)"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => agregarNuevoPlazo(plan.id)} disabled={guardando}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-40">
                            {guardando ? 'Guardando...' : 'Agregar plazo'}
                          </button>
                          <button onClick={() => setMostrarNuevoPlazo(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMostrarNuevoPlazo(plan.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
                      >
                        + Agregar nuevo plazo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
