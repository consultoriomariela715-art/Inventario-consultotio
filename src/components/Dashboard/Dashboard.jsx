import React, { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { useCurrency } from "../../context/CurrencyContext"
import { fmt } from "../../utils/helpers"
import PriceBox from "../UI/PriceBox"
import {
  Users, Calendar, ShoppingBag, AlertTriangle, ArrowUpRight,
  Clock, CheckCircle2, TrendingUp, Package, Stethoscope, ChevronRight,
  Gift, MessageCircle, DollarSign, Activity, Sparkles
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()
  const { rates } = useCurrency()
  const [stats, setStats] = useState({
    ingresosHoyUSD: 0,
    ingresosMesUSD: 0,
    citasHoy: 0,
    citasPendientes: 0,
    pacsTotal: 0,
    lowStockCount: 0,
    costoReabastecerUSD: 0
  })
  const [citasHoy, setCitasHoy] = useState([])
  const [alertasStock, setAlertasStock] = useState([])
  const [cumpleaneros, setCumpleaneros] = useState([])

  const loadDashboard = async () => {
    const today = new Date().toISOString().split("T")[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const [pRes, cRes, vHoyRes, vMesRes, hHoyRes, hMesRes, prodRes, allPacsRes] = await Promise.all([
      supabase.from("pacientes").select("id", { count: "exact", head: true }).eq("activo", true),
      supabase.from("citas").select("*, pacientes(nombres, apellidos, telefono), tratamientos(nombre, precio)").gte("fecha", `${today}T00:00:00`).lte("fecha", `${today}T23:59:59`).order("fecha"),
      supabase.from("ventas").select("total_usd").gte("created_at", `${today}T00:00:00`).eq("estado", "completada"),
      supabase.from("ventas").select("total_usd").gte("created_at", startOfMonth).eq("estado", "completada"),
      supabase.from("historial_clinico").select("monto_usd").gte("created_at", `${today}T00:00:00`).eq("pagado", true),
      supabase.from("historial_clinico").select("monto_usd").gte("created_at", startOfMonth).eq("pagado", true),
      supabase.from("productos").select("*").eq("activo", true),
      supabase.from("pacientes").select("id, nombres, apellidos, telefono, fecha_nacimiento").eq("activo", true)
    ])

    const ventasHoy = vHoyRes.data?.reduce((a, b) => a + Number(b.total_usd), 0) || 0
    const clinicaHoy = hHoyRes.data?.reduce((a, b) => a + Number(b.monto_usd), 0) || 0
    const ingresosHoy = ventasHoy + clinicaHoy

    const ventasMes = vMesRes.data?.reduce((a, b) => a + Number(b.total_usd), 0) || 0
    const clinicaMes = hMesRes.data?.reduce((a, b) => a + Number(b.monto_usd), 0) || 0
    const ingresosMes = ventasMes + clinicaMes

    const prods = prodRes.data || []
    const stockBajo = prods.filter(p => p.stock <= p.stock_minimo)
    const costoReponer = stockBajo.reduce((acc, p) => {
      const faltante = Math.max(0, p.stock_minimo - p.stock) + 5
      return acc + (faltante * (Number(p.precio_compra) || Number(p.precio_venta) * 0.6))
    }, 0)

    const citas = cRes.data || []
    const pendientes = citas.filter(c => c.estado === "programada" || c.estado === "en_curso").length

    setStats({
      ingresosHoyUSD: ingresosHoy,
      ingresosMesUSD: ingresosMes,
      citasHoy: citas.length,
      citasPendientes: pendientes,
      pacsTotal: pRes.count || 0,
      lowStockCount: stockBajo.length,
      costoReabastecerUSD: costoReponer
    })

    setCitasHoy(citas)
    setAlertasStock(stockBajo.slice(0, 6))

    // Cumpleañeros
    const hoy = new Date()
    const mesHoy = hoy.getMonth() + 1
    const diaHoy = hoy.getDate()
    const cumple = (allPacsRes.data || []).filter(p => {
      if (!p.fecha_nacimiento) return false
      const parts = p.fecha_nacimiento.split("-")
      if (parts.length < 3) return false
      return Number(parts[1]) === mesHoy && Math.abs(Number(parts[2]) - diaHoy) <= 3
    })
    setCumpleaneros(cumple)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const cambiarEstadoCita = async (id, estado) => {
    await supabase.from("citas").update({ estado }).eq("id", id)
    loadDashboard()
  }

  const felicitarWhatsApp = (p) => {
    const phone = (p.telefono || "").replace(/[^0-9]/g, "")
    const msg = `🎂 ¡Feliz Cumpleaños estimado/a *${p.nombres}*! 🎉\n\nDe parte de todo el equipo de su consultorio odontológico, le deseamos un maravilloso día lleno de bendiciones y motivos para sonreír. ¡Felicidades!`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  const fechaFormat = new Date().toLocaleDateString("es-VE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <div className="space-y-6">
      
      {/* Banner Principal de Bienvenida */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Panel de Control Clínico
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Bienvenida, Dra. Mariela 👋</h1>
          <p className="text-xs text-slate-300 font-medium capitalize">{fechaFormat}</p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 w-full md:w-auto">
          <Link to="/citas" className="btn-primary flex-1 md:flex-initial justify-center py-2.5">
            <Calendar className="w-4 h-4" /> Ver Agenda
          </Link>
          <Link to="/pos" className="btn-secondary flex-1 md:flex-initial justify-center py-2.5">
            <ShoppingBag className="w-4 h-4" /> Cobro Rápido
          </Link>
        </div>
      </div>

      {/* Tarjetas Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Hoy */}
        <div className="card-box bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-0 shadow-lg shadow-teal-600/20 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-teal-100 font-bold uppercase tracking-wider">Ingresos Hoy</p>
              <h3 className="text-2xl font-black mt-1">{fmt(stats.ingresosHoyUSD, "USD")}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <DollarSign className="w-6 h-6 text-teal-100" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/15 flex justify-between text-[11px] font-bold text-teal-100">
            <span>Bs. {fmt(stats.ingresosHoyUSD * rates.VES, "VES")}</span>
            <span>COP {fmt(stats.ingresosHoyUSD * rates.COP, "COP")}</span>
          </div>
        </div>

        {/* Citas de Hoy */}
        <div className="card-box flex items-center justify-between p-5">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Citas de Hoy</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.citasHoy}</h3>
            <p className="text-[11px] text-teal-600 font-bold mt-1">{stats.citasPendientes} pendientes</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center border border-teal-100 dark:border-teal-900/40">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Ingresos del Mes */}
        <div className="card-box flex items-center justify-between p-5">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ingresos del Mes</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{fmt(stats.ingresosMesUSD, "USD")}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Consultorio + Ventas</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Insumos Críticos */}
        <div className="card-box flex items-center justify-between p-5">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Insumos en Alerta</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{stats.lowStockCount}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Reponer: ~{fmt(stats.costoReabastecerUSD, "USD")}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center border border-rose-100 dark:border-rose-900/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cumpleañeros */}
      {cumpleaneros.length > 0 && (
        <div className="card-box bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-amber-300 dark:border-amber-800/60 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-extrabold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              🎉 Cumpleañeros de la Semana ({cumpleaneros.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {cumpleaneros.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{p.nombres} {p.apellidos}</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">🎂 {p.fecha_nacimiento}</p>
                </div>
                {p.telefono && (
                  <button onClick={() => felicitarWhatsApp(p)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <MessageCircle className="w-3.5 h-3.5" /> Felicitar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citas de Hoy y Almacén */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda */}
        <div className="lg:col-span-2 card-box space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" /> Pacientes en Agenda de Hoy
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Flujo de atención en tiempo real</p>
            </div>
            <Link to="/citas" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
              Ver Agenda <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {citasHoy.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">No hay citas programadas para el día de hoy</p>
              </div>
            ) : (
              citasHoy.map(c => {
                const hora = new Date(c.fecha).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
                return (
                  <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-center w-12">
                        <p className="font-black text-sm text-slate-800 dark:text-white">{hora}</p>
                        <span className="text-[10px] text-slate-400">{c.duracion_min || 30}m</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-white">{c.pacientes?.nombres} {c.pacientes?.apellidos}</p>
                        <p className="text-[11px] text-teal-600 font-semibold">{c.tratamientos?.nombre || "Consulta General"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        c.estado === "completada" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                        c.estado === "en_curso" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse" :
                        c.estado === "cancelada" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                      }`}>
                        {c.estado}
                      </span>

                      {c.estado === "programada" && (
                        <button onClick={() => cambiarEstadoCita(c.id, "en_curso")} className="btn-secondary text-xs py-1 px-3">
                          En Sillón ➔
                        </button>
                      )}
                      {c.estado === "en_curso" && (
                        <button onClick={() => cambiarEstadoCita(c.id, "completada")} className="btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terminar
                        </button>
                      )}
                      {c.estado === "completada" && (
                        <Link to="/historial" className="btn-primary text-xs py-1 px-3">
                          Cobrar $
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Alertas de Insumos */}
        <div className="card-box space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Insumos en Stock Bajo
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Materiales que requieren reposición</p>
          </div>

          <div className="space-y-2">
            {alertasStock.length === 0 ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold text-center">
                ✓ Todo el inventario está en niveles óptimos
              </div>
            ) : (
              alertasStock.map(p => (
                <div key={p.id} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{p.nombre}</p>
                    <span className="text-[10px] text-slate-400 font-medium">Mínimo sugerido: {p.stock_minimo}</span>
                  </div>
                  <div className="text-right">
                    <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">Stock: {p.stock}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link to="/inventario" className="w-full btn-secondary justify-center text-xs py-2.5 mt-2">
            <Package className="w-4 h-4" /> Ir a Almacén & Kardex
          </Link>
        </div>
      </div>
    </div>
  )
}
