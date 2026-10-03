import React from "react"
const sup = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"]
const inf = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"]

export default function Odontograma({ selected = [], onChange = () => {}, readOnly = false }) {
  const current = Array.isArray(selected) ? selected : (selected ? String(selected).split(",").map(s=>s.trim()) : [])
  const toggle = (num) => {
    if (readOnly) return
    onChange(current.includes(num) ? current.filter(d=>d!==num) : [...current, num])
  }
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex justify-between items-center text-xs font-bold border-b pb-2">
        <span>🦷 Odontograma Dental FDI</span>
        <span className="text-teal-600 font-mono">{current.length ? current.join(", ") : "Ninguno"}</span>
      </div>
      <div className="space-y-2 text-center">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Arcada Superior</p>
          <div className="flex flex-wrap justify-center gap-1">
            {sup.map(num => (
              <button key={num} type="button" disabled={readOnly} onClick={()=>toggle(num)}
                className={`w-7 h-8 rounded-lg text-[10px] font-bold border flex flex-col items-center justify-center ${current.includes(num) ? "bg-teal-600 text-white border-teal-700 shadow" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"}`}>
                {num}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Arcada Inferior</p>
          <div className="flex flex-wrap justify-center gap-1">
            {inf.map(num => (
              <button key={num} type="button" disabled={readOnly} onClick={()=>toggle(num)}
                className={`w-7 h-8 rounded-lg text-[10px] font-bold border flex flex-col items-center justify-center ${current.includes(num) ? "bg-teal-600 text-white border-teal-700 shadow" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"}`}>
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
