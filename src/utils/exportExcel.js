import * as XLSX from "xlsx"

export function exportarAExcel(datos, nombreArchivo = "Reporte", nombreHoja = "Datos") {
  if (!datos || !datos.length) return alert("Sin datos para exportar")
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
  XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportarReciboAExcel(data, consultorio) {
  const config = consultorio || { nombre: "CONSULTORIO ODONTOLÓGICO", rif_nit: "J-00000000-0" }
  const total = Number(data.monto_usd || data.subtotal_usd || 0)
  const iva = Number(data.impuesto_usd || total * 0.16)
  const filas = [
    [config.nombre],
    [`RIF: ${config.rif_nit}`, "", `FACTURA N°: ${data.factura || "0001"}`],
    [`FECHA: ${data.fecha || new Date().toLocaleDateString("es-VE")}`],
    [],
    ["PACIENTE:", data.paciente_nombre || "General", "CÉDULA:", data.paciente_cedula || "N/A"],
    ["PROCEDIMIENTO:", data.procedimiento || "Consulta", "DIENTES:", data.dientes_tratados || "—"],
    [],
    ["", "", "", "SUBTOTAL USD:", `$${total.toFixed(2)}`],
    ["", "", "", "IVA 16% USD:", `$${iva.toFixed(2)}`],
    ["", "", "", "TOTAL USD:", `$${(total + iva).toFixed(2)}`]
  ]
  const ws = XLSX.utils.aoa_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Factura SENIAT")
  XLSX.writeFile(wb, `Factura_${data.factura || "001"}.xlsx`)
}
