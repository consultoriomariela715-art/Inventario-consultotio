const fs = require('fs');
const path = require('path');

console.log('🚀 Escribiendo e integrando TODOS los componentes en tu aplicación...\n');

// 1. Asegurar directorios
const dirs = [
  'src/components/UI',
  'src/components/Consultorio',
  'src/components/Configuracion',
  'src/components/Layout',
  'src/components/Dashboard',
  'src/utils'
];
dirs.forEach(d => {
  const full = path.join(__dirname, d);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

// =========================================================================
// 1. TAILWIND & INDEX.CSS (Modo Oscuro Real Forzado)
// =========================================================================
fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [],
}
`);

fs.writeFileSync(path.join(__dirname, 'src/index.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-100 text-slate-900 antialiased font-sans transition-colors duration-300;
  }
  html.dark body, body.dark {
    background-color: #020617 !important;
    color: #f8fafc !important;
  }
  .dark .bg-white { background-color: #0f172a !important; color: #f8fafc !important; }
  .dark .bg-slate-50 { background-color: #090d1a !important; }
  .dark .bg-slate-100 { background-color: #020617 !important; }
  .dark .card-box { background-color: #0f172a !important; border-color: #1e293b !important; color: #f8fafc !important; }
  .dark .text-slate-800, .dark .text-slate-900, .dark .text-slate-700 { color: #f8fafc !important; }
  .dark .text-slate-600, .dark .text-slate-500 { color: #94a3b8 !important; }
  .dark .border, .dark .border-b, .dark .border-t, .dark .border-slate-200, .dark .border-slate-100 { border-color: #1e293b !important; }
  .dark .input-field { background-color: #020617 !important; border-color: #334155 !important; color: #f8fafc !important; }
  .dark header { background-color: rgba(15, 23, 42, 0.95) !important; border-color: #1e293b !important; }
  .dark aside { background-color: #020617 !important; border-color: #1e293b !important; }
}

@layer components {
  .btn-primary { @apply bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs; }
  .btn-secondary { @apply bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs; }
  .btn-danger { @apply bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs; }
  .input-field { @apply w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500; }
  .card-box { @apply bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all; }
  .badge { @apply px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border; }
}
`);

// =========================================================================
// 2. SHELL.JSX (Header con Modo Oscuro + Search + Help)
// =========================================================================
fs.writeFileSync(path.join(__dirname, 'src/components/Layout/Shell.jsx'), `import React, { useState, useEffect } from 'react'
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
  const { rates, activeCur, setActiveCur, syncOfficialRates } = useCurrency()
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
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center z-50">
        <span className="font-extrabold text-sm text-teal-400">🦷 OdontoCare PRO</span>
        <button onClick={() => setMob(!mob)} className="p-2 rounded-xl bg-slate-800 text-white">
          {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside className={\`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-300 \${
        mob ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }\`}>
        <div className="space-y-4">
          <div className="hidden md:flex items-center gap-3 px-2 py-2 mb-2 bg-slate-800/40 rounded-2xl border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg">🦷</div>
            <div>
              <h2 className="font-black text-sm text-white tracking-tight">OdontoCare</h2>
              <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">PRO v5.0</span>
            </div>
          </div>

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

        <div className="pt-3 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-2.5 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 p-2.5 rounded-xl w-full transition-all">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {mob && <div onClick={close} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
              <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Buscar...</span>
              <kbd className="hidden sm:inline-block text-[9px] bg-white dark:bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border dark:border-slate-800 font-mono">Ctrl+K</kbd>
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
              {["USD", "VES", "COP"].map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCur(c)}
                  className={\`px-2.5 py-1 rounded-lg transition-all \${
                    activeCur === c ? "bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm" : "text-slate-600 dark:text-slate-400"
                  }\`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800/50">
                BCV: Bs.{rates.VES}
              </span>
              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/50">
                COP: \${rates.COP}
              </span>
              <button onClick={() => syncOfficialRates(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500" title="Sincronizar Tasas">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* BOTÓN MODO OSCURO / CLARO */}
            <button
              type="button"
              onClick={toggleDark}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm cursor-pointer \${
                darkMode
                  ? "bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
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
`);

