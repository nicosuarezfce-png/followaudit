import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const AREAS = ['finanzas', 'logistica', 'compras', 'comercial', 'pago_proveedores']

const COLORES_ESTADO = {
  pendiente: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  avanzado: 'bg-purple-100 text-purple-700',
  implementado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
}

function SemaforoBarra({ valor, total, color }) {
  const pct = total ? Math.round((valor / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{valor}</span>
    </div>
  )
}

export default function DashboardGerente() {
  const [planes, setPlanes] = useState([])
  const [observaciones, setObservaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get('/planes/'), api.get('/observaciones/')])
      .then(([p, o]) => { setPlanes(p.data); setObservaciones(o.data) })
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="text-slate-400 py-10">Cargando...</div>

  // Métricas globales
  const total = planes.length
  const vencidos = planes.filter(p => p.estado === 'vencido').length
  const implementados = planes.filter(p => p.estado === 'implementado').length
  const enProceso = planes.filter(p => ['en_curso', 'avanzado'].includes(p.estado)).length
  const pendientes = planes.filter(p => p.estado === 'pendiente').length
  const pctAvance = total ? Math.round((implementados / total) * 100) : 0

  // Métricas por área
  const porArea = AREAS.map(area => {
    const obsArea = observaciones.filter(o => o.area === area)
    const obsIds = obsArea.map(o => o.id)
    const planesArea = planes.filter(p => obsIds.includes(p.observacion_id))
    const vencidosArea = planesArea.filter(p => p.estado === 'vencido').length
    const implementadosArea = planesArea.filter(p => p.estado === 'implementado').length
    const totalArea = planesArea.length

    const semaforo = vencidosArea > 0 ? 'rojo'
      : pendientes > 0 && totalArea > 0 ? 'amarillo'
      : totalArea === implementadosArea && totalArea > 0 ? 'verde'
      : 'gris'

    return { area, obsArea: obsArea.length, totalArea, vencidosArea, implementadosArea, semaforo }
  }).filter(a => a.totalArea > 0)

  // Planes más urgentes (vencidos primero, luego pendientes)
  const urgentes = planes
    .filter(p => ['vencido', 'pendiente'].includes(p.estado))
    .slice(0, 6)

  const SEMAFORO_COLOR = {
    rojo: { dot: 'bg-red-500', bg: 'border-red-200 bg-red-50', label: 'text-red-600' },
    amarillo: { dot: 'bg-yellow-400', bg: 'border-yellow-200 bg-yellow-50', label: 'text-yellow-700' },
    verde: { dot: 'bg-green-500', bg: 'border-green-200 bg-green-50', label: 'text-green-700' },
    gris: { dot: 'bg-slate-300', bg: 'border-slate-200 bg-slate-50', label: 'text-slate-500' },
  }

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panel de gestión</h2>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total planes', valor: total, sub: 'en seguimiento', color: 'bg-slate-800', texto: 'text-white' },
          { label: 'Implementados', valor: implementados, sub: `${pctAvance}% del total`, color: 'bg-green-500', texto: 'text-white' },
          { label: 'En proceso', valor: enProceso, sub: 'en curso / avanzado', color: 'bg-blue-500', texto: 'text-white' },
          { label: 'Pendientes', valor: pendientes, sub: 'sin iniciar', color: 'bg-yellow-400', texto: 'text-white' },
          { label: 'Vencidos', valor: vencidos, sub: 'requieren atención', color: vencidos > 0 ? 'bg-red-500' : 'bg-slate-200', texto: vencidos > 0 ? 'text-white' : 'text-slate-500' },
        ].map(({ label, valor, sub, color, texto }) => (
          <div key={label} className={`${color} rounded-xl p-5`}>
            <p className={`text-xs font-medium ${texto} opacity-75`}>{label}</p>
            <p className={`text-4xl font-bold ${texto} mt-1`}>{valor}</p>
            <p className={`text-xs ${texto} opacity-60 mt-1`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Barra de avance global */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Avance general de implementación</p>
          <p className="text-2xl font-bold text-slate-800">{pctAvance}%</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-green-500 transition-all"
            style={{ width: `${pctAvance}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{implementados} implementados</span>
          <span>{total - implementados} restantes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Semáforo por área */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Estado por área</h3>
            <p className="text-xs text-slate-400 mt-0.5">Semáforo de cumplimiento</p>
          </div>
          <div className="p-4 space-y-2">
            {porArea.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Sin datos</p>
            ) : porArea.map(({ area, totalArea, vencidosArea, implementadosArea, semaforo }) => {
              const c = SEMAFORO_COLOR[semaforo]
              return (
                <div key={area}
                  onClick={() => navigate('/observaciones')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer hover:opacity-80 transition ${c.bg}`}>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium capitalize ${c.label}`}>
                      {area.replace('_', ' ')}
                    </p>
                    <div className="mt-1">
                      <SemaforoBarra
                        valor={implementadosArea}
                        total={totalArea}
                        color="bg-green-400"
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-600">{totalArea} planes</p>
                    {vencidosArea > 0 && (
                      <p className="text-xs text-red-500 font-medium">{vencidosArea} vencido{vencidosArea > 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Planes urgentes */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-700">Requieren atención</h3>
              <p className="text-xs text-slate-400 mt-0.5">Vencidos y pendientes</p>
            </div>
            {urgentes.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2.5 py-1 rounded-full">
                {urgentes.length}
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {urgentes.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-green-600 font-medium text-sm">Todo al día</p>
                <p className="text-slate-400 text-xs mt-1">Sin planes vencidos ni pendientes</p>
              </div>
            ) : urgentes.map(plan => (
              <div key={plan.id}
                onClick={() => navigate('/planes')}
                className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{plan.responsable_nombre}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{plan.descripcion}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 capitalize ${COLORES_ESTADO[plan.estado]}`}>
                    {plan.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-slate-50">
            <button onClick={() => navigate('/planes')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Ver todos los planes →
            </button>
          </div>
        </div>
      </div>

      {/* Accesos rápidos a lo operativo */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ir a lo operativo</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Observaciones', desc: `${observaciones.length} hallazgos cargados`, icon: '🔍', ruta: '/observaciones', color: 'border-blue-200 hover:border-blue-400' },
            { label: 'Planes de acción', desc: `${total} planes en seguimiento`, icon: '📋', ruta: '/planes', color: 'border-slate-200 hover:border-slate-400' },
            { label: 'Nueva observación', desc: 'Cargar un nuevo hallazgo', icon: '＋', ruta: '/observaciones', color: 'border-green-200 hover:border-green-400' },
          ].map(({ label, desc, icon, ruta, color }) => (
            <button key={label} onClick={() => navigate(ruta)}
              className={`bg-white border rounded-xl px-5 py-4 text-left hover:shadow-md transition ${color}`}>
              <span className="text-2xl">{icon}</span>
              <p className="font-semibold text-slate-700 mt-2 text-sm">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
