import React, { useState } from 'react'
import { Printer, X, MessageCircle, Plus, Trash2, Pill } from 'lucide-react'

export default function RecipeModal({ isOpen, onClose, paciente, doctor, consultorio }) {
  const [indicaciones, setIndicaciones] = useState([
    { medicamento: '', dosis: '', frecuencia: '', duracion: '' }
  ])
  const [diagnostico, setDiagnostico] = useState('')
  const [observaciones, setObservaciones] = useState('Tomar con abundante agua.')

  if (!isOpen) return null

  const config = consultorio || {
    nombre: 'CONSULTORIO ODONTOLÓGICO',
    rif_nit: 'J-00000000-0',
    telefono: '+58 412-000-0000',
    direccion: 'Av. Bolívar, Centro Profesional'
  }

  const pacNombre = paciente ? `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim() : 'Paciente General'
  const pacCedula = paciente?.cedula || 'N/A'
  const pacTelefono = paciente?.telefono || ''
  const docNombre = doctor ? `Dr(a). ${doctor.nombres || ''} ${doctor.apellidos || ''}`.trim() : 'Dr. Tratante'
  const fechaHoy = new Date().toLocaleDateString('es-VE')

  const agregarItem = () => {
    setIndicaciones([...indicaciones, { medicamento: '', dosis: '', frecuencia: '', duracion: '' }])
  }

  const eliminarItem = (index) => {
    if (indicaciones.length > 1) {
      setIndicaciones(indicaciones.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const updated = [...indicaciones]
    updated[index][field] = value
    setIndicaciones(updated)
  }

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=800,height=900')
    if (!printWin) return alert('Permite las ventanas emergentes para imprimir.')

    const medsHtml = indicaciones.map((item, i) => `
      <div style="margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
        <div style="font-weight: bold;">${i + 1}. ${item.medicamento || 'Medicamento'} ${item.dosis ? '(' + item.dosis + ')' : ''}</div>
        <div style="font-size: 11px; color: #444; margin-top: 2px;">
          ${item.frecuencia ? '• Frecuencia: ' + item.frecuencia : ''} ${item.duracion ? ' | Duración: ' + item.duracion : ''}
        </div>
      </div>
    `).join('')

    printWin.document.write(`
      <!DOCTYPE html><html><head><title>Récipe - ${pacNombre}</title>
      <style>body{font-family:Arial;padding:35px;color:#111;font-size:12px}
      .h{border-bottom:2px solid #0d9488;padding-bottom:10px;margin-bottom:15px;display:flex;justify-content:space-between}
      .box{background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:6px;margin-bottom:15px}
      .sig{margin-top:60px;text-align:center;width:220px;border-top:1px solid #000;padding-top:4px;margin-left:auto;margin-right:auto}</style>
      </head><body>
      <div class="h"><div><h2 style="margin:0;color:#0d9488">🏥 ${config.nombre}</h2><div style="font-size:10px;color:#666">${config.direccion} | Tel: ${config.telefono}</div></div>
      <div style="text-align:right"><strong>${docNombre}</strong><div style="font-size:10px;color:#666">Fecha: ${fechaHoy}</div></div></div>
      <div class="box"><strong>Paciente:</strong> ${pacNombre} | <strong>Cédula:</strong> ${pacCedula} ${diagnostico ? '<br><strong>Diagnóstico:</strong> ' + diagnostico : ''}</div>
      <h3 style="color:#0d9488;margin-bottom:10px">Rp. / Indicaciones Médicas:</h3>
      <div>${medsHtml}</div>
      ${observaciones ? '<div style="margin-top:15px;font-size:11px;color:#555"><strong>Indicaciones:</strong> ' + observaciones + '</div>' : ''}
      <div class="sig"><strong>${docNombre}</strong><br><span style="font-size:10px;color:#666">Firma y Sello</span></div>
      </body></html>
    `)
    printWin.document.close()
    printWin.print()
  }

  const handleWhatsApp = () => {
    const phone = String(pacTelefono).replace(/\D/g, '')
    const itemsMsg = indicaciones.map((item, i) =>
      `*${i + 1}. ${item.medicamento}* ${item.dosis ? '(' + item.dosis + ')' : ''}\n  Tomar: ${item.frecuencia || 'según indicación'} por ${item.duracion || 'los días indicados'}`
    ).join('\n\n')

    const msg = `💊 *RÉCIPE MÉDICO - ${config.nombre}*\n\n*Paciente:* ${pacNombre}\n*Fecha:* ${fechaHoy}\n*Médico:* ${docNombre}\n\n*Prescripción:*\n${itemsMsg}\n\n_${observaciones}_`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden text-xs">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center font-bold">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-400" />
            <span>Emitir Récipe Médico</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border flex justify-between">
            <span><strong>Paciente:</strong> {pacNombre}</span>
            <span><strong>Doc:</strong> {pacCedula}</span>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Diagnóstico:</label>
            <input className="input-field text-xs" value={diagnostico} onChange={e => setDiagnostico(e.target.value)} placeholder="Ej: Post-extracción dental" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Medicamentos:</span>
              <button type="button" onClick={agregarItem} className="text-[11px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-teal-200">
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>

            {indicaciones.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border space-y-1.5">
                <div className="flex gap-2">
                  <input className="input-field text-xs flex-1" placeholder="Medicamento (ej: Amoxicilina 875mg)" value={item.medicamento} onChange={e => updateItem(idx, 'medicamento', e.target.value)} />
                  {indicaciones.length > 1 && (
                    <button type="button" onClick={() => eliminarItem(idx)} className="text-rose-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <input className="input-field text-xs py-1" placeholder="Dosis (1 tab)" value={item.dosis} onChange={e => updateItem(idx, 'dosis', e.target.value)} />
                  <input className="input-field text-xs py-1" placeholder="Cada (8 horas)" value={item.frecuencia} onChange={e => updateItem(idx, 'frecuencia', e.target.value)} />
                  <input className="input-field text-xs py-1" placeholder="Por (7 días)" value={item.duracion} onChange={e => updateItem(idx, 'duracion', e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Observaciones:</label>
            <input className="input-field text-xs" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={onClose} className="btn-secondary text-xs">Cerrar</button>
            {pacTelefono && (
              <button onClick={handleWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
            )}
            <button onClick={handlePrint} className="btn-primary text-xs">
              <Printer className="w-3.5 h-3.5" /> Imprimir Récipe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