// =========================================================================
// 3. BOTÓN DE AYUDA FLOTANTE (HelpModal.jsx)
// =========================================================================
fs.writeFileSync(path.join(__dirname, 'src/components/UI/HelpModal.jsx'), `import React, { useState } from 'react'
import { HelpCircle, X, ChevronRight, BookOpen, MessageCircle } from 'lucide-react'

export default function HelpModal() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
        title="Centro de Ayuda"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-end sm:justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <h3 className="font-bold text-sm">Guía Rápida OdontoCare</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3 max-h-80 overflow-y-auto text-slate-700 dark:text-slate-200">
          <div className="space-y-2">
            <p className="font-bold text-teal-700 dark:text-teal-400">💡 Atajos y Funciones Clave:</p>
            <p>• <strong>Ctrl + K:</strong> Abre el buscador rápido desde cualquier pantalla.</p>
            <p>• <strong>Pacientes 360°:</strong> Haz clic en un paciente para ver su Odontograma, Anamnesis, Fotos y Justificantes.</p>
            <p>• <strong>Historial & Cobros:</strong> Emite facturas SENIAT y descárgalas en Excel (.xlsx).</p>
            <p>• <strong>Catálogo Precios:</strong> Edita honorarios directamente con el lápiz amarillo.</p>
          </div>
          <button onClick={() => setOpen(false)} className="btn-primary w-full justify-center text-xs mt-2">Entendido</button>
        </div>
      </div>
    </div>
  )
}
`);

