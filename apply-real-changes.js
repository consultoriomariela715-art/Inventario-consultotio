const fs = require('fs');
const path = require('path');

console.log('🚀 Escribiendo componentes completos con todas las funciones reales...\n');

// 1. RE-ESCRIBIR TASASIMPUESTOS.JSX CON ELIMINAR Y EDITAR IMPUESTOS
const tasasPath = path.join(__dirname, 'src/components/Configuracion/TasasImpuestos.jsx');
fs.writeFileSync(tasasPath, `import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../context/CurrencyContext'
import { DollarSign, Percent, Save, Plus, RefreshCw, Building2, Trash2, Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TasasImpuestos() {
  const { rates, setRates, syncOfficialRates, loadingRates, loadData } = useCurrency()
  const [tab, setTab] = useState('clinica')
  const [ves, setVes] = useState(rates?.VES || 0)
  const [cop, setCop] = useState(rates?.COP || 0)
  const [taxes, setTaxes] = useState([])
  const [newTax, setNewTax] = useState({ nombre: '', porcentaje: '' })
  const [seguros, setSeguros] = useState([])
  const [newSeguro, setNewSeguro] = useState({ nombre: '', telefono: '', cobertura_pct: 80 })

  const [clinica, setClinica] = useState({
    nombre: '', rif_nit: '', telefono: '', email: '', direccion: '', mensaje_recibo: ''
  })

  useEffect(() => {
    if (rates) {
      setVes(rates.VES)
      setCop(rates.COP)
    }
  }, [rates])

  const loadAll = async () => {
    try {
      const [cRes, iRes, sRes] = await Promise.all([
        supabase.from('configuracion_consultorio').select('*').limit(1),
        supabase.from('impuestos').select('*').order('created_at', { ascending: true }),
        supabase.from('seguros').select('*').order('nombre').catch(() => ({ data: [] }))
      ])
      if (cRes.data?.[0]) setClinica(cRes.data[0])
      if (iRes.data) setTaxes(iRes.data)
      if (sRes.data) setSeguros(sRes.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { loadAll() }, [])

  const saveClinica = async e => {
    e.preventDefault()
    try {
      if (clinica.id) {
        await supabase.from('configuracion_consultorio').update(clinica).eq('id', clinica.id)
      } else {
        await supabase.from('configuracion_consultorio').insert([clinica])
      }
      toast.success('Membrete del consultorio guardado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const saveRates = async (e) => {
    e.preventDefault()
    const numVes = Number(ves)
    const numCop = Number(cop)
    try {
      await supabase.from('tasas_cambio').upsert({ moneda: 'VES', tasa: numVes, fuente: 'Manual' }, { onConflict: 'moneda' })
      await supabase.from('tasas_cambio').upsert({ moneda: 'COP', tasa: numCop, fuente: 'Manual' }, { onConflict: 'moneda' })
      setRates({ VES: numVes, COP: numCop })
      toast.success('Tasas guardadas en Supabase')
    } catch (err) {
      localStorage.setItem('tasa_ves', String(numVes))
      localStorage.setItem('tasa_cop', String(numCop))
      setRates({ VES: numVes, COP: numCop })
      toast.success('Tasas guardadas localmente')
    }
  }

  const addTax = async (e) => {
    e.preventDefault()
    if (!newTax.nombre.trim() || newTax.porcentaje === '') return toast.error('Ingresa nombre y porcentaje')
    try {
      const { error } = await supabase.from('impuestos').insert([{
        nombre: newTax.nombre.trim(),
        porcentaje: parseFloat(newTax.porcentaje) || 0,
        activo: true
      }])
      if (error) throw error
      toast.success(\`Impuesto "\${newTax.nombre}" agregado\`)
      setNewTax({ nombre: '', porcentaje: '' })
      loadAll()
      if (loadData) loadData()
    } catch (err) {
      toast.error('Error al agregar: ' + err.message)
    }
  }

  const deleteTax = async (id, nombre) => {
    if (!confirm(\`¿Eliminar el impuesto "\${nombre}"?\`)) return
    try {
      const { error } = await supabase.from('impuestos').delete().eq('id', id)
      if (error) throw error
      toast.success(\`Impuesto "\${nombre}" eliminado\`)
      setTaxes(prev => prev.filter(t => t.id !== id))
      if (loadData) loadData()
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message)
    }
  }

  const updateTaxPct = async (id, newPct) => {
    const val = parseFloat(newPct)
    if (isNaN(val) || val < 0) return
    try {
      await supabase.from('impuestos').update({ porcentaje: val }).eq('id', id)
      toast.success('Porcentaje actualizado')
      setTaxes(prev => prev.map(t => t.id === id ? { ...t, porcentaje: val } : t))
      if (loadData) loadData()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const addSeguro = async () => {
    if (!newSeguro.nombre.trim()) return toast.error('Ingresa nombre del seguro')
    await supabase.from('seguros').insert([newSeguro])
    toast.success('Seguro agregado')
    setNewSeguro({ nombre: '', telefono: '', cobertura_pct: 80 })
    loadAll()
  }

  const deleteSeguro = async (id) => {
    if (!confirm('¿Eliminar aseguradora?')) return
    await supabase.from('seguros').delete().eq('id', id)
    toast.success('Seguro eliminado')
    loadAll()
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Ajustes & Membrete de la Clínica</h1>
          <p className="text-xs text-slate-400">Datos fiscales de los recibos, tasas BCV e impuestos configurables</p>
        </div>
        <button onClick={() => syncOfficialRates(true)} disabled={loadingRates} className="btn-primary">
          <RefreshCw className={\`w-4 h-4 \${loadingRates ? 'animate-spin' : ''}\`} /> Sincronizar BCV de Hoy
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button onClick={() => setTab('clinica')} className={\`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 \${tab === 'clinica' ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent text-slate-400'}\`}>
          <Building2 className="w-3.5 h-3.5" /> Datos del Consultorio (Membrete de Recibos)
        </button>
        <button onClick={() => setTab('tasas')} className={\`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 \${tab === 'tasas' ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent text-slate-400'}\`}>
          <DollarSign className="w-3.5 h-3.5" /> Tasas Oficiales, Impuestos & Seguros
        </button>
      </div>

      {tab === 'clinica' && (
        <form onSubmit={saveClinica} className="card-box space-y-4 max-w-2xl">
          <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-2">
            <Building2 className="w-4 h-4 text-teal-600" /> Información que aparecerá en Facturas y Recibos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nombre del Consultorio / Clínica *</label>
              <input required className="input-field font-bold" value={clinica.nombre || ''} onChange={e => setClinica({...clinica, nombre: e.target.value})} placeholder="Ej: Clínica Dental San Lucas" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">RIF / Identificación Fiscal *</label>
              <input required className="input-field" value={clinica.rif_nit || ''} onChange={e => setClinica({...clinica, rif_nit: e.target.value})} placeholder="RIF: J-12345678-0" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Teléfono de Contacto</label>
              <input className="input-field" value={clinica.telefono || ''} onChange={e => setClinica({...clinica, telefono: e.target.value})} placeholder="+58 412-1234567" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Correo Electrónico</label>
              <input type="email" className="input-field" value={clinica.email || ''} onChange={e => setClinica({...clinica, email: e.target.value})} placeholder="contacto@clinicadental.com" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Dirección Física</label>
            <input className="input-field" value={clinica.direccion || ''} onChange={e => setClinica({...clinica, direccion: e.target.value})} placeholder="Av. Principal, Edif. Médico, Piso 2" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Mensaje de Pie de Página en Recibos</label>
            <textarea rows={2} className="input-field" value={clinica.mensaje_recibo || ''} onChange={e => setClinica({...clinica, mensaje_recibo: e.target.value})} placeholder="¡Gracias por su visita!" />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            <Save className="w-4 h-4" /> Guardar Membrete de la Clínica
          </button>
        </form>
      )}

      {tab === 'tasas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={saveRates} className="card-box space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" /> Tasas del Sistema
            </h2>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Tasa Bolívares (VES por 1 USD)</label>
              <input type="number" step="0.01" className="input-field font-bold text-teal-800 dark:text-teal-400" value={ves} onChange={e => setVes(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Tasa Pesos Colombianos (COP por 1 USD)</label>
              <input type="number" step="1" className="input-field font-bold text-amber-800 dark:text-amber-400" value={cop} onChange={e => setCop(e.target.value)} />
            </div>
            <button type="submit" className="btn-secondary w-full justify-center text-xs font-bold py-2.5">
              <Save className="w-4 h-4" /> Guardar Tasas en Supabase
            </button>
          </form>

          {/* GESTIÓN DE IMPUESTOS CON BORRAR Y EDITAR */}
          <div className="card-box space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-2">
              <Percent className="w-4 h-4 text-teal-600" /> Impuestos Configurados ({taxes.length})
            </h2>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {taxes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin impuestos configurados</p>
              ) : (
                taxes.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl gap-2 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-white flex-1">{t.nombre}</span>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-16 text-center text-xs py-1 font-mono font-bold text-teal-700 dark:text-teal-400"
                      defaultValue={t.porcentaje}
                      onBlur={e => updateTaxPct(t.id, e.target.value)}
                      title="Haz clic afuera para actualizar porcentaje"
                    />
                    <span className="text-slate-400 font-bold">%</span>
                    <button
                      type="button"
                      onClick={() => deleteTax(t.id, t.nombre)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este impuesto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addTax} className="flex gap-2 pt-2 border-t">
              <input required placeholder="Nombre (ej. IVA 16%)" className="input-field text-xs flex-1" value={newTax.nombre} onChange={e => setNewTax({...newTax, nombre: e.target.value})} />
              <input required type="number" step="0.1" placeholder="%" className="input-field w-20 text-xs text-center font-bold" value={newTax.porcentaje} onChange={e => setNewTax({...newTax, porcentaje: e.target.value})} />
              <button type="submit" className="btn-primary text-xs px-3"><Plus className="w-4 h-4" /></button>
            </form>
          </div>

          {/* SEGUROS Y CONVENIOS */}
          <div className="md:col-span-2 card-box space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-2">
              <Shield className="w-4 h-4 text-teal-600" /> Seguros & Convenios Odontológicos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {seguros.map(s => (
                <div key={s.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{s.nombre}</p>
                    <p className="text-[10px] text-teal-600 font-bold">Cobertura: {s.cobertura_pct}%</p>
                  </div>
                  <button onClick={() => deleteSeguro(s.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <input className="input-field text-xs flex-1" placeholder="Aseguradora (ej. Seguros Caracas)" value={newSeguro.nombre} onChange={e => setNewSeguro({...newSeguro, nombre: e.target.value})} />
              <input className="input-field text-xs w-28" placeholder="Teléfono" value={newSeguro.telefono} onChange={e => setNewSeguro({...newSeguro, telefono: e.target.value})} />
              <input type="number" className="input-field text-xs w-20 text-center font-bold" placeholder="%" value={newSeguro.cobertura_pct} onChange={e => setNewSeguro({...newSeguro, cobertura_pct: e.target.value})} />
              <button onClick={addSeguro} className="btn-primary text-xs px-3"><Plus className="w-4 h-4" /> Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`, 'utf8');
