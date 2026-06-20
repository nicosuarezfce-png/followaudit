import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const RIESGO_BADGE = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-yellow-100 text-yellow-700',
  bajo: 'bg-green-100 text-green-700',
}

const AREAS = ['finanzas', 'logistica', 'compras', 'comercial', 'pago_proveedores']

const MESES_OPCIONES = [1, 2, 3, 6, 12]

function agregarMeses(meses) {
  const d = new Date()
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().split('T')[0]
}

const FORM_OBS_VACIO = { titulo: '', descripcion: '', riesgo: 'medio', area: 'finanzas', auditoria_nombre: '' }
const FORM_PLAN_VACIO = { descripcion: '', responsable_email: '', responsable_nombre: '', meses: 3 }

export default function Observaciones() {
  const [observaciones, setObservaciones] = useState([])
  const [mostrarFormObs, setMostrarFormObs] = useState(false)
  const [obsSeleccionada, setObsSeleccionada] = useState(null)
  const [mostrarFormPlan, setMostrarFormPlan] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [formObs, setFormObs] = useState(FORM_OBS_VACIO)
  const [formPlan, setFormPlan] = useState(FORM_PLAN_VACIO)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const cargarObservaciones = () =>
    api.get('/observaciones/').then(r => setObservaciones(r.data)).finally(() => setCargando(false))

  useEffect(() => { cargarObservaciones() }, [])

  const handleCrearObs = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/observaciones/', formObs)
    setObservaciones(prev => [data, ...prev])
    setMostrarFormObs(false)
    setFormObs(FORM_OBS_VACIO)
  }

  const handleCrearPlan = async (e) => {
    e.preventDefault()
    await api.post(`/planes/observacion/${obsSeleccionada.id}`, {
      ...formPlan,
      plazo_inicial: agregarMeses(formPlan.meses),
    })
    setMostrarFormPlan(false)
    setObsSeleccionada(null)
    setFormPlan(FORM_PLAN_VACIO)
    cargarObservaciones()
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
            onClick={() => { setMostrarFormObs(!mostrarFormObs); setMostrarFormPlan(false) }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Nueva observación
          </button>
        )}
      </div>

      {/* Formulario nueva observación */}
      {mostrarFormObs && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Nueva observación</h3>
          <form onSubmit={handleCrearObs} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
                <input value={formObs.titulo} onChange={e => setFormObs({ ...formObs, titulo: e.target.value })}
                  required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la auditoría</label>
                <input value={formObs.auditoria_nombre} onChange={e => setFormObs({ ...formObs, auditoria_nombre: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
              <textarea value={formObs.descripcion} onChange={e => setFormObs({ ...formObs, descripcion: e.target.value })}
                required rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Área</label>
                <select value={formObs.area} onChange={e => setFormObs({ ...formObs, area: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {AREAS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nivel de riesgo</label>
                <select value={formObs.riesgo} onChange={e => setFormObs({ ...formObs, riesgo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="alto">Alto</option>
                  <option value="medio">Medio</option>
                  <option value="bajo">Bajo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setMostrarFormObs(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario nuevo plan de acción */}
      {mostrarFormPlan && obsSeleccionada && (
        <div className="bg-white rounded-xl border border-green-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-700">Nuevo plan de acción</h3>
              <p className="text-xs text-slate-400 mt-0.5">Para: <span className="font-medium text-slate-600">{obsSeleccionada.titulo}</span></p>
            </div>
            <button onClick={() => { setMostrarFormPlan(false); setObsSeleccionada(null) }} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
          <form onSubmit={handleCrearPlan} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Descripción del plan de acción</label>
              <textarea value={formPlan.descripcion} onChange={e => setFormPlan({ ...formPlan, descripcion: e.target.value })}
                required rows={3} placeholder="¿Qué debe implementar el responsable?"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del responsable</label>
                <input value={formPlan.responsable_nombre} onChange={e => setFormPlan({ ...formPlan, responsable_nombre: e.target.value })}
                  required placeholder="Ej: Laura Méndez"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email del responsable</label>
                <input type="email" value={formPlan.responsable_email} onChange={e => setFormPlan({ ...formPlan, responsable_email: e.target.value })}
                  required placeholder="jefe@empresa.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plazo para implementación</label>
              <div className="flex gap-2">
                {MESES_OPCIONES.map(m => (
                  <button key={m} type="button"
                    onClick={() => setFormPlan({ ...formPlan, meses: m })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${formPlan.meses === m ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400'}`}>
                    {m} {m === 1 ? 'mes' : 'meses'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Vence el: <span className="font-medium text-slate-600">{new Date(agregarMeses(formPlan.meses) + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setMostrarFormPlan(false); setObsSeleccionada(null) }} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">Crear plan</button>
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
          <div key={obs.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5 hover:border-slate-200 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/observaciones/${obs.id}`)}>
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
                {usuario?.rol === 'auditor' && (
                  <button
                    onClick={() => { setObsSeleccionada(obs); setMostrarFormPlan(true); setMostrarFormObs(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="ml-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg border border-green-200 transition"
                  >
                    + Plan de acción
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
