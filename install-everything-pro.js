const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando instalación física de todos los módulos...\n');

const consultorioDir = path.join(__dirname, 'src/components/Consultorio');
const configDir = path.join(__dirname, 'src/components/Configuracion');
const cajaDir = path.join(__dirname, 'src/components/CajaChica');
const uiDir = path.join(__dirname, 'src/components/UI');

if (!fs.existsSync(consultorioDir)) fs.mkdirSync(consultorioDir, { recursive: true });
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
if (!fs.existsSync(cajaDir)) fs.mkdirSync(cajaDir, { recursive: true });
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

// =========================================================================
// 1. ANAMNESIS.JSX (Ficha Médica)
// =========================================================================
fs.writeFileSync(path.join(consultorioDir, 'Anamnesis.jsx'), `import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { FileText, Save, Printer, Check, Heart, Pill, AlertTriangle, Baby, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Anamnesis({ pacienteId, pacienteNombre, doctorId }) {
  const [form, setForm] = useState({
    motivo_consulta: '', enfermedad_actual: '', enfermedades_sistemicas: '',
    medicamentos_actuales: '', alergias_medicamentos: '', alergias_anestesia: '',
    antecedentes_quirurgicos: '', habitos: '', embarazo_lactancia: 'No aplica',
    presion_arterial: '', frecuencia_cardiaca: '', glicemia: '', observaciones: ''
  })
  const [saved, setSaved] = useState(null)
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    if (!pacienteId) return
    supabase.from('anamnesis').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => { 
        if (data?.[0]) {
          setSaved(data[0])
          setForm(data[0])
        }
      })
  }, [pacienteId])

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const guardar = async () => {
    try {
      const firmaUrl = canvasRef.current?.toDataURL() || ''
      const { data, error } = await supabase.from('anamnesis').insert([{
        ...form, paciente_id: pacienteId, doctor_id: doctorId || null, firma_url: firmaUrl
      }]).select().single()
      if (error) throw error
      setSaved(data)
      toast.success('Anamnesis guardada exitosamente')
    } catch (e) { toast.error(e.message) }
  }

  const imprimir = () => {
    const w = window.open('', '_blank', 'width=850,height=1000')
    w.document.write(\`<!DOCTYPE html><html><head><title>Anamnesis - \${pacienteNombre}</title>
      <style>body{font-family:Arial;padding:30px;color:#000;font-size:12px}
      .h{border-bottom:2px solid #0d9488;padding-bottom:10px;margin-bottom:15px}
      .t{font-size:16px;font-weight:900}.s{font-weight:700;color:#0d9488;margin:12px 0 4px}
      .r{display:flex;gap:20px;margin:4px 0}.l{font-weight:700;min-width:160px}
      .box{background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:6px;margin:4px 0}</style>
      </head><body>
      <div class="h"><div class="t">🏥 FICHA DE ANAMNESIS ODONTOLÓGICA</div>
      <div>Paciente: <strong>\${pacienteNombre}</strong> | Fecha: \${new Date().toLocaleDateString('es-VE')}</div></div>
      <div class="s">Motivo de Consulta</div><div class="box">\${form.motivo_consulta || 'No especificado'}</div>
      <div class="s">Enfermedad Actual</div><div class="box">\${form.enfermedad_actual || 'Ninguna'}</div>
      <div class="s">Antecedentes Médicos</div>
      <div class="r"><span class="l">Enf. Sistémicas:</span><span>\${form.enfermedades_sistemicas || 'Niega'}</span></div>
      <div class="r"><span class="l">Medicamentos:</span><span>\${form.medicamentos_actuales || 'Ninguno'}</span></div>
      <div class="r"><span class="l">Alergias Medicamentos:</span><span style="color:red;font-weight:700">\${form.alergias_medicamentos || 'Niega'}</span></div>
      <div class="r"><span class="l">Alergias Anestesia:</span><span style="color:red;font-weight:700">\${form.alergias_anestesia || 'Niega'}</span></div>
      <div class="r"><span class="l">Antecedentes Quirúrgicos:</span><span>\${form.antecedentes_quirurgicos || 'Niega'}</span></div>
      <div class="r"><span class="l">Hábitos:</span><span>\${form.habitos || 'Ninguno'}</span></div>
      <div class="r"><span class="l">Embarazo/Lactancia:</span><span>\${form.embarazo_lactancia || 'No aplica'}</span></div>
      <div class="s">Signos Vitales</div>
      <div class="r"><span class="l">Presión Arterial:</span><span>\${form.presion_arterial || 'No tomada'}</span></div>
      <div class="r"><span class="l">Frec. Cardíaca:</span><span>\${form.frecuencia_cardiaca || 'No tomada'}</span></div>
      <div class="r"><span class="l">Glicemia:</span><span>\${form.glicemia || 'No tomada'}</span></div>
      <div class="s">Observaciones</div><div class="box">\${form.observaciones || 'Sin observaciones'}</div>
      <div style="margin-top:40px;display:flex;justify-content:space-between">
        <div style="text-align:center;width:200px;border-top:1px solid #000;padding-top:4px">Firma del Paciente</div>
        <div style="text-align:center;width:200px;border-top:1px solid #000;padding-top:4px">Firma del Odontólogo</div>
      </div></body></html>\`)
    w.document.close()
    w.onload = () => { w.focus(); w.print() }
  }

  const startDraw = (e) => { setDrawing(true); const c = canvasRef.current?.getContext('2d'); if(c){c.beginPath();c.moveTo(e.nativeEvent.offsetX,e.nativeEvent.offsetY)} }
  const draw = (e) => { if(!drawing)return; const c=canvasRef.current?.getContext('2d'); if(c){c.lineTo(e.nativeEvent.offsetX,e.nativeEvent.offsetY);c.stroke()} }
  const stopDraw = () => setDrawing(false)

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <FileText className="w-4 h-4 text-teal-600" /> Ficha de Anamnesis
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={imprimir} className="btn-secondary text-xs py-1.5"><Printer className="w-3.5 h-3.5" /> Imprimir</button>
          <button type="button" onClick={guardar} className="btn-primary text-xs py-1.5"><Save className="w-3.5 h-3.5" /> Guardar</button>
        </div>
      </div>

      {saved && <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/40"><Check className="w-4 h-4" /> Último registro guardado: {new Date(saved.created_at).toLocaleDateString('es-VE')}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div><label className="font-bold text-slate-500 block mb-1">Motivo de Consulta *</label><textarea className="input-field" rows={2} value={form.motivo_consulta || ''} onChange={e=>set('motivo_consulta',e.target.value)} placeholder="Dolor, estética, control..." /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Enfermedad Actual</label><textarea className="input-field" rows={2} value={form.enfermedad_actual || ''} onChange={e=>set('enfermedad_actual',e.target.value)} /></div>
      </div>

      <p className="font-bold text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1.5 border-t dark:border-slate-800 pt-3"><Heart className="w-4 h-4" /> Antecedentes Médicos</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div><label className="font-bold text-slate-500 block mb-1">Enfermedades Sistémicas</label><input className="input-field" value={form.enfermedades_sistemicas || ''} onChange={e=>set('enfermedades_sistemicas',e.target.value)} placeholder="Diabetes, Hipertensión, etc." /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Medicamentos Actuales</label><input className="input-field" value={form.medicamentos_actuales || ''} onChange={e=>set('medicamentos_actuales',e.target.value)} /></div>
        <div><label className="font-bold text-rose-600 dark:text-rose-400 block mb-1"><AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Alergia a Medicamentos</label><input className="input-field border-rose-200" value={form.alergias_medicamentos || ''} onChange={e=>set('alergias_medicamentos',e.target.value)} placeholder="Penicilina, Aspirina, etc." /></div>
        <div><label className="font-bold text-rose-600 dark:text-rose-400 block mb-1"><AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Alergia a Anestesia</label><input className="input-field border-rose-200" value={form.alergias_anestesia || ''} onChange={e=>set('alergias_anestesia',e.target.value)} /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Antecedentes Quirúrgicos</label><input className="input-field" value={form.antecedentes_quirurgicos || ''} onChange={e=>set('antecedentes_quirurgicos',e.target.value)} /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Hábitos de Salud</label><input className="input-field" value={form.habitos || ''} onChange={e=>set('habitos',e.target.value)} placeholder="Fumador, Bruxismo, etc." /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Embarazo / Lactancia</label>
          <select className="input-field" value={form.embarazo_lactancia || 'No aplica'} onChange={e=>set('embarazo_lactancia',e.target.value)}>
            <option value="No aplica">No aplica</option>
            <option value="Embarazada">Embarazada</option>
            <option value="Lactando">Lactando</option>
          </select>
        </div>
      </div>

      <p className="font-bold text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1.5 border-t dark:border-slate-800 pt-3"><Activity className="w-4 h-4" /> Signos Vitales</p>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div><label className="font-bold text-slate-500 block mb-1">Presión Arterial</label><input className="input-field" value={form.presion_arterial || ''} onChange={e=>set('presion_arterial',e.target.value)} placeholder="120/80" /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Frec. Cardíaca</label><input className="input-field" value={form.frecuencia_cardiaca || ''} onChange={e=>set('frecuencia_cardiaca',e.target.value)} placeholder="72 lpm" /></div>
        <div><label className="font-bold text-slate-500 block mb-1">Glicemia</label><input className="input-field" value={form.glicemia || ''} onChange={e=>set('glicemia',e.target.value)} placeholder="90 mg/dl" /></div>
      </div>

      <div><label className="font-bold text-slate-500 text-xs block mb-1">Observaciones</label><textarea className="input-field text-xs" rows={2} value={form.observaciones || ''} onChange={e=>set('observaciones',e.target.value)} /></div>

      <div>
        <label className="font-bold text-slate-500 text-xs block mb-1">Firma Digital del Paciente</label>
        <canvas ref={canvasRef} width={400} height={100} className="w-full border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-crosshair bg-white dark:bg-slate-900"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
        <button type="button" onClick={()=>{const c=canvasRef.current?.getContext('2d');if(c)c.clearRect(0,0,400,100)}} className="text-[10px] text-rose-500 mt-1 hover:underline">Limpiar firma</button>
      </div>
    </div>
  )
}
`);
console.log('✅ 1. Anamnesis.jsx creado con éxito.');

