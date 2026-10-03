const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src/components/Layout/Shell.jsx');

const shellContent = `import React, { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCurrency } from '../../context/CurrencyContext'
import GlobalSearchModal from '../UI/GlobalSearchModal'
import HelpModal from '../UI/HelpModal'
import {
  Users, Calendar, FileText, Activity, ShoppingBag, Package,
  Settings, LogOut, RefreshCw, LayoutDashboard, Receipt, BarChart3,
  UserCheck, Menu, X, Wallet, FlaskConical, MessageSquare, Moon, Sun, Search
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Shell() {
  const { logout } = useAuth()
  const { rates, activeCur, setActiveCur, syncOfficialRates, loadingRates } = useCurrency()
  const [mob, setMob] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    localStorage.setItem('dark_mode', String(darkMode))
  }, [darkMode])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    toast(next ? '🌙 Modo Oscuro Activado' : '☀️ Modo Claro Activado', { duration: 2000 })
  }

  const navClass = ({ isActive }) =>
    \`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all \${
      isActive ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }\`

  const close = () => setMob(false)

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 md:overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center z-50">
        <span className="font-extrabold text-sm text-teal-400">🦷 OdontoCare PRO</span>
        <button onClick={() => setMob(!mob)} className="p-2 rounded-xl bg-slate-800 text-white">
          {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={\`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 overflow-y-auto \${
        mob ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }\`}>
        <div className="space-y-4">
          <div className="hidden md:flex items-center gap-3 px-2 py-2 mb-2 bg-slate-800/40 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg">🦷</div>
            <div><h2 className="font-black text-sm text-white">OdontoCare</h2><span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">PRO v5.2</span></div>
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/" onClick={close} className={navClass}><LayoutDashboard className="w-4 h-4"/> Panel Ejecutivo</NavLink>
            <NavLink to="/reportes" onClick={close} className={navClass}><BarChart3 className="w-4 h-4"/> Reportes & Finanzas</NavLink>
            <NavLink to="/caja" onClick={close} className={navClass}><Wallet className="w-4 h-4"/> Caja Chica & Cierre</NavLink>
            <NavLink to="/comunicacion" onClick={close} className={navClass}><MessageSquare className="w-4 h-4 text-emerald-400"/> WhatsApp & Chat</NavLink>
            
            <p className="text-[9px] uppercase font-black text-slate-500 px-3 pt-3 pb-1 tracking-widest">Consultorio</p>
            <NavLink to="/pacientes" onClick={close} className={navClass}><Users className="w-4 h-4"/> Pacientes 360°</NavLink>
            <NavLink to="/citas" onClick={close} className={navClass}><Calendar className="w-4 h-4"/> Agenda & Horarios</NavLink>
            <NavLink to="/historial" onClick={close} className={navClass}><FileText className="w-4 h-4"/> Historial & Cobros</NavLink>
            <NavLink to="/planes" onClick={close} className={navClass}><Receipt className="w-4 h-4"/> Planes & Cuotas</NavLink>
            <NavLink to="/tratamientos" onClick={close} className={navClass}><Activity className="w-4 h-4"/> Catálogo Precios</NavLink>
            <NavLink to="/doctores" onClick={close} className={navClass}><UserCheck className="w-4 h-4"/> Doctores</NavLink>
            <NavLink to="/laboratorio" onClick={close} className={navClass}><FlaskConical className="w-4 h-4"/> Laboratorio</NavLink>
            
            <p className="text-[9px] uppercase font-black text-slate-500 px-3 pt-3 pb-1 tracking-widest">Insumos & Ventas</p>
            <NavLink to="/pos" onClick={close} className={navClass}><ShoppingBag className="w-4 h-4"/> Punto de Venta (POS)</NavLink>
            <NavLink to="/ventas" onClick={close} className={navClass}><Receipt className="w-4 h-4"/> Historial Ventas</NavLink>
            <NavLink to="/inventario" onClick={close} className={navClass}><Package className="w-4 h-4"/> Almacén & Kardex</NavLink>
            <NavLink to="/config" onClick={close} className={navClass}><Settings className="w-4 h-4"/> Membrete & Tasas</NavLink>
          </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-2.5 text-xs font-bold text-rose-400 hover:text-white p-2.5 rounded-xl w-full"><LogOut className="w-4 h-4"/> Cerrar Sesión</button>
      </aside>

      {mob && <div onClick={close} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" />}

      {/* Main Header con las 3 Monedas, Tasas BCV/COP y Modo Oscuro */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-sm">
          
          <div className="flex items-center gap-3">
            {/* Buscador */}
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
              <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Buscar...</span>
              <kbd className="hidden sm:inline-block text-[9px] bg-white dark:bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border dark:border-slate-800 font-mono">Ctrl+K</kbd>
            </button>

            {/* SELECTOR DE LAS 3 MONEDAS (USD / VES / COP) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
              {['USD', 'VES', 'COP'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCur(c)}
                  className={\`px-2.5 py-1 rounded-lg transition-all cursor-pointer \${
                    activeCur === c
                      ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }\`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TASAS EN VIVO (BCV Y COP) */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800/50 shadow-sm">
                BCV: Bs.{rates?.VES || 0}
              </span>
              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm">
                COP: \${rates?.COP || 0}
              </span>
              <button 
                type="button"
                onClick={() => syncOfficialRates(true)} 
                disabled={loadingRates}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-teal-600 transition-all cursor-pointer" 
                title="Sincronizar Tasas Oficiales"
              >
                <RefreshCw className={\`w-3.5 h-3.5 \${loadingRates ? 'animate-spin text-teal-600' : ''}\`} />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* MODO OSCURO */}
            <button
              type="button"
              onClick={toggleDark}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm cursor-pointer \${
                darkMode
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }\`}
            >
              {darkMode ? <><Sun className="w-4 h-4 text-amber-400" /><span>Modo Claro</span></> : <><Moon className="w-4 h-4 text-slate-600" /><span>Modo Oscuro</span></>}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <HelpModal />
    </div>
  )
}
`;

fs.writeFileSync(shellPath, shellContent, 'utf8');
console.log('✅ Shell.jsx actualizado correctamente.');
