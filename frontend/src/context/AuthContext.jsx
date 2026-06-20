import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('followaudit_usuario')
    return guardado ? JSON.parse(guardado) : null
  })

  const login = (datos) => {
    localStorage.setItem('followaudit_token', datos.access_token)
    localStorage.setItem('followaudit_usuario', JSON.stringify(datos.usuario))
    setUsuario(datos.usuario)
  }

  const logout = () => {
    localStorage.removeItem('followaudit_token')
    localStorage.removeItem('followaudit_usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
