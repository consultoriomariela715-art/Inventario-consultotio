import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../context/CurrencyContext'
import { fmt } from '../../utils/helpers'
import PriceBox from '../UI/PriceBox'
import ReciboModal from '../ReciboModal'
import {
  CreditCard, Plus, DollarSign, Save, X, Printer, Receipt, ChevronDown, ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PlanesTratamiento() {
  const { rates } = useCurrency()
  const [planes, setPlanes] = useState([])
  const [pacs, setPacs] = useState([])
  const [docs, setDocs] = useState([])
  const [clinica, setClinica] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [abonosPorPlan, setAbonosPorPlan] = useState({})
  const [reciboModalData, setReciboModalData] = useState(null)

  const [form, setForm] = useState({
    paciente_id: '', doctor_id: '', titulo: '', monto_total_usd: '', cuotas_total: 6, abono_inicial_usd: 0, metodo_pago_inicial: 'efectivo_usd', notas: ''
  })

  const [abonoForm, setAbonoForm] = useState({
    plan_id: '', monto_usd: '', metodo_pago: 'efectivo_usd', notas: ''
  })

  const load = async () => {
    const [ptRes, pRes, dRes, caRes, clRes] = await Promise.all([
      supabase.from('planes_tratamiento').select('*, pacientes(nombres, apellidos, cedula, telefono, direccion), doctores(nombres, apellidos)').order('created_at', { ascending: false }),
      supabase.from('pacientes').select('id, nombres, apellidos, cedula, telefono, direccion').eq('activo', true).order('nombres'),
      supabase.from('doctores').select('id, nombres, apellidos, especialidad').eq('activo', true),
      supabase.from('cuotas_abonos').select('*').order('created_at', { ascending: true }),
      supabase.from('configuracion_consultorio').select('*').limit(1)
    ])

    setPlanes(ptRes.data || [])
    setPacs(pRes.data || [])
    setDocs(dRes.data || [])
    if (clRes.data?.[0]) setClinica(clRes.data[0])

    const map = {}
    ;(caRes.data || []).forEach(a => {
      if (!map[a.plan_id]) map[a.plan_id] = []
      map[a.plan_id].push(a)
    })
    setAbonosPorPlan(map)
  }

  useEffect(() => { load() }, [])

  const savePlan = async (e) => {
    e.preventDefault()
    const totalUSD = parseFloat(form.monto_total_usd) || 0
    const inicialUSD = parseFloat(form.abono_inicial_usd) || 0
    const saldo = Math.max(0, totalUSD - inicialUSD)
    const cuotasPagadas = inicialUSD > 0 ? 1 : 0

    const { data: newPlan, error } = await supabase.from('planes_tratamiento').insert([{
      paciente_id: form.paciente_id,
      doctor_id: form.doctor_id || null,
      titulo: form.titulo,
      monto_total_usd: totalUSD,
      cuotas_total: parseInt(form.cuotas_total) || 1,
      cuotas_pagadas: cuotasPagadas,
      saldo_pendiente_usd: saldo,
      estado: saldo === 0 ? 'completado' : 'activo',
      notas: form.notas
    }]).select().single()

    if (error) return toast.error('Error al crear plan')

    if (inicialUSD > 0 && newPlan) {
      const rec = `REC-AB-${Date.now().toString().slice(-6)}`
      await supabase.from('cuotas_abonos').insert({
        plan_id: newPlan.id,
        paciente_id: form.paciente_id,
        numero_cuota: 1,
        monto_usd: inicialUSD,
        metodo_pago: form.metodo_pago_inicial,
        recibo: rec,
        notas: 'Abono inicial de tratamiento'
      })

      const pacObj = pacs.find(p => p.id === form.paciente_id)
      setReciboModalData({
        factura: rec,
        paciente_nombre: pacObj ? `${pacObj.nombres} ${pacObj.apellidos}` : 'Paciente',
        paciente_cedula: pacObj?.cedula || 'V-00000000',
        paciente_telefono: pacObj?.telefono || '',
        doctor_nombre: 'Dr. Tratante',
        procedimiento: `Abono Inicial - ${form.titulo}`,
        monto_usd: inicialUSD,
        metodo_pago: form.metodo_pago_inicial,
        tasa_ves: rates?.VES || 0,
        tasa_cop: rates?.COP || 0
      })
    }

    toast.success('Plan de tratamiento registrado')
    setShowForm(false)
    setForm({ paciente_id: '', doctor_id: '', titulo: '', monto_total_usd: '', cuotas_total: 6, abono_inicial_usd: 0, metodo_pago_inicial: 'efectivo_usd', notas: '' })
    load()
  }

  const registrarAbono = async (plan) => {
    const monto = parseFloat(abonoForm.monto_usd)
    if (!monto || monto <= 0) return toast.error('Ingresa un monto válido')
    if (monto > plan.saldo_pendiente_usd) return toast.error(`El monto supera el saldo (${fmt(plan.saldo_pendiente_usd)})`)

    const nuevoSaldo = Math.max(0, plan.saldo_pendiente_usd - monto)
    const nuevasCuotas = plan.cuotas_pagadas + 1
    const estadoNuevo = nuevoSaldo === 0 ? 'completado' : 'activo'
    const rec = `REC-AB-${Date.now().toString().slice(-6)}`

    await supabase.from('cuotas_abonos').insert({
      plan_id: plan.id,
      paciente_id: plan.paciente_id,
      numero_cuota: nuevasCuotas,
      monto_usd: monto,
      metodo_pago: abonoForm.metodo_pago,
      recibo: rec,
      notas: abonoForm.notas || `Cuota #${nuevasCuotas}`
    })

    await supabase.from('planes_tratamiento').update({
      saldo_pendiente_usd: nuevoSaldo,
      cuotas_pagadas: nuevasCuotas,
      estado: estadoNuevo
    }).eq('id', plan.id)

    toast.success(`Abono ${rec} registrado`)
    
    // ABRIR FACTURA SENIAT / EXCEL PARA EL ABONO
    setReciboModalData({
      factura: rec,
      paciente_nombre: plan.pacientes ? `${plan.pacientes.nombres} ${plan.pacientes.apellidos}` : 'Paciente',
      paciente_cedula: plan.pacientes?.cedula || 'V-00000000',
      paciente_telefono: plan.pacientes?.telefono || '',
      doctor_nombre: plan.doctores ? `Dr. ${plan.doctores.nombres}` : 'Dr. Tratante',
      procedimiento: `Abono Cuota #${nuevasCuotas} - ${plan.titulo}`,
      monto_usd: monto,
      metodo_pago: abonoForm.metodo_pago,
      tasa_ves: rates?.VES || 0,
      tasa_cop: rates?.COP || 0
    })

    setAbonoForm({ plan_id: '', monto_usd: '', metodo_pago: 'efectivo_usd', notas: '' })
    load()
  }

  const abrirReciboAbono = (a, p) => {
    setReciboModalData({
      factura: a.recibo,
      paciente_nombre: p.pacientes ? `${p.pacientes.nombres} ${p.pacientes.apellidos}` : 'Paciente',
      paciente_cedula: p.pacientes?.cedula || 'V-00000000',
      paciente_telefono: p.pacientes?.telefono || '',
      doctor_nombre: p.doctores ? `Dr. ${p.doctores.nombres}` : 'Dr. Tratante',
      procedimiento: `Abono Cuota #${a.numero_cuota} - ${p.titulo}`,
      monto_usd: a.monto_usd,
      metodo_pago: a.metodo_pago,
      tasa_ves: rates?.VES || 0,
      tasa_cop: rates?.COP || 0
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Planes de Tratamiento & Cuotas</h1>
          <p className="text-xs text-slate-400">Control de tratamientos a plazos (Ortodoncia, Implantes, Prótesis)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo Plan</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={savePlan} className="card-box space-y-4 border-2 border-teal-200 bg-teal-50/20">
          <h3 className="font-bold text-sm text-teal-800 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> Crear Plan de Tratamiento a Plazos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Paciente *</label>
              <select required className="input-field" value={form.paciente_id} onChange={e => setForm({...form, paciente_id: e.target.value})}>
                <option value="">Seleccionar paciente...</option>
                {pacs.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Doctor Especialista</label>
              <select className="input-field" value={form.doctor_id} onChange={e => setForm({...form, doctor_id: e.target.value})}>
                <option value="">Cualquier profesional</option>
                {docs.map(d => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Título del Plan *</label>
              <input required className="input-field" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ej: Ortodoncia Brackets MBT" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Monto Total ($ USD) *</label>
              <input required type="number" step="0.01" min="1" className="input-field font-bold text-teal-700" value={form.monto_total_usd} onChange={e => setForm({...form, monto_total_usd: e.target.value})} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Nº de Cuotas</label>
              <select className="input-field" value={form.cuotas_total} onChange={e => setForm({...form, cuotas_total: e.target.value})}>
                {[2, 3, 4, 6, 8, 10, 12, 18, 24].map(n => <option key={n} value={n}>{n} cuotas</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Abono Inicial ($ USD)</label>
              <input type="number" step="0.01" min="0" className="input-field" value={form.abono_inicial_usd} onChange={e => setForm({...form, abono_inicial_usd: e.target.value})} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Método Inicial</label>
              <select className="input-field" value={form.metodo_pago_inicial} onChange={e => setForm({...form, metodo_pago_inicial: e.target.value})}>
                <option value="efectivo_usd">Efectivo $</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="zelle">Zelle</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Crear Plan</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {planes.map(p => {
          const abonos = abonosPorPlan[p.id] || []
          const isExp = expanded === p.id
          const pct = p.monto_total_usd > 0 ? (((p.monto_total_usd - p.saldo_pendiente_usd) / p.monto_total_usd) * 100) : 100

          return (
            <div key={p.id} className="card-box p-0 overflow-hidden border">
              <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{p.titulo}</h3>
                    <span className={`badge ${p.estado === 'completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {p.estado === 'completado' ? '✓ Liquidado' : '⏳ En Curso'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Paciente: <b>{p.pacientes?.nombres} {p.pacientes?.apellidos}</b></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Saldo Deudor</p>
                    <p className={`text-base font-bold ${p.saldo_pendiente_usd > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {fmt(p.saldo_pendiente_usd, 'USD')}
                    </p>
                  </div>
                  <button onClick={() => setExpanded(isExp ? null : p.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExp ? 'Ocultar' : 'Abonar / Cuotas'}
                  </button>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
                <div style={{ width: `${pct}%` }} className="bg-teal-500 h-full transition-all" />
              </div>

              {isExp && (
                <div className="border-t dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-5 space-y-4">
                  {p.saldo_pendiente_usd > 0 && (
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2">
                      <p className="text-xs font-bold text-teal-900 dark:text-teal-400">Registrar Nuevo Abono / Cuota:</p>
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="number"
                          step="0.01"
                          max={p.saldo_pendiente_usd}
                          placeholder="Monto ($ USD)"
                          className="input-field w-32 text-xs font-bold text-teal-700"
                          value={abonoForm.plan_id === p.id ? abonoForm.monto_usd : ''}
                          onChange={e => setAbonoForm({ ...abonoForm, plan_id: p.id, monto_usd: e.target.value })}
                        />
                        <select
                          className="input-field w-36 text-xs"
                          value={abonoForm.plan_id === p.id ? abonoForm.metodo_pago : 'efectivo_usd'}
                          onChange={e => setAbonoForm({ ...abonoForm, plan_id: p.id, metodo_pago: e.target.value })}
                        >
                          <option value="efectivo_usd">Efectivo $</option>
                          <option value="pago_movil">Pago Móvil</option>
                          <option value="zelle">Zelle</option>
                          <option value="transferencia">Transferencia</option>
                        </select>
                        <input
                          placeholder="Notas de la cuota"
                          className="input-field flex-1 text-xs"
                          value={abonoForm.plan_id === p.id ? abonoForm.notas : ''}
                          onChange={e => setAbonoForm({ ...abonoForm, plan_id: p.id, notas: e.target.value })}
                        />
                        <button type="button" onClick={() => registrarAbono(p)} className="btn-primary text-xs shrink-0 py-1.5">
                          <Save className="w-3.5 h-3.5" /> Cobrar Cuota
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Historial de Cuotas Pagadas:</p>
                    {abonos.map(a => (
                      <div key={a.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold font-mono mr-2 text-teal-700 dark:text-teal-400">{a.recibo}</span>
                          <span className="text-slate-500">{a.notas || `Cuota #${a.numero_cuota}`} • {new Date(a.created_at).toLocaleDateString('es-VE')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{fmt(a.monto_usd, 'USD')}</span>
                          <button
                            onClick={() => abrirReciboAbono(a, p)}
                            className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1 font-bold"
                            title="Ver Factura SENIAT / Excel"
                          >
                            <Receipt className="w-3 h-3" /> Factura
                          </button>
                        </div>
                      </div>
                    ))}
                    {!abonos.length && <p className="text-xs text-slate-400 italic">Sin abonos registrados.</p>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ReciboModal
        isOpen={!!reciboModalData}
        onClose={() => setReciboModalData(null)}
        data={reciboModalData}
        consultorio={clinica}
      />
    </div>
  )
}
