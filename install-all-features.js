const fs = require('fs');
const path = require('path');

console.log('🚀 Instalando las 7 funciones avanzadas...\n');

const consultorioDir = path.join(__dirname, 'src/components/Consultorio');
const planesDir = path.join(__dirname, 'src/components/Planes');
const reportesDir = path.join(__dirname, 'src/components/Reportes');
const configDir = path.join(__dirname, 'src/components/Configuracion');

// =========================================================================
// 1. ANAMNESIS DIGITAL (Ficha de Primera Consulta)
// =========================================================================
fs.writeFileSync(path.join(consultorioDir, 'AnamnesisDigital.jsx'), `import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { FileText, Save, Printer, Check, X, Heart, Pill, AlertTriangle, Baby, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnamnesisDigital({ pacienteId, pacienteNombre, doctorId }) {
  const [form, setForm] = useState({
    motivo_consulta: '', enfermedad_actual: '', enfermedades_sistemicas: '',
    medicamentos_actuales: '', alergias_medicamentos: '', alergias_anestesia: '',
    antecedentes_quirurgicos: '', habitos: '', embarazo_lactancia: '',
    presion_arterial: '', frecuencia_cardiaca: '', glicemia: '', observaciones: ''
  })
  const [saved, setSaved] = useState(null)
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    if (!pacienteId) return
    supabase.from('anamnesis').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) setSaved(data[0]) })
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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-teal-600" /> Anamnesis Digital de {pacienteNombre}
        </h4>
        <div className="flex gap-2">
          <button onClick={imprimir} className="btn-secondary text-xs py-1"><Printer className="w-3 h-3" /> Imprimir</button>
          <button onClick={guardar} className="btn-primary text-xs py-1"><Save className="w-3 h-3" /> Guardar</button>
        </div>
      </div>

      {saved && <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Última anamnesis: {new Date(saved.created_at).toLocaleDateString('es-VE')}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">Motivo de Consulta *</label><textarea className="input-field" rows={2} value={form.motivo_consulta} onChange={e=>set('motivo_consulta',e.target.value)} placeholder="Dolor, estética, control..." /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Enfermedad Actual</label><textarea className="input-field" rows={2} value={form.enfermedad_actual} onChange={e=>set('enfermedad_actual',e.target.value)} /></div>
      </div>

      <p className="font-bold text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1 border-t pt-2"><Heart className="w-3 h-3" /> Antecedentes Médicos</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">Enf. Sistémicas (Diabetes, HTA...)</label><input className="input-field" value={form.enfermedades_sistemicas} onChange={e=>set('enfermedades_sistemicas',e.target.value)} /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5"><Pill className="w-3 h-3 inline" /> Medicamentos Actuales</label><input className="input-field" value={form.medicamentos_actuales} onChange={e=>set('medicamentos_actuales',e.target.value)} /></div>
        <div><label className="font-bold text-rose-600 block mb-0.5"><AlertTriangle className="w-3 h-3 inline" /> Alergias a Medicamentos</label><input className="input-field border-rose-300" value={form.alergias_medicamentos} onChange={e=>set('alergias_medicamentos',e.target.value)} placeholder="Penicilina, AINES..." /></div>
        <div><label className="font-bold text-rose-600 block mb-0.5"><AlertTriangle className="w-3 h-3 inline" /> Alergias a Anestesia</label><input className="input-field border-rose-300" value={form.alergias_anestesia} onChange={e=>set('alergias_anestesia',e.target.value)} /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Antecedentes Quirúrgicos</label><input className="input-field" value={form.antecedentes_quirurgicos} onChange={e=>set('antecedentes_quirurgicos',e.target.value)} /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Hábitos (Tabaco, Bruxismo...)</label><input className="input-field" value={form.habitos} onChange={e=>set('habitos',e.target.value)} /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5"><Baby className="w-3 h-3 inline" /> Embarazo / Lactancia</label><select className="input-field" value={form.embarazo_lactancia} onChange={e=>set('embarazo_lactancia',e.target.value)}><option>No aplica</option><option>Embarazada</option><option>Lactando</option></select></div>
      </div>

      <p className="font-bold text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1 border-t pt-2"><Activity className="w-3 h-3" /> Signos Vitales</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">P. Arterial</label><input className="input-field" value={form.presion_arterial} onChange={e=>set('presion_arterial',e.target.value)} placeholder="120/80" /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Frec. Cardíaca</label><input className="input-field" value={form.frecuencia_cardiaca} onChange={e=>set('frecuencia_cardiaca',e.target.value)} placeholder="72 lpm" /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Glicemia</label><input className="input-field" value={form.glicemia} onChange={e=>set('glicemia',e.target.value)} placeholder="90 mg/dl" /></div>
      </div>

      <div><label className="font-bold text-slate-500 text-xs block mb-0.5">Observaciones</label><textarea className="input-field text-xs" rows={2} value={form.observaciones} onChange={e=>set('observaciones',e.target.value)} /></div>

      <div>
        <label className="font-bold text-slate-500 text-xs block mb-0.5">Firma del Paciente</label>
        <canvas ref={canvasRef} width={400} height={100} className="w-full border-2 border-dashed border-slate-300 rounded-xl cursor-crosshair bg-white dark:bg-slate-900"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
        <button onClick={()=>{const c=canvasRef.current?.getContext('2d');if(c)c.clearRect(0,0,400,100)}} className="text-[10px] text-rose-500 mt-0.5 hover:underline">Limpiar firma</button>
      </div>
    </div>
  )
}
`);
console.log('✅ 1. AnamnesisDigital.jsx creado.');