console.log('✅ 1. TasasImpuestos.jsx re-escrito con eliminar y editar impuestos.');

// 2. RE-ESCRIBIR HISTORIAL.JSX PARA QUE ABRA EL RECIBOMODAL REAL
const histPath = path.join(__dirname, 'src/components/Consultorio/Historial.jsx');
fs.writeFileSync(histPath, `import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../context/CurrencyContext'
import { fmt } from '../../utils/helpers'
import PriceBox from '../UI/PriceBox'
import Odontograma from './Odontograma'
import ReciboModal from '../ReciboModal'
import RecipeModal from './RecipeModal'
import VoiceDictation from '../UI/VoiceDictation'
import CalculadoraCambioModal from '../UI/CalculadoraCambioModal'
import AsistenteClinicoModal from './AsistenteClinicoModal'
import {
  Plus, Search, Save, X, Printer, Receipt, Edit3, Trash2, Sparkles, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Historial() {
  const { rates, taxes } = useCurrency()
  const [list, setList] = useState([])
  const [pacs, setPacs] = useState([])
  const [trats, setTrats] = useState([])
  const [prods, setProds] = useState([])
  const [clinica, setClinica] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [q, setQ] = useState('')
  const [dientesSel, setDientesSel] = useState([])
  const [reciboModalData, setReciboModalData] = useState(null)
  const [recipeActivo, setRecipeActivo] = useState(null)
  const [calculadoraOpen, setCalculadoraOpen] = useState(false)
  const [asistenteOpen, setAsistenteOpen] = useState(false)
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
    const [h, p, t, pr, cl] = await Promise.all([
      supabase.from('historial_clinico').select('*, pacientes(nombres, apellidos, cedula, telefono)').order('created_at', { ascending: false }),
      supabase.from('pacientes').select('id, nombres, apellidos, cedula, telefono').eq('activo', true).order('nombres'),
      supabase.from('tratamientos').select('id, nombre, precio').eq('activo', true),
      supabase.from('productos').select('*').eq('activo', true),
      supabase.from('configuracion_consultorio').select('*').limit(1)
    ])
    setList(h.data || [])
    setPacs(p.data || [])
    setTrats(t.data || [])
    setProds(pr.data || [])
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
    if (!confirm(\`¿Eliminar el registro clínico \${factura}?\`)) return
    const { error } = await supabase.from('historial_clinico').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success(\`Registro \${factura} eliminado\`)
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
    const fac = editId ? list.find(x => x.id === editId)?.factura : \`CONS-\${Date.now().toString().slice(-6)}\`

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
      const { data: nuevaConsulta, error: err } = await supabase.from('historial_clinico').insert([payload]).select().single()
      error = err
    }

    if (error) return toast.error('Error al guardar: ' + error.message)

    toast.success(\`Consulta \${fac} \${editId ? 'actualizada' : 'registrada y cobrada'}\`)
    
    // ABRIR EL RECIBO SENIAT REAL AUTOMÁTICAMENTE
    const pacObj = pacs.find(p => p.id === form.paciente_id)
    setReciboModalData({
      ...payload,
      paciente_nombre: pacObj ? \`\${pacObj.nombres} \${pacObj.apellidos}\` : 'Paciente',
      paciente_cedula: pacObj?.cedula || 'V-00000000',
      paciente_telefono: pacObj?.telefono || '',
      doctor_nombre: 'Dr. Tratante'
    })

    setShowForm(false)
    setEditId(null)
    setDientesSel([])
    setForm({ paciente_id: '', tratamiento_id: '', diagnostico: '', procedimiento: '', monto_usd: 0, impuesto_id: '', pagado: true, metodo_pago: 'efectivo_usd' })
    load()
  }

  const filtered = list.filter(h =>
    \`\${h.pacientes?.nombres} \${h.pacientes?.apellidos} \${h.procedimiento} \${h.diagnostico} \${h.factura}\`.toLowerCase().includes(q.toLowerCase())
  )

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
            <button
              type="button"
              onClick={() => setAsistenteOpen(true)}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold py-1 px-3 rounded-xl flex items-center gap-1 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> ⚡ Asistente Clínico
            </button>
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
                {trats.map(t => <option key={t.id} value={t.id}>{t.nombre} — \${t.precio}</option>)}
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
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-500 block">Diagnóstico & Observaciones Clínicas</label>
              <VoiceDictation onTranscript={(text) => setForm(prev => ({ ...prev, diagnostico: prev.diagnostico ? prev.diagnostico + ' ' + text : text }))} />
            </div>
            <textarea className="input-field" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} placeholder="Detalles clínicos de la intervención..." rows={2} />
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span>\${subtotalUSD.toFixed(2)} USD</span></div>
            {taxPct > 0 && <div className="flex justify-between text-teal-400"><span>Impuesto ({taxPct}%):</span><span>\${taxUSD.toFixed(2)} USD</span></div>}
            <div className="flex justify-between items-center pt-1 border-t border-slate-700">
              <button 
                type="button" 
                onClick={() => setCalculadoraOpen(true)} 
                className="text-[11px] bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-teal-500/30"
              >
                💵 Calcular Cambio / Vuelto
              </button>
              <div className="text-right">
                <span className="text-sm font-bold text-teal-400">\${totalUSD.toFixed(2)} USD</span>
              </div>
            </div>
            <div className="flex justify-between text-slate-300"><span>Total en Bs. (BCV):</span><span>Bs. {(totalUSD * (rates?.VES || 1)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {editId ? 'Guardar Cambios' : 'Guardar y Emitir Factura'}</button>
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
                    onClick={() => setReciboModalData({
                      ...h,
                      paciente_nombre: \`\${h.pacientes?.nombres || ''} \${h.pacientes?.apellidos || ''}\`.trim(),
                      paciente_cedula: h.pacientes?.cedula || 'N/A',
                      paciente_telefono: h.pacientes?.telefono || '',
                      doctor_nombre: 'Dr. Tratante'
                    })}
                    className="btn-primary text-xs py-1 px-2.5 inline-flex items-center gap-1 font-bold"
                    title="Emitir Factura SENIAT / Excel"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Recibo / Factura
                  </button>
                  <button
                    onClick={() => setRecipeActivo({ paciente: h.pacientes, doctor: { nombres: 'Tratante', apellidos: '' } })}
                    className="btn-secondary text-xs py-1 px-2 inline-flex items-center gap-1 text-teal-700 hover:bg-teal-50"
                    title="Emitir Récipe Médico"
                  >
                    💊 Récipe
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

      {/* MODAL DE FACTURA SENIAT Y EXCEL NATIVO */}
      <ReciboModal
        isOpen={!!reciboModalData}
        onClose={() => setReciboModalData(null)}
        data={reciboModalData}
        consultorio={clinica}
      />

      <RecipeModal
        isOpen={!!recipeActivo}
        onClose={() => setRecipeActivo(null)}
        paciente={recipeActivo?.paciente}
        doctor={recipeActivo?.doctor}
        consultorio={clinica}
      />

      <CalculadoraCambioModal
        isOpen={calculadoraOpen}
        onClose={() => setCalculadoraOpen(false)}
        totalUSD={totalUSD}
        tasaVES={rates?.VES || 1}
        tasaCOP={rates?.COP || 1}
      />

      <AsistenteClinicoModal
        isOpen={asistenteOpen}
        onClose={() => setAsistenteOpen(false)}
        onApply={(data) => setForm(prev => ({ ...prev, procedimiento: data.procedimiento, diagnostico: data.diagnostico }))}
        pacienteTelefono={pacs.find(p => p.id === form.paciente_id)?.telefono}
        pacienteNombre={pacs.find(p => p.id === form.paciente_id)?.nombres}
      />
    </div>
  )
}
`, 'utf8');
console.log('✅ 2. Historial.jsx vinculado con ReciboModal SENIAT.');

console.log('\n🎉 ¡Todos los componentes han sido actualizados con su código real!');
