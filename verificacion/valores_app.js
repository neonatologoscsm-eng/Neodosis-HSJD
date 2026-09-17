/* Emite, en formato JSON y con las referencias de celda de la planilla,
   todos los valores que calcula la aplicación para un paciente dado.
   Uso: node valores_app.js '{"pesoG":1200,"edadDias":5,"egSem":28,"egDia":0,"igP":10000,"igD":400}' */
const fs = require('fs'), path = require('path'), vm = require('vm');

const base = path.join(__dirname, '..', 'js');
const fuente = ['calculo.js', 'data.js', 'antimicrobianos.js']
  .map(f => fs.readFileSync(path.join(base, f), 'utf8')).join('\n') +
  '\n;globalThis.__x = { NeoCalc, XL_FALSE, BOLOS_MEDICAMENTOS, BOLOS_OTROS, INFUSIONES, ANTIMICROBIANOS };';
const ctxVm = vm.createContext({ module: { exports: {} } });
vm.runInContext(fuente, ctxVm);
const { NeoCalc, XL_FALSE, BOLOS_MEDICAMENTOS, BOLOS_OTROS, INFUSIONES, ANTIMICROBIANOS } = ctxVm.__x;

/* Acepta un paciente o un arreglo de pacientes. */
const entrada = JSON.parse(process.argv[2]);
const lote = Array.isArray(entrada) ? entrada : [entrada];
const resultados = lote.map(calcular);
console.log(JSON.stringify(Array.isArray(entrada) ? resultados : resultados[0]));

