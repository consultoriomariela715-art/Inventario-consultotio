import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Upload } from "lucide-react"
import toast from "react-hot-toast"

export default function FotosClinicas({ pacienteId }) {
  const [fotos, setFotos] = useState([])
  const load = () => {
    supabase.from("fotos_clinicas").select("*").eq("paciente_id", pacienteId).order("created_at", { ascending: false })
      .then(({ data }) => setFotos(data || []))
  }
  useEffect(() => { if (pacienteId) load() }, [pacienteId])

  const subir = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const path = `${pacienteId}/${Date.now()}.${file.name.split(".").pop()}`
    await supabase.storage.from("fotos-clinicas").upload(path, file)
    const { data: { publicUrl } } = supabase.storage.from("fotos-clinicas").getPublicUrl(path)
    await supabase.from("fotos_clinicas").insert([{ paciente_id: pacienteId, url: publicUrl, tipo: "control" }])
    toast.success("Foto agregada")
    load()
  }

  return (
    <div className="space-y-3 text-xs">
      <label className="btn-primary text-xs py-1 cursor-pointer w-fit">
        <Upload className="w-3 h-3"/> Subir Foto Clínica
        <input type="file" accept="image/*" className="hidden" onChange={subir}/>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map(f => (
          <img key={f.id} src={f.url} alt="Foto" className="w-full h-20 object-cover rounded-lg border"/>
        ))}
        {!fotos.length && <p className="text-slate-400 col-span-3 text-center py-2">Sin fotos guardadas</p>}
      </div>
    </div>
  )
}
