import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Check, Plus } from "lucide-react"
import toast from "react-hot-toast"

export default function Consentimientos({ pacienteId, pacienteNombre }) {
  const [list, setList] = useState([])
  const [proc, setProc] = useState("")

  const load = () => {
    supabase.from("consentimientos").select("*").eq("paciente_id", pacienteId).order("created_at", { ascending: false })
      .then(({ data }) => setList(data || []))
  }
  useEffect(() => { if (pacienteId) load() }, [pacienteId])

  const firmar = async () => {
    if (!proc.trim()) return
    await supabase.from("consentimientos").insert([{ paciente_id: pacienteId, procedimiento: proc, firma_nombre: pacienteNombre, aceptado: true }])
    toast.success("Consentimiento firmado")
    setProc("")
    load()
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex gap-2">
        <input className="input-field flex-1" placeholder="Procedimiento a autorizar (ej. Exodoncia)..." value={proc} onChange={e=>setProc(e.target.value)}/>
        <button onClick={firmar} className="btn-primary text-xs py-1"><Check className="w-3 h-3"/> Firmar</button>
      </div>
      <div className="space-y-1">
        {list.map(c => (
          <div key={c.id} className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-lg flex justify-between items-center">
            <span>✓ {c.procedimiento}</span>
            <span className="text-[10px]">{new Date(c.created_at).toLocaleDateString("es-VE")}</span>
          </div>
        ))}
        {!list.length && <p className="text-slate-400 text-center py-2">Sin consentimientos firmados</p>}
      </div>
    </div>
  )
}