// =========================================================================
// 2. EVOLUCIÓN CLÍNICA (Timeline de Tratamiento)
// =========================================================================
fs.writeFileSync(path.join(consultorioDir, 'EvolucionClinica.jsx'), `import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Save, Clock, Camera, ChevronRight, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EvolucionClinica({ pacienteId, pacienteNombre }) {
  const [evoluciones, setEvoluciones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', descripcion: '', hallazgos: '', procedimiento_realizado: '', indicaciones: '', proxima_cita: '' })

  const cargar = async () => {
    if (!pacienteId) return
    const { data } = await supabase.from('evolucion_clinica').select('*').eq('paciente_id', pacienteId).order('fecha', { ascending: false })
    setEvoluciones(data || [])
  }
  useEffect(() => { cargar() }, [pacienteId])

  const guardar = async () => {
    try {
      const sesion = evoluciones.length + 1
      await supabase.from('evolucion_clinica').insert([{ ...form, paciente_id: pacienteId, sesion_numero: sesion }])
      toast.success(\`Sesión #\${sesion} registrada\`)
      setShowForm(false)
      setForm({ titulo: '', descripcion: '', hallazgos: '', procedimiento_realizado: '', indicaciones: '', proxima_cita: '' })
      cargar()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-600" /> Evolución Clínica de {pacienteNombre} ({evoluciones.length} sesiones)
        </h4>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-1">
          <Plus className="w-3 h-3" /> {showForm ? 'Cancelar' : 'Nueva Sesión'}
        </button>
      </div>

      {showForm && (
        <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="font-bold text-slate-500 block mb-0.5">Título de la Sesión *</label><input className="input-field" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Ej: Control mensual #3" /></div>
            <div><label className="font-bold text-slate-500 block mb-0.5">Próxima Cita</label><input type="date" className="input-field" value={form.proxima_cita} onChange={e=>setForm({...form,proxima_cita:e.target.value})} /></div>
          </div>
          <div><label className="font-bold text-slate-500 block mb-0.5">Hallazgos Clínicos</label><textarea className="input-field" rows={2} value={form.hallazgos} onChange={e=>setForm({...form,hallazgos:e.target.value})} /></div>
          <div><label className="font-bold text-slate-500 block mb-0.5">Procedimiento Realizado</label><textarea className="input-field" rows={2} value={form.procedimiento_realizado} onChange={e=>setForm({...form,procedimiento_realizado:e.target.value})} /></div>
          <div><label className="font-bold text-slate-500 block mb-0.5">Indicaciones para el Paciente</label><textarea className="input-field" rows={2} value={form.indicaciones} onChange={e=>setForm({...form,indicaciones:e.target.value})} /></div>
          <button onClick={guardar} className="btn-primary text-xs"><Save className="w-3 h-3" /> Guardar Sesión</button>
        </div>
      )}

      {/* Timeline */}
      <div className="relative pl-4 border-l-2 border-teal-200 dark:border-teal-800 space-y-3">
        {evoluciones.length === 0 && <p className="text-xs text-slate-400 py-4">Sin evoluciones registradas</p>}
        {evoluciones.map((ev, i) => (
          <div key={ev.id} className="relative">
            <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900" />
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="badge bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Sesión #{ev.sesion_numero}</span>
                  <h5 className="font-bold text-slate-800 dark:text-white mt-1">{ev.titulo}</h5>
                  <p className="text-[10px] text-slate-400">{new Date(ev.fecha).toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              {ev.hallazgos && <p className="mt-2 text-slate-600 dark:text-slate-300"><strong>Hallazgos:</strong> {ev.hallazgos}</p>}
              {ev.procedimiento_realizado && <p className="mt-1 text-slate-600 dark:text-slate-300"><strong>Procedimiento:</strong> {ev.procedimiento_realizado}</p>}
              {ev.indicaciones && <p className="mt-1 text-teal-700 dark:text-teal-400"><strong>Indicaciones:</strong> {ev.indicaciones}</p>}
              {ev.proxima_cita && <p className="mt-1 text-amber-600 font-bold">📅 Próxima cita: {new Date(ev.proxima_cita).toLocaleDateString('es-VE')}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
`);
console.log('✅ 2. EvolucionClinica.jsx creado.');

