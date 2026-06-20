import { useEffect, useState } from 'react'
import api from '../api'

const COLORES_ESTADO = {
  pendiente: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  avanzado: 'bg-purple-100 text-purple-700',
  implementado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
}

const ESTADOS = ['pendiente', 'en_curso', 'avanzado', 'implementado', 'vencido']

export default function Planes() {
  const [planes, setPlanes] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    const url = filtroEstado ? `/planes/?estado=${filtroEstado}` : '/planes/'
    api.get(url).then(r => setPlanes(r.data)).finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [filtroEstado])

  if (cargando) return <div className="text-slate-400">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Planes de Acción</h2>
          <p className="text-slate-500 text-sm mt-1">Seguimiento de todos los planes activos</p>
        </div>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {planes.length === 0 ? (
          <p className="text-slate-400 text-sm px-6 py-10 text-center">No hay planes con ese estado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Responsable</th>
                <th className="px-6 py-3 text-left">Descripción</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Último plazo</th>
                <th className="px-6 py-3 text-left">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {planes.map(plan => {
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
                      {ultimoPlazo ? new Date(ultimoPlazo.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}
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
  )
}
