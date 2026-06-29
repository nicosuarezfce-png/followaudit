import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardGerente from './pages/DashboardGerente'
import Observaciones from './pages/Observaciones'
import Planes from './pages/Planes'
import ObservacionDetalle from './pages/ObservacionDetalle'

function DashboardRouter() {
  const { usuario } = useAuth()
  return usuario?.rol === 'gerente' ? <DashboardGerente /> : <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/observaciones" element={<Observaciones />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/observaciones/:id" element={<ObservacionDetalle />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
