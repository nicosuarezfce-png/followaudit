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

export default function Observaciones() {
  const [observaciones, setObservaciones] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState({ titulo: '', descripcion: '', riesgo: 'medio', area: 'finanzas', auditoria_nombre: '' })
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/observaciones/').then(r => setObservaciones(r.data)).finally(() => setCargando(false))
  }, [])

  const handleCrear = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/observaciones/', form)
    setObservaciones(prev => [data, ...prev])
    setMostrarForm(false)
    setForm({ titulo: '', descripcion: '', riesgo: 'medio', area: 'finanzas', auditoria_nombre: '' })
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

      {/* Formulario nueva observación */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Nueva observación</h3>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
                <input
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la auditoría</label>
                <input
                  value={form.auditoria_nombre}
                  onChange={e => setForm({ ...form, auditoria_nombre: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                required
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Área</label>
                <select
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AREAS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nivel de riesgo</label>
                <select
                  value={form.riesgo}
                  onChange={e => setForm({ ...form, riesgo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alto">Alto</option>
                  <option value="medio">Medio</option>
                  <option value="bajo">Bajo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setMostrarForm(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">Guardar</button>
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
          <div
            key={obs.id}
            onClick={() => navigate(`/observaciones/${obs.id}`)}
            className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">{obs.titulo}</h4>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{obs.descripcion}</p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
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
