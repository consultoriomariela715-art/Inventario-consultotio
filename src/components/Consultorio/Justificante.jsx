import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FileCheck, Printer, Save, ShieldAlert, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Justificante({ pacienteId, pacienteNombre, pacienteCedula, doctorNombre, clinica }) {
  const [form, setForm] = useState({
    tipo: 'reposo',
    diagnostico: '',
    procedimiento: '',
    dias_reposo: 1,
    observaciones: '',
    cov_num: '',
    mpps_num: '',
    doctor_firmante: doctorNombre || ''
  })

  const config = clinica || {
    nombre: 'CONSULTORIO ODONTOLÓGICO INTEGRAL',
    rif_nit: 'J-12345678-0',
    telefono: '+58 412-000-0000',
    direccion: 'Caracas, Venezuela'
  }

  useEffect(() => {
    // Intentar precargar credenciales del último doctor registrado
    supabase.from('doctores').select('nombres, apellidos, telefono').eq('activo', true).limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setForm(prev => ({
            ...prev,
            doctor_firmante: `Dr(a). ${data[0].nombres} ${data[0].apellidos}`
          }))
        }
      })
  }, [doctorNombre])

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const numeroALetras = (num) => {
    const unidades = ['CERO', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ']
    return unidades[num] || String(num)
  }

  const guardar = async () => {
    try {
      await supabase.from('justificantes').insert([{
        paciente_id: pacienteId,
        tipo: form.tipo,
        diagnostico: form.diagnostico,
        procedimiento: form.procedimiento,
        dias_reposo: parseInt(form.dias_reposo),
        observaciones: `C.O.V: ${form.cov_num} | M.P.P.S: ${form.mpps_num} | ${form.observaciones}`
      }])
      toast.success('Justificante asentado en la historia clínica')
    } catch (e) {
      toast.error('Error al registrar justificante')
    }
  }

  const imprimirCOV = () => {
    if (!form.doctor_firmante.trim()) return toast.error('Ingrese el nombre del odontólogo tratante')
    if (!form.cov_num.trim() || !form.mpps_num.trim()) {
      return toast.error('Los números de C.O.V. y M.P.P.S. son obligatorios para la validez legal del reposo')
    }

    const hoy = new Date()
    const fin = new Date(hoy.getTime() + (parseInt(form.dias_reposo) - 1) * 86400000)
    
    const printWin = window.open('', '_blank', 'width=850,height=950')
    if (!printWin) return alert('Permite las ventanas emergentes para imprimir.')

    const diasLetras = numeroALetras(parseInt(form.dias_reposo))
    const diasFormateado = `${diasLetras} (${String(form.dias_reposo).padStart(2, '0')})`

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Constancia Médica - C.O.V.</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: "Times New Roman", Times, serif;
            color: #0f172a;
            background: #fff;
            padding: 20mm;
            line-height: 1.6;
            font-size: 13px;
          }
          .cov-header {
            text-align: center;
            border-bottom: 3px double #0d9488;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .cov-logo {
            font-size: 24px;
            margin-bottom: 4px;
          }
          .cov-title {
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #111827;
          }
          .cov-subtitle {
            font-size: 10px;
            font-weight: bold;
            color: #475569;
            margin-top: 2px;
          }
          .cert-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 30px 0;
            letter-spacing: 1px;
            text-decoration: underline;
          }
          .content-text {
            text-align: justify;
            font-size: 13px;
            text-indent: 30px;
            margin-bottom: 16px;
          }
          .bold {
            font-weight: bold;
          }
          .details-box {
            margin: 20px 0;
            padding: 12px 16px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 8px;
          }
          .details-row {
            display: flex;
            margin-bottom: 6px;
          }
          .details-label {
            width: 140px;
            font-weight: bold;
            color: #334155;
          }
          .signature-area {
            margin-top: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .signature-line {
            width: 250px;
            border-top: 1.5px solid #000;
            margin-bottom: 6px;
          }
          .legal-footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 9px;
            color: #64748b;
            text-align: center;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="cov-header">
          <div class="cov-logo">🇻🇪</div>
          <div class="cov-title">Colegio de Odontólogos de Venezuela</div>
          <div class="cov-subtitle">REGISTRO NACIONAL DE CONSTANCIAS Y REPOSOS ODONTOLÓGICOS</div>
          <div style="font-size: 8px; color: #94a3b8; margin-top: 3px;">CONTRALORÍA SANITARIA Y DEONTOLÓGICA</div>
        </div>

        <div class="cert-title">
          ${form.tipo === 'reposo' ? 'Certificado de Reposo Odontológico' : 'Constancia de Asistencia Clínica'}
        </div>

        <div class="content-text">
          Quien suscribe, odontólogo tratante <span class="bold">${form.doctor_firmante.toUpperCase()}</span>, 
          debidamente inscrito en el Colegio de Odontólogos de Venezuela bajo el número <span class="bold">N° ${form.cov_num}</span> 
          y registrado en el Ministerio del Poder Popular para la Salud bajo el número <span class="bold">N° ${form.mpps_num}</span>, 
          hace constar por medio de la presente que el/la ciudadano(a) <span class="bold">${pacienteNombre.toUpperCase()}</span>, 
          titular de la Cédula de Identidad número <span class="bold">C.I. ${pacienteCedula || 'N/A'}</span>, 
          asistió a consulta clínica en este centro odontológico el día de hoy, <span class="bold">${hoy.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>.
        </div>

        <div class="details-box">
          <div class="details-row"><span class="details-label">Diagnóstico Clínico:</span><span>${form.diagnostico || 'Evaluación y control odontológico de rutina.'}</span></div>
          <div class="details-row"><span class="details-label">Terapéutica / Plan:</span><span>${form.procedimiento || 'Tratamiento clínico en sillón.'}</span></div>
        </div>

        ${form.tipo === 'reposo' ? `
          <div class="content-text">
            Por tal motivo, se prescribe reposo absoluto de índole laboral y físico por un período de 
            <span class="bold">${diasFormateado} día(s) consecutivos</span>, 
            los cuales comprenden desde el <span class="bold">${hoy.toLocaleDateString('es-VE')}</span> 
            hasta el <span class="bold">${fin.toLocaleDateString('es-VE')}</span> inclusive. Debiendo reiniciar sus actividades normales el día <span class="bold">${new Date(fin.getTime() + 86400000).toLocaleDateString('es-VE')}</span>.
          </div>
        ` : ''}

        ${form.observaciones ? `
          <div class="content-text" style="text-indent: 0; margin-top: 10px;">
            <strong>Indicaciones Deontológicas / Observaciones:</strong> ${form.observaciones}
          </div>
        ` : ''}

        <div class="content-text" style="text-indent: 0; margin-top: 15px;">
          Certificado que se expide a solicitud de la parte interesada, conforme a derecho, en la ciudad de Caracas, República Bolivariana de Venezuela.
        </div>

        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="bold" style="font-size: 12px;">${form.doctor_firmante.toUpperCase()}</div>
          <div style="font-size: 10px; color: #475569; margin-top: 1px;">ODONTÓLOGO TRATANTE</div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace; margin-top: 2px;">C.O.V. N° ${form.cov_num} | M.P.P.S. N° ${form.mpps_num}</div>
        </div>

        <div class="legal-footer">
          Documento emitido de conformidad con la Ley del Ejercicio de la Odontología en Venezuela (Gaceta Oficial N° 29.284) 
          y las normativas de la Contraloría Sanitaria del M.P.P.S. <br>
          La falsificación o alteración de este documento constituye delito tipificado en el Código Penal Venezolano.
        </div>
      </body>
      </html>
    `

    printWin.document.open()
    printWin.document.write(html)
    printWin.document.close()
    printWin.onload = () => { printWin.focus(); printWin.print() }
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-4 flex items-start gap-3">
        <Award className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-xs text-teal-900 dark:text-teal-300 uppercase tracking-wider">Certificación Oficial COV / MPPS</h4>
          <p className="text-[10px] text-teal-700 dark:text-teal-400">Emita constancias de asistencia y reposos médicos válidos ante el IVSS, ministerios, empresas públicas y privadas bajo normativa venezolana.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-500 block mb-1">Nombre Odontólogo *</label>
          <input className="input-field" value={form.doctor_firmante} onChange={e=>set('doctor_firmante', e.target.value)} placeholder="Dr. Juan Pérez" />
        </div>
        <div>
          <label className="font-bold text-slate-500 block mb-1">N° C.O.V. (Colegio) *</label>
          <input className="input-field font-mono" value={form.cov_num} onChange={e=>set('cov_num', e.target.value)} placeholder="Ej: 14250" />
        </div>
        <div>
          <label className="font-bold text-slate-500 block mb-1">N° M.P.P.S. (Salud) *</label>
          <input className="input-field font-mono" value={form.mpps_num} onChange={e=>set('mpps_num', e.target.value)} placeholder="Ej: 8596" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-500 block mb-1">Tipo de Documento</label>
          <select className="input-field text-xs font-bold" value={form.tipo} onChange={e=>set('tipo', e.target.value)}>
            <option value="reposo">📝 Certificado de Reposo Odontológico</option>
            <option value="asistencia">📄 Constancia de Asistencia Clínica</option>
          </select>
        </div>
        {form.tipo === 'reposo' && (
          <div>
            <label className="font-bold text-slate-500 block mb-1">Días de Reposo</label>
            <select className="input-field text-xs font-bold" value={form.dias_reposo} onChange={e=>set('dias_reposo', e.target.value)}>
              <option value="1">1 día (24 horas)</option>
              <option value="2">2 días (48 horas)</option>
              <option value="3">3 días (72 horas)</option>
              <option value="5">5 días</option>
              <option value="7">7 días</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-500 block mb-1">Diagnóstico Clínico (COV) *</label>
          <input className="input-field" value={form.diagnostico} onChange={e=>set('diagnostico', e.target.value)} placeholder="Ej: Pulpitis aguda supurativa..." />
        </div>
        <div>
          <label className="font-bold text-slate-500 block mb-1">Procedimiento Efectuado *</label>
          <input className="input-field" value={form.procedimiento} onChange={e=>set('procedimiento', e.target.value)} placeholder="Ej: Biopulpectomía total, obturación..." />
        </div>
      </div>

      <div>
        <label className="font-bold text-slate-500 text-xs block mb-1">Observaciones / Indicaciones Especiales</label>
        <textarea className="input-field text-xs" rows={2} value={form.observaciones} onChange={e=>set('observaciones', e.target.value)} placeholder="Ej: Reposo absoluto, indicaciones de dieta..." />
      </div>

      <div className="flex gap-2 border-t dark:border-slate-800 pt-3">
        <button onClick={guardar} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md"><Save className="w-4 h-4" /> Registrar en Historia</button>
        <button onClick={imprimirCOV} className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 font-bold"><Printer className="w-4 h-4" /> Generar Reposo Oficial</button>
      </div>
    </div>
  )
}
