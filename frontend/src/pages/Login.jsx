import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)
      const { data } = await api.post('/auth/login', form)
      login(data)
      navigate('/dashboard')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — fondo visual */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
        }}
      >
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute top-1/2 right-20 w-[160px] h-[160px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />

        {/* Logo y tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-white font-bold text-2xl">FollowAudit</span>
          </div>
        </div>

        {/* Texto central */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-4xl font-bold leading-tight">
            Seguimiento de<br />auditorías en<br />
            <span className="text-blue-300">tiempo real</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Centralizá todas las observaciones, planes de acción y plazos en un solo lugar. Sin Excel, sin emails dispersos.
          </p>

          {/* Estadísticas ficticias para dar vida al panel */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { valor: '100%', label: 'Trazabilidad' },
              { valor: '3', label: 'Roles de acceso' },
              { valor: '0', label: 'Plazos perdidos' },
            ].map(({ valor, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white font-bold text-2xl">{valor}</p>
                <p className="text-slate-300 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">© 2026 FollowAudit · Todos los derechos reservados</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-8">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
          {/* Logo solo visible en mobile */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">FollowAudit</h1>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Bienvenido</h3>
            <p className="text-slate-500 text-sm mt-1">Ingresá con tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
