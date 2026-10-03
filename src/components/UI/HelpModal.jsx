import React, { useState } from "react"
import { HelpCircle, X, BookOpen } from "lucide-react"

export default function HelpModal() {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer" title="Centro de Ayuda">
        <HelpCircle className="w-6 h-6" />
      </button>
    )
  }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-sm"><BookOpen className="w-4 h-4"/> Guía OdontoCare PRO</div>
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 space-y-2 text-slate-700 dark:text-slate-200">
          <p>• <strong>Ctrl + K:</strong> Buscador global en cualquier pantalla.</p>
          <p>• <strong>Pacientes 360°:</strong> Despliega para ver Odontograma, Anamnesis, Fotos y Justificantes.</p>
          <p>• <strong>Historial:</strong> Emite facturas SENIAT con botón para descargar Excel.</p>
          <p>• <strong>Modo Oscuro:</strong> Botón arriba a la derecha para alternar.</p>
          <button onClick={() => setOpen(false)} className="btn-primary w-full justify-center text-xs mt-3">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
