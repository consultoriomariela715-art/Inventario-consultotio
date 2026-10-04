import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../context/CurrencyContext'
import { fmt } from '../../utils/helpers'
import PriceBox from '../UI/PriceBox'
import Odontograma from './Odontograma'
import ReciboModal from '../ReciboModal'
import {
  Plus, Search, Save, X, Printer, Receipt, Edit3, Trash2, Sparkles, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Historial() {
  const { rates, taxes } = useCurrency()
  const [list, setList] = useState([])
  const [pacs, setPacs] = useState([])
  const [trats, setTrats] = useState([])
  const [clinica, setClinica] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [q, setQ] = useState('')
  const [dientesSel, setDientesSel] = useState([])
  const [reciboModalData, setReciboModalData] = useState(null)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    paciente_id: '',
    tratamiento_id: '',
    diagnostico: '',
    procedimiento: '',
    monto_usd: 0,
    impuesto_id: '',
    pagado: true,
    metodo_pago: 'efectivo_usd'
  })

  const load = async () => {
    const [h, p, t, cl] = await Promise.all([
      supabase.from('historial_clinico').select('*, pacientes(nombres, apellidos, cedula, telefono, direccion)').order('created_at', { ascending: false }),
      supabase.from('pacientes').select('id, nombres, apellidos, cedula, telefono, direccion').eq('activo', true).order('nombres'),
      supabase.from('tratamientos').select('id, nombre, precio').eq('activo', true),
      supabase.from('configuracion_consultorio').select('*').limit(1)
    ])
    setList(h.data || [])
    setPacs(p.data || [])
    setTrats(t.data || [])
    if (cl.data?.[0]) setClinica(cl.data[0])
  }

  useEffect(() => { load() }, [])

  const seleccionarTratamiento = (id) => {
    const t = trats.find(x => x.id === id)
    if (t) {
      setForm(prev => ({
        ...prev,
        tratamiento_id: id,
        procedimiento: t.nombre,
        monto_usd: Number(t.precio)
      }))
    }
  }

  const startEdit = (h) => {
    setForm({
      paciente_id: h.paciente_id || '',
      tratamiento_id: h.tratamiento_id || '',
      diagnostico: h.diagnostico || '',
      procedimiento: h.procedimiento || '',
      monto_usd: Number(h.subtotal_usd || h.monto_usd || 0),
      impuesto_id: h.impuesto_id || '',
      pagado: h.pagado !== false,
      metodo_pago: h.metodo_pago || 'efectivo_usd'
    })
    setDientesSel(h.dientes_tratados ? h.dientes_tratados.split(',').map(d => d.trim()).filter(Boolean) : [])
    setEditId(h.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const eliminarConsulta = async (id, factura) => {
    if (!confirm(`¿Eliminar el registro clínico ${factura}?`)) return
    const { error } = await supabase.from('historial_clinico').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success(`Registro ${factura} eliminado`)
      load()
    }
  }

  const selectedTax = taxes?.find(t => t.id === form.impuesto_id)
  const taxPct = selectedTax ? selectedTax.porcentaje : 0
  const subtotalUSD = Number(form.monto_usd || 0)
  const taxUSD = subtotalUSD * (taxPct / 100)
  const totalUSD = subtotalUSD + taxUSD

  const save = async (e) => {
    e.preventDefault()
    const fac = editId ? list.find(x => x.id === editId)?.factura : `CONS-${Date.now().toString().slice(-6)}`

    const payload = {
      paciente_id: form.paciente_id || null,
      tratamiento_id: form.tratamiento_id || null,
      impuesto_id: form.impuesto_id || null,
      diagnostico: form.diagnostico || null,
      procedimiento: form.procedimiento,
      pagado: form.pagado,
      metodo_pago: form.metodo_pago,
      factura: fac,
      dientes_tratados: dientesSel.join(', ') || null,
      subtotal_usd: subtotalUSD,
      impuesto_usd: taxUSD,
      monto_usd: totalUSD,
      total_ves: totalUSD * (rates?.VES || 1),
      total_cop: totalUSD * (rates?.COP || 1),
      tasa_ves: rates?.VES || 0,
      tasa_cop: rates?.COP || 0
    }

    let error
    if (editId) {
      const { error: err } = await supabase.from('historial_clinico').update(payload).eq('id', editId)
      error = err
    } else {
      const { error: err } = await supabase.from('historial_clinico').insert([payload])
      error = err
    }

    if (error) return toast.error('Error al guardar: ' + error.message)

    toast.success(`Consulta ${fac} ${editId ? 'actualizada' : 'registrada y cobrada'}`)
    
    // ABRIR FACTURA SENIAT AUTOMÁTICAMENTE
    const pacObj = pacs.find(p => p.id === form.paciente_id)
    setReciboModalData({
      ...payload,
      paciente_nombre: pacObj ? `${pacObj.nombres} ${pacObj.apellidos}` : 'Paciente General',
      paciente_cedula: pacObj?.cedula || 'V-00000000',
      paciente_telefono: pacObj?.telefono || '',
      paciente_direccion: pacObj?.direccion || '',
      doctor_nombre: 'Dr. Tratante'
    })

    setShowForm(false)
    setEditId(null)
    setDientesSel([])
    setForm({ paciente_id: '', tratamiento_id: '', diagnostico: '', procedimiento: '', monto_usd: 0, impuesto_id: '', pagado: true, metodo_pago: 'efectivo_usd' })
    load()
  }

  const filtered = list.filter(h =>
    `${h.pacientes?.nombres} ${h.pacientes?.apellidos} ${h.procedimiento} ${h.diagnostico} ${h.factura}`.toLowerCase().includes(q.toLowerCase())
  )

  const abrirReciboDeFila = (h) => {
    setReciboModalData({
      ...h,
      paciente_nombre: h.pacientes ? `${h.pacientes.nombres || ''} ${h.pacientes.apellidos || ''}`.trim() : 'Paciente General',
      paciente_cedula: h.pacientes?.cedula || 'V-00000000',
      paciente_telefono: h.pacientes?.telefono || '',
      paciente_direccion: h.pacientes?.direccion || '',
      doctor_nombre: 'Dr. Tratante'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Historial Clínico & Cobros</h1>
          <p className="text-xs text-slate-400">Consultas realizadas, emisión de facturas SENIAT y registro dental</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setDientesSel([]) }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Registrar Consulta</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card-box space-y-4 border-2 border-teal-200 bg-teal-50/20">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold text-sm text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> {editId ? 'Editar Consulta / Cobro' : 'Registrar Procedimiento y Cobro'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Paciente *</label>
              <select required className="input-field" value={form.paciente_id} onChange={e => setForm({...form, paciente_id: e.target.value})}>
                <option value="">Seleccionar paciente...</option>
                {pacs.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Cargar del Catálogo</label>
                <Link to="/tratamientos" className="text-[10px] text-teal-600 hover:underline font-bold">⚙️ Editar Catálogo</Link>
              </div>
              <select className="input-field" value={form.tratamiento_id} onChange={e => seleccionarTratamiento(e.target.value)}>
                <option value="">Personalizado / Otro</option>
                {trats.map(t => <option key={t.id} value={t.id}>{t.nombre} — ${t.precio}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Nombre del Procedimiento *</label>
              <input required className="input-field" value={form.procedimiento} onChange={e => setForm({...form, procedimiento: e.target.value})} placeholder="Ej: Resina Fotocurada #14" />
            </div>
          </div>

          <Odontograma selected={dientesSel} onChange={setDientesSel} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Monto Base ($ USD) *</label>
              <input required type="number" step="0.01" min="0" className="input-field font-bold text-teal-700" value={form.monto_usd} onChange={e => setForm({...form, monto_usd: e.target.value})} />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Impuesto Aplicable</label>
              <select className="input-field" value={form.impuesto_id} onChange={e => setForm({...form, impuesto_id: e.target.value})}>
                <option value="">Exento de Impuestos</option>
                {taxes?.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.porcentaje}%)</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Método de Pago</label>
              <select className="input-field" value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})}>
                <option value="efectivo_usd">Efectivo $ USD</option>
                <option value="pago_movil">Pago Móvil (VES)</option>
                <option value="zelle">Zelle</option>
                <option value="tarjeta">Punto de Venta / Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Diagnóstico & Observaciones Clínicas</label>
            <textarea className="input-field" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} placeholder="Detalles clínicos de la intervención..." rows={2} />
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span>${subtotalUSD.toFixed(2)} USD</span></div>
            {taxPct > 0 && <div className="flex justify-between text-teal-400"><span>Impuesto ({taxPct}%):</span><span>${taxUSD.toFixed(2)} USD</span></div>}
            <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-1.5">
              <span>Total a Cobrar:</span><span className="text-teal-400">${totalUSD.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-300"><span>Total en Bs. (BCV):</span><span>Bs. {(totalUSD * (rates?.VES || 1)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {editId ? 'Guardar Cambios' : 'Guardar y Emitir Factura SENIAT'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input placeholder="Buscar por paciente, procedimiento o factura..." value={q} onChange={e => setQ(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map(h => (
          <div key={h.id} className="card-box space-y-2.5">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300 px-2 py-0.5 rounded">{h.factura || 'FACTURA'}</span>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mt-1">{h.pacientes?.nombres} {h.pacientes?.apellidos}</h3>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">{h.procedimiento}</p>
                <p className="text-[11px] text-slate-400">{new Date(h.fecha || h.created_at).toLocaleDateString('es-VE')}</p>
              </div>
              <div className="text-right">
                <PriceBox usd={h.monto_usd} showAll />
                <div className="flex justify-end gap-1 mt-2">
                  <button
                    onClick={() => abrirReciboDeFila(h)}
                    className="btn-primary text-xs py-1 px-2.5 inline-flex items-center gap-1 font-bold shadow-sm"
                    title="Emitir Factura SENIAT / Excel"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Factura / Recibo
                  </button>
                  <button
                    onClick={() => startEdit(h)}
                    className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => eliminarConsulta(h.id, h.factura)}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {h.diagnostico && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-400">Dx:</span> {h.diagnostico}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* MODAL DE FACTURA SENIAT CON EXCEL E IMPRESIÓN AISLADA */}
      <ReciboModal
        isOpen={!!reciboModalData}
        onClose={() => setReciboModalData(null)}
        data={reciboModalData}
        consultorio={clinica}
      />
    </div>
  )
}
