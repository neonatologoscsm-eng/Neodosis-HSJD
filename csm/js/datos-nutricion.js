/* =====================================================================
   Calculadora de medicamentos · Clínica Santa María
   Hoja «Formulas»: aportes nutricionales por fórmula láctea.
   Composición por 100 mL y fortificantes tal como están en la planilla.
   ===================================================================== */

/* Composición por 100 mL (filas 45-54 de la hoja «Formulas»). */
const COMPOSICION_CSM = {
  'Alprem 14,4%':   { cal: 80,  prot: 2.9, hc: 8.4, lip: 4,    ca: 116,  p: 77,   na: 51,   k: 120,  fe: 1.8,  zn: 1.2,  vitD: 148 },
  'SSC 24':         { cal: 83,  prot: 2.4, hc: 8.4, lip: 4.41, ca: 146,  p: 81,   na: 35,   k: 105,  fe: 1.5,  zn: 1.2,  vitD: 120 },
  'SSC 30 cal':     { cal: 101, prot: 3,   hc: 7.8, lip: 6.7,  ca: 183,  p: 101,  na: 44,   k: 131,  fe: 1.8,  zn: 1.5,  vitD: 160 },
  'SNS 14,5%':      { cal: 75,  prot: 1.9, hc: 7.7, lip: 4.1,  ca: 78,   p: 46,   na: 25,   k: 106,  fe: 1.3,  zn: 0.9,  vitD: 52 },
  'G start 14,5%':  { cal: 80,  prot: 2.3, hc: 8.3, lip: 4.3,  ca: 87,   p: 50,   na: 40,   k: 83,   fe: 0.76, zn: 1,    vitD: 35 },
  'NAN 1 OP 13,6%': { cal: 67,  prot: 1.2, hc: 7.4, lip: 3.6,  ca: 43,   p: 24,   na: 21,   k: 67,   fe: 0.3,  zn: 0.5,  vitD: 32 },
  'Neocate 13,5%':  { cal: 67,  prot: 1.8, hc: 7.1, lip: 3.5,  ca: 77.1, p: 50.2, na: 29.3, k: 72.9, fe: 1,    zn: 0.73, vitD: 72 },
  'Neocate 16%':    { cal: 79,  prot: 2.1, hc: 8.4, lip: 4.1,  ca: 91,   p: 59,   na: 34,   k: 86.4, fe: 1.18, zn: 0.86, vitD: 85 },
  'Neocate 18%':    { cal: 89,  prot: 2.4, hc: 9.4, lip: 4.6,  ca: 102,  p: 66,   na: 38.6, k: 96,   fe: 1.3,  zn: 0.97, vitD: 96 },
  'LM':             { cal: 70,  prot: 1.4, hc: 7,   lip: 4.2,  ca: 28,   p: 15,   na: 15,   k: 58,   fe: 0.1,  zn: 0.3,  vitD: 0.2 }
};

/* Aporte de cada 1 % de fortificante (columnas R y S de la planilla). */
const FORTIFICANTES_CSM = {
  'Similac': { cal: 3.9, prot: 0.27, ca: 32.5, p: 17, na: 4,   k: 16,   fe: 0.09, zn: 0.3, vitD: 40 },
  'FM85':    { cal: 5,   prot: 0.4,  ca: 19,   p: 11, na: 9.2, k: 12.1, fe: 0.4,  zn: 0.2, vitD: 36 }
};

/** Leche materna fortificada: LM + n veces el aporte del fortificante. */
function lecheFortificada(pct, fortificante) {
  const lm = COMPOSICION_CSM['LM'], f = FORTIFICANTES_CSM[fortificante];
  const r = Object.assign({}, lm);
  ['cal', 'prot', 'ca', 'p', 'na', 'k', 'fe', 'zn', 'vitD'].forEach(x => { r[x] = lm[x] + pct * f[x]; });
  return r;
}

/* Opciones de la hoja, con el volumen por kilo que trae cada una. */
const FORMULAS_CSM = [
  { nombre: 'LM (leche materna)',   comp: () => COMPOSICION_CSM['LM'],        volKg: 150 },
  { nombre: 'LM + F 2% Similac',    comp: () => lecheFortificada(2, 'Similac'), volKg: 55 },
  { nombre: 'LM + F 3% Similac',    comp: () => lecheFortificada(3, 'Similac'), volKg: 150 },
  { nombre: 'LM + F 4% Similac',    comp: () => lecheFortificada(4, 'Similac'), volKg: 150 },
  { nombre: 'LM + F 5% Similac',    comp: () => lecheFortificada(5, 'Similac'), volKg: 150 },
  { nombre: 'LM + F 6% Similac',    comp: () => lecheFortificada(6, 'Similac'), volKg: 70 },
  { nombre: 'LM + F 2% FM85',       comp: () => lecheFortificada(2, 'FM85'),   volKg: 75 },
  { nombre: 'LM + F 3% FM85',       comp: () => lecheFortificada(3, 'FM85'),   volKg: 150 },
  { nombre: 'LM + F 4% FM85',       comp: () => lecheFortificada(4, 'FM85'),   volKg: 150 },
  { nombre: 'LM + F 5% FM85',       comp: () => lecheFortificada(5, 'FM85'),   volKg: 170 },
  { nombre: 'LM + F 6% FM85',       comp: () => lecheFortificada(6, 'FM85'),   volKg: 150 },
  { nombre: 'Alprem 14,4%',         comp: () => COMPOSICION_CSM['Alprem 14,4%'],   volKg: 150 },
  { nombre: 'SSC 24',               comp: () => COMPOSICION_CSM['SSC 24'],         volKg: 150 },
  { nombre: 'SSC 30 cal',           comp: () => COMPOSICION_CSM['SSC 30 cal'],     volKg: 160 },
  { nombre: 'SNS 14,5%',            comp: () => COMPOSICION_CSM['SNS 14,5%'],      volKg: 170 },
  { nombre: 'G start 14,5%',        comp: () => COMPOSICION_CSM['G start 14,5%'],  volKg: 140 },
  { nombre: 'NAN 1 OP 13,6%',       comp: () => COMPOSICION_CSM['NAN 1 OP 13,6%'], volKg: 150 },
  { nombre: 'Neocate 13,5%',        comp: () => COMPOSICION_CSM['Neocate 13,5%'],  volKg: 150 },
  { nombre: 'Neocate 16%',          comp: () => COMPOSICION_CSM['Neocate 16%'],    volKg: 150 },
  { nombre: 'Neocate 18%',          comp: () => COMPOSICION_CSM['Neocate 18%'],    volKg: 150 }
];

/* MCT: 1 mL aporta 8,5 cal (nota de la planilla). */
const MCT_CAL_POR_ML = 8.5;