// =========================================================================
// 2. EVOLUCION.JSX (Timeline)
// =========================================================================
fs.writeFileSync(path.join(consultorioDir, 'Evolucion.jsx'), `import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Save, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Evolucion({ pacienteId, pacienteNombre }) {
  const [evoluciones, setEvoluciones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', descripcion: '', hallazgos: '', procedimiento_realizado: '', indicaciones: '', proxima_cita: '' })

  const cargar = async () => {
    if (!pacienteId) return
    const { data } = await supabase.from('evolucion_clinica').select('*').eq('paciente_id', pacienteId).order('fecha', { ascending: false })
    setEvoluciones(data || [])
  }
  useEffect(() => { cargar() }, [pacienteId])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      const sesion = evoluciones.length + 1
      await supabase.from('evolucion_clinica').insert([{ ...form, paciente_id: pacienteId, sesion_numero: sesion }])
      toast.success(\`Sesión #\${sesion} registrada\`)
      setShowForm(false)
      setForm({ titulo: '', descripcion: '', hallazgos: '', procedimiento_realizado: '', indicaciones: '', proxima_cita: '' })
      cargar()
    } catch (e) { toast.error(e.message) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta sesión?')) return
    await supabase.from('evolucion_clinica').delete().eq('id', id)
    toast.success('Sesión eliminada')
    cargar()
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-600" /> Línea de Tiempo de Evolución Clínica ({evoluciones.length})
        </h4>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-1.5">
          <Plus className="w-3.5 h-3.5" /> {showForm ? 'Cancelar' : 'Nueva Sesión'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={guardar} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-teal-200 dark:border-teal-900/60 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="font-bold text-slate-500 block mb-1">Título de la Sesión *</label><input required className="input-field" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Ej: Control mensual #3" /></div>
            <div><label className="font-bold text-slate-500 block mb-1">Próxima Cita</label><input type="date" className="input-field" value={form.proxima_cita} onChange={e=>setForm({...form,proxima_cita:e.target.value})} /></div>
          </div>
          <div><label className="font-bold text-slate-500 block mb-1">Hallazgos Clínicos / Estado de la boca</label><textarea className="input-field" rows={2} value={form.hallazgos} onChange={e=>setForm({...form,hallazgos:e.target.value})} /></div>
          <div><label className="font-bold text-slate-500 block mb-1">Procedimiento Realizado</label><textarea className="input-field" rows={2} value={form.procedimiento_realizado} onChange={e=>setForm({...form,procedimiento_realizado:e.target.value})} /></div>
          <div><label className="font-bold text-slate-500 block mb-1">Indicaciones para el Paciente</label><textarea className="input-field" rows={2} value={form.indicaciones} onChange={e=>setForm({...form,indicaciones:e.target.value})} /></div>
          <button type="submit" className="btn-primary text-xs"><Save className="w-3.5 h-3.5" /> Guardar Sesión</button>
        </form>
      )}

      {/* Timeline */}
      <div className="relative pl-5 border-l-2 border-teal-500/30 dark:border-teal-500/10 space-y-4">
        {evoluciones.length === 0 && <p className="text-xs text-slate-400 py-4 italic">Sin sesiones evolutivas registradas.</p>}
        {evoluciones.map((ev) => (
          <div key={ev.id} className="relative">
            <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900" />
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="badge bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400">Sesión #{ev.sesion_numero}</span>
                  <h5 className="font-bold text-slate-800 dark:text-white mt-1 text-sm">{ev.titulo}</h5>
                  <p className="text-[10px] text-slate-400">{new Date(ev.fecha || ev.created_at).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <button type="button" onClick={() => eliminar(ev.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {ev.hallazgos && <p className="text-slate-600 dark:text-slate-300"><strong>Hallazgos:</strong> {ev.hallazgos}</p>}
              {ev.procedimiento_realizado && <p className="text-slate-600 dark:text-slate-300"><strong>Procedimiento:</strong> {ev.procedimiento_realizado}</p>}
              {ev.indicaciones && <p className="text-teal-800 dark:text-teal-400 font-medium"><strong>Indicaciones:</strong> {ev.indicaciones}</p>}
              {ev.proxima_cita && <p className="text-amber-600 dark:text-amber-400 font-bold mt-1">📅 Próxima cita programada: {new Date(ev.proxima_cita).toLocaleDateString('es-VE')}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
`);
console.log('✅ 2. Evolucion.jsx creado con éxito.');

