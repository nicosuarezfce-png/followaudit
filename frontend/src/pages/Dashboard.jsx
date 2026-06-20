import { useEffect, useState } from 'react'
import api from '../api'

const COLORES_RIESGO = {
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

export default function Dashboard() {
  const [planes, setPlanes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/planes/').then(r => setPlanes(r.data)).finally(() => setCargando(false))
  }, [])

  const total = planes.length
  const implementados = planes.filter(p => p.estado === 'implementado').length
  const vencidos = planes.filter(p => p.estado === 'vencido').length
  const pendientes = planes.filter(p => p.estado === 'pendiente').length

  const porArea = planes.reduce((acc, p) => {
    // área viene de la observación, por ahora agrupamos por responsable
    const key = p.responsable_nombre
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  if (cargando) return <div className="text-slate-400">Cargando...</div>

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen general de planes de acción</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: 'Total planes', valor: total, color: 'bg-slate-800 text-white' },
          { label: 'Pendientes', valor: pendientes, color: 'bg-yellow-500 text-white' },
          { label: 'Vencidos', valor: vencidos, color: 'bg-red-500 text-white' },
          { label: 'Implementados', valor: implementados, color: 'bg-green-500 text-white' },
        ].map(({ label, valor, color }) => (
          <div key={label} className={`${color} rounded-xl p-6 shadow-sm`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-4xl font-bold mt-2">{valor}</p>
          </div>
        ))}
      </div>

      {/* Tabla de planes recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Planes de acción recientes</h3>
        </div>
        {planes.length === 0 ? (
          <p className="text-slate-400 text-sm px-6 py-8">No hay planes de acción cargados aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Responsable</th>
                <th className="px-6 py-3 text-left">Descripción</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Plazos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {planes.map(plan => (
                <tr key={plan.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-700">{plan.responsable_nombre}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{plan.descripcion}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${COLORES_ESTADO[plan.estado]}`}>
                      {plan.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{plan.plazos?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
