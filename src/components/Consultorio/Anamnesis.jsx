import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Save, Printer, FileText } from "lucide-react"
import toast from "react-hot-toast"

export default function Anamnesis({ pacienteId, pacienteNombre }) {
  const [form, setForm] = useState({ motivo: "", alergias: "", antecedentes: "", medicamentos: "" })
  useEffect(() => {
    if (!pacienteId) return
    supabase.from("anamnesis").select("*").eq("paciente_id", pacienteId).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) setForm(data[0]) })
  }, [pacienteId])

  const guardar = async () => {
    await supabase.from("anamnesis").insert([{ ...form, paciente_id: pacienteId }])
    toast.success("Anamnesis guardada")
  }
  return (
    <div className="space-y-3 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"><FileText className="w-4 h-4 text-teal-600"/> Anamnesis de {pacienteNombre}</span>
        <button onClick={guardar} className="btn-primary text-xs py-1"><Save className="w-3 h-3"/> Guardar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className="font-bold text-slate-500 block mb-1">Motivo de Consulta</label><input className="input-field" value={form.motivo||""} onChange={e=>setForm({...form, motivo: e.target.value})} placeholder="Dolor, limpieza, revisión..."/></div>
        <div><label className="font-bold text-slate-500 block mb-1">Alergias Conocidas</label><input className="input-field" value={form.alergias||""} onChange={e=>setForm({...form, alergias: e.target.value})} placeholder="Penicilina, látex..."/></div>
        <div><label className="font-bold text-slate-500 block mb-1">Antecedentes Médicos</label><input className="input-field" value={form.antecedentes||""} onChange={e=>setForm({...form, antecedentes: e.target.value})} placeholder="Diabetes, HTA..."/></div>
        <div><label className="font-bold text-slate-500 block mb-1">Medicamentos Actuales</label><input className="input-field" value={form.medicamentos||""} onChange={e=>setForm({...form, medicamentos: e.target.value})} placeholder="Aspirina, etc."/></div>
      </div>
    </div>
  )
}
