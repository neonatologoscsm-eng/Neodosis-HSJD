/* =====================================================================
   Calculadora de medicamentos · Clínica Santa María
   Núcleo de cálculo: replica las fórmulas de la planilla. Se usa tanto en
   la aplicación como en las pruebas automáticas (verificacion-csm/).
   ===================================================================== */
var CalcCSM = (function () {
  'use strict';
  const esNum = v => typeof v === 'number' && isFinite(v);

  /** Encabezado de las hojas: peso, edad, EG y superficie corporal. */
  function contexto(p) {
    const g = esNum(p.pesoG) ? p.pesoG : 0;
    const d = esNum(p.edadDias) ? p.edadDias : 0;
    const egDec = esNum(p.egSem) ? p.egSem + (esNum(p.egDia) ? p.egDia / 7 : 0) : 0;
    const kg = g / 1000;
    const egcDec = egDec + d / 7;
    /* Los criterios de las tablas hablan de semanas cumplidas, igual que la
       planilla, donde la EG se escribe como un número entero de semanas. */
    return {
      g, kg, d,
      eg: Math.trunc(egDec), egDec,
      egc: Math.trunc(egcDec),                       // ANTIBIOTICOS!I4 = TRUNC(F4+D4/7)
      egcDec,
      egcSem: Math.trunc(egcDec),
      egcD: (egcDec - Math.trunc(egcDec)) * 7,       // ANTIBIOTICOS!K4
      sc: ((kg * 4) + 7) / (90 + kg),                // =+((B3/1000*4)+7)/(90+B3/1000)
      hayPeso: g > 0, hayEdad: esNum(p.edadDias), hayEG: esNum(p.egSem)
    };
  }

  /** Bolos y orales: dosis por kilo o por superficie corporal. */
  function dosis(linea, ctx) {
    if (linea.base === 'kg') return (linea.k * ctx.g) / 1000;
    if (linea.base === 'sc') return ctx.sc * linea.k;
    return null;
  }

  /** Volumen a administrar según la forma de la fórmula original. */
  function volumen(linea, ctx, d) {
    switch (linea.vol) {
      case 'div':   return d == null ? null : d / linea.f;
      case 'mul':   return d == null ? null : d * linea.f;
      case 'igual': return (linea.kDirecta * ctx.g) / 1000;   // la celda repite el cálculo desde el peso
      case 'fijo':  return linea.f;
      case 'texto': return linea.f;
      default:      return null;
    }
  }

  function bolo(linea, ctx) {
    const d = dosis(linea, ctx);
    return { dosis: d, vol: volumen(linea, ctx, d) };
  }

  /** Infusiones (hoja MED BIC): preparación para 48 mL. */
  function infusion(linea, ctx, porCC) {
    const D = esNum(porCC) ? porCC : linea.porCC;
    const prep = (ctx.g * D * linea.factor) / 1000 / linea.div * 2;
    let vial = null, solvente = null;
    if (linea.vialTipo === 'mul') { vial = prep * linea.vialF; solvente = 48 - vial; }
    else if (linea.vialTipo === 'div') { vial = prep / linea.vialF; solvente = 48 - vial; }
    return { D, prep, vial, solvente };
  }

  /** Antibióticos: la fila que corresponde al paciente y las dosis de todas. */
  function antibiotico(m, ctx) {
    const filas = m.filas.map(f => ({
      crit: f.crit,
      coincide: !f.siempre && ctx.hayPeso && f.aplica(ctx),
      siempre: !!f.siempre,
      dosis: f.dosis.map(x => (x * ctx.g) / 1000),
      mgkg: f.dosis,
      intervalo: f.intervalo,
      dividir: f.dividir || null,
      porToma: f.dividir ? f.dosis.map(x => (x * ctx.g) / 1000 / f.dividir) : null
    }));
    let carga = null;
    if (m.carga) {
      const v = m.carga.valores.find(x => ctx.hayPeso && x.aplica(ctx)) || null;
      carga = v ? { crit: v.crit, mgkg: v.mgkg, dosis: (v.mgkg * ctx.g) / 1000 } : null;
    }
    return { filas, carga };
  }

  /** Hoja de urgencia: accesos y fármacos. */
  function urgencia(ctx) {
    return {
      accesos: URGENCIA_CSM.accesos.map(a => ({
        nombre: a.nombre, valor: ctx.hayPeso ? a.valor(ctx) : '—', unidad: a.unidad,
        medida: a.medida, calc: ctx.hayPeso ? a.calc(ctx) : null, medidaUnidad: a.medidaUnidad,
        xl: a.xl, xlMedida: a.xlMedida
      })),
      grupos: URGENCIA_CSM.grupos.map(gr => ({
        titulo: gr.titulo,
        farmacos: gr.farmacos.map(f => {
          const d = (f.k * ctx.g) / 1000;
          return Object.assign({}, f, { dosisCalc: d, volCalc: d / f.div });
        })
      }))
    };
  }

  /** DART: esquema de dexametasona de 10 días. */
  function dart(ctx, fechaInicio) {
    return DART_CSM.dias.map(x => {
      const mg = (ctx.g * x.mgkg) / 1000;
      let fecha = null;
      if (fechaInicio) {
        const f = new Date(fechaInicio + 'T00:00:00');
        if (!isNaN(f)) { f.setDate(f.getDate() + x.dia - 1); fecha = f; }
      }
      return { dia: x.dia, mgkg: x.mgkg, mg, mL: mg / DART_CSM.concentracion, fecha };
    });
  }

  /** Weaning a metadona: dosis diaria equivalente y esquema de bajada. */
  function weaning(ctx, opioide, dosisOpioide, fechaInicio) {
    const op = WEANING_CSM.opioides.find(o => o.nombre === opioide) || WEANING_CSM.opioides[0];
    const mcgHora = ctx.kg * dosisOpioide;                      // AB9 = peso/1000 * dosis
    const diaria = ((mcgHora / 1000) * 0.1) / op.divisor * 4;   // AB5 / AB6
    const esquemas = WEANING_CSM.esquemas.map(e => ({
      titulo: e.titulo,
      dias: e.dias.map(x => {
        let fecha = null;
        if (fechaInicio) {
          const f = new Date(fechaInicio + 'T00:00:00');
          if (!isNaN(f)) { f.setDate(f.getDate() + x.dia - 1); fecha = f; }
        }
        if (x.suspender) return { dia: x.dia, fecha, suspender: true };
        const total = diaria * x.factor;
        return { dia: x.dia, fecha, total, unitaria: total / x.entre, intervalo: x.intervalo };
      })
    }));
    return { mcgHora, diaria, esquemas };
  }

  /** Carga de glucosa según el volumen de fleboclisis. */
  function glucosa(ctx, volKg) {
    const v = esNum(volKg) ? volKg : GLUCOSA_CSM.volPorKg;
    const volDia = ctx.g * v / 1000;
    return {
      volKg: v, volDia, goteo: volDia / 24,
      sueros: GLUCOSA_CSM.sueros.map(s => ({
        nombre: s.nombre, carga: (v * s.pct / 100) / 1440 * 1000
      }))
    };
  }

  /** Gammaglobulina EV (misma hoja que la versión del HSJD). */
  function ig(ctx, presentacion, dosisKg) {
    const P = presentacion, D = dosisKg, g = ctx.g;
    const dosisTotal = (g * D) / 1000;
    const vol = P ? (dosisTotal * 100) / P : null;
    let v1 = null, v2 = null;
    if (P === 5000 && (D === 400 || D === 500)) { v1 = 0.015 * g * 60 / 1000; v2 = 0.04 * g * 60 / 1000; }
    else if (P === 5000 && D === 1000) { v1 = 0.03 * g * 60 / 1000; v2 = 0.06 * g * 60 / 1000; }
    else if (P === 10000 && (D === 400 || D === 500)) { v1 = 0.007 * g * 60 / 1000; v2 = 0.02 * g * 60 / 1000; }
    else if (P === 10000 && D === 1000) { v1 = 0.01 * g * 60 / 1000; v2 = 0.03 * g * 60 / 1000; }
    const total = (vol != null && v1 != null && v2 > 0) ? 1 + Math.max(0, (vol - v1) / v2) : null;
    return { dosis: dosisTotal, vol, v1, v2, total };
  }

  /** Aportes nutricionales de una fórmula a un volumen dado. */
  function nutricion(ctx, formula, volKg) {
    const c = formula.comp();
    const v = esNum(volKg) ? volKg : formula.volKg;
    const volDia = ctx.kg * v;
    return {
      volKg: v, volDia,
      calDia: volDia / 100 * c.cal,
      calKg: c.cal * v / 100,
      protKg: c.prot * v / 100,
      caKg: c.ca * v / 100,
      pKg: c.p * v / 100,
      feKg: c.fe * v / 100,
      naKg: (v / 100) * (c.na / 23),
      kKg: (v / 100) * (c.k / 39),
      znDia: c.zn * volDia / 100,
      vitDDia: c.vitD * volDia / 100,
      mct: [1, 2, 3].map(n => ({ pct: n, calKg: v * n * MCT_CAL_POR_ML / 100 + c.cal * v / 100 }))
    };
  }

  return { contexto, bolo, dosis, volumen, infusion, antibiotico, urgencia,
           dart, weaning, glucosa, ig, nutricion };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CalcCSM;
