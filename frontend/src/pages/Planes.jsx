import { useEffect, useState, useMemo } from 'react'
import api from '../api'
import { exportarPlanesExcel } from '../utils/exportExcel'

const COLORES_ESTADO = {
  pendiente: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  avanzado: 'bg-purple-100 text-purple-700',
  implementado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
}

const ESTADOS = ['pendiente', 'en_curso', 'avanzado', 'implementado', 'vencido']
const AREAS = ['finanzas', 'logistica', 'compras', 'comercial', 'pago_proveedores']

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

export default function Planes() {
  const [planes, setPlanes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroArea, setFiltroArea] = useState('todas')

  useEffect(() => {
    api.get('/planes/').then(r => setPlanes(r.data)).finally(() => setCargando(false))
  }, [])

  const conteos = useMemo(() => {
    const estado = {}
    ESTADOS.forEach(e => { estado[e] = 0 })
    planes.forEach(p => { if (estado[p.estado] !== undefined) estado[p.estado]++ })
    return { estado }
  }, [planes])

  const filtrados = useMemo(() => planes.filter(p => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
    return true
  }), [planes, filtroEstado])

  const PUNTO_ESTADO = {
    pendiente: '#94a3b8', en_curso: '#3b82f6', avanzado: '#a855f7',
    implementado: '#22c55e', vencido: '#ef4444',
  }

  if (cargando) return <div className="text-slate-400">Cargando...</div>

  return (
    <div className="flex gap-6">

      {/* Panel filtros */}
      <aside className="w-48 flex-shrink-0 space-y-5">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Estado</p>
          <FiltroItem activo={filtroEstado === 'todos'} onClick={() => setFiltroEstado('todos')}
            punto="#2563eb" badge={planes.length}>Todos</FiltroItem>
          {ESTADOS.map(e => (
            <FiltroItem key={e} activo={filtroEstado === e} onClick={() => setFiltroEstado(e)}
              punto={PUNTO_ESTADO[e]} badge={conteos.estado[e]}
              badgeRojo={e === 'vencido' && conteos.estado[e] > 0}>
              <span className="capitalize">{e.replace('_', ' ')}</span>
            </FiltroItem>
          ))}
        </div>

        {filtroEstado !== 'todos' && (
          <button onClick={() => setFiltroEstado('todos')}
            className="w-full text-xs text-slate-400 hover:text-slate-600 px-3 py-1 text-left transition">
            × Limpiar filtros
          </button>
        )}
      </aside>

      {/* Contenido */}
      <div className="flex-1 space-y-5 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Planes de Acción</h2>
            <p className="text-slate-500 text-sm mt-1">
              {filtrados.length === planes.length
                ? `${planes.length} planes en total`
                : `${filtrados.length} de ${planes.length} planes`}
            </p>
          </div>
          <button
            onClick={() => exportarPlanesExcel(filtrados)}
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Excel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          {filtrados.length === 0 ? (
            <p className="text-slate-400 text-sm px-6 py-10 text-center">No hay planes con ese filtro.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Responsable</th>
                  <th className="px-6 py-3 text-left">Descripción</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Último plazo</th>
                  <th className="px-6 py-3 text-left">Historial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map(plan => {
                  const ultimoPlazo = plan.plazos?.[plan.plazos.length - 1]
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{plan.responsable_nombre}</p>
                        <p className="text-slate-400 text-xs">{plan.responsable_email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs">
                        <p className="line-clamp-2">{plan.descripcion}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${COLORES_ESTADO[plan.estado]}`}>
                          {plan.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {ultimoPlazo ? new Date(ultimoPlazo.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {plan.plazos?.length || 0} plazo{plan.plazos?.length !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
