import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Search, User, Package, Activity, X } from "lucide-react"

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [q, setQ] = useState("")
  const [pacs, setPacs] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQ(""); setPacs([]) }
  }, [isOpen])

  useEffect(() => {
    if (!q.trim()) return setPacs([])
    supabase.from("pacientes").select("id, nombres, apellidos, cedula").ilike("nombres", `%${q}%`).limit(4)
      .then(({ data }) => setPacs(data || []))
  }, [q])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600"/>
          <input ref={inputRef} className="w-full outline-none bg-transparent dark:text-white" placeholder="Buscar paciente por nombre..." value={q} onChange={e=>setQ(e.target.value)}/>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400"/></button>
        </div>
        <div className="p-3 space-y-1">
          {pacs.map(p => (
            <div key={p.id} onClick={() => { onClose(); navigate("/pacientes") }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer flex items-center justify-between">
              <span className="font-bold">{p.nombres} {p.apellidos}</span>
              <span className="text-slate-400 font-mono">{p.cedula}</span>
            </div>
          ))}
          {!q && <p className="text-slate-400 text-center py-4">Escribe para buscar...</p>}
        </div>
      </div>
    </div>
  )
}