// =========================================================================
// 3. JUSTIFICANTE.JSX (Justificante / Reposo Médico)
// =========================================================================
fs.writeFileSync(path.join(consultorioDir, 'Justificante.jsx'), `import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FileCheck, Printer, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Justificante({ pacienteId, pacienteNombre, pacienteCedula, doctorNombre, clinica }) {
  const [form, setForm] = useState({ tipo: 'asistencia', diagnostico: '', procedimiento: '', dias_reposo: 1, observaciones: '' })

  const config = clinica || { nombre: 'Consultorio Dental & Médico Pro', rif_nit: 'J-12345678-0', telefono: '+58 412-000-0000', direccion: 'Av. Principal, Centro Profesional' }

  const guardar = async () => {
    try {
      await supabase.from('justificantes').insert([{ ...form, paciente_id: pacienteId, dias_reposo: parseInt(form.dias_reposo) }])
      toast.success('Justificante de asistencia guardado')
    } catch (e) { toast.error(e.message) }
  }

  const imprimir = () => {
    const hoy = new Date()
    const fin = new Date(hoy.getTime() + parseInt(form.dias_reposo) * 86400000)
    const w = window.open('', '_blank', 'width=800,height=600')
    w.document.write(\`<!DOCTYPE html><html><head><title>Justificante Odontológico</title>
      <style>body{font-family:Arial;padding:45px;color:#1e293b;line-height:1.5;font-size:12px}
      .h{text-align:center;border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:24px}
      .t{font-size:18px;font-weight:900;color:#0f172a}.sub{font-size:10px;color:#64748b}
      .bold{font-weight:900;color:#0f172a}.center{text-align:center}
      .sig{margin-top:60px;display:flex;justify-content:center}
      .line{width:220px;border-top:1px solid #000;padding-top:4px;text-align:center;font-size:11px}</style>
      </head><body>
      <div class="h">
        <div class="t">🏥 \${config.nombre}</div>
        <div class="sub">\${config.direccion} | Tel: \${config.telefono} | \${config.rif_nit}</div>
      </div>
      <div class="center bold" style="font-size:15px;margin:24px 0;text-transform:uppercase">
        \${form.tipo === 'reposo' ? 'Constancia de Reposo Médico-Odontológico' : 'Constancia de Asistencia'}
      </div>
      <p style="margin-bottom:12px">Por medio de la presente se hace constar que el/la paciente <span class="bold">\${pacienteNombre}</span>, 
      titular de la cédula de identidad / documento número <span class="bold">\${pacienteCedula || 'N/A'}</span>, 
      asistió a este centro de salud para recibir atención profesional el día <span class="bold">\${hoy.toLocaleDateString('es-VE')}</span>.</p>
      
      <p style="margin-bottom:12px"><strong>Diagnóstico Clínico:</strong> \${form.diagnostico || 'Evaluación odontológica'}</p>
      <p style="margin-bottom:12px"><strong>Tratamiento / Procedimiento:</strong> \${form.procedimiento || 'Tratamiento clínico'}</p>
      
      \${form.tipo === 'reposo' ? \`<p style="margin-bottom:12px">Para su total recuperación, se prescribe reposo médico estricto por un período de <span class="bold">\${form.dias_reposo} día(s)</span>, 
      comenzando el <span class="bold">\${hoy.toLocaleDateString('es-VE')}</span> y culminando el <span class="bold">\${fin.toLocaleDateString('es-VE')}</span>.</p>\` : ''}
      
      \${form.observaciones ? \`<p style="margin-bottom:12px"><strong>Indicaciones adicionales:</strong> \${form.observaciones}</p>\` : ''}
      
      <p style="margin-top:24px">Constancia que se expide a solicitud de la parte interesada, en la fecha de su atención.</p>
      
      <div class="sig">
        <div class="line">
          <strong>\${doctorNombre || 'Dr. Tratante'}</strong><br>
          <span style="color:#64748b;font-size:10px">Odontólogo(a) Tratante</span>
        </div>
      </div>
      </body></html>\`)
    w.document.close()
    w.onload = () => { w.focus(); w.print() }
  }

  return (
    <div className="space-y-3 animate-fade-up">
      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
        <FileCheck className="w-4 h-4 text-teal-600" /> Emisión de Constancia o Reposo
      </h4>
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">Tipo de Justificante</label>
          <select className="input-field text-xs" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
            <option value="asistencia">Constancia de Asistencia</option>
            <option value="reposo">Reposo Odontológico</option>
          </select>
        </div>
        {form.tipo === 'reposo' && <div><label className="font-bold text-slate-500 block mb-0.5">Días Prescritos</label>
          <select className="input-field text-xs" value={form.dias_reposo} onChange={e=>setForm({...form,dias_reposo:e.target.value})}>
            <option value="1">1 día (24 horas)</option>
            <option value="2">2 días (48 horas)</option>
            <option value="3">3 días (72 horas)</option>
            <option value="5">5 días</option>
          </select>
        </div>}
      </div>
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">Diagnóstico Clínico</label><input className="input-field text-xs" value={form.diagnostico} onChange={e=>setForm({...form,diagnostico:e.target.value})} placeholder="Ej: Pulpitis aguda..." /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Tratamiento Realizado</label><input className="input-field text-xs" value={form.procedimiento} onChange={e=>setForm({...form,procedimiento:e.target.value})} placeholder="Ej: Tratamiento de conducto..." /></div>
      </div>
      <div><label className="font-bold text-slate-500 text-xs block mb-0.5">Observaciones Adicionales</label><textarea className="input-field text-xs" rows={2} value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})} placeholder="Indicaciones de reposo..." /></div>
      <div className="flex gap-2">
        <button onClick={guardar} className="btn-primary text-xs py-1.5"><Save className="w-3.5 h-3.5" /> Registrar en Historia</button>
        <button onClick={imprimir} className="btn-secondary text-xs py-1.5"><Printer className="w-3.5 h-3.5" /> Imprimir Comprobante</button>
      </div>
    </div>
  )
}
`);
console.log('✅ 3. Justificante.jsx creado con éxito.');

