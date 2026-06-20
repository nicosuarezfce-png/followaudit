import { useEffect, useState, useMemo } from 'react'
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

const FORM_VACIO = {
  titulo: '', descripcion: '', riesgo: 'medio', area: 'finanzas', auditoria_nombre: '',
  plan_descripcion: '', responsable_nombre: '', responsable_email: '', meses: 3,
}

function FiltroItem({ activo, onClick, punto, children, badge, badgeRojo }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
        activo ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}>
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: punto }} />
        {children}
      </span>
      {badge !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
          badgeRojo ? 'bg-red-100 text-red-600' : activo ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
        }`}>{badge}</span>
      )}
    </button>
  )
}

export default function Observaciones() {
  const [observaciones, setObservaciones] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [filtroArea, setFiltroArea] = useState('todas')
  const [filtroRiesgo, setFiltroRiesgo] = useState('todos')
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
      const { data: obs } = await api.post('/observaciones/', {
        titulo: form.titulo, descripcion: form.descripcion,
        riesgo: form.riesgo, area: form.area, auditoria_nombre: form.auditoria_nombre,
      })
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

  // Conteos para badges del filtro
  const conteos = useMemo(() => {
    const area = {}
    const riesgo = { alto: 0, medio: 0, bajo: 0 }
    observaciones.forEach(o => {
      area[o.area] = (area[o.area] || 0) + 1
      riesgo[o.riesgo]++
    })
    return { area, riesgo }
  }, [observaciones])

  const filtradas = useMemo(() => observaciones.filter(o => {
    if (filtroArea !== 'todas' && o.area !== filtroArea) return false
    if (filtroRiesgo !== 'todos' && o.riesgo !== filtroRiesgo) return false
    return true
  }), [observaciones, filtroArea, filtroRiesgo])

  if (cargando) return <div className="text-slate-400">Cargando...</div>

  return (
    <div className="flex gap-6 h-full">

      {/* Panel de filtros lateral */}
      <aside className="w-48 flex-shrink-0 space-y-5">

        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Área</p>
          <FiltroItem activo={filtroArea === 'todas'} onClick={() => setFiltroArea('todas')}
            punto="#2563eb" badge={observaciones.length} badgeRojo={false}>
            Todas
          </FiltroItem>
          {AREAS.map(a => (
            <FiltroItem key={a} activo={filtroArea === a} onClick={() => setFiltroArea(a)}
              punto="#94a3b8" badge={conteos.area[a] || 0}>
              <span className="capitalize">{a.replace('_', ' ')}</span>
            </FiltroItem>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Riesgo</p>
          <FiltroItem activo={filtroRiesgo === 'todos'} onClick={() => setFiltroRiesgo('todos')}
            punto="#94a3b8">Todos</FiltroItem>
          <FiltroItem activo={filtroRiesgo === 'alto'} onClick={() => setFiltroRiesgo('alto')}
            punto="#ef4444" badge={conteos.riesgo.alto} badgeRojo={conteos.riesgo.alto > 0}>
            Alto
          </FiltroItem>
          <FiltroItem activo={filtroRiesgo === 'medio'} onClick={() => setFiltroRiesgo('medio')}
            punto="#eab308" badge={conteos.riesgo.medio}>
            Medio
          </FiltroItem>
          <FiltroItem activo={filtroRiesgo === 'bajo'} onClick={() => setFiltroRiesgo('bajo')}
            punto="#22c55e" badge={conteos.riesgo.bajo}>
            Bajo
          </FiltroItem>
        </div>

        {(filtroArea !== 'todas' || filtroRiesgo !== 'todos') && (
          <button onClick={() => { setFiltroArea('todas'); setFiltroRiesgo('todos') }}
            className="w-full text-xs text-slate-400 hover:text-slate-600 px-3 py-1 text-left transition">
            × Limpiar filtros
          </button>
        )}
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 space-y-5 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Observaciones</h2>
            <p className="text-slate-500 text-sm mt-1">
              {filtradas.length === observaciones.length
                ? `${observaciones.length} hallazgos en total`
                : `${filtradas.length} de ${observaciones.length} hallazgos`}
            </p>
          </div>
          {usuario?.rol === 'auditor' && (
            <button onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              + Nueva observación
            </button>
          )}
        </div>

        {/* Formulario unificado */}
        {mostrarForm && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Nueva observación y plan de acción</h3>
              <p className="text-xs text-slate-400 mt-0.5">Completá los dos bloques. La observación no puede quedar sin plan asociado.</p>
            </div>
            <form onSubmit={handleCrear}>
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
                    placeholder="Describí en detalle lo que se observó..."
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
                          }`}>{r}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-6 border-t border-dashed border-slate-200" />

              <div className="px-6 py-5 space-y-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">2 · Plan de acción</p>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">¿Qué debe implementar el responsable?</label>
                  <textarea value={form.plan_descripcion} onChange={f('plan_descripcion')} required rows={3}
                    placeholder="Describí las acciones concretas a tomar..."
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
                      <button key={m} type="button" onClick={() => setForm(p => ({ ...p, meses: m }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          form.meses === m ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400'
                        }`}>{m} {m === 1 ? 'mes' : 'meses'}</button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Vence el: <span className="font-medium text-slate-600">
                      {new Date(agregarMeses(form.meses) + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO) }}
                  className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">Cancelar</button>
                <button type="submit" disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar observación y plan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista filtrada */}
        <div className="space-y-3">
          {filtradas.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
              No hay observaciones con ese filtro.
            </div>
          ) : filtradas.map(obs => (
            <div key={obs.id} onClick={() => navigate(`/observaciones/${obs.id}`)}
              className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5 cursor-pointer hover:border-blue-200 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {obs.auditoria_nombre && (
                    <p className="text-xs text-slate-400 mb-1">{obs.auditoria_nombre}</p>
                  )}
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
    </div>
  )
}
