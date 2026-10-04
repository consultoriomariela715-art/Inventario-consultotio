import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const SESSION_DURATION = 30 * 60 * 1000

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = localStorage.getItem('odonto_auth_session')
    const t = localStorage.getItem('odonto_auth_timestamp')
    if (s === 'active' && t) {
      const elapsed = Date.now() - Number(t)
      if (elapsed < SESSION_DURATION) {
        setAuth(true)
      } else {
        localStorage.removeItem('odonto_auth_session')
        localStorage.removeItem('odonto_auth_timestamp')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!auth) return
    const interval = setInterval(() => {
      const t = localStorage.getItem('odonto_auth_timestamp')
      if (t && Date.now() - Number(t) > SESSION_DURATION) {
        localStorage.removeItem('odonto_auth_session')
        localStorage.removeItem('odonto_auth_timestamp')
        setAuth(false)
        window.location.href = '/login'
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [auth])

  const login = (pass) => {
    const valid = import.meta.env.VITE_APP_PASSWORD
    if (!valid) {
      console.error('VITE_APP_PASSWORD no configurada en Vercel')
      return false
    }
    if (pass === valid) {
      localStorage.setItem('odonto_auth_session', 'active')
      localStorage.setItem('odonto_auth_timestamp', String(Date.now()))
      setAuth(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('odonto_auth_session')
    localStorage.removeItem('odonto_auth_timestamp')
    setAuth(false)
  }

  return <AuthContext.Provider value={{ auth, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
