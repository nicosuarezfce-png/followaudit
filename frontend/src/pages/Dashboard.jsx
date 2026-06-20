import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const COLORES_ESTADO = {
  pendiente: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  avanzado: 'bg-purple-100 text-purple-700',
  implementado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
}

const RIESGO_BADGE = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-yellow-100 text-yellow-700',
  bajo: 'bg-green-100 text-green-700',
}

export default function Dashboard() {
  const [planes, setPlanes] = useState([])
  const [observaciones, setObservaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/planes/'),
      api.get('/observaciones/'),
    ]).then(([planesRes, obsRes]) => {
      setPlanes(planesRes.data)
      setObservaciones(obsRes.data)
    }).finally(() => setCargando(false))
  }, [])

  const total = planes.length
  const implementados = planes.filter(p => p.estado === 'implementado').length
  const vencidos = planes.filter(p => p.estado === 'vencido').length
  const pendientes = planes.filter(p => p.estado === 'pendiente').length
  const enCurso = planes.filter(p => p.estado === 'en_curso' || p.estado === 'avanzado').length

  const planesUrgentes = planes.filter(p => p.estado === 'vencido' || p.estado === 'pendiente').slice(0, 5)
  const obsRecientes = observaciones.slice(0, 4)

  if (cargando) return <div className="text-slate-400 py-10">Cargando...</div>

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bienvenido, {usuario?.nombre?.split(' ')[0]}</h2>
          <p className="text-slate-500 text-sm mt-1">Resumen general de auditorías al {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Acciones rápidas — solo auditores */}
        {usuario?.rol === 'auditor' && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/observaciones')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
            >
              <span className="text-base">🔍</span> Nueva observación
            </button>
          </div>
        )}
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: 'Total planes', valor: total, color: 'bg-slate-800', sub: 'planes activos' },
          { label: 'En proceso', valor: enCurso, color: 'bg-blue-600', sub: 'en curso / avanzado' },
          { label: 'Vencidos', valor: vencidos, color: 'bg-red-500', sub: 'requieren atención' },
          { label: 'Implementados', valor: implementados, color: 'bg-green-500', sub: 'completados' },
        ].map(({ label, valor, color, sub }) => (
          <div key={label} className={`${color} rounded-xl p-6 shadow-sm text-white`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-4xl font-bold mt-2">{valor}</p>
            <p className="text-xs opacity-60 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Planes que requieren atención */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Planes que requieren atención</h3>
            <button onClick={() => navigate('/planes')} className="text-xs text-blue-600 hover:underline">Ver todos</button>
          </div>
          {planesUrgentes.length === 0 ? (
            <p className="text-slate-400 text-sm px-6 py-8 text-center">Sin planes urgentes. ¡Todo al día!</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Responsable</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Plazos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {planesUrgentes.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate('/planes')}>
                    <td className="px-6 py-3 font-medium text-slate-700">{plan.responsable_nombre}</td>
                    <td className="px-6 py-3 text-slate-500 max-w-[200px] truncate">{plan.descripcion}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${COLORES_ESTADO[plan.estado]}`}>
                        {plan.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400">{plan.plazos?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Observaciones recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Observaciones recientes</h3>
            <button onClick={() => navigate('/observaciones')} className="text-xs text-blue-600 hover:underline">Ver todas</button>
          </div>
          <div className="divide-y divide-slate-50">
            {obsRecientes.length === 0 ? (
              <p className="text-slate-400 text-sm px-6 py-8 text-center">Sin observaciones cargadas.</p>
            ) : obsRecientes.map(obs => (
              <div key={obs.id} className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition" onClick={() => navigate('/observaciones')}>
                <p className="text-sm font-medium text-slate-700 truncate">{obs.titulo}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RIESGO_BADGE[obs.riesgo]}`}>{obs.riesgo}</span>
                  <span className="text-xs text-slate-400 capitalize">{obs.area.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Acceso rápido para agregar */}
          {usuario?.rol === 'auditor' && (
            <div className="px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/observaciones')}
                className="w-full text-sm text-center text-blue-600 hover:text-blue-700 font-medium py-1"
              >
                + Cargar nueva observación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
