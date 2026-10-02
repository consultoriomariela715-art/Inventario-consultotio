import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../context/CurrencyContext'
import { DollarSign, Percent, Save, Plus, RefreshCw, Building2, Trash2, Edit3, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TasasImpuestos() {
  const { rates, setRates, syncOfficialRates, loadingRates, loadData: reloadCurrency } = useCurrency()
  const [tab, setTab] = useState('clinica') // clinica | tasas
  const [ves, setVes] = useState(rates?.VES || 0)
  const [cop, setCop] = useState(rates?.COP || 0)
  const [taxes, setTaxes] = useState([])
  const [newTax, setNewTax] = useState({ nombre: '', porcentaje: '' })

  const [clinica, setClinica] = useState({
    nombre: '',
    rif_nit: '',
    telefono: '',
    email: '',
    direccion: '',
    mensaje_recibo: ''
  })

  useEffect(() => {
    if (rates) {
      setVes(rates.VES)
      setCop(rates.COP)
    }
  }, [rates])

  const loadClinicaData = async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        supabase.from('configuracion_consultorio').select('*').limit(1),
        supabase.from('impuestos').select('*').order('created_at', { ascending: true })
      ])

      if (cRes.data?.[0]) setClinica(cRes.data[0])
      if (iRes.data) setTaxes(iRes.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { loadClinicaData() }, [])

  const saveClinica = async e => {
    e.preventDefault()
    try {
      if (clinica.id) {
        await supabase.from('configuracion_consultorio').update(clinica).eq('id', clinica.id)
      } else {
        await supabase.from('configuracion_consultorio').insert([clinica])
      }
      toast.success('Membrete del consultorio actualizado')
    } catch (err) {
      toast.error('Error al guardar datos: ' + err.message)
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
      toast.success('Tasas oficiales guardadas')
    } catch (err) {
      localStorage.setItem('tasa_ves', String(numVes))
      localStorage.setItem('tasa_cop', String(numCop))
      setRates({ VES: numVes, COP: numCop })
      toast.success('Tasas guardadas localmente')
    }
  }

  const addTax = async (e) => {
    e.preventDefault()
    if (!newTax.nombre.trim() || newTax.porcentaje === '') {
      return toast.error('Ingresa nombre y porcentaje del impuesto')
    }

    try {
      const { error } = await supabase.from('impuestos').insert([{
        nombre: newTax.nombre.trim(),
        porcentaje: parseFloat(newTax.porcentaje) || 0,
        activo: true
      }])

      if (error) throw error

      toast.success(`Impuesto "${newTax.nombre}" agregado`)
      setNewTax({ nombre: '', porcentaje: '' })
      loadClinicaData()
      if (reloadCurrency) reloadCurrency()
    } catch (err) {
      toast.error('Error al agregar: ' + err.message)
    }
  }

  const deleteTax = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el impuesto "${nombre}"?`)) return

    try {
      const { error } = await supabase.from('impuestos').delete().eq('id', id)
      if (error) throw error

      toast.success(`Impuesto "${nombre}" eliminado`)
      setTaxes(prev => prev.filter(t => t.id !== id))
      if (reloadCurrency) reloadCurrency()
    } catch (err) {
      toast.error('No se pudo eliminar el impuesto: ' + err.message)
    }
  }

  const updateTaxPercentage = async (id, newPct) => {
    const parsed = parseFloat(newPct)
    if (isNaN(parsed) || parsed < 0) return

    try {
      const { error } = await supabase.from('impuestos').update({ porcentaje: parsed }).eq('id', id)
      if (error) throw error

      toast.success('Porcentaje actualizado')
      setTaxes(prev => prev.map(t => t.id === id ? { ...t, porcentaje: parsed } : t))
      if (reloadCurrency) reloadCurrency()
    } catch (err) {
      toast.error('Error al actualizar: ' + err.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Ajustes, Membrete & Tasas</h1>
          <p className="text-xs text-slate-400">Datos fiscales de los recibos, tasas BCV e impuestos configurables</p>
        </div>
        <button onClick={() => syncOfficialRates(true)} disabled={loadingRates} className="btn-primary">
          <RefreshCw className={`w-4 h-4 ${loadingRates ? 'animate-spin' : ''}`} /> Sincronizar BCV de Hoy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button 
          onClick={() => setTab('clinica')} 
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            tab === 'clinica' 
              ? 'border-teal-600 text-teal-700 dark:text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Datos del Consultorio (Membrete de Recibos)
        </button>
        <button 
          onClick={() => setTab('tasas')} 
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            tab === 'tasas' 
              ? 'border-teal-600 text-teal-700 dark:text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Tasas Oficiales & Impuestos
        </button>
      </div>

      {/* TAB 1: DATOS DEL CONSULTORIO */}
      {tab === 'clinica' && (
        <form onSubmit={saveClinica} className="card-box space-y-4 max-w-2xl">
          <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b dark:border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-teal-600" /> Información que aparecerá en Facturas, Recibos y Réipes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nombre del Consultorio / Razón Social *</label>
              <input required className="input-field font-bold" value={clinica.nombre || ''} onChange={e => setClinica({...clinica, nombre: e.target.value})} placeholder="Ej: Consultorio Odontológico Integral" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">RIF / Identificación Fiscal *</label>
              <input required className="input-field" value={clinica.rif_nit || ''} onChange={e => setClinica({...clinica, rif_nit: e.target.value})} placeholder="Ej: J-12345678-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Teléfono de Contacto</label>
              <input className="input-field" value={clinica.telefono || ''} onChange={e => setClinica({...clinica, telefono: e.target.value})} placeholder="+58 412-1234567" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Correo Electrónico</label>
              <input type="email" className="input-field" value={clinica.email || ''} onChange={e => setClinica({...clinica, email: e.target.value})} placeholder="contacto@consultorio.com" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Dirección Física</label>
            <input className="input-field" value={clinica.direccion || ''} onChange={e => setClinica({...clinica, direccion: e.target.value})} placeholder="Av. Principal, Edif. Médico, Piso 3" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Mensaje de Pie de Página en Recibos</label>
            <textarea rows={2} className="input-field" value={clinica.mensaje_recibo || ''} onChange={e => setClinica({...clinica, mensaje_recibo: e.target.value})} placeholder="¡Gracias por su visita! Cuidamos de su salud." />
          </div>

          <button type="submit" className="btn-primary w-full justify-center">
            <Save className="w-4 h-4" /> Guardar Membrete del Consultorio
          </button>
        </form>
      )}

      {/* TAB 2: TASAS E IMPUESTOS */}
      {tab === 'tasas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasas de Cambio */}
          <form onSubmit={saveRates} className="card-box space-y-4">
            <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" /> Tasas del Sistema
            </h2>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Tasa Bolívares (VES por 1 USD)</label>
              <input type="number" step="0.01" className="input-field font-bold text-teal-700 dark:text-teal-400" value={ves} onChange={e => setVes(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Tasa Pesos Colombianos (COP por 1 USD)</label>
              <input type="number" step="1" className="input-field font-bold text-amber-700 dark:text-amber-400" value={cop} onChange={e => setCop(e.target.value)} />
            </div>
            <button type="submit" className="btn-secondary w-full justify-center text-xs font-bold py-2.5">
              <Save className="w-4 h-4" /> Guardar Tasas de Cambio
            </button>
          </form>

          {/* Gestión de Impuestos con Borrado y Edición */}
          <div className="card-box space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
              <h2 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-teal-600" /> Impuestos Configurados ({taxes.length})
              </h2>
            </div>

            {/* Lista de impuestos */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {taxes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Sin impuestos registrados (Todas las consultas serán exentas)</p>
              ) : (
                taxes.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 gap-3 text-xs">
                    <span className="font-bold text-slate-800 dark:text-white flex-1 truncate">{t.nombre}</span>
                    
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number" 
                        step="0.1" 
                        className="input-field w-16 text-center font-mono font-bold text-teal-700 dark:text-teal-400 py-1 px-1.5 text-xs" 
                        defaultValue={t.porcentaje} 
                        onBlur={e => {
                          if (parseFloat(e.target.value) !== parseFloat(t.porcentaje)) {
                            updateTaxPercentage(t.id, e.target.value)
                          }
                        }}
                        title="Modifica el porcentaje y haz clic afuera para guardar"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => deleteTax(t.id, t.nombre)} 
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-lg transition-colors cursor-pointer" 
                      title={`Eliminar impuesto ${t.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Formulario para agregar nuevo impuesto */}
            <form onSubmit={addTax} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Agregar Nuevo Impuesto:</label>
              <div className="flex gap-2">
                <input 
                  required 
                  placeholder="Nombre (ej. IVA 16%)" 
                  className="input-field text-xs flex-1" 
                  value={newTax.nombre} 
                  onChange={e => setNewTax({...newTax, nombre: e.target.value})} 
                />
                <input 
                  required 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="100"
                  placeholder="%" 
                  className="input-field w-20 text-center text-xs font-bold font-mono" 
                  value={newTax.porcentaje} 
                  onChange={e => setNewTax({...newTax, porcentaje: e.target.value})} 
                />
                <button type="submit" className="btn-primary text-xs shrink-0 px-3">
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