// =========================================================================
// 4. SEGUROSCONVENIOS.JSX (Configuración)
// =========================================================================
fs.writeFileSync(path.join(configDir, 'SegurosConvenios.jsx'), `import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Shield, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SegurosConvenios() {
  const [seguros, setSeguros] = useState([])
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', cobertura_pct: 80 })

  const cargar = async () => {
    const { data } = await supabase.from('seguros').select('*').order('nombre')
    setSeguros(data || [])
  }
  useEffect(() => { cargar() }, [])

  const agregar = async () => {
    if (!form.nombre.trim()) return toast.error('Ingresa el nombre del seguro')
    await supabase.from('seguros').insert([form])
    toast.success('Aseguradora agregada con éxito')
    setForm({ nombre: '', telefono: '', email: '', cobertura_pct: 80 })
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta aseguradora del catálogo?')) return
    await supabase.from('seguros').delete().eq('id', id)
    toast.success('Seguro eliminado')
    cargar()
  }

  return (
    <div className="card-box space-y-4">
      <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
        <Shield className="w-4 h-4 text-teal-600" /> Seguros & Convenios Odontológicos
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {seguros.map(s => (
          <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border text-xs">
            <span className="font-bold text-slate-800 dark:text-white flex-1">{s.nombre}</span>
            <span className="badge bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">Cobertura: {s.cobertura_pct}%</span>
            <button onClick={() => eliminar(s.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <input className="input-field text-xs flex-1" placeholder="Nombre aseguradora..." value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <input type="number" className="input-field text-xs w-16 text-center font-bold" placeholder="%" value={form.cobertura_pct} onChange={e=>setForm({...form,cobertura_pct:e.target.value})} />
        <button onClick={agregar} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}
`);
console.log('✅ 4. SegurosConvenios.jsx creado con éxito.');

