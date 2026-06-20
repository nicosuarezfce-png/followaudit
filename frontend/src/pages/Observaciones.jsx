import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const RIESGO_BADGE = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-yellow-100 text-yellow-700',
  bajo: 'bg-green-100 text-green-700',
}

const COLORES_ESTADO = {
  pendiente: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  avanzado: 'bg-purple-100 text-purple-700',
  implementado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
}

const AREAS = ['finanzas', 'logistica', 'compras', 'comercial', 'pago_proveedores']
const MESES_OPCIONES = [1, 2, 3, 6, 12]

function agregarMeses(meses) {
  const d = new Date()
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().split('T')[0]
}

const FORM_VACIO = {
  // Observación
  titulo: '',
  descripcion: '',
  riesgo: 'medio',
  area: 'finanzas',
  auditoria_nombre: '',
  // Plan de acción
  plan_descripcion: '',
  responsable_nombre: '',
  responsable_email: '',
  meses: 3,
}

export default function Observaciones() {
  const [observaciones, setObservaciones] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const cargar = () =>
    api.get('/observaciones/').then(r => setObservaciones(r.data)).finally(() => setCargando(false))

  useEffect(() => { cargar() }, [])

  const f = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }))

  const handleCrear = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      // 1. Crear observación
      const { data: obs } = await api.post('/observaciones/', {
        titulo: form.titulo,
        descripcion: form.descripcion,
        riesgo: form.riesgo,
        area: form.area,
        auditoria_nombre: form.auditoria_nombre,
      })
      // 2. Crear plan de acción vinculado
      await api.post(`/planes/observacion/${obs.id}`, {
        descripcion: form.plan_descripcion,
        responsable_nombre: form.responsable_nombre,
        responsable_email: form.responsable_email,
        plazo_inicial: agregarMeses(form.meses),
      })
      await cargar()
      setMostrarForm(false)
      setForm(FORM_VACIO)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <div className="text-slate-400">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Observaciones</h2>
          <p className="text-slate-500 text-sm mt-1">Hallazgos relevados durante la auditoría</p>
        </div>
        {usuario?.rol === 'auditor' && (
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Nueva observación
          </button>
        )}
      </div>

      {/* Formulario unificado observación + plan */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Nueva observación y plan de acción</h3>
            <p className="text-xs text-slate-400 mt-0.5">Completá los dos bloques. La observación no puede quedar sin plan asociado.</p>
          </div>

          <form onSubmit={handleCrear}>
            {/* Bloque 1 — Observación */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">1 · Detalle del hallazgo</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Título del hallazgo</label>
                  <input value={form.titulo} onChange={f('titulo')} required
                    placeholder="Ej: Falta de conciliación bancaria"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la auditoría</label>
                  <input value={form.auditoria_nombre} onChange={f('auditoria_nombre')}
                    placeholder="Ej: Auditoría Finanzas Q1 2025"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Descripción del hallazgo</label>
                <textarea value={form.descripcion} onChange={f('descripcion')} required rows={3}
                  placeholder="Describí en detalle lo que se observó durante la auditoría..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Área auditada</label>
                  <select value={form.area} onChange={f('area')}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {AREAS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nivel de riesgo</label>
                  <div className="flex gap-2 mt-1">
                    {['alto', 'medio', 'bajo'].map(r => (
                      <button key={r} type="button" onClick={() => setForm(p => ({ ...p, riesgo: r }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                          form.riesgo === r
                            ? r === 'alto' ? 'bg-red-500 text-white border-red-500'
                              : r === 'medio' ? 'bg-yellow-500 text-white border-yellow-500'
                              : 'bg-green-500 text-white border-green-500'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="mx-6 border-t border-dashed border-slate-200" />

            {/* Bloque 2 — Plan de acción */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">2 · Plan de acción</p>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">¿Qué debe implementar el responsable?</label>
                <textarea value={form.plan_descripcion} onChange={f('plan_descripcion')} required rows={3}
                  placeholder="Describí las acciones concretas a tomar para mitigar la observación..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Responsable del área</label>
                  <input value={form.responsable_nombre} onChange={f('responsable_nombre')} required
                    placeholder="Ej: Laura Méndez"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email del responsable</label>
                  <input type="email" value={form.responsable_email} onChange={f('responsable_email')} required
                    placeholder="jefe@empresa.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Plazo para implementación</label>
                <div className="flex gap-2">
                  {MESES_OPCIONES.map(m => (
                    <button key={m} type="button"
                      onClick={() => setForm(p => ({ ...p, meses: m }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        form.meses === m
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-slate-200 text-slate-600 hover:border-green-400'
                      }`}>
                      {m} {m === 1 ? 'mes' : 'meses'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Vence el: <span className="font-medium text-slate-600">
                    {new Date(agregarMeses(form.meses) + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO) }}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
                Cancelar
              </button>
              <button type="submit" disabled={guardando}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar observación y plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de observaciones */}
      <div className="space-y-3">
        {observaciones.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
            No hay observaciones cargadas aún.
          </div>
        ) : observaciones.map(obs => (
          <div key={obs.id}
            onClick={() => navigate(`/observaciones/${obs.id}`)}
            className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5 cursor-pointer hover:border-blue-200 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {obs.auditoria_nombre && (
                    <span className="text-xs text-slate-400">{obs.auditoria_nombre} ·</span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-800">{obs.titulo}</h4>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{obs.descripcion}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${RIESGO_BADGE[obs.riesgo]}`}>
                  {obs.riesgo}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                  {obs.area.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
