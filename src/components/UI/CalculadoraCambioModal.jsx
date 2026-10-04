import React, { useState } from 'react'
import { Calculator, X } from 'lucide-react'

export default function CalculadoraCambioModal({ isOpen, onClose, totalUSD = 0, tasaVES = 0, tasaCOP = 0 }) {
  const [montoRecibido, setMontoRecibido] = useState('')
  const [monedaPago, setMonedaPago] = useState('USD')

  if (!isOpen) return null

  const totalNum = Number(totalUSD) || 0
  const rateVES = Number(tasaVES) || 1
  const rateCOP = Number(tasaCOP) || 1
  const recibidoNum = Number(montoRecibido) || 0

  let recibidoEnUSD = 0
  if (monedaPago === 'USD') recibidoEnUSD = recibidoNum
  else if (monedaPago === 'VES') recibidoEnUSD = rateVES > 0 ? recibidoNum / rateVES : 0
  else if (monedaPago === 'COP') recibidoEnUSD = rateCOP > 0 ? recibidoNum / rateCOP : 0

  const vueltoUSD = Math.max(0, recibidoEnUSD - totalNum)
  const vueltoVES = vueltoUSD * rateVES
  const vueltoCOP = vueltoUSD * rateCOP
  const faltaPagar = Math.max(0, totalNum - recibidoEnUSD)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center font-bold">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span>Calculadora de Cambio / Vuelto</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total a Cobrar:</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">${totalNum.toFixed(2)} USD</p>
            </div>
            <div className="text-right text-[11px] font-semibold text-slate-500">
              <p>Bs. {(totalNum * rateVES).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
              {rateCOP > 1 && <p>$ {(totalNum * rateCOP).toLocaleString('es-CO')} COP</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-200 block">Monto recibido del paciente:</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                autoFocus
                className="input-field text-base font-bold text-teal-700 flex-1"
                placeholder="0.00"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
              />
              <select
                value={monedaPago}
                onChange={(e) => setMonedaPago(e.target.value)}
                className="input-field w-24 font-bold text-center bg-slate-100 dark:bg-slate-900"
              >
                <option value="USD">USD ($)</option>
                <option value="VES">Bs. (VES)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>
          </div>

          {monedaPago === 'USD' && (
            <div className="flex gap-1.5 justify-center">
              {[5, 10, 20, 50, 100].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setMontoRecibido(String(b))}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs cursor-pointer"
                >
                  ${b}
                </button>
              ))}
            </div>
          )}

          {recibidoNum > 0 && (
            <div className="pt-2 border-t">
              {faltaPagar > 0 ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded-xl text-center text-rose-700 font-bold">
                  Faltan: ${faltaPagar.toFixed(2)} USD (Bs. {(faltaPagar * rateVES).toLocaleString('es-VE', { minimumFractionDigits: 2 })})
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300 font-bold">
                    <span>Vuelto a entregar:</span>
                    <span className="text-xl">${vueltoUSD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400">
                    <span>En Bolívares (BCV):</span>
                    <span>Bs. {vueltoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={onClose} className="w-full btn-secondary justify-center text-xs">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
