/* Emite, con las referencias de celda de la planilla, todos los valores que
   calcula la aplicación de Clínica Santa María para uno o varios pacientes.
   Uso: node valores_app.js '<json del paciente o arreglo>' */
const fs = require('fs'), path = require('path'), vm = require('vm');

const base = path.join(__dirname, '..', 'csm', 'js');
const fuente = ['calculo.js', 'datos-medicamentos.js', 'datos-tablas.js', 'datos-nutricion.js']
  .map(f => fs.readFileSync(path.join(base, f), 'utf8')).join('\n') +
  '\n;globalThis.__x = { CalcCSM, BOLOS_CSM, BIC_CSM, ORALES_CSM, ANTIBIOTICOS_CSM, URGENCIA_CSM, DART_CSM, WEANING_CSM, GLUCOSA_CSM };';
const ctxVm = vm.createContext({ module: { exports: {} } });
vm.runInContext(fuente, ctxVm);
const X = ctxVm.__x;
const celdas = JSON.parse(fs.readFileSync(path.join(__dirname, 'celdas.json'), 'utf8'));

/* Celdas de las tablas de ANTIBIOTICOS: dosis calculada por fila y esquema. */
const ANTI_CELDAS = {
  'Ampicilina':               [['E10','H10'],['E11','H11'],['E12','H12'],['E13','H13']],
  'Gentamicina':              [['E17'],['E18'],['E19'],['E20'],['E21'],['E22']],
  'Amikacina':                [['D28'],['G28'],['D29'],['G29'],['D30'],['G30'],['D31'],['G31'],['D32'],['G32']],
  'Cloxacilina':              [['F36'],['F37'],['F38'],['F39']],
  'Vancomicina':              [['G44'],['G45'],['G46'],['G47'],['G48'],['G49'],['G50'],['G51'],['G52'],['G53'],
                               ['G54'],['G55'],['G56'],['G57'],['G58']],
  'Cefotaxima':               [['E63'],['E64'],['E65']],
  'Piperacilina / Tazobactam':[['D79'],['D80'],['D81']],
  'Meropenem':                [['E87'],['E88'],['E89'],['E90'],['E91']],
  'Metronidazol':             [['F96'],['F97'],['F98'],['F99'],['F100']],
  'Linezolid':                [['E105'],['E106'],['E107']],
  'Azitromicina':             [['C112'],['C113'],['C114']],
  'Cotrimoxazol':             [['D119']],
  'Ciprofloxacino':           [['D123'],['D124']]
};
const ANTI_CARGA = { 'Vancomicina': ['E44','E49','E54'], 'Metronidazol': ['D96'] };

const entrada = JSON.parse(process.argv[2]);
const lote = Array.isArray(entrada) ? entrada : [entrada];
const res = lote.map(calcular);
console.log(JSON.stringify(Array.isArray(entrada) ? res : res[0]));

function calcular(p) {
  const ctx = X.CalcCSM.contexto(p);
  const out = {};

  /* MED BOLO */
  X.BOLOS_CSM.forEach((m, i) => m.lineas.forEach((l, j) => {
    const fila = celdas.bolos[i][j];
    const r = X.CalcCSM.bolo(l, ctx);
    if (r.dosis != null) out[`MED BOLO!E${fila}`] = r.dosis;
    if (r.vol != null && typeof r.vol === 'number') out[`MED BOLO!G${fila}`] = r.vol;
  }));

  /* MED BIC */
  X.BIC_CSM.forEach((m, i) => m.lineas.forEach((l, j) => {
    const fila = celdas.bic[i][j];
    const r = X.CalcCSM.infusion(l, ctx, undefined);
    out[`MED BIC!H${fila}`] = r.prep;
    if (r.vial != null) { out[`MED BIC!J${fila}`] = r.vial; out[`MED BIC!K${fila}`] = r.solvente; }
  }));

  /* MED ORALES */
  X.ORALES_CSM.forEach((m, i) => m.lineas.forEach((l, j) => {
    const fila = celdas.orales[i][j];
    const r = X.CalcCSM.bolo(l, ctx);
    if (r.dosis != null) out[`MED ORALES!F${fila}`] = r.dosis;
    if (typeof r.vol === 'number') out[`MED ORALES!H${fila}`] = r.vol;
  }));

  /* ANTIBIOTICOS */
  X.ANTIBIOTICOS_CSM.forEach(m => {
    const mapa = ANTI_CELDAS[m.nombre];
    if (!mapa) return;
    const r = X.CalcCSM.antibiotico(m, ctx);
    r.filas.forEach((f, i) => (mapa[i] || []).forEach((celda, k) => {
      const valor = m.porDia && f.dividir ? f.dosis[k] / f.dividir : f.dosis[k];
      if (valor != null) out['ANTIBIOTICOS!' + celda] = valor;
    }));
    const cargas = ANTI_CARGA[m.nombre];
    if (cargas && m.carga) {
      m.carga.valores.forEach((v, i) => {
        if (cargas[i]) out['ANTIBIOTICOS!' + cargas[i]] = (v.mgkg * ctx.g) / 1000;
      });
    }
  });

  /* Hoja de urgencia */
  const u = X.CalcCSM.urgencia(ctx);
  out['Hoja de Urgencia!E10'] = u.accesos[0].calc;
  out['Hoja de Urgencia!E11'] = u.accesos[1].calc;
  out['Hoja de Urgencia!E12'] = u.accesos[2].calc;
  const filasUrg = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  let n = 0;
  u.grupos.forEach(g => g.farmacos.forEach(f => {
    const fila = filasUrg[n++];
    out[`Hoja de Urgencia!F${fila}`] = f.dosisCalc;
    out[`Hoja de Urgencia!H${fila}`] = f.volCalc;
  }));

  /* DART */
  X.CalcCSM.dart(ctx, '').forEach((d, i) => {
    out[`DART!D${8 + i}`] = d.mg;
    out[`DART!F${8 + i}`] = d.mL;
  });

  /* C Glucosa */
  const gl = X.CalcCSM.glucosa(ctx, undefined);
  out['C Glucosa!D6'] = gl.volDia;
  out['C Glucosa!E6'] = gl.goteo;
  gl.sueros.forEach((s, i) => { out[`C Glucosa!D${8 + i}`] = s.carga; });

  /* Gammaglobulina */
  const ig = X.CalcCSM.ig(ctx, p.igP, p.igD);
  out['GGlobulina !E12'] = ig.dosis;
  out['GGlobulina !G12'] = ig.vol;
  out['GGlobulina !I12'] = ig.v1;
  out['GGlobulina !J12'] = ig.v2;

  /* Weaning */
  const w = X.CalcCSM.weaning(ctx, p.opioide, p.dosisOpioide, '');
  out['WEANING OPIODES!AB9'] = w.mcgHora;
  out['WEANING OPIODES!C10'] = w.diaria;
  const corto = w.esquemas[0].dias, largo = w.esquemas[1].dias;
  corto.forEach((d, i) => { if (!d.suspender) { out[`WEANING OPIODES!C${15 + i}`] = d.total;
                                                out[`WEANING OPIODES!D${15 + i}`] = d.unitaria; } });
  largo.forEach((d, i) => { if (!d.suspender) { out[`WEANING OPIODES!F${15 + i}`] = d.total;
                                                out[`WEANING OPIODES!G${15 + i}`] = d.unitaria; } });

  /* Encabezado */
  out['MED BOLO!D3'] = ctx.sc;
  return out;
}
