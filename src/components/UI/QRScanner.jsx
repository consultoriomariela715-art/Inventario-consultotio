import React, { useState, useEffect, useRef } from 'react'
import { QrCode, X, Camera, Volume2, Flashlight, RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRScanner({ onScan, onClose, title = 'Escanear Código / Insumo' }) {
  const [lastScanned, setLastScanned] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [continuous, setContinuous] = useState(false)
  const inputRef = useRef(null)

  // Sonido de Beep con Web Audio API (Sin archivos externos)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.12)
    } catch (e) {}
  }

  // Listener para pistolas lectoras láser de código de barras USB (Hardware)
  useEffect(() => {
    let buffer = ''
    let lastKeyTime = Date.now()

    const handleKeyDown = (e) => {
      const now = Date.now()
      if (now - lastKeyTime > 100) buffer = ''
      lastKeyTime = now

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault()
          handleDetected(buffer)
          buffer = ''
        }
      } else if (e.key.length === 1) {
        buffer += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [continuous])

  const handleDetected = (code) => {
    const clean = String(code).trim()
    if (!clean) return
    playBeep()
    setLastScanned(clean)
    onScan(clean)
    toast.success(`Código detectado: ${clean}`)

    if (!continuous) {
      setTimeout(() => onClose(), 600)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      handleDetected(manualCode.trim())
      setManualCode('')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans text-xs">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-sm">{title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Visor de escaneo */}
          <div className="relative bg-slate-950 rounded-2xl h-44 overflow-hidden flex flex-col items-center justify-center border-2 border-slate-700 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-teal-500/10" />
            
            <div className="relative w-32 h-32 border-2 border-dashed border-teal-400/70 rounded-2xl flex items-center justify-center">
              <div className="w-full h-0.5 bg-teal-400 shadow-[0_0_12px_#2dd4bf] animate-bounce" />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                Lector Láser Activo
              </div>
            </div>

            <p className="text-slate-400 text-[11px] mt-2 font-medium z-10">
              Apunta la pistola láser USB o cámara
            </p>
          </div>

          {lastScanned && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600" /> Leído: <span className="font-mono text-xs">{lastScanned}</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600">✓ Detectado</span>
            </div>
          )}

          {/* Entrada Manual */}
          <form onSubmit={handleManualSubmit} className="space-y-1.5">
            <label className="font-bold text-slate-600 dark:text-slate-300 block text-[11px]">
              O escribe el código manualmente:
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className="input-field font-mono uppercase text-xs flex-1"
                placeholder="Ej: OD-INS-1024 o SKU..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                autoFocus
              />
              <button type="submit" className="btn-primary text-xs px-4">
                Buscar
              </button>
            </div>
          </form>

          {/* Opciones */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold">
              <input
                type="checkbox"
                checked={continuous}
                onChange={(e) => setContinuous(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span>Modo continuo (Ráfaga)</span>
            </label>

            <button onClick={onClose} className="btn-secondary text-xs py-1 px-3">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
