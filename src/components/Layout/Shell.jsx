import React, { useState, useEffect } from "react"
import { Outlet, NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCurrency } from "../../context/CurrencyContext"
import GlobalSearchModal from "../UI/GlobalSearchModal"
import HelpModal from "../UI/HelpModal"
import {
  Users, Calendar, FileText, Activity, ShoppingBag, Package,
  Settings, LogOut, RefreshCw, LayoutDashboard, Receipt, BarChart3,
  UserCheck, Menu, X, Wallet, FlaskConical, MessageSquare, Moon, Sun, Search
} from "lucide-react"
import toast from "react-hot-toast"

export default function Shell() {
  const { logout } = useAuth()
  const { rates, activeCur, setActiveCur, syncOfficialRates } = useCurrency()
  const [mob, setMob] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark_mode") === "true")

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      document.body.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark")
    }
    localStorage.setItem("dark_mode", String(darkMode))
  }, [darkMode])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    toast(next ? "🌙 Modo Oscuro Activado" : "☀️ Modo Claro Activado", { duration: 2000 })
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
      isActive ? "bg-teal-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
    }`

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 md:overflow-hidden font-sans">
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 overflow-y-auto ${mob ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="space-y-4">
          <div className="hidden md:flex items-center gap-3 px-2 py-2 mb-2 bg-slate-800/40 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg">🦷</div>
            <div><h2 className="font-black text-sm text-white">OdontoCare</h2><span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">PRO v5.2</span></div>
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/" onClick={()=>setMob(false)} className={navClass}><LayoutDashboard className="w-4 h-4"/> Panel Ejecutivo</NavLink>
            <NavLink to="/reportes" onClick={()=>setMob(false)} className={navClass}><BarChart3 className="w-4 h-4"/> Reportes & Finanzas</NavLink>
            <NavLink to="/caja" onClick={()=>setMob(false)} className={navClass}><Wallet className="w-4 h-4"/> Caja Chica & Cierre</NavLink>
            <NavLink to="/comunicacion" onClick={()=>setMob(false)} className={navClass}><MessageSquare className="w-4 h-4 text-emerald-400"/> WhatsApp & Chat</NavLink>
            <p className="text-[9px] uppercase font-black text-slate-500 px-3 pt-3 pb-1 tracking-widest">Consultorio</p>
            <NavLink to="/pacientes" onClick={()=>setMob(false)} className={navClass}><Users className="w-4 h-4"/> Pacientes 360°</NavLink>
            <NavLink to="/citas" onClick={()=>setMob(false)} className={navClass}><Calendar className="w-4 h-4"/> Agenda & Horarios</NavLink>
            <NavLink to="/historial" onClick={()=>setMob(false)} className={navClass}><FileText className="w-4 h-4"/> Historial & Cobros</NavLink>
            <NavLink to="/planes" onClick={()=>setMob(false)} className={navClass}><Receipt className="w-4 h-4"/> Planes & Cuotas</NavLink>
            <NavLink to="/tratamientos" onClick={()=>setMob(false)} className={navClass}><Activity className="w-4 h-4"/> Catálogo Precios</NavLink>
            <NavLink to="/doctores" onClick={()=>setMob(false)} className={navClass}><UserCheck className="w-4 h-4"/> Doctores</NavLink>
            <NavLink to="/laboratorio" onClick={()=>setMob(false)} className={navClass}><FlaskConical className="w-4 h-4"/> Laboratorio</NavLink>
            <p className="text-[9px] uppercase font-black text-slate-500 px-3 pt-3 pb-1 tracking-widest">Insumos & Ventas</p>
            <NavLink to="/pos" onClick={()=>setMob(false)} className={navClass}><ShoppingBag className="w-4 h-4"/> Punto de Venta (POS)</NavLink>
            <NavLink to="/ventas" onClick={()=>setMob(false)} className={navClass}><Receipt className="w-4 h-4"/> Historial Ventas</NavLink>
            <NavLink to="/inventario" onClick={()=>setMob(false)} className={navClass}><Package className="w-4 h-4"/> Almacén & Kardex</NavLink>
            <NavLink to="/config" onClick={()=>setMob(false)} className={navClass}><Settings className="w-4 h-4"/> Membrete & Tasas</NavLink>
          </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-2.5 text-xs font-bold text-rose-400 hover:text-white p-2.5 rounded-xl w-full"><LogOut className="w-4 h-4"/> Cerrar Sesión</button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSearchOpen(true)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
              <Search className="w-3.5 h-3.5 text-teal-600"/> <span>Buscar...</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 px-2.5 py-1.5 rounded-xl border">BCV: Bs.{rates.VES}</span>
            <button onClick={toggleDark} className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300">
              {darkMode ? <><Sun className="w-4 h-4"/> Modo Claro</> : <><Moon className="w-4 h-4"/> Modo Oscuro</>}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950"><Outlet/></main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={()=>setSearchOpen(false)} />
      <HelpModal />
    </div>
  )
}
