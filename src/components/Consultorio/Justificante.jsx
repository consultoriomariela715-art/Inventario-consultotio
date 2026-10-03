import React, { useState } from "react"
import { Printer } from "lucide-react"

export default function Justificante({ pacienteNombre, pacienteCedula }) {
  const [dias, setDias] = useState(1)
  const [diag, setDiag] = useState("Tratamiento Odontológico")

  const imprimir = () => {
    const w = window.open("", "_blank", "width=700,height=500")
    w.document.write(`<!DOCTYPE html><html><body style="font-family:Arial;padding:40px;line-height:1.6">
      <h2 style="text-align:center;color:#0d9488">CONSTANCIA DE ASISTENCIA / REPOSO</h2>
      <p>Se hace constar que el/la paciente <strong>${pacienteNombre}</strong>, CI: <strong>${pacienteCedula||"N/A"}</strong>, asistió a consulta hoy ${new Date().toLocaleDateString("es-VE")}.</p>
      <p><strong>Diagnóstico:</strong> ${diag}</p>
      <p>Se sugiere reposo de <strong>${dias} día(s)</strong>.</p>
      <br/><br/><div style="text-align:center;border-top:1px solid #000;width:200px;margin:0 auto">Firma del Odontólogo</div>
    </body></html>`)
    w.document.close(); w.print()
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div><label className="font-bold text-slate-500 block mb-1">Diagnóstico</label><input className="input-field" value={diag} onChange={e=>setDiag(e.target.value)}/></div>
        <div><label className="font-bold text-slate-500 block mb-1">Días de Reposo</label><input type="number" className="input-field" value={dias} onChange={e=>setDias(e.target.value)}/></div>
      </div>
      <button onClick={imprimir} className="btn-primary text-xs"><Printer className="w-3 h-3"/> Imprimir Justificante</button>
    </div>
  )
}
