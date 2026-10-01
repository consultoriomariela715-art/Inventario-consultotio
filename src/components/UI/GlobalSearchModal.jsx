import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Search, User, Package, FileText, Calendar, X, ArrowRight, Activity } from 'lucide-react'

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ pacientes: [], productos: [], tratamientos: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ pacientes: [], productos: [], tratamientos: [] })
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ pacientes: [], productos: [], tratamientos: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const q = query.trim()
      try {
        const [pRes, prodRes, tRes] = await Promise.all([
          supabase.from('pacientes').select('id, nombres, apellidos, cedula, telefono').eq('activo', true).or(`nombres.ilike.%${q}%,apellidos.ilike.%${q}%,cedula.ilike.%${q}%`).limit(4),
          supabase.from('productos').select('id, nombre, stock, precio_venta').eq('activo', true).ilike('nombre', `%${q}%`).limit(4),
          supabase.from('tratamientos').select('id, nombre, precio, categoria').eq('activo', true).ilike('nombre', `%${q}%`).limit(4)
        ])
        setResults({
          pacientes: pRes.data || [],
          productos: prodRes.data || [],
          tratamientos: tRes.data || []
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const goTo = (path) => {
    onClose()
    navigate(path)
  }

  const totalResults = results.pacientes.length + results.productos.length + results.tratamientos.length

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            placeholder="Buscar paciente, insumo, tratamiento o acceso rápido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded border dark:border-slate-600 font-mono">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-3 space-y-3">
          {loading && <p className="text-center py-4 text-slate-400">Buscando...</p>}
          {!loading && query && totalResults === 0 && (
            <p className="text-center py-6 text-slate-400">No se encontraron resultados para "{query}"</p>
          )}

          {results.pacientes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Pacientes</p>
              <div className="space-y-1">
                {results.pacientes.map(p => (
                  <button key={p.id} onClick={() => goTo('/pacientes')} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{p.nombres} {p.apellidos}</p>
                        <p className="text-[10px] text-slate-400">CI: {p.cedula || 'S/C'} • {p.telefono || 'S/T'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.tratamientos.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Tratamientos</p>
              <div className="space-y-1">
                {results.tratamientos.map(t => (
                  <button key={t.id} onClick={() => goTo('/tratamientos')} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{t.nombre}</p>
                        <p className="text-[10px] text-slate-400">{t.categoria || 'General'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-teal-600">${t.precio}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.productos.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Insumos / Almacén</p>
              <div className="space-y-1">
                {results.productos.map(pr => (
                  <button key={pr.id} onClick={() => goTo('/inventario')} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{pr.nombre}</p>
                        <p className="text-[10px] text-slate-400">Stock: {pr.stock}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">${pr.precio_venta}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Accesos Rápidos</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => goTo('/citas')} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-left">
                  <Calendar className="w-4 h-4 text-teal-600" /> <span>Agenda & Citas</span>
                </button>
                <button onClick={() => goTo('/historial')} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-left">
                  <FileText className="w-4 h-4 text-blue-600" /> <span>Cobrar Consulta</span>
                </button>
                <button onClick={() => goTo('/pos')} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-left">
                  <Package className="w-4 h-4 text-amber-600" /> <span>Punto de Venta POS</span>
                </button>
                <button onClick={() => goTo('/reportes')} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-left">
                  <Activity className="w-4 h-4 text-purple-600" /> <span>Cierre de Caja</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 px-4 border-t border-slate-100 dark:border-slate-700/80 flex justify-between text-[10px] text-slate-400">
          <span>Usa el teclado o clic para navegar</span>
          <span>Cerrar con <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border dark:border-slate-700">ESC</kbd></span>
        </div>
      </div>
    </div>
  )
}