// =========================================================================
// 3. JUSTIFICANTE DE REPOSO
// =========================================================================
fs.writeFileSync(path.join(consultorioDir, 'JustificanteReposo.jsx'), `import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FileCheck, Printer, Save, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function JustificanteReposo({ pacienteId, pacienteNombre, pacienteCedula, doctorNombre, clinica }) {
  const [form, setForm] = useState({ tipo: 'asistencia', diagnostico: '', procedimiento: '', dias_reposo: 1, observaciones: '' })

  const config = clinica || { nombre: 'Consultorio Odontológico', rif_nit: '', telefono: '', direccion: '' }

  const guardar = async () => {
    try {
      await supabase.from('justificantes').insert([{ ...form, paciente_id: pacienteId, dias_reposo: parseInt(form.dias_reposo) }])
      toast.success('Justificante registrado')
    } catch (e) { toast.error(e.message) }
  }

  const imprimir = () => {
    const hoy = new Date()
    const fin = new Date(hoy.getTime() + parseInt(form.dias_reposo) * 86400000)
    const w = window.open('', '_blank', 'width=800,height=600')
    w.document.write(\`<!DOCTYPE html><html><head><title>Justificante</title>
      <style>body{font-family:Arial;padding:40px;color:#000;font-size:13px;text-align:justify}
      .h{text-align:center;border-bottom:2px solid #0d9488;padding-bottom:15px;margin-bottom:20px}
      .t{font-size:18px;font-weight:900}.sub{font-size:11px;color:#666}
      .bold{font-weight:900}.center{text-align:center}
      .sig{margin-top:60px;display:flex;justify-content:center}
      .line{width:250px;border-top:1px solid #000;padding-top:5px;text-align:center}</style>
      </head><body>
      <div class="h">
        <div class="t">🏥 \${config.nombre}</div>
        <div class="sub">\${config.direccion} | Tel: \${config.telefono} | \${config.rif_nit}</div>
      </div>
      <div class="center" style="font-size:16px;font-weight:900;margin:20px 0">
        \${form.tipo === 'reposo' ? 'CONSTANCIA DE REPOSO MÉDICO' : 'CONSTANCIA DE ASISTENCIA'}
      </div>
      <p>Quien suscribe, <span class="bold">\${doctorNombre || 'Dr. Tratante'}</span>, odontólogo(a) colegiado(a),
      hace constar que el/la paciente <span class="bold">\${pacienteNombre}</span>,
      C.I. <span class="bold">\${pacienteCedula || 'N/A'}</span>,
      asistió a consulta odontológica el día <span class="bold">\${hoy.toLocaleDateString('es-VE')}</span>.</p>
      <p><strong>Diagnóstico:</strong> \${form.diagnostico || 'Consulta odontológica'}</p>
      <p><strong>Procedimiento:</strong> \${form.procedimiento || 'Evaluación y tratamiento'}</p>
      \${form.tipo === 'reposo' ? \`<p>Se prescribe reposo por <span class="bold">\${form.dias_reposo} día(s)</span>,
      desde el <span class="bold">\${hoy.toLocaleDateString('es-VE')}</span>
      hasta el <span class="bold">\${fin.toLocaleDateString('es-VE')}</span>.</p>\` : ''}
      \${form.observaciones ? \`<p><strong>Observaciones:</strong> \${form.observaciones}</p>\` : ''}
      <p style="margin-top:20px">Constancia que se expide a solicitud del interesado en la ciudad,
      a los \${hoy.getDate()} días del mes de \${hoy.toLocaleDateString('es-VE', {month:'long'})} de \${hoy.getFullYear()}.</p>
      <div class="sig"><div class="line">\${doctorNombre || 'Dr. Tratante'}<br><span style="font-size:10px">Odontólogo(a)</span></div></div>
      </body></html>\`)
    w.document.close()
    w.onload = () => { w.focus(); w.print() }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
        <FileCheck className="w-4 h-4 text-teal-600" /> Justificante / Reposo para {pacienteNombre}
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">Tipo</label>
          <select className="input-field" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
            <option value="asistencia">Constancia de Asistencia</option>
            <option value="reposo">Reposo Médico</option>
          </select>
        </div>
        {form.tipo === 'reposo' && <div><label className="font-bold text-slate-500 block mb-0.5">Días de Reposo</label>
          <select className="input-field" value={form.dias_reposo} onChange={e=>setForm({...form,dias_reposo:e.target.value})}>
            <option value="1">1 día</option><option value="2">2 días</option><option value="3">3 días</option>
            <option value="5">5 días</option><option value="7">7 días</option>
          </select>
        </div>}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><label className="font-bold text-slate-500 block mb-0.5">Diagnóstico</label><input className="input-field" value={form.diagnostico} onChange={e=>setForm({...form,diagnostico:e.target.value})} /></div>
        <div><label className="font-bold text-slate-500 block mb-0.5">Procedimiento</label><input className="input-field" value={form.procedimiento} onChange={e=>setForm({...form,procedimiento:e.target.value})} /></div>
      </div>
      <div><label className="font-bold text-slate-500 text-xs block mb-0.5">Observaciones</label><textarea className="input-field text-xs" rows={2} value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})} /></div>
      <div className="flex gap-2">
        <button onClick={guardar} className="btn-primary text-xs"><Save className="w-3 h-3" /> Guardar</button>
        <button onClick={imprimir} className="btn-secondary text-xs"><Printer className="w-3 h-3" /> Imprimir Justificante</button>
      </div>
    </div>
  )
}
`);
console.log('✅ 3. JustificanteReposo.jsx creado.');

