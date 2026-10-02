const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correcciones de código...\n');

// 1. IMPUESTOS: Eliminar y Editar
const tasasPath = path.join(__dirname, 'src/components/Configuracion/TasasImpuestos.jsx');
if (fs.existsSync(tasasPath)) {
  let c = fs.readFileSync(tasasPath, 'utf8');
  if (!c.includes('deleteTax')) {
    c = c.replace(
      "import { DollarSign, Percent, Save, Plus, RefreshCw, Building2, CheckCircle2 } from 'lucide-react'",
      "import { DollarSign, Percent, Save, Plus, RefreshCw, Building2, CheckCircle2, Trash2, Edit3 } from 'lucide-react'"
    );
    c = c.replace(
      "const addTax = async (e) => {",
      `const deleteTax = async (id, nombre) => {
    if (!confirm(\`¿Eliminar el impuesto "\${nombre}"?\`)) return
    await supabase.from('impuestos').delete().eq('id', id)
    toast.success('Impuesto eliminado')
    const { data } = await supabase.from('impuestos').select('*')
    setTaxes(data || [])
    loadData()
  }

  const editTax = async (id, nuevoPorcentaje) => {
    await supabase.from('impuestos').update({ porcentaje: parseFloat(nuevoPorcentaje) }).eq('id', id)
    toast.success('Impuesto actualizado')
    const { data } = await supabase.from('impuestos').select('*')
    setTaxes(data || [])
    loadData()
  }

  const addTax = async (e) => {`
    );
    c = c.replace(
      `{taxes.map(t => (
                <div key={t.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-800">{t.nombre}</span>
                  <span className="font-mono bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">{t.porcentaje}%</span>
                </div>
              ))}`,
      `{taxes.map(t => (
                <div key={t.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl gap-2">
                  <span className="font-bold text-slate-800 flex-1">{t.nombre}</span>
                  <input type="number" step="0.1" className="input-field w-16 text-center text-xs py-1 font-mono font-bold text-teal-800" defaultValue={t.porcentaje} onBlur={e => { if (e.target.value !== String(t.porcentaje)) editTax(t.id, e.target.value) }} />
                  <span className="text-slate-400 text-[10px]">%</span>
                  <button onClick={() => deleteTax(t.id, t.nombre)} className="p-1 hover:bg-rose-50 text-rose-500 rounded" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}`
    );
    fs.writeFileSync(tasasPath, c, 'utf8');
    console.log('✅ 1. TasasImpuestos.jsx: Borrar y editar impuestos agregado.');
  }
}

// 2. VENTANA DE AYUDA FLOTANTE (HelpModal.jsx)
const uiDir = path.join(__dirname, 'src/components/UI');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

