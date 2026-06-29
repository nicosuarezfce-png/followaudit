import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS_AUDITOR = [
  { to: '/dashboard', label: 'Inicio', icon: '📊' },
  { to: '/observaciones', label: 'Observaciones', icon: '🔍' },
  { to: '/planes', label: 'Planes de Acción', icon: '📋' },
]

const LINKS_GERENTE = [
  { to: '/dashboard', label: 'Panel de gestión', icon: '📈' },
  { to: '/observaciones', label: 'Observaciones', icon: '🔍' },
  { to: '/planes', label: 'Planes de Acción', icon: '📋' },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const links = usuario?.rol === 'gerente' ? LINKS_GERENTE : LINKS_AUDITOR

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-white font-bold text-xl">FollowAudit</h1>
        <p className="text-slate-400 text-xs mt-1">Seguimiento de auditorías</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-slate-700">
        <p className="text-slate-300 text-sm font-medium">{usuario?.nombre}</p>
        <p className="text-slate-500 text-xs capitalize">{usuario?.rol}</p>
        <button onClick={handleLogout} className="mt-3 text-xs text-slate-400 hover:text-white transition">
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
