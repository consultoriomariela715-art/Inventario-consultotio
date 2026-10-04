import React, { useState } from 'react'
import { Sparkles, MessageCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

const plantillas = [
  {
    titulo: 'Profilaxis & Limpieza',
    procedimiento: 'Limpieza Dental Ultrasónica y Profilaxis',
    diagnostico: 'Gingivitis marginal inducida por placa y cálculo dental.',
    postOp: 'Evitar alimentos con colorantes oscuros por 24 horas. Cepillado suave.'
  },
  {
    titulo: 'Exodoncia Simple / Extracción',
    procedimiento: 'Exodoncia Simple bajo Anestesia Local Infiltrativa',
    diagnostico: 'Resto radicular / Destrucción coronaria no restaurable.',
    postOp: '1. Mantener gasa 45 min. 2. No escupir ni usar pitillo. 3. Dieta blanda y fría 24h. 4. Tomar analgésico indicado.'
  },
  {
    titulo: 'Resina Fotocurada',
    procedimiento: 'Restauración Estética con Resina Fotocurada',
    diagnostico: 'Caries dental en esmalte y dentina.',
    postOp: 'Evitar alimentos duros las primeras 2 horas mientras pasa la anestesia.'
  },
  {
    titulo: 'Endodoncia / Conducto',
    procedimiento: 'Tratamiento de Conducto / Endodoncia',
    diagnostico: 'Pulpitis irreversible sintomática.',
    postOp: 'Molestia normal a la masticación por 48 horas. Tomar analgésico según indicación.'
  }
]

export default function AsistenteClinicoModal({ isOpen, onClose, onApply, pacienteTelefono, pacienteNombre }) {
  const [selected, setSelected] = useState(plantillas[0])

  if (!isOpen) return null

  const handleApply = (p) => {
    onApply({ procedimiento: p.procedimiento, diagnostico: p.diagnostico })
    toast.success('Plantilla aplicada')
    onClose()
  }

  const handleWhatsApp = (p) => {
    const phone = String(pacienteTelefono || '').replace(/\D/g, '')
    const msg = `🦷 *CUIDADOS POST-OPERATORIOS*\nHola *${pacienteNombre || 'Paciente'}*:\n\n*Tratamiento:* ${p.procedimiento}\n\n*Indicaciones:* ${p.postOp}\n\n¡Que se recupere pronto!`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden text-xs">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Asistente Clínico Inteligente</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {plantillas.map((p, i) => (
              <div
                key={i}
                onClick={() => setSelected(p)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selected.titulo === p.titulo
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="text-slate-800 dark:text-white">{p.titulo}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border space-y-2">
            <p><strong>Procedimiento:</strong> {selected.procedimiento}</p>
            <p><strong>Diagnóstico:</strong> {selected.diagnostico}</p>
            <p className="text-emerald-700 dark:text-emerald-400"><strong>Cuidados Post-Op:</strong> {selected.postOp}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={onClose} className="btn-secondary text-xs">Cerrar</button>
            {pacienteTelefono && (
              <button onClick={() => handleWhatsApp(selected)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> Enviar Post-Op WhatsApp
              </button>
            )}
            <button onClick={() => handleApply(selected)} className="btn-primary text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Aplicar al Formulario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