fs.writeFileSync(path.join(uiDir, 'HelpModal.jsx'), `import React, { useState } from 'react'
import { HelpCircle, X, ChevronRight, MessageCircle, BookOpen, Keyboard } from 'lucide-react'
import { Link } from 'react-router-dom'

const guias = {
  '/': { titulo: 'Panel Ejecutivo', tips: ['Vista general de ingresos, citas y alertas', 'Haz clic en "Ver Agenda" para ir a citas del día', 'Los números se animan al cargar'] },
  '/citas': { titulo: 'Agenda & Citas', tips: ['Selecciona fecha y hora para agendar', 'Cambia el estado: Programada → En Sillón → Completada', 'Usa "Recordar WhatsApp" para avisar al paciente', '📇 Carnet imprime tarjeta de cita'] },
  '/historial': { titulo: 'Historial & Cobros', tips: ['Selecciona paciente y tratamiento del catálogo', 'El precio se carga automáticamente', 'Usa 🎙️ Dictado para dictar el diagnóstico', '💵 Calculadora de Cambio calcula el vuelto', '⚡ Asistente Clínico autocompleta notas'] },
  '/planes': { titulo: 'Planes & Cuotas', tips: ['Crea planes a plazos para tratamientos largos', 'Registra abonos parciales', '⚖️ Comparador muestra opciones Estándar vs Premium', 'Envía recordatorios de pago por WhatsApp'] },
  '/pacientes': { titulo: 'Pacientes 360°', tips: ['Haz clic en un paciente para ver su expediente', 'Sube fotos clínicas (antes/después)', 'Firma consentimientos informados', 'Imprime el expediente completo'] },
  '/pos': { titulo: 'Punto de Venta', tips: ['Haz clic en un producto para agregarlo al carrito', 'Escanea códigos QR con el botón "Escanear QR"', '💵 Calculadora de Vuelto en el carrito'] },
  '/inventario': { titulo: 'Almacén & Kardex', tips: ['Pestañas: Stock, Alertas, Vencimientos, Kardex, Entrada', 'Genera códigos automáticos con el botón ↻', 'Imprime etiquetas QR para cada insumo'] },
  '/tratamientos': { titulo: 'Catálogo de Precios', tips: ['✏️ Lápiz amarillo para editar precio', '🗑️ Papelera roja para desactivar', 'Agrega insumos que se descuentan automáticamente'] },
  '/config': { titulo: 'Configuración', tips: ['Pestaña 1: Datos del membrete de recibos', 'Pestaña 2: Tasas BCV/COP e impuestos', 'Los impuestos se editan en línea y se borran con 🗑️'] },
}

export default function HelpModal() {
  const [open, setOpen] = useState(false)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  const guia = guias[currentPath] || { titulo: 'Ayuda General', tips: ['Navega por el menú lateral izquierdo', 'Usa Ctrl+K para buscar rápido', 'Usa Ctrl+M para modo oscuro'] }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg shadow-teal-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Ayuda y Soporte"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-end sm:justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <h3 className="font-bold text-sm">Ayuda: {guia.titulo}</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          <ul className="space-y-2">
            {guia.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <ChevronRight className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
            <p className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Keyboard className="w-3.5 h-3.5" /> Atajos de Teclado</p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg"><kbd className="font-mono bg-white dark:bg-slate-800 px-1 rounded border text-[10px]">Ctrl+K</kbd> Buscar</div>
              <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg"><kbd className="font-mono bg-white dark:bg-slate-800 px-1 rounded border text-[10px]">Ctrl+M</kbd> Modo Oscuro</div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex gap-2">
            <Link to="/faq" onClick={() => setOpen(false)} className="btn-secondary text-xs flex-1 justify-center">❓ Ver FAQ</Link>
            <a href="https://wa.me/584120000000?text=Hola%2C%20necesito%20soporte%20con%20OdontoCare" target="_blank" className="btn-primary bg-emerald-600 text-xs flex-1 justify-center"><MessageCircle className="w-3 h-3" /> Soporte</a>
          </div>
        </div>
      </div>
    </div>
  )
}
`);
console.log('✅ 2. HelpModal.jsx: Creado.');

// Integrar en Shell.jsx
const shellPath = path.join(__dirname, 'src/components/Layout/Shell.jsx');
if (fs.existsSync(shellPath)) {
  let shell = fs.readFileSync(shellPath, 'utf8');
  if (!shell.includes('HelpModal')) {
    shell = "import HelpModal from '../UI/HelpModal';\n" + shell;
    shell = shell.replace(
      '<GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />',
      '<GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />\n      <HelpModal />'
    );
    fs.writeFileSync(shellPath, shell, 'utf8');
    console.log('✅ 2b. HelpModal integrado en Shell.jsx.');
  }
}