function calcular(p) {
const ctx = NeoCalc.contexto(p);
const out = {};

/* --- bolos hoja Medicamentos (E/G 11..29) y Otros medicamentos (11..16) --- */
const celdasBolos = { 'Medicamentos': [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29],
                      'Otros medicamentos': [11,12,13,14,15,16] };
[['Medicamentos', BOLOS_MEDICAMENTOS], ['Otros medicamentos', BOLOS_OTROS]].forEach(([hoja, lista]) => {
  const filas = celdasBolos[hoja];
  let i = 0;
  lista.forEach(m => m.lineas.forEach(l => {
    const r = NeoCalc.bolo(l, ctx), f = filas[i++];
    out[`${hoja}!E${f}`] = r.dosis;
    if (r.vol != null) out[`${hoja}!G${f}`] = r.vol;
  }));
  if (i !== filas.length) throw new Error('desalineación de filas en ' + hoja);
});

/* --- infusiones (G34..G46 y G21..G25) --- */
let fMed = 34, fOtr = 21;
INFUSIONES.forEach(inf => {
  const r = NeoCalc.infusion(inf, ctx, undefined);
  out[`${inf.hoja}!G${inf.hoja === 'Medicamentos' ? fMed++ : fOtr++}`] = r.prep;
});

/* --- antimicrobianos: celdas por fármaco y esquema --- */
const MAPA = {
  'Ampicilina': [['Bacteriemia','E13','G13','J13','L13','N13'], ['Meningitis','F13','H13','K13','M13','O13']],
  'Amikacina': [[null,'E14','G14','J14','L14','N14']],
  'Azitromicina EV': [[null,'E15','G15','J15','L15',null]],
  'Azitromicina VO': [[null,null,null,null,'L16',null]],
  'Cefadroxilo': [['Profilaxis ITU','E18','G18','J18','L18','N18'], ['Tratamiento','F18','H18','K18','M18','O18']],
  'Cefazolina': [[null,'E19','G19','J19','L19','N19']],
  'Cefepime': [['Bacteriemia','E21','G21','J21','L21',null], ['Meningitis','F21','H21','K21','M21',null]],
  'Cefotaxima': [['Bacteriemia','E23','G23','J23','L23','N23'], ['Meningitis','F23','H23','K23','M23','O23']],
  'Ceftazidima': [['Bacteriemia','E25','G25','J25','L25','N25'], ['Meningitis','F25','H25','K25','M25','O25']],
  'Ciprofloxacino': [[null,'E26','G26','J26','L26',null]],
  'Ciprofloxacino VO': [[null,'E26',null,'J26',null,null]],
  'Cloxacilina': [['Bacteriemia','E29','G29','J29','L29','N29'], ['Meningitis','F29','H29','K29','M29','O29']],
  'Colistin': [[null,'E30','G30','J30','L30',null]],
  'Cotrimoxazol (en base a trimetoprim)': [['Stenotrophomona','E32','G32','J32','L32','N32'], ['Profilaxis ITU','F32','H32','K32','M32','O32']],
  'Ertapenem': [[null,'E33','G33','J33','L33',null]],
  'Gentamicina': [[null,'E34','G34','J34','L34','N34']],
  'Linezolid': [[null,'E35','G35','J35','L35',null]],
  'Meropenem': [['Bacteriemia','E37','G37','J37','L37','N37'], ['Meningitis','F37','H37','K37','M37','O37']],
  'Metronidazol': [['Carga','E39','G39',null,'L39','N39'], ['Mantención','F39','H39','K39','M39','O39']],
  'Metronidazol VO': [['Carga','E40','G40',null,'L40','N40'], ['Mantención','F40','H40','K40','M40','O40']],
  'Penicilina G': [['Sífilis',null,'G42',null,'L41','N41']],
  'Piperacilina / Tazobactam (en base a piperacilina)': [[null,'E43','G43','J43','L43','N43']],
  'Vancomicina': [['Bacteriemia','E45','G45','J44','L45','N45'], ['Meningitis','F45','H45','J44','M45','O45']],
  'Aciclovir': [[null,'E53','G53','J53','L53',null]],
  'Ganciclovir': [[null,'E54','G54','J54','L54',null]],
  'Nevirapina': [['Profilaxis','E56','G56',null,'L56','N56'], ['Tratamiento','F56','H56','K56','M56','O56']],
  'Oseltamivir': [[null,'E57','G57','J57','L57',null]],
  'Valganciclovir': [[null,'E58','G58','J58','L58','N58']],
  'Zidovudina EV': [[null,'E59','G59','J59','L59',null]],
  'Zidovudina VO': [[null,'E60','G60',null,'L60',null]],
  'Anfotericina B Deoxicolato': [[null,'E68','G68','J68','L68','N68']],
  'Anfotericina B Liposomal': [[null,'E69','G69','J69','L69','N69']],
  'Caspofungina': [[null,'E70','G70','J70','L70','N70']],
  'Fluconazol': [['Profilaxis','E72','G72',null,'L72','N72'], ['Tratamiento','F72','H72','K72','M72','O72']]
};

ANTIMICROBIANOS.forEach(m => {
  const filas = MAPA[m.nombre];
  if (!filas) throw new Error('sin mapa de celdas: ' + m.nombre);
  m.esquemas.forEach((e, i) => {
    const [, cDpk, cDosis, cInt, cSin, cCon] = filas[i];
    const r = NeoCalc.anti(m, e, ctx, XL_FALSE);
    const H = 'Antimicrobianos!';
    if (cDpk) out[H + cDpk] = r.nulo ? null : r.dpk;
    if (cDosis) out[H + cDosis] = r.dosis;
    if (cInt) out[H + cInt] = r.intervalo;
    if (cSin) out[H + cSin] = r.volSin;
    if (cCon) out[H + cCon] = r.volCon;
  });
});

/* --- inmunoglobulina y reanimación --- */
const g = NeoCalc.ig(ctx, p.igP, p.igD);
out['Inmunoglobulina!E12'] = g.dosis;
out['Inmunoglobulina!G12'] = g.vol;
out['Inmunoglobulina!I12'] = g.v1;
out['Inmunoglobulina!J12'] = g.v2;

const re = NeoCalc.reanimacion(ctx);
out['Reanimación!B12'] = re.tet;
out['Reanimación!B13'] = re.dist;
out['Reanimación!B17'] = re.car1;
out['Reanimación!C17'] = re.car2;

/* --- encabezado --- */
out['Medicamentos!I5'] = ctx.egc;
out['Medicamentos!K5'] = ctx.egcD;
out['Medicamentos!F6'] = ctx.sc;
out['Otros medicamentos!F6'] = ctx.sc2;

return out;
}