// =========================================================================
// 4. INTEGRAR EN PACIENTES.JSX (Anamnesis + Evolución + Justificante)
// =========================================================================
const pacPath = path.join(consultorioDir, 'Pacientes.jsx');
if (fs.existsSync(pacPath)) {
  let pac = fs.readFileSync(pacPath, 'utf8');

  if (!pac.includes('AnamnesisDigital')) {
    pac = "import AnamnesisDigital from './AnamnesisDigital';\nimport EvolucionClinica from './EvolucionClinica';\nimport JustificanteReposo from './JustificanteReposo';\n" + pac;

    // Agregar tabs en el expediente expandido
    pac = pac.replace(
      '                    {/* Consentimientos Informados */}',
      `                    {/* Anamnesis Digital */}
                    <div className="pt-2 border-t border-slate-200">
                      <AnamnesisDigital pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />
                    </div>

                    {/* Evolución Clínica */}
                    <div className="pt-2 border-t border-slate-200">
                      <EvolucionClinica pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} />
                    </div>

                    {/* Justificante de Reposo */}
                    <div className="pt-2 border-t border-slate-200">
                      <JustificanteReposo pacienteId={p.id} pacienteNombre={\`\${p.nombres} \${p.apellidos}\`} pacienteCedula={p.cedula} />
                    </div>

                    {/* Consentimientos Informados */}`
    );

    fs.writeFileSync(pacPath, pac, 'utf8');
    console.log('✅ 4. Anamnesis + Evolución + Justificante integrados en Pacientes.jsx.');
  }
}