// 3. POS.JSX: Corrección de stock y códigos
const posPath = path.join(__dirname, 'src/components/Ventas/POS.jsx');
if (fs.existsSync(posPath)) {
  let pos = fs.readFileSync(posPath, 'utf8');
  pos = pos.replace(/p\.stock(?!\s*_)/g, '(p.stock ?? p.stock_actual)');
  pos = pos.replace(/i\.stock(?!\s*_)/g, '(i.stock ?? i.stock_actual)');
  pos = pos.replace(/item\.stock(?!\s*_)/g, '(item.stock ?? item.stock_actual)');
  pos = pos.replace(/p\.codigo/g, '(p.codigo || p.sku)');
  fs.writeFileSync(posPath, pos, 'utf8');
  console.log('✅ 3. POS.jsx corregido.');
}

// 4. INVENTARIO.JSX: Corrección de stock y códigos
const invPath = path.join(__dirname, 'src/components/Inventario/Inventario.jsx');
if (fs.existsSync(invPath)) {
  let inv = fs.readFileSync(invPath, 'utf8');
  inv = inv.replace(/i\.stock(?!\s*_)/g, '(i.stock ?? i.stock_actual)');
  inv = inv.replace(/p\.stock(?!\s*_)/g, '(p.stock ?? p.stock_actual)');
  inv = inv.replace(/prod\.stock(?!\s*_)/g, '(prod.stock ?? prod.stock_actual)');
  inv = inv.replace(/i\.codigo/g, '(i.codigo || i.sku)');
  fs.writeFileSync(invPath, inv, 'utf8');
  console.log('✅ 4. Inventario.jsx corregido.');
}

// 5. CITAS.JSX: Corregir typo notes -> notas
const citasPath = path.join(__dirname, 'src/components/Consultorio/Citas.jsx');
if (fs.existsSync(citasPath)) {
  let citas = fs.readFileSync(citasPath, 'utf8');
  citas = citas.replace(/notes: ''/g, "notas: ''");
  fs.writeFileSync(citasPath, citas, 'utf8');
  console.log('✅ 5. Citas.jsx corregido.');
}

// 6. CAJACHICA.JSX: Eliminar gastos
const cajaPath = path.join(__dirname, 'src/components/CajaChica/CajaChica.jsx');
if (fs.existsSync(cajaPath)) {
  let caja = fs.readFileSync(cajaPath, 'utf8');
  if (!caja.includes('deleteGasto')) {
    caja = caja.replace("import {", "import { Trash2,");
    caja = caja.replace(
      "const saveGasto = async (e) => {",
      `const deleteGasto = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('gastos').delete().eq('id', id)
    toast.success('Gasto eliminado'); load()
  }

  const saveGasto = async (e) => {`
    );
    caja = caja.replace('<th className="p-3">Método</th></tr>', '<th className="p-3">Método</th><th className="p-3 text-right">Acción</th></tr>');
    caja = caja.replace('<td colSpan={5}', '<td colSpan={6}');
    caja = caja.replace(
      '<td className="p-3 text-slate-400">{g.metodo_pago}</td>\n              </tr>',
      `<td className="p-3 text-slate-400">{g.metodo_pago}</td>
                <td className="p-3 text-right"><button onClick={() => deleteGasto(g.id)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>`
    );
    fs.writeFileSync(cajaPath, caja, 'utf8');
    console.log('✅ 6. CajaChica.jsx: Eliminar gasto agregado.');
  }
}

// 7. LABORATORIO.JSX: Corregir fechas
const labPath = path.join(__dirname, 'src/components/Laboratorio/Laboratorio.jsx');
if (fs.existsSync(labPath)) {
  let lab = fs.readFileSync(labPath, 'utf8');
  lab = lab.replace(/new Date\(t\.fecha_envio\)/g, "new Date(t.fecha_envio || t.created_at)");
  lab = lab.replace(/t\.tipo_trabajo:/g, "(t.tipo_trabajo || t.tipo_estudio || 'Trabajo'):");
  fs.writeFileSync(labPath, lab, 'utf8');
  console.log('✅ 7. Laboratorio.jsx corregido.');
}

console.log('\n🎉 ¡Todos los archivos actualizados!');
