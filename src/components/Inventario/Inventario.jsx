import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../context/CurrencyContext'
import { fmt } from '../../utils/helpers'
import PriceBox from '../UI/PriceBox'
import QRScanner from '../UI/QRScanner'
import EtiquetasModal from './EtiquetasModal'
import {
  Plus, AlertTriangle, QrCode, Printer, Search, RefreshCw,
  X, Save, Package, Calendar, Edit3, Trash2, ArrowDownLeft, Tag
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Inventario() {
  const { rates } = useCurrency()
  const [list, setList] = useState([])
  const [cats, setCats] = useState([])
  const [movs, setMovs] = useState([])
  const [tab, setTab] = useState('stock')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [etiquetasModal, setEtiquetasModal] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nombre: '', codigo: '', stock: 10, stock_minimo: 5,
    precio_compra: 0, precio_venta: '', categoria_id: '',
    ubicacion: '', fecha_vencimiento: '', lote: '', es_vendible: true
  })

  const [entradaForm, setEntradaForm] = useState({ producto_id: '', cantidad: 10, precio_compra: '', notas: '' })

  const load = async () => {
    try {
      const [pRes, cRes, mRes] = await Promise.all([
        supabase.from('productos').select('*').eq('activo', true).order('nombre'),
        supabase.from('categorias').select('*').order('nombre'),
        supabase.from('movimientos').select('*, productos(nombre, codigo, sku)').order('created_at', { ascending: false }).limit(50)
      ])

      const categoriasMap = {}
      if (cRes.data) {
        cRes.data.forEach(c => { categoriasMap[c.id] = c })
      }

      const mappedProds = (pRes.data || []).map(p => ({
        ...p,
        codigo: p.codigo || p.sku || 'SIN-COD',
        sku: p.sku || p.codigo || 'SIN-COD',
        stock: p.stock_actual ?? p.stock ?? 0,
        stock_actual: p.stock_actual ?? p.stock ?? 0,
        categorias: categoriasMap[p.categoria_id] || null
      }))

      setList(mappedProds)
      setCats(cRes.data || [])
      setMovs(mRes.data || [])
    } catch (err) {
      console.error('Error cargando inventario:', err)
      toast.error('Error al cargar datos del almacén')
    }
  }

  useEffect(() => { load() }, [])

  const generateCode = () => {
    const cat = cats.find(x => x.id === form.categoria_id)
    const prefix = cat ? cat.nombre.slice(0, 3).toUpperCase() : 'INS'
    const code = `OD-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
    setForm(prev => ({ ...prev, codigo: code }))
  }

  const saveProduct = async e => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    const codeGenerated = form.codigo || `OD-INS-${Math.floor(1000 + Math.random() * 9000)}`
    const stockNum = parseInt(form.stock) || 0
    const precioCompraNum = parseFloat(form.precio_compra) || 0
    const precioVentaNum = parseFloat(form.precio_venta) || 0
    const stockMinNum = parseInt(form.stock_minimo) || 5

    const payload = {
      nombre: form.nombre.trim(),
      codigo: codeGenerated,
      sku: codeGenerated,
      stock: stockNum,
      stock_actual: stockNum,
      stock_minimo: stockMinNum,
      precio_compra: precioCompraNum,
      precio_venta: precioVentaNum,
      categoria_id: form.categoria_id || null,
      ubicacion: form.ubicacion || null,
      lote: form.lote || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      es_vendible: form.es_vendible !== false,
      activo: true
    }

    try {
      if (editId) {
        const { error } = await supabase.from('productos').update(payload).eq('id', editId)
        if (error) throw error
        toast.success(`Insumo "${form.nombre}" actualizado`)
      } else {
        const { data: np, error } = await supabase.from('productos').insert([payload]).select().single()
        if (error) throw error

        if (stockNum > 0 && np) {
          await supabase.from('movimientos').insert({
            producto_id: np.id,
            tipo: 'entrada',
            cantidad: stockNum,
            costo_unitario: precioCompraNum,
            motivo: 'Inventario Inicial',
            referencia: 'Stock Inicial'
          }).catch(() => {})
        }
        toast.success(`Insumo "${form.nombre}" registrado`)
      }

      setShowForm(false)
      setEditId(null)
      setForm({
        nombre: '', codigo: '', stock: 10, stock_minimo: 5,
        precio_compra: 0, precio_venta: '', categoria_id: '',
        ubicacion: '', fecha_vencimiento: '', lote: '', es_vendible: true
      })
      load()
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item) => {
    setForm({
      nombre: item.nombre || '',
      codigo: item.codigo || item.sku || '',
      stock: item.stock_actual ?? item.stock ?? 0,
      stock_minimo: item.stock_minimo || 5,
      precio_compra: item.precio_compra || 0,
      precio_venta: item.precio_venta || 0,
      categoria_id: item.categoria_id || '',
      ubicacion: item.ubicacion || '',
      fecha_vencimiento: item.fecha_vencimiento || '',
      lote: item.lote || '',
      es_vendible: item.es_vendible !== false
    })
    setEditId(item.id)
    setShowForm(true)
    setTab('stock')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProduct = async (id, nombre) => {
    if (!confirm(`¿Desactivar el insumo "${nombre}" del almacén?`)) return
    try {
      const { error } = await supabase.from('productos').update({ activo: false }).eq('id', id)
      if (error) throw error
      toast.success(`Insumo "${nombre}" desactivado`)
      load()
    } catch (err) {
      toast.error('Error al desactivar: ' + err.message)
    }
  }

  const registrarEntrada = async e => {
    e.preventDefault()
    const prod = list.find(p => p.id === entradaForm.producto_id)
    if (!prod) return toast.error('Selecciona un insumo')
    const cant = parseInt(entradaForm.cantidad) || 0
    if (cant <= 0) return toast.error('Ingresa una cantidad válida')

    const stockActual = prod.stock_actual ?? prod.stock ?? 0
    const nuevo = stockActual + cant
    const costo = parseFloat(entradaForm.precio_compra) || prod.precio_compra || 0

    try {
      await supabase.from('productos').update({
        stock: nuevo,
        stock_actual: nuevo,
        precio_compra: costo
      }).eq('id', prod.id)

      await supabase.from('movimientos').insert({
        producto_id: prod.id,
        tipo: 'entrada',
        cantidad: cant,
        costo_unitario: costo,
        motivo: entradaForm.notas || 'Compra / Reabastecimiento',
        referencia: 'Entrada Almacén'
      })

      toast.success(`+${cant} unidades agregadas a ${prod.nombre}`)
      setEntradaForm({ producto_id: '', cantidad: 10, precio_compra: '', notas: '' })
      setTab('stock')
      load()
    } catch (err) {
      toast.error('Error al registrar entrada: ' + err.message)
    }
  }

  const hoy = new Date()
  const en30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)
  const vencimientos = list.filter(i => {
    if (!i.fecha_vencimiento) return false
    const fv = new Date(i.fecha_vencimiento)
    return fv <= en30
  })

  const alertas = list.filter(i => (i.stock_actual ?? i.stock ?? 0) <= (i.stock_minimo || 5))
  const filtered = list.filter(i => 
    `${i.nombre || ''} ${i.codigo || ''} ${i.sku || ''} ${i.ubicacion || ''}`.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Almacén & Kardex de Insumos</h1>
          <p className="text-xs text-slate-400">Control de stock real, etiquetas adhesivas, compras y trazabilidad</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setScanning(true)} className="btn-secondary">
            <QrCode className="w-4 h-4 text-teal-600" /> Escanear / Lector Láser
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setTab('stock') }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
            {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo Insumo</>}
          </button>
        </div>
      </div>

      {/* Alerta de Vencimientos */}
      {vencimientos.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{vencimientos.length} insumo(s) próximo(s) a vencer en los siguientes 30 días.</span>
          </div>
          <button onClick={() => setTab('vencimientos')} className="text-amber-900 dark:text-amber-200 underline text-[11px] font-bold">Ver lista</button>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        {[
          { id: 'stock', label: 'Stock General', count: list.length },
          { id: 'alertas', label: 'Stock Bajo', count: alertas.length, alert: alertas.length > 0 },
          { id: 'vencimientos', label: 'Vencimientos', count: vencimientos.length, alert: vencimientos.length > 0 },
          { id: 'kardex', label: 'Movimientos / Kardex', count: movs.length },
          { id: 'entrada', label: '📥 + Entrada de Mercancía' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== 'stock') setShowForm(false) }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              tab === t.id
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                t.alert ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={saveProduct} className="card-box space-y-4 border-2 border-teal-200 bg-teal-50/20">
          <h3 className="font-bold text-sm text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
            <Package className="w-4 h-4" /> {editId ? 'Editar Insumo / Material' : 'Registrar Nuevo Insumo en el Almacén'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Categoría</label>
              <select className="input-field" value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})}>
                <option value="">General / Sin Categoría</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Código / SKU *</label>
              <div className="flex gap-1">
                <input
                  required
                  className="input-field font-mono uppercase"
                  value={form.codigo}
                  onChange={e => setForm({...form, codigo: e.target.value.toUpperCase()})}
                  placeholder="OD-INS-1001"
                />
                <button type="button" onClick={generateCode} className="btn-secondary text-xs px-2.5" title="Generar código">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Nombre del Insumo / Material *</label>
              <input required className="input-field font-bold" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Anestesia Lidocaína 2%" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Stock {editId ? 'Actual' : 'Inicial'} *</label>
              <input required type="number" min="0" className="input-field font-bold text-teal-700" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Stock Mínimo Alerta</label>
              <input type="number" min="1" className="input-field" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: e.target.value})} />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Precio Compra ($)</label>
              <input type="number" step="0.01" min="0" className="input-field" value={form.precio_compra} onChange={e => setForm({...form, precio_compra: e.target.value})} />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Precio Venta POS ($) *</label>
              <input required type="number" step="0.01" min="0" className="input-field font-bold text-teal-700" value={form.precio_venta} onChange={e => setForm({...form, precio_venta: e.target.value})} placeholder="Ej: 5.00" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Ubicación / Gaveta</label>
              <input className="input-field" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Ej: Gaveta 2, Estante A" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Número de Lote</label>
              <input className="input-field" value={form.lote} onChange={e => setForm({...form, lote: e.target.value})} placeholder="LOT-2025-01" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Fecha de Vencimiento</label>
              <input type="date" className="input-field" value={form.fecha_vencimiento} onChange={e => setForm({...form, fecha_vencimiento: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : editId ? 'Actualizar Insumo' : 'Guardar en Almacén'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* TAB 1: STOCK GENERAL */}
      {tab === 'stock' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input placeholder="Buscar insumo por nombre, código o ubicación..." value={q} onChange={e => setQ(e.target.value)} className="input-field pl-10" />
          </div>

          <div className="card-box p-0 overflow-hidden border dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Insumo</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3 hidden sm:table-cell">Vencimiento</th>
                  <th className="p-3">Precio Venta</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filtered.map(i => {
                  const stockReal = i.stock_actual ?? i.stock ?? 0
                  const isLow = stockReal <= (i.stock_minimo || 5)
                  const isVencido = i.fecha_vencimiento && new Date(i.fecha_vencimiento) <= en30

                  return (
                    <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-teal-700 dark:text-teal-400">{i.codigo || i.sku}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 dark:text-white">{i.nombre}</p>
                        <p className="text-[10px] text-slate-400">{i.categorias?.nombre || 'General'} {i.ubicacion ? `• ${i.ubicacion}` : ''}</p>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`badge ${isLow ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'}`}>
                          {stockReal} unidades
                        </span>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        {i.fecha_vencimiento ? (
                          <span className={isVencido ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                            {new Date(i.fecha_vencimiento).toLocaleDateString('es-VE')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3">
                        <PriceBox usd={i.precio_venta} showAll />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEtiquetasModal(i)}
                            className="btn-primary text-xs py-1 px-2 flex items-center gap-1 font-bold shadow-sm"
                            title="Generar e Imprimir Etiquetas Adhesivas / Stickers"
                          >
                            <Tag className="w-3.5 h-3.5" /> Etiqueta QR
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(i)}
                            className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg"
                            title="Editar Insumo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(i.id, i.nombre)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg"
                            title="Desactivar Insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                      No hay insumos registrados. Haz clic en <strong>"+ Nuevo Insumo"</strong> para agregar uno.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALERTAS */}
      {tab === 'alertas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {alertas.map(i => (
            <div key={i.id} className="card-box border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">{i.nombre}</h4>
                <span className="badge bg-rose-100 text-rose-800">Crítico</span>
              </div>
              <p className="text-xs text-rose-600 font-bold">Stock Actual: {i.stock_actual ?? i.stock ?? 0} (Mínimo requerido: {i.stock_minimo})</p>
              <button onClick={() => { setEntradaForm({ producto_id: i.id, cantidad: 10, precio_compra: i.precio_compra || '', notas: 'Reabastecimiento urgente' }); setTab('entrada') }} className="btn-primary text-xs w-full justify-center py-1.5 mt-2">
                📥 Reponer Stock
              </button>
            </div>
          ))}
          {alertas.length === 0 && (
            <div className="col-span-full p-8 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold border border-emerald-200">
              ✓ Todo el inventario se encuentra en niveles óptimos de stock.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VENCIMIENTOS */}
      {tab === 'vencimientos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vencimientos.map(i => (
            <div key={i.id} className="card-box border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-1 text-xs">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">{i.nombre}</h4>
              <p className="text-slate-500">Lote: {i.lote || 'Sin Lote'}</p>
              <p className="text-amber-700 dark:text-amber-400 font-bold">Vence: {new Date(i.fecha_vencimiento).toLocaleDateString('es-VE')}</p>
              <p className="text-slate-400 text-[11px]">Stock en riesgo: {i.stock_actual ?? i.stock ?? 0} uds</p>
            </div>
          ))}
          {vencimientos.length === 0 && (
            <div className="col-span-full p-8 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold border border-emerald-200">
              ✓ No hay insumos próximos a vencer en los siguientes 30 días.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: KARDEX */}
      {tab === 'kardex' && (
        <div className="card-box p-0 overflow-hidden border dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Insumo</th>
                <th className="p-3 text-center">Tipo</th>
                <th className="p-3 text-right">Cantidad</th>
                <th className="p-3">Referencia / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {movs.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400">{new Date(m.created_at).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-white">{m.productos?.nombre || 'Insumo'}</td>
                  <td className="p-3 text-center">
                    <span className={`badge ${m.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span className={m.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}>
                      {m.tipo === 'entrada' ? `+${m.cantidad}` : `-${m.cantidad}`}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{m.motivo || m.referencia || '—'}</td>
                </tr>
              ))}
              {movs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Sin movimientos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: ENTRADA DE MERCANCÍA */}
      {tab === 'entrada' && (
        <form onSubmit={registrarEntrada} className="card-box space-y-4 max-w-xl">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> Registrar Entrada / Compra de Mercancía
          </h3>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Insumo a Reabastecer *</label>
            <select required className="input-field font-bold" value={entradaForm.producto_id} onChange={e => setEntradaForm({...entradaForm, producto_id: e.target.value})}>
              <option value="">Seleccionar insumo...</option>
              {list.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Stock actual: {p.stock_actual ?? p.stock ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Cantidad a Ingresar *</label>
              <input required type="number" min="1" className="input-field font-bold text-emerald-700" value={entradaForm.cantidad} onChange={e => setEntradaForm({...entradaForm, cantidad: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Costo Unitario Compra ($)</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00" value={entradaForm.precio_compra} onChange={e => setEntradaForm({...entradaForm, precio_compra: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Notas / Factura Proveedor</label>
            <input className="input-field" placeholder="Ej: Factura #1234 Proveedor Dental" value={entradaForm.notas} onChange={e => setEntradaForm({...entradaForm, notas: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-2.5">
            <Save className="w-4 h-4" /> Confirmar e Ingresar al Almacén
          </button>
        </form>
      )}

      {/* Modal Generador de Etiquetas Adhesivas */}
      <EtiquetasModal
        isOpen={!!etiquetasModal}
        onClose={() => setEtiquetasModal(null)}
        insumo={etiquetasModal}
      />

      {/* Escáner QR */}
      {scanning && (
        <QRScanner
          onScan={(c) => { setScanning(false); setQ(c); setTab('stock') }}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  )
}
