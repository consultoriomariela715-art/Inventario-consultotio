const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correcciones de código...\n');

// 1. Laboratorio.jsx
const labPath = path.join(__dirname, 'src/components/Laboratorio/Laboratorio.jsx');
if (fs.existsSync(labPath)) {
  let lab = fs.readFileSync(labPath, 'utf8');
  lab = lab.replace(/new Date\(t\.fecha_envio\)\.toLocaleDateString/g, "new Date(t.fecha_envio || t.created_at).toLocaleDateString");
  lab = lab.replace(/t\.tipo_trabajo:/g, "(t.tipo_trabajo || t.tipo_estudio || 'Trabajo'):");
  lab = lab.replace(
    "await supabase.from('laboratorio').insert([{ ...form, costo_usd: parseFloat(form.costo_usd) || 0, doctor_id: form.doctor_id || null }])",
    "await supabase.from('laboratorio').insert([{ ...form, costo_usd: parseFloat(form.costo_usd) || 0, doctor_id: form.doctor_id || null, estado: 'enviado', fecha_envio: new Date().toISOString() }])"
  );
  fs.writeFileSync(labPath, lab, 'utf8');
  console.log('✅ Laboratorio.jsx corregido.');
}

// 2. TasasImpuestos.jsx
const tasasPath = path.join(__dirname, 'src/components/Configuracion/TasasImpuestos.jsx');
if (fs.existsSync(tasasPath)) {
  let tasas = fs.readFileSync(tasasPath, 'utf8');
  tasas = tasas.replace(
    "const saveRates = async (e) => {\n    e.preventDefault()\n    const numVes = Number(ves)\n    const numCop = Number(cop)\n    await supabase.from('tasas_cambio').upsert({ moneda: 'VES', tasa: numVes, fuente: 'Manual' }, { onConflict: 'moneda' })\n    await supabase.from('tasas_cambio').upsert({ moneda: 'COP', tasa: numCop, fuente: 'Manual' }, { onConflict: 'moneda' })\n    setRates({ VES: numVes, COP: numCop })\n    toast.success('Tasas guardadas en Supabase')\n  }",
    `const saveRates = async (e) => {
    e.preventDefault()
    const numVes = Number(ves)
    const numCop = Number(cop)
    try {
      const { error: e1 } = await supabase.from('tasas_cambio').upsert({ moneda: 'VES', tasa: numVes, fuente: 'Manual' }, { onConflict: 'moneda' })
      const { error: e2 } = await supabase.from('tasas_cambio').upsert({ moneda: 'COP', tasa: numCop, fuente: 'Manual' }, { onConflict: 'moneda' })
      if (e1 || e2) throw e1 || e2
      setRates({ VES: numVes, COP: numCop })
      toast.success('Tasas guardadas en Supabase')
    } catch (err) {
      localStorage.setItem('tasa_ves', String(numVes))
      localStorage.setItem('tasa_cop', String(numCop))
      setRates({ VES: numVes, COP: numCop })
      toast.success('Tasas guardadas localmente')
    }
  }`
  );
  fs.writeFileSync(tasasPath, tasas, 'utf8');
  console.log('✅ TasasImpuestos.jsx corregido.');
}

// 3. Inventario.jsx
const invPath = path.join(__dirname, 'src/components/Inventario/Inventario.jsx');
if (fs.existsSync(invPath)) {
  let inv = fs.readFileSync(invPath, 'utf8');
  inv = inv.replace(/i\.codigo/g, "(i.codigo || i.sku)");
  inv = inv.replace(/i\.stock(?!\s*_)/g, "(i.stock ?? i.stock_actual)");
  inv = inv.replace(/p\.stock(?!\s*_)/g, "(p.stock ?? p.stock_actual)");
  inv = inv.replace(/prod\.stock(?!\s*_)/g, "(prod.stock ?? prod.stock_actual)");
  fs.writeFileSync(invPath, inv, 'utf8');
  console.log('✅ Inventario.jsx corregido.');
}

// 4. Doctores.jsx
const docPath = path.join(__dirname, 'src/components/Doctores/Doctores.jsx');
if (fs.existsSync(docPath)) {
  let doc = fs.readFileSync(docPath, 'utf8');
  if (!doc.includes('type="color"')) {
    doc = doc.replace(
      '<div className="flex gap-2">\n            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {editId ? \'Actualizar\' : \'Guardar Especialista\'}</button>',
      `<div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Color de Identificación</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                <span className="text-xs text-slate-500 font-mono">{form.color}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {editId ? 'Actualizar' : 'Guardar Especialista'}</button>`
    );
    fs.writeFileSync(docPath, doc, 'utf8');
    console.log('✅ Doctores.jsx corregido.');
  }
}
