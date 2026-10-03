import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import Odontograma from "./Odontograma"
import Anamnesis from "./Anamnesis"
import Evolucion from "./Evolucion"
import Justificante from "./Justificante"
import FotosClinicas from "./FotosClinicas"
import Consentimientos from "./Consentimientos"
import { Plus, Search, Trash2, Phone, AlertTriangle, ChevronDown, ChevronUp, Save, X, Edit3 } from "lucide-react"
import toast from "react-hot-toast"

export default function Pacientes() {
  const [list, setList] = useState([])
  const [q, setQ] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [subTab, setSubTab] = useState("odontograma")
  const [form, setForm] = useState({ nombres: "", apellidos: "", cedula: "", telefono: "", email: "", fecha_nacimiento: "", alergias: "", antecedentes: "" })

  const load = async () => {
    const { data } = await supabase.from("pacientes").select("*").eq("activo", true).order("created_at", { ascending: false })
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    if (editId) {
      await supabase.from("pacientes").update(form).eq("id", editId)
      toast.success("Paciente actualizado")
    } else {
      await supabase.from("pacientes").insert([form])
      toast.success("Paciente registrado")
    }
    setShowForm(false); setEditId(null); setForm({ nombres: "", apellidos: "", cedula: "", telefono: "", email: "", fecha_nacimiento: "", alergias: "", antecedentes: "" }); load()
  }

  const del = async (id) => {
    if (!confirm("¿Desactivar paciente?")) return
    await supabase.from("pacientes").update({ activo: false }).eq("id", id)
    toast.success("Paciente desactivado"); load()
  }

  const filtered = list.filter(p => `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Expedientes de Pacientes (Perfil 360°)</h1>
          <p className="text-xs text-slate-400">Historia clínica consolidada, odontograma FDI y sub-pestañas operativas</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null) }} className={showForm ? "btn-secondary" : "btn-primary"}>
          {showForm ? <><X className="w-4 h-4"/> Cerrar</> : <><Plus className="w-4 h-4"/> Nuevo Paciente</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card-box space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-[11px] font-bold block mb-1">Nombres *</label><input required className="input-field" value={form.nombres} onChange={e=>setForm({...form, nombres: e.target.value})}/></div>
            <div><label className="text-[11px] font-bold block mb-1">Apellidos *</label><input required className="input-field" value={form.apellidos} onChange={e=>setForm({...form, apellidos: e.target.value})}/></div>
            <div><label className="text-[11px] font-bold block mb-1">Cédula</label><input className="input-field" value={form.cedula} onChange={e=>setForm({...form, cedula: e.target.value})}/></div>
            <div><label className="text-[11px] font-bold block mb-1">Teléfono</label><input className="input-field" value={form.telefono} onChange={e=>setForm({...form, telefono: e.target.value})}/></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4"/> Guardar</button>
            <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input placeholder="Buscar paciente por nombre o cédula..." value={q} onChange={e=>setQ(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card-box p-0 overflow-hidden border">
            <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">{p.nombres} {p.apellidos}</h3>
                <p className="text-[11px] text-slate-400">CI: {p.cedula || "Sin cédula"} • Tel: {p.telefono || "Sin teléfono"}</p>
              </div>
              <div className="flex items-center gap-2">
                {expanded === p.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
              </div>
            </button>

            {/* EXPEDIENTE CON LAS 6 SUB-PESTAÑAS */}
            {expanded === p.id && (
              <div className="border-t bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
                <div className="flex border-b gap-1 overflow-x-auto text-xs font-bold">
                  {[
                    { id: "odontograma", label: "🦷 Odontograma" },
                    { id: "anamnesis", label: "📋 Anamnesis" },
                    { id: "evolucion", label: "📈 Evolución" },
                    { id: "justificantes", label: "📄 Justificantes" },
                    { id: "fotos", label: "📷 Fotos" },
                    { id: "consentimientos", label: "✍️ Consentimiento" }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setSubTab(tab.id)} className={`pb-2 px-3 border-b-2 transition-all ${subTab === tab.id ? "border-teal-600 text-teal-700 dark:text-teal-400" : "border-transparent text-slate-400"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border min-h-[160px]">
                  {subTab === "odontograma" && <Odontograma readOnly={true} />}
                  {subTab === "anamnesis" && <Anamnesis pacienteId={p.id} pacienteNombre={`${p.nombres} ${p.apellidos}`} />}
                  {subTab === "evolucion" && <Evolucion pacienteId={p.id} />}
                  {subTab === "justificantes" && <Justificante pacienteNombre={`${p.nombres} ${p.apellidos}`} pacienteCedula={p.cedula} />}
                  {subTab === "fotos" && <FotosClinicas pacienteId={p.id} />}
                  {subTab === "consentimientos" && <Consentimientos pacienteId={p.id} pacienteNombre={`${p.nombres} ${p.apellidos}`} />}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setForm(p); setEditId(p.id); setShowForm(true); setExpanded(null) }} className="btn-secondary text-xs"><Edit3 className="w-3.5 h-3.5"/> Editar</button>
                  <button onClick={() => del(p.id)} className="btn-danger text-xs"><Trash2 className="w-3.5 h-3.5"/> Desactivar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