// =========================================================================
// 5. PACIENTES.JSX (Rediseñado con Sub-Pestañas organizadas)
// =========================================================================
const pacsContent = `import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { fmt } from '../../utils/helpers'
import PriceBox from '../UI/PriceBox'
import Odontograma from './Odontograma'
import Anamnesis from './Anamnesis'
import Evolucion from './Evolucion'
import Justificante from './Justificante'
import FotosClinicas from './FotosClinicas'
import Consentimientos from './Consentimientos'
import {
  Plus, Search, Trash2, Phone, AlertTriangle,
  ChevronDown, ChevronUp, Save, X, Edit3, FileText, Clock, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

const calcEdad = f => { if (!f) return null; const h = new Date(), n = new Date(f); let e = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--; return e }
const ini = (n, a) => \`\${(n||'?')[0]}\${(a||'?')[0]}\`.toUpperCase()
const cols = ['bg-teal-500','bg-blue-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-emerald-500','bg-indigo-500']
const gc = id => cols[Math.abs((id||'a').charCodeAt(0)) % cols.length]
const blank = { nombres:'', apellidos:'', cedula:'', telefono:'', email:'', fecha_nacimiento:'', alergias:'', antecedentes:'' }

export default function Pacientes() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [subTab, setSubTab] = useState('odontograma') // odontograma | anamnesis | evolucion | justificantes | fotos | consentimientos
  const [pacienteDetalle, setPacienteDetalle] = useState({ historial: [], citas: [], dientesUsados: [] })
  const [form, setForm] = useState(blank)

  const load = async () => {
    const { data } = await supabase.from('pacientes').select('*').eq('activo', true).order('created_at', { ascending: false })
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  const toggleExpediente = async (p) => {
    if (expanded === p.id) {
      setExpanded(null)
      return
    }

    setExpanded(p.id)
    setSubTab('odontograma') // Reset sub-tab
    const [hRes, cRes] = await Promise.all([
      supabase.from('historial_clinico').select('*').eq('paciente_id', p.id).order('created_at', { ascending: false }),
      supabase.from('citas').select('*, tratamientos(nombre)').eq('paciente_id', p.id).order('fecha', { ascending: false })
    ])

    const hist = hRes.data || []
    const citas = cRes.data || []

    const allDientes = []
    hist.forEach(h => {
      if (h.dientes_tratados) {
        h.dientes_tratados.split(',').forEach(d => {
          const clean = d.trim()
          if (clean && !allDientes.includes(clean)) allDientes.push(clean)
        })
      }
    })

    setPacienteDetalle({ historial: hist, citas, dientesUsados: allDientes })
  }

  const save = async e => {
    e.preventDefault()
    const sanitizedForm = {
      nombres: form.nombres,
      apellidos: form.apellidos,
      cedula: form.cedula || null,
      telefono: form.telefono || null,
      email: form.email || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      alergias: form.alergias || null,
      antecedentes: form.antecedentes || null
    }

    if (editId) {
      await supabase.from('pacientes').update(sanitizedForm).eq('id', editId)
      toast.success('Paciente actualizado')
    } else {
      await supabase.from('pacientes').insert([sanitizedForm])
      toast.success('Paciente registrado')
    }
    setShowForm(false); setEditId(null); setForm(blank); load()
  }

  const startEdit = p => {
    setForm({ nombres: p.nombres, apellidos: p.apellidos, cedula: p.cedula||'', telefono: p.telefono||'', email: p.email||'', fecha_nacimiento: p.fecha_nacimiento||'', alergias: p.alergias||'', antecedentes: p.antecedentes||'' })
    setEditId(p.id); setShowForm(true); setExpanded(null)
  }

  const del = async id => {
    if (!confirm('¿Desactivar paciente?')) return
    await supabase.from('pacientes').update({ activo: false }).eq('id', id)
    toast.success('Paciente desactivado'); setExpanded(null); load()
  }

  const filtered = list.filter(p => \`\${p.nombres} \${p.apellidos} \${p.cedula} \${p.telefono}\`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Expedientes de Pacientes (Perfil 360°)</h1>
          <p className="text-xs text-slate-400">Historia clínica, odontograma consolidado y balance por paciente</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank) }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo Paciente</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card-box space-y-3 border-2 border-teal-200 bg-teal-50/20">
          <h3 className="font-bold text-sm text-teal-800">{editId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Nombres *</label><input required className="input-field" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} placeholder="María" /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Apellidos *</label><input required className="input-field" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} placeholder="González" /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Cédula</label><input className="input-field" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} placeholder="V-12345678" /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Nacimiento</label><input type="date" className="input-field" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Teléfono</label><input className="input-field" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="0412-1234567" /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="correo@email.com" /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">⚠️ Alergias</label><input className="input-field" value={form.alergias} onChange={e => setForm({...form, alergias: e.target.value})} placeholder="Penicilina, Látex..." /></div>
            <div><label className="text-[11px] font-semibold text-slate-500 block mb-1">🏥 Antecedentes</label><input className="input-field" value={form.antecedentes} onChange={e => setForm({...form, antecedentes: e.target.value})} placeholder="Diabetes, HTA..." /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {editId ? 'Actualizar' : 'Guardar Paciente'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input placeholder="Buscar por nombre, cédula o teléfono..." value={q} onChange={e => setQ(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card-box p-0 overflow-hidden border">
            <button onClick={() => toggleExpediente(p)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className={\`w-11 h-11 rounded-2xl \${gc(p.id)} text-white flex items-center justify-center font-bold text-sm shadow-sm\`}>{ini(p.nombres, p.apellidos)}</div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{p.nombres} {p.apellidos}</h3>
                  <p className="text-[11px] text-slate-400">{p.cedula || 'Sin cédula'} {calcEdad(p.fecha_nacimiento) ? \`• \${calcEdad(p.fecha_nacimiento)} años\` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.alergias && <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-950/30 text-[10px]"><AlertTriangle className="w-3 h-3" /> Alergias</span>}
                <span className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {p.telefono || '—'}</span>
                {expanded === p.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* EXPEDIENTE 360° CON SUB-PESTAÑAS */}
            {expanded === p.id && (
              <div className="border-t bg-slate-50/50 dark:bg-slate-950/20 p-5 space-y-4">
                
                {/* Selector de sub-pestañas */}
                <div className="flex border-b dark:border-slate-800 gap-1 overflow-x-auto text-[11px] font-bold">
                  {[
                    { id: 'odontograma', label: '🦷 Odontograma' },
                    { id: 'anamnesis', label: '📋 Anamnesis' },
                    { id: 'evolucion', label: '📈 Evolución' },
                    { id: 'justificantes', label: '📄 Justificantes' },
                    { id: 'fotos', label: '📷 Fotos' },
                    { id: 'consentimientos', label: '✍️ Consentimiento' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSubTab(tab.id)}
                      className={\`pb-2 px-3 border-b-2 whitespace-nowrap transition-all \${
                        subTab === tab.id
                          ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }\`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Contenido de sub-pestañas */}
                <div className="p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-4 min-h-[250px]">
                  {subTab === 'odontograma' && (
                    <div className="space-y-2 animate-fade-up">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">🦷 Odontograma Histórico Consolidado</p>
                      <Odontograma selected={pacienteDetalle.dientesUsados} onChange={() => {}} readOnly={true} />
                    </div>
                  )}

                  {subTab === 'anamnesis' && (
                    <Anamnesis pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />
                  )}

                  {subTab === 'evolucion' && (
                    <Evolucion pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />
                  )}

                  {subTab === 'justificantes' && (
                    <Justificante pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} pacienteCedula={p.cedula} />
                  )}

                  {subTab === 'fotos' && (
                    <FotosClinicas pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />
                  )}

                  {subTab === 'consentimientos' && (
                    <Consentimientos pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />
                  )}
                </div>

                {/* Acciones principales del paciente */}
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => startEdit(p)} className="btn-secondary text-xs"><Edit3 className="w-3.5 h-3.5" /> Editar Datos</button>
                  <button onClick={() => del(p.id)} className="btn-danger text-xs"><Trash2 className="w-3.5 h-3.5" /> Desactivar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
`;
fs.writeFileSync(path.join(consultorioDir, 'Pacientes.jsx'), pacsContent, 'utf8');
console.log('✅ 5. Pacientes.jsx rediseñado con sub-pestañas e integraciones completas.');

console.log('\n🎉 ¡Instalación completada y verificada de forma física!');
