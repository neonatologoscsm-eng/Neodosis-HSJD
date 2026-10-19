/* =====================================================================
   NeoDosis HSJD — núcleo de cálculo
   Funciones puras que replican las fórmulas de la planilla. Se usan tanto
   en la aplicación como en las pruebas automáticas (verificacion/).
   ===================================================================== */
var NeoCalc = (function () {
  'use strict';
  const esNum = v => typeof v === 'number' && isFinite(v);

  /** Encabezado de las hojas (celdas B6, D5, F5, I5, K5, F6). */
  function contexto(p) {
    const g = esNum(p.pesoG) ? p.pesoG : 0;
    const d = esNum(p.edadDias) ? p.edadDias : 0;
    const eg = esNum(p.egSem) ? p.egSem + (esNum(p.egDia) ? p.egDia / 7 : 0) : 0;
    const egc = eg + d / 7;                        // I5 = F5 + (D5/7)
    const kg = g / 1000;
    return {
      g, kg, d, eg, egc,
      egcD: (egc - Math.floor(egc)) * 7,           // K5
      egcSem: Math.floor(egc),
      sc: (0.05 * kg) + 0.05,                      // Medicamentos!F6 y Reanimación!F6
      sc2: ((kg * 4) + 7) / (90 + kg),             // Otros medicamentos!F6
      hayPeso: g > 0,
      hayEdad: esNum(p.edadDias),
      hayEG: esNum(p.egSem)
    };
  }

  /** Bolos: dosis = (mg/Kg · peso g)/1000 ; volumen = dosis / concentración. */
  function bolo(linea, ctx) {
    const dosis = (linea.porKg * ctx.g) / 1000;
    const vol = linea.vol ? linea.vol(dosis) : (linea.div ? dosis / linea.div : null);
    return { dosis, vol };
  }

  /** Infusiones: preparación para 24 mL = (peso g · dosis/cc · factor)/1000/div. */
  function infusion(inf, ctx, dosisPorCC) {
    const D = esNum(dosisPorCC) ? dosisPorCC : inf.porCC;
    return { D, prep: (ctx.g * D * inf.factor) / 1000 / inf.div };
  }

  /** Antimicrobianos: un esquema (bacteriemia, meningitis, carga, etc.). */
  function anti(m, e, ctx, XLF) {
    const crudo = e.dosis(ctx);
    const nulo = (crudo === XLF) || crudo === 'error' || !esNum(crudo);
    const dpk = nulo ? null : crudo;
    const dosis = nulo ? null : (dpk * ctx.g) / 1000;
    let intervalo = e.intervalo(ctx);
    if (intervalo === XLF) intervalo = null;
    let volSin = null, volCon = null;
    if (!e.volTxt && dosis != null) {
      volSin = e.volSin ? e.volSin(dosis) : (m.cSin ? dosis / m.cSin : null);
      volCon = e.volCon ? e.volCon(dosis) : (m.cCon ? dosis / m.cCon : null);
    }
    return { dpk, dosis, nulo, intervalo, volSin, volCon,
             volTxt: e.volTxt || null, unidad: e.unidad || 'mg' };
  }

  /** Inmunoglobulina EV (hoja «Inmunoglobulina»). */
  function ig(ctx, presentacion, dosisKg) {
    const P = presentacion, D = dosisKg, g = ctx.g;
    const dosis = (g * D) / 1000;                       // E12
    const vol = P ? (dosis * 100) / P : null;           // G12
    let v1 = null, v2 = null;                           // I12 / J12
    if (P === 5000 && (D === 400 || D === 500)) { v1 = 0.015 * g * 60 / 1000; v2 = 0.04 * g * 60 / 1000; }
    else if (P === 5000 && D === 1000) { v1 = 0.03 * g * 60 / 1000; v2 = 0.06 * g * 60 / 1000; }
    else if (P === 10000 && (D === 400 || D === 500)) { v1 = 0.007 * g * 60 / 1000; v2 = 0.02 * g * 60 / 1000; }
    else if (P === 10000 && D === 1000) { v1 = 0.01 * g * 60 / 1000; v2 = 0.03 * g * 60 / 1000; }
    /* El tiempo total no existe en la planilla: lo estima la aplicación. */
    const total = (vol != null && v1 != null && v2 > 0) ? 1 + Math.max(0, (vol - v1) / v2) : null;
    return { dosis, vol, v1, v2, total };
  }

  /** Hoja «Reanimación». */
  function reanimacion(ctx) {
    const g = ctx.g;
    return {
      tet: g > 2000 ? 3.5 : g < 1000 ? 2.5 : 3,   // =SI(B6>2000;3,5;SI(B6<1000;2,5;3))
      dist: (g / 1009) + 6,                       // =(B6/1009)+6
      car1: 0.5 * g / 1000,                       // =0,5*B6/1000
      car2: 2 * g / 1000                          // =2*B6/1000
    };
  }

  return { contexto, bolo, infusion, anti, ig, reanimacion };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = NeoCalc;
