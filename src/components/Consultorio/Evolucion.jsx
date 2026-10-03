import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Plus, Save, Clock } from "lucide-react"
import toast from "react-hot-toast"

export default function Evolucion({ pacienteId }) {
  const [list, setList] = useState([])
  const [texto, setTexto] = useState("")

  const load = () => {
    supabase.from("evolucion_clinica").select("*").eq("paciente_id", pacienteId).order("created_at", { ascending: false })
      .then(({ data }) => setList(data || []))
  }
  useEffect(() => { if (pacienteId) load() }, [pacienteId])

  const agregar = async () => {
    if (!texto.trim()) return
    await supabase.from("evolucion_clinica").insert([{ paciente_id: pacienteId, titulo: texto, descripcion: texto }])
    toast.success("Evolución registrada")
    setTexto("")
    load()
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex gap-2">
        <input className="input-field flex-1" placeholder="Nueva nota de evolución clínica..." value={texto} onChange={e=>setTexto(e.target.value)}/>
        <button onClick={agregar} className="btn-primary text-xs py-1"><Plus className="w-4 h-4"/> Anotar</button>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {list.map(e => (
          <div key={e.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border flex justify-between items-center">
            <span>{e.titulo}</span>
            <span className="text-[10px] text-slate-400">{new Date(e.created_at).toLocaleDateString("es-VE")}</span>
          </div>
        ))}
        {!list.length && <p className="text-slate-400 text-center py-2">Sin notas de evolución</p>}
      </div>
    </div>
  )
}
