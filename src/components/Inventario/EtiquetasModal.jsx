import React, { useState } from 'react'
import { Printer, X, Tag, Grid } from 'lucide-react'

export default function EtiquetasModal({ isOpen, onClose, insumo, clinica }) {
  const [formato, setFormato] = useState('termica') // 'termica' (50x30mm) | 'hoja' (A4 - 24 etiquetas)
  const [cantidadCopias, setCantidadCopias] = useState(12)

  if (!isOpen || !insumo) return null

  const config = clinica || {
    nombre: 'Consultorio Dental & Médico Pro',
    telefono: '+58 412-000-0000'
  }

  const codigo = insumo.codigo || insumo.sku || 'SIN-CODIGO'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(codigo)}`

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=850,height=900')
    if (!printWin) return alert('Permite las ventanas emergentes para imprimir.')

    let contentHtml = ''

    if (formato === 'termica') {
      // Formato Sticker Térmico 50mm x 30mm (Para cajas, frascos o gavetas)
      contentHtml = `
        <style>
          @page { size: 50mm 30mm; margin: 0; }
          body {
            width: 50mm; height: 30mm; margin: 0; padding: 2mm;
            font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            color: #000; box-sizing: border-box; display: flex;
            flex-direction: column; justify-content: space-between;
          }
          .title { font-size: 8px; font-weight: 900; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .middle { display: flex; align-items: center; justify-content: space-between; gap: 2mm; margin: 1mm 0; }
          .qr { width: 14mm; height: 14mm; }
          .info { font-size: 6.5px; line-height: 1.2; }
          .sku { font-family: monospace; font-size: 8px; font-weight: 900; }
          .price { font-size: 9px; font-weight: 900; }
        </style>
        <body>
          <div class="title">${insumo.nombre}</div>
          <div class="middle">
            <img src="${qrUrl}" class="qr" alt="QR" />
            <div class="info">
              <div class="sku">${codigo}</div>
              ${insumo.lote ? '<div>Lote: ' + insumo.lote + '</div>' : ''}
              ${insumo.fecha_vencimiento ? '<div>Vence: ' + insumo.fecha_vencimiento + '</div>' : ''}
              ${insumo.ubicacion ? '<div>Ubic: ' + insumo.ubicacion + '</div>' : ''}
              <div class="price">$${Number(insumo.precio_venta || 0).toFixed(2)}</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 5.5px; color: #444;">${config.nombre}</div>
        </body>
      `
    } else {
      // Formato Pliego A4 con Grilla de Etiquetas Múltiples
      const totalCards = Array.from({ length: Number(cantidadCopias) || 12 })
      const cardsHtml = totalCards.map(() => `
        <div class="etiqueta-grid">
          <div class="etq-title">${insumo.nombre}</div>
          <div class="etq-body">
            <img src="${qrUrl}" class="etq-qr" alt="QR" />
            <div class="etq-info">
              <div class="etq-code">${codigo}</div>
              ${insumo.lote ? '<div>Lot: ' + insumo.lote + '</div>' : ''}
              ${insumo.fecha_vencimiento ? '<div>Venc: ' + insumo.fecha_vencimiento + '</div>' : ''}
              ${insumo.ubicacion ? '<div>' + insumo.ubicacion + '</div>' : ''}
              <div class="etq-price">$${Number(insumo.precio_venta || 0).toFixed(2)}</div>
            </div>
          </div>
          <div class="etq-foot">${config.nombre}</div>
        </div>
      `).join('')

      contentHtml = `
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; }
          .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
          .etiqueta-grid {
            border: 1px dashed #cbd5e1; border-radius: 6px; padding: 2.5mm; height: 32mm;
            box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;
          }
          .etq-title { font-size: 8.5px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1mm; }
          .etq-body { display: flex; align-items: center; justify-content: space-between; margin: 1mm 0; }
          .etq-qr { width: 15mm; height: 15mm; }
          .etq-info { font-size: 7px; line-height: 1.3; }
          .etq-code { font-family: monospace; font-size: 8px; font-weight: bold; }
          .etq-price { font-size: 9px; font-weight: bold; }
          .etq-foot { font-size: 6px; color: #64748b; text-align: right; }
        </style>
        <body>
          <div class="grid-container">
            ${cardsHtml}
          </div>
        </body>
      `
    }

    const fullHtml = `<!DOCTYPE html><html><head><title>Etiquetas - ${insumo.nombre}</title></head>${contentHtml}</html>`
    printWin.document.open()
    printWin.document.write(fullHtml)
    printWin.document.close()
    printWin.onload = () => { printWin.focus(); printWin.print() }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans text-xs">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
            <Tag className="w-4 h-4 text-teal-400" />
            <span>Generador de Etiquetas Adhesivas / QR</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selector de formato */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormato('termica')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                formato === 'termica'
                  ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Sticker Térmico (50x30mm)</p>
                <p className="text-[10px] text-slate-400">Para frascos, cajas individuales y gavetas</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormato('hoja')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                formato === 'hoja'
                  ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Pliego A4 (Grilla de 24)</p>
                <p className="text-[10px] text-slate-400">Para hojas de etiquetas adhesivas múltiples</p>
              </div>
            </button>
          </div>

          {/* Vista previa */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vista Previa de la Etiqueta:</p>
            
            <div className="bg-white text-slate-900 p-3 rounded-xl border border-slate-300 shadow-md w-64 space-y-1.5 font-sans">
              <p className="font-black text-xs uppercase truncate border-b pb-1">{insumo.nombre}</p>
              <div className="flex items-center justify-between gap-2">
                <img src={qrUrl} alt="QR" className="w-16 h-16 border rounded p-0.5 bg-white shrink-0" />
                <div className="text-[10px] space-y-0.5 font-medium leading-tight">
                  <p className="font-mono font-black text-xs text-teal-700">{codigo}</p>
                  {insumo.lote && <p>Lote: {insumo.lote}</p>}
                  {insumo.fecha_vencimiento && <p>Vence: {insumo.fecha_vencimiento}</p>}
                  {insumo.ubicacion && <p>Ubic: {insumo.ubicacion}</p>}
                  <p className="font-black text-sm text-slate-900">${Number(insumo.precio_venta || 0).toFixed(2)}</p>
                </div>
              </div>
              <p className="text-[8px] text-slate-400 text-right">{config.nombre}</p>
            </div>
          </div>

          {formato === 'hoja' && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">Cantidad en la hoja A4:</span>
              <select
                value={cantidadCopias}
                onChange={(e) => setCantidadCopias(e.target.value)}
                className="input-field w-24 text-center font-bold text-xs py-1"
              >
                <option value="6">6 etiquetas</option>
                <option value="12">12 etiquetas</option>
                <option value="18">18 etiquetas</option>
                <option value="24">24 etiquetas</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={onClose} className="btn-secondary text-xs">Cerrar</button>
            <button onClick={handlePrint} className="btn-primary text-xs flex items-center gap-1.5 font-bold">
              <Printer className="w-3.5 h-3.5" /> Imprimir Etiquetas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