// =========================================================================
// 5. SEGUROS Y CONVENIOS (En Configuración)
// =========================================================================
fs.writeFileSync(path.join(configDir, 'SegurosConvenios.jsx'), `import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Shield, Plus, Trash2, Save, Check } from 'lucide-react'
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
    toast.success('Aseguradora agregada')
    setForm({ nombre: '', telefono: '', email: '', cobertura_pct: 80 })
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta aseguradora?')) return
    await supabase.from('seguros').delete().eq('id', id)
    toast.success('Eliminada')
    cargar()
  }

  return (
    <div className="card-box space-y-4">
      <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
        <Shield className="w-4 h-4 text-teal-600" /> Seguros y Convenios Odontológicos
      </h3>
      <div className="space-y-2">
        {seguros.map(s => (
          <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border text-xs">
            <div className="flex-1">
              <span className="font-bold text-slate-800 dark:text-white">{s.nombre}</span>
              <span className="ml-2 text-slate-400">{s.telefono || ''}</span>
            </div>
            <span className="badge bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Cobertura: {s.cobertura_pct}%</span>
            <button onClick={() => eliminar(s.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <input className="input-field text-xs flex-1" placeholder="Nombre aseguradora" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <input className="input-field text-xs w-24" placeholder="Teléfono" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} />
        <input type="number" className="input-field text-xs w-16 text-center" placeholder="%" value={form.cobertura_pct} onChange={e=>setForm({...form,cobertura_pct:e.target.value})} />
        <button onClick={agregar} className="btn-primary text-xs"><Plus className="w-3 h-3" /></button>
      </div>
    </div>
  )
}
`);
console.log('✅ 5. SegurosConvenios.jsx creado.');

// Integrar en TasasImpuestos
const tasasPath = path.join(configDir, 'TasasImpuestos.jsx');
if (fs.existsSync(tasasPath)) {
  let t = fs.readFileSync(tasasPath, 'utf8');
  if (!t.includes('SegurosConvenios')) {
    t = "import SegurosConvenios from './SegurosConvenios';\n" + t;
    t = t.replace(
      "const [tab, setTab] = useState('clinica')",
      "const [tab, setTab] = useState('clinica')"
    );
    // Agregar tab de seguros
    t = t.replace(
      "Tasas Oficiales & Impuestos",
      "Tasas, Impuestos & Seguros"
    );
    t = t.replace(
      '          </div>\n        </div>\n      )}\n    </div>',
      `          </div>

          {/* Seguros y Convenios */}
          <div className="md:col-span-2">
            <SegurosConvenios />
          </div>
        </div>
      )}
    </div>`
    );
    fs.writeFileSync(tasasPath, t, 'utf8');
    console.log('✅ 5b. Seguros integrado en Configuración.');
  }
}