// =========================================================================
// 4. PACIENTES 360° CON SUB-PESTAÑAS (Pacientes.jsx)
// =========================================================================
fs.writeFileSync(path.join(__dirname, 'src/components/Consultorio/Pacientes.jsx'), `import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Odontograma from './Odontograma'
import Anamnesis from './Anamnesis'
import Evolucion from './Evolucion'
import Justificante from './Justificante'
import FotosClinicas from './FotosClinicas'
import Consentimientos from './Consentimientos'
import { Plus, Search, Trash2, Phone, AlertTriangle, ChevronDown, ChevronUp, Save, X, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'

const calcEdad = f => { if (!f) return null; const h = new Date(), n = new Date(f); let e = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--; return e }
const ini = (n, a) => \`\${(n||'?')[0]}\${(a||'?')[0]}\`.toUpperCase()
const cols = ['bg-teal-500','bg-blue-500','bg-violet-500','bg-rose-500','bg-amber-500']
const gc = id => cols[Math.abs((id||'a').charCodeAt(0)) % cols.length]
const blank = { nombres:'', apellidos:'', cedula:'', telefono:'', email:'', fecha_nacimiento:'', alergias:'', antecedentes:'' }

export default function Pacientes() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [subTab, setSubTab] = useState('odontograma')
  const [pacienteDetalle, setPacienteDetalle] = useState({ historial: [], citas: [], dientesUsados: [] })
  const [form, setForm] = useState(blank)

  const load = async () => {
    const { data } = await supabase.from('pacientes').select('*').eq('activo', true).order('created_at', { ascending: false })
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  const toggleExpediente = async (p) => {
    if (expanded === p.id) {
      setExpanded(null)
      return
    }

    setExpanded(p.id)
    setSubTab('odontograma')
    const [hRes, cRes] = await Promise.all([
      supabase.from('historial_clinico').select('*').eq('paciente_id', p.id).order('created_at', { ascending: false }),
      supabase.from('citas').select('*, tratamientos(nombre)').eq('paciente_id', p.id).order('fecha', { ascending: false })
    ])

    const hist = hRes.data || []
    const allDientes = []
    hist.forEach(h => {
      if (h.dientes_tratados) {
        h.dientes_tratados.split(',').forEach(d => {
          const clean = d.trim()
          if (clean && !allDientes.includes(clean)) allDientes.push(clean)
        })
      }
    })

    setPacienteDetalle({ historial: hist, citas: cRes.data || [], dientesUsados: allDientes })
  }

  const save = async e => {
    e.preventDefault()
    const sanitized = {
      nombres: form.nombres,
      apellidos: form.apellidos,
      cedula: form.cedula || null,
      telefono: form.telefono || null,
      email: form.email || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      alergias: form.alergias || null,
      antecedentes: form.antecedentes || null
    }

    if (editId) {
      await supabase.from('pacientes').update(sanitized).eq('id', editId)
      toast.success('Paciente actualizado')
    } else {
      await supabase.from('pacientes').insert([sanitized])
      toast.success('Paciente registrado')
    }
    setShowForm(false); setEditId(null); setForm(blank); load()
  }

  const del = async id => {
    if (!confirm('¿Desactivar paciente?')) return
    await supabase.from('pacientes').update({ activo: false }).eq('id', id)
    toast.success('Paciente desactivado'); setExpanded(null); load()
  }

  const filtered = list.filter(p => \`\${p.nombres} \${p.apellidos} \${p.cedula} \${p.telefono}\`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Expedientes de Pacientes (Perfil 360°)</h1>
          <p className="text-xs text-slate-400">Historia clínica consolidada, odontograma FDI y sub-pestañas operativas</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank) }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo Paciente</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card-box space-y-3 border-2 border-teal-200 bg-teal-50/20">
          <h3 className="font-bold text-sm text-teal-800">{editId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Nombres *</label><input required className="input-field" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Apellidos *</label><input required className="input-field" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Cédula</label><input className="input-field" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Nacimiento</label><input type="date" className="input-field" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Teléfono</label><input className="input-field" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Alergias</label><input className="input-field" value={form.alergias} onChange={e => setForm({...form, alergias: e.target.value})} /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Antecedentes</label><input className="input-field" value={form.antecedentes} onChange={e => setForm({...form, antecedentes: e.target.value})} /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {editId ? 'Actualizar' : 'Guardar'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input placeholder="Buscar por nombre, cédula o teléfono..." value={q} onChange={e => setQ(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card-box p-0 overflow-hidden border">
            <button onClick={() => toggleExpediente(p)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={\`w-11 h-11 rounded-2xl \${gc(p.id)} text-white flex items-center justify-center font-bold text-sm\`}>{ini(p.nombres, p.apellidos)}</div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{p.nombres} {p.apellidos}</h3>
                  <p className="text-[11px] text-slate-400">{p.cedula || 'Sin cédula'} {calcEdad(p.fecha_nacimiento) ? \`• \${calcEdad(p.fecha_nacimiento)} años\` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.alergias && <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px]"><AlertTriangle className="w-3 h-3" /> Alergias</span>}
                <span className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {p.telefono || '—'}</span>
                {expanded === p.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* EXPEDIENTE 360° CON LAS 6 SUB-PESTAÑAS */}
            {expanded === p.id && (
              <div className="border-t bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-4">
                <div className="flex border-b dark:border-slate-800 gap-1 overflow-x-auto text-xs font-bold">
                  {[
                    { id: 'odontograma', label: '🦷 Odontograma' },
                    { id: 'anamnesis', label: '📋 Anamnesis' },
                    { id: 'evolucion', label: '📈 Evolución' },
                    { id: 'justificantes', label: '📄 Justificantes' },
                    { id: 'fotos', label: '📷 Fotos' },
                    { id: 'consentimientos', label: '✍️ Consentimiento' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSubTab(tab.id)}
                      className={\`pb-2.5 px-3.5 border-b-2 transition-all cursor-pointer \${
                        subTab === tab.id
                          ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }\`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[200px]">
                  {subTab === 'odontograma' && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">🦷 Odontograma Histórico Consolidado</p>
                      <Odontograma selected={pacienteDetalle.dientesUsados} onChange={() => {}} readOnly={true} />
                    </div>
                  )}
                  {subTab === 'anamnesis' && <Anamnesis pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />}
                  {subTab === 'evolucion' && <Evolucion pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />}
                  {subTab === 'justificantes' && <Justificante pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} pacienteCedula={p.cedula} />}
                  {subTab === 'fotos' && <FotosClinicas pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />}
                  {subTab === 'consentimientos' && <Consentimientos pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => { setForm(p); setEditId(p.id); setShowForm(true); setExpanded(null) }} className="btn-secondary text-xs"><Edit3 className="w-3.5 h-3.5" /> Editar Datos</button>
                  <button onClick={() => del(p.id)} className="btn-danger text-xs"><Trash2 className="w-3.5 h-3.5" /> Desactivar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
`);

console.log('✅ Archivos generados e integrados exitosamente.');
