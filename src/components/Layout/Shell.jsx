import React, { useState, useEffect } from "react"
import { Outlet, NavLink, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCurrency } from "../../context/CurrencyContext"
import GlobalSearchModal from "../UI/GlobalSearchModal"
import {
  Users, Calendar, FileText, Activity, ShoppingBag, Package,
  Settings, LogOut, RefreshCw, LayoutDashboard, Receipt, BarChart3,
  UserCheck, Menu, X, Wallet, FlaskConical, MessageSquare, Moon, Sun, Search, Sparkles
} from "lucide-react"

export default function Shell() {
  const { logout } = useAuth()
  const { rates, activeCur, setActiveCur, syncOfficialRates } = useCurrency()
  const [mob, setMob] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("dark_mode")
      return s === "true"
    }
    return false
  })

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem("dark_mode", String(next))
    document.documentElement.classList.toggle("dark", next)
    document.body.classList.toggle("dark", next)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    document.body.classList.toggle("dark", darkMode)
  }, [darkMode])

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 translate-x-1"
        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
    }`

  const close = () => setMob(false)

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 md:overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦷</span>
          <span className="font-extrabold text-sm tracking-tight text-teal-400">OdontoCare PRO</span>
        </div>
        <button onClick={() => setMob(!mob)} className="p-2 rounded-xl bg-slate-800 text-white">
          {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Oscura de Alta Gama */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-300 shadow-2xl md:shadow-none border-r border-slate-800 ${
        mob ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="space-y-4">
          {/* Logo Brand */}
          <div className="hidden md:flex items-center gap-3 px-2 py-2 mb-2 bg-slate-800/40 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center text-xl shadow-lg shadow-teal-500/30">
              🦷
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-sm text-white tracking-tight">OdontoCare</h2>
                <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded font-bold">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Gestión Odontológica</p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-0.5">
            <NavLink to="/" onClick={close} className={navClass}><LayoutDashboard className="w-4 h-4" /> Panel Ejecutivo</NavLink>
            <NavLink to="/reportes" onClick={close} className={navClass}><BarChart3 className="w-4 h-4" /> Reportes & Finanzas</NavLink>
            <NavLink to="/caja" onClick={close} className={navClass}><Wallet className="w-4 h-4" /> Caja Chica & Cierre</NavLink>
            <NavLink to="/comunicacion" onClick={close} className={navClass}><MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp & Chat</NavLink>

            <p className="text-[9px] uppercase font-black text-slate-500 px-3 pt-3 pb-1 tracking-widest">Consultorio</p>
            <NavLink to="/pacientes" onClick={close} className={navClass}><Users className="w-4 h-4" /> Pacientes 360°</NavLink>
            <NavLink to="/citas" onClick={close} className={navClass}><Calendar className="w-4 h-4" /> Agenda & Horarios</NavLink>
            <NavLink to="/historial" onClick={close} className={navClass}><FileText className="w-4 h-4" /> Historial & Cobros</NavLink>
            <NavLink to="/planes" onClick={close} className={navClass}><Receipt className="w-4 h-4" /> Planes & Cuotas</NavLink>
            <NavLink to="/tratamientos" onClick={close} className={navClass}><Activity className="w-4 h-4" /> Catálogo Precios</NavLink>
            <NavLink to="/doctores" onClick={close} className={navClass}><UserCheck className="w-4 h-4" /> Doctores</NavLink>
            <NavLink to="/laboratorio" onClick={close} className={navClass}><FlaskConical className="w-4 h-4" /> Laboratorio</NavLink>

            <p className="text-[9px] uppercase font-black text-slate-500 px-3 pt-3 pb-1 tracking-widest">Insumos & Ventas</p>
            <NavLink to="/pos" onClick={close} className={navClass}><ShoppingBag className="w-4 h-4" /> Punto de Venta (POS)</NavLink>
            <NavLink to="/ventas" onClick={close} className={navClass}><Receipt className="w-4 h-4" /> Historial Ventas</NavLink>
            <NavLink to="/inventario" onClick={close} className={navClass}><Package className="w-4 h-4" /> Almacén & Kardex</NavLink>
            <NavLink to="/config" onClick={close} className={navClass}><Settings className="w-4 h-4" /> Membrete & Tasas</NavLink>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-3 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-2.5 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 p-2.5 rounded-xl w-full transition-all">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {mob && <div onClick={close} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" />}

      {/* Contenedor Central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior Blanco / Oscuro */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="VERSION_ACTIVA_V5 bg-emerald-500 text-slate-950 font-black px-2 py-1 rounded-lg text-[10px] tracking-wider animate-pulse shadow-md">
              ⚡ V5.0 NUEVA
            </span>
            {/* Buscador Rápido */}
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-inner">
              <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Buscar paciente o insumo...</span>
              <kbd className="hidden sm:inline-block text-[9px] bg-white dark:bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">Ctrl+K</kbd>
            </button>

            {/* Selector de Moneda */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
              {["USD", "VES", "COP"].map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCur(c)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeCur === c
                      ? "bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tasas de Cambio */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800/50 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                BCV: Bs.{rates.VES}
              </span>
              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm">
                COP: ${rates.COP}
              </span>
              <button onClick={() => syncOfficialRates(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500" title="Sincronizar Tasas">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Modo Oscuro */}
            <button onClick={toggleDark} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title={darkMode ? "Modo Claro" : "Modo Oscuro"}>
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </header>

        {/* Vista de contenido */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/60 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