// =========================================================================
// 6. ESTADO DE RESULTADOS MENSUAL (En Reportes)
// =========================================================================
const repPath = path.join(reportesDir, 'Reportes.jsx');
if (fs.existsSync(repPath)) {
  let rep = fs.readFileSync(repPath, 'utf8');
  if (!rep.includes('Estado de Resultados')) {
    // Agregar botón de Estado de Resultados
    rep = rep.replace(
      '<button onClick={() => window.print()}',
      `<button onClick={async () => {
          toast.loading('Generando Estado de Resultados...')
          const now = new Date()
          const inicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
          const [vRes, hRes, gRes] = await Promise.all([
            supabase.from('ventas').select('total_usd').gte('created_at', inicio).eq('estado', 'completada'),
            supabase.from('historial_clinico').select('monto_usd').gte('created_at', inicio).eq('pagado', true),
            supabase.from('gastos').select('monto_usd').gte('fecha', inicio.split('T')[0])
          ])
          const ingV = vRes.data?.reduce((a,b)=>a+Number(b.total_usd),0)||0
          const ingC = hRes.data?.reduce((a,b)=>a+Number(b.monto_usd),0)||0
          const gas = gRes.data?.reduce((a,b)=>a+Number(b.monto_usd),0)||0
          const neto = ingV + ingC - gas
          toast.dismiss()
          const w = window.open('','_blank','width=800,height=600')
          w.document.write(\`<!DOCTYPE html><html><head><title>Estado de Resultados</title>
            <style>body{font-family:Arial;padding:30px;color:#000}
            .t{font-size:18px;font-weight:900;text-align:center;margin-bottom:20px}
            .r{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
            .b{font-weight:900;font-size:14px}.g{color:#059669}.r2{color:#dc2626}
            .total{font-size:18px;border-top:2px solid #000;margin-top:10px;padding-top:10px}</style></head><body>
            <div class="t">📊 ESTADO DE RESULTADOS - \${now.toLocaleDateString('es-VE',{month:'long',year:'numeric'})}</div>
            <div class="r"><span>Ingresos Consultorio</span><span class="b g">$\${ingC.toFixed(2)}</span></div>
            <div class="r"><span>Ingresos Ventas POS</span><span class="b g">$\${ingV.toFixed(2)}</span></div>
            <div class="r"><span><strong>Total Ingresos</strong></span><span class="b g">$\${(ingV+ingC).toFixed(2)}</span></div>
            <div class="r"><span>Gastos Operativos</span><span class="b r2">-$\${gas.toFixed(2)}</span></div>
            <div class="r total"><span>GANANCIA NETA</span><span class="b \${neto>=0?'g':'r2'}">$\${neto.toFixed(2)}</span></div>
            </body></html>\`)
          w.document.close(); w.onload=()=>{w.focus();w.print()}
        }} className="btn-secondary text-xs flex items-center gap-1">
          📊 Estado de Resultados
        </button>
        <button onClick={() => window.print()}`
    );
    fs.writeFileSync(repPath, rep, 'utf8');
    console.log('✅ 6. Estado de Resultados integrado en Reportes.');
  }
}

// =========================================================================
// 7. DETECTOR DE CONEXIÓN A INTERNET
// =========================================================================
const uiDir = path.join(__dirname, 'src/components/UI');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

fs.writeFileSync(path.join(uiDir, 'ConnectionStatus.jsx'), `import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export default function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (online) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-lg animate-pulse">
      <WifiOff className="w-4 h-4" />
      Sin conexión a internet. Los datos no se guardarán hasta que se restablezca la conexión.
    </div>
  )
}
`);
console.log('✅ 7. ConnectionStatus.jsx creado.');

// Integrar en Shell
const shellPath = path.join(__dirname, 'src/components/Layout/Shell.jsx');
if (fs.existsSync(shellPath)) {
  let shell = fs.readFileSync(shellPath, 'utf8');
  if (!shell.includes('ConnectionStatus')) {
    shell = "import ConnectionStatus from '../UI/ConnectionStatus';\n" + shell;
    shell = shell.replace(
      '<HelpModal />',
      '<HelpModal />\n      <ConnectionStatus />'
    );
    fs.writeFileSync(shellPath, shell, 'utf8');
    console.log('✅ 7b. Detector de conexión integrado en Shell.');
  }
}

console.log('\n🎉 ¡Las 7 funciones avanzadas han sido instaladas!');
