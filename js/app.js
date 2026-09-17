/* =====================================================================
   NeoDosis HSJD — aplicación
   Flujo en tres pasos: paciente → selección de fármacos → dosis.
   Los cálculos viven en js/calculo.js y los datos en js/data.js y
   js/antimicrobianos.js (réplica verificada de la planilla).
   ===================================================================== */
(function () {
'use strict';

/* ---------------------------------------------------------------- util */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esNum = v => typeof v === 'number' && isFinite(v);
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sinTildes = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const idHtml = t => sinTildes(t).replace(/[^a-z0-9]+/g, '-');

function num(v, dec) {
  if (!esNum(v)) return '—';
  return v.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function numDosis(v) {
  if (!esNum(v)) return '—';
  const a = Math.abs(v);
  return num(v, a < 1 ? 3 : a < 10 ? 2 : a < 100 ? 1 : 0);
}
const numVol = v => num(v, 2);

const ICONO_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/></svg>';
const ICONO_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/></svg>';
const ICONO_AVISO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"/></svg>';

/* Fórmulas originales, para el diálogo de auditoría. */
const FORMULAS = {};
let nFormula = 0;
function fx(titulo, lineas) {
  const utiles = lineas.filter(l => l && l[1]);
  if (!utiles.length) return '';
  const id = 'f' + (++nFormula);
  FORMULAS[id] = { titulo, lineas: utiles };
  return `<button type="button" class="fx" data-formula="${id}" title="Ver la fórmula original de la planilla">ƒx</button>`;
}

/* ------------------------------------------------------------- estado */
const LS = 'neodosis-hsjd-v2';
const estado = {
  paso: 1,
  peso: null, egSem: null, egDia: null, edad: null, fn: '',
  nombre: '', cupo: '', diagnostico: '',
  sel: [], infusiones: {}, igPresentacion: 10000, igDosis: 400,
  tema: ''
};
const guardar = () => { try { localStorage.setItem(LS, JSON.stringify(estado)); } catch (e) {} };
function restaurar() {
  try { const r = localStorage.getItem(LS); if (r) Object.assign(estado, JSON.parse(r)); } catch (e) {}
  if (!Array.isArray(estado.sel)) estado.sel = [];
}

const contexto = () => NeoCalc.contexto({
  pesoG: estado.peso, edadDias: estado.edad, egSem: estado.egSem, egDia: estado.egDia
});
const hayPeso = () => esNum(estado.peso) && estado.peso > 0;

function diasDesde(iso) {
  if (!iso) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const p = iso.split('-').map(Number);
  const fn = new Date(p[0], p[1] - 1, p[2]);
  if (isNaN(fn)) return null;
  return Math.round((hoy - fn) / 86400000);
}

/* ---------------------------------------------------------- catálogo */
const CATALOGO = [];
BOLOS_MEDICAMENTOS.forEach(m => CATALOGO.push({
  id: 'b|Medicamentos|' + m.nombre, tipo: 'bolo', grupo: 'Bolos',
  nombre: m.nombre, sub: m.conc + ' · ' + m.via, ref: m, hoja: 'Medicamentos'
}));
BOLOS_OTROS.forEach(m => CATALOGO.push({
  id: 'b|Otros medicamentos|' + m.nombre, tipo: 'bolo', grupo: 'Bolos',
  nombre: m.nombre, sub: m.conc + ' · ' + m.via, ref: m, hoja: 'Otros medicamentos'
}));
INFUSIONES.forEach(i => CATALOGO.push({
  id: 'i|' + i.hoja + '|' + i.nombre, tipo: 'infusion', grupo: 'Infusiones continuas',
  nombre: i.nombre, sub: i.rango, ref: i, alias: 'bic goteo perfusion'
}));
ANTIMICROBIANOS.forEach(m => CATALOGO.push({
  id: 'a|' + m.nombre, tipo: 'anti', grupo: m.grupo,
  nombre: m.nombre, sub: (m.concSin || '') + ' · ' + m.via, ref: m
}));
CATALOGO.push({
  id: 'e|ig', tipo: 'ig', grupo: 'Otros cálculos', nombre: 'Inmunoglobulina EV',
  sub: 'Dosis, volumen y velocidades de infusión', alias: 'igiv ig ev gammaglobulina'
});
CATALOGO.push({
  id: 'e|rea', tipo: 'rea', grupo: 'Otros cálculos', nombre: 'Reanimación',
  sub: 'N° de TET, distancia a la boca y cardioversión',
  alias: 'tet tubo endotraqueal intubacion cardioversion joules paro'
});
CATALOGO.forEach(c => {
  c.busca = sinTildes(c.nombre + ' ' + (c.sub || '') + ' ' + (c.alias || ''));
  /* Etiqueta corta para los chips: distingue el bolo de la infusión continua. */
  c.chip = c.nombre + (c.tipo === 'infusion' ? ' · infusión' : '');
});
const porId = id => CATALOGO.find(c => c.id === id);
const GRUPOS = ['Bolos', 'Infusiones continuas', 'Antibióticos', 'Antivirales', 'Antifúngicos', 'Otros cálculos'];

/* ====================================================================
   FICHAS DE RESULTADO
   ==================================================================== */
function fichaBolo(item, ctx) {
  const m = item.ref;
  const lineas = m.lineas.map(l => {
    const r = NeoCalc.bolo(l, ctx);
    return `
      <div class="linea">
        <div>
          ${l.etiqueta ? `<div class="linea__etq">${esc(l.etiqueta)}</div>` : ''}
          <div class="linea__det">${esc(l.dosisTxt)}${fx(m.nombre + (l.etiqueta ? ' · ' + l.etiqueta : ''),
            [['Dosis a administrar', l.xlDosis], ['Volumen a administrar', l.xlVol]])}</div>
        </div>
        <div class="valores">
          <span class="valor"><b>${numDosis(r.dosis)}</b><i>${esc(l.unidad)}</i></span>
          ${r.vol != null ? `<span class="valor valor--vol"><b>${numVol(r.vol)}</b><i>mL</i></span>` : ''}
        </div>
      </div>`;
  }).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(m.nombre)}</div>
        <div class="ficha__conc">${esc(m.conc)}</div></div>
      <span class="via">${esc(m.via)}</span>
    </header>
    <div class="ficha__cuerpo">${lineas}</div>
    <footer class="ficha__pie">
      <span><b>Diluir en:</b> ${esc(m.diluir)}</span>
      <span><b>Tiempo:</b> ${esc(m.tiempo)}</span>
    </footer>
  </article>`;
}

function fichaInfusion(item, ctx) {
  const inf = item.ref;
  const clave = inf.hoja + '|' + inf.nombre;
  const propia = estado.infusiones[clave];
  const r = NeoCalc.infusion(inf, ctx, esNum(propia) ? propia : undefined);
  const unidadCorta = inf.unidad.replace(/\s*\/\s*mL$/, '');
  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(inf.nombre)}</div>
        <div class="ficha__conc">Dosis recomendada: ${esc(inf.rango)}</div></div>
      <span class="via">Infusión</span>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="inf-${idHtml(clave)}">Dosis en 1 cc</label>
        <input type="number" id="inf-${idHtml(clave)}" data-infusion="${esc(clave)}"
               step="0.01" min="0" inputmode="decimal" value="${r.D}">
        <label>${esc(unidadCorta)}</label>
      </div>
      <div class="linea">
        <div>
          <div class="linea__etq">Preparación en 24 mL</div>
          <div class="linea__det">1 mL/h aporta ${numDosis(r.D)} ${esc(unidadCorta)}${
            fx(inf.nombre + ' · preparación en 24 mL', [['Preparación en 24 mL', inf.xl]])}</div>
        </div>
        <div class="valores">
          <span class="valor valor--vol"><b>${numDosis(r.prep)}</b><i>${esc(inf.prepUnidad)}</i></span>
        </div>
      </div>
    </div>
    <footer class="ficha__pie">
      <span><b>Preparar en:</b> ${esc(inf.preparar)}</span>
      <span><b>Completar hasta:</b> 24 mL</span>
    </footer>
  </article>`;
}

function fichaAnti(item, ctx) {
  const m = item.ref;
  const filas = m.esquemas.map(e => {
    const r = NeoCalc.anti(m, e, ctx, XL_FALSE);
    const inter = r.intervalo === null ? '<span class="nulo">sin resultado</span>'
      : esNum(r.intervalo) ? `<span class="intervalo">c/${r.intervalo} h</span>`
      : `<span class="intervalo">${esc(r.intervalo)}</span>`;
    let vSin = '—', vCon = '—';
    if (r.volTxt) vSin = `<span class="num">${esc(r.volTxt)}</span>`;
    else {
      if (r.volSin != null) vSin = `<span class="vol">${numVol(r.volSin)}</span> <span class="num">mL</span>`;
      if (r.volCon != null) vCon = `<span class="vol">${numVol(r.volCon)}</span> <span class="num">mL</span>`;
    }
    return `<tr>
      <td><span class="esq">${esc(e.label || 'Dosis')}</span>${fx(m.nombre + (e.label ? ' · ' + e.label : ''),
        [['Dosis por Kg', e.dosisXl], ['Intervalo', e.intervaloXl],
         ['Volumen sin restricción', e.volSinXl], ['Volumen con restricción', e.volConXl]])}</td>
      <td class="num" data-etq="Dosis por Kg">${r.nulo ? '<span class="nulo">sin resultado</span>' : numDosis(r.dpk) + ' ' + r.unidad + '/Kg'}</td>
      <td class="num fuerte" data-etq="Dosis a administrar">${r.dosis != null ? numDosis(r.dosis) + ' ' + r.unidad : '—'}</td>
      <td class="num" data-etq="Intervalo">${inter}</td>
      <td class="num" data-etq="Administrar (sin restricción)">${vSin}</td>
      <td class="num" data-etq="Administrar (con restricción)">${vCon}</td>
    </tr>`;
  }).join('');

  const alertas = (m.alertas || []).filter(a => a.cuando(ctx)).map(a =>
    `<div class="alerta">${ICONO_AVISO}<div><b>Revisar la fórmula de la planilla</b>${esc(a.texto)}</div></div>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(m.nombre)}</div>
        <div class="ficha__conc">Sin restricción de volumen: ${esc(m.concSin || '—')}${
          m.concCon ? ' · Con restricción: ' + esc(m.concCon) : ''}</div></div>
      <span class="via">${esc(m.via)}</span>
    </header>
    <div class="ficha__cuerpo">
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Esquema</th><th>Dosis por Kg</th><th>Dosis a administrar</th>
            <th>Intervalo</th><th>Administrar<br>sin restricción</th><th>Administrar<br>con restricción</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      ${m.nota ? `<p class="nota">${esc(m.nota)}</p>` : ''}
      ${alertas}
    </div>
    <footer class="ficha__pie">
      <span><b>Diluir en:</b> ${esc(m.diluir)}</span>
      <span><b>Tiempo de infusión:</b> ${esc(m.tiempo)}</span>
    </footer>
  </article>`;
}

function fichaIG(ctx) {
  const r = NeoCalc.ig(ctx, estado.igPresentacion, estado.igDosis);
  const horas = ['0', '0,5', '1', 'aviso1', '2', '3', '4', '5', '6', 'aviso2'];
  const avisos = {
    aviso1: 'Si paciente tolera bien la primera hora, subir goteo según volumen de horas posteriores',
    aviso2: 'En caso de que aparezcan reacciones adversas, disminuir la velocidad de infusión o suspender'
  };
  const filas = horas.map(h => avisos[h]
    ? `<tr class="aviso"><td colspan="8">${esc(avisos[h])}</td></tr>`
    : `<tr><td class="hora">${h}</td>${'<td class="libre"></td>'.repeat(7)}</tr>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Inmunoglobulina EV</div>
        <div class="ficha__conc">Vía exclusiva (central o periférica)</div></div>
      <span class="via">EV</span>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="igPres">Presentación</label>
        <select id="igPres">
          <option value="5000"${estado.igPresentacion === 5000 ? ' selected' : ''}>5.000 mg / 100 mL</option>
          <option value="10000"${estado.igPresentacion === 10000 ? ' selected' : ''}>10.000 mg / 100 mL</option>
        </select>
        <label for="igDosis">Dosis</label>
        <select id="igDosis">
          ${[400, 500, 1000].map(v => `<option value="${v}"${estado.igDosis === v ? ' selected' : ''}>${v} mg/Kg</option>`).join('')}
        </select>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Dosis a administrar</div>
          <div class="linea__det">${estado.igDosis} mg/Kg${fx('Inmunoglobulina · dosis', [['Dosis', '=(B6*D12)/1000']])}</div></div>
        <div class="valores"><span class="valor"><b>${numDosis(r.dosis)}</b><i>mg</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Volumen total</div>
          <div class="linea__det">Según presentación${fx('Inmunoglobulina · volumen', [['Volumen total', '=(E12*100)/B12']])}</div></div>
        <div class="valores"><span class="valor valor--vol"><b>${numVol(r.vol)}</b><i>mL</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Velocidad · primeros 60 min</div>
          <div class="linea__det">${fx('Inmunoglobulina · velocidad inicial',
            [['Primeros 60 min', '=SI(Y(B12=5000;O(D12=400;D12=500));0,015*B6*60/1000; … ;"ERROR")']])}</div></div>
        <div class="valores"><span class="valor valor--vol"><b>${num(r.v1, 1)}</b><i>mL/h</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Velocidad · horas posteriores</div>
          <div class="linea__det">${fx('Inmunoglobulina · velocidad posterior',
            [['Horas posteriores', '=SI(Y(B12=5000;O(D12=400;D12=500));0,04*B6*60/1000; … ;"ERROR")']])}</div></div>
        <div class="valores"><span class="valor valor--vol"><b>${num(r.v2, 1)}</b><i>mL/h</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Tiempo total estimado</div>
          <div class="linea__det">Calculado por la app; la planilla deja esta casilla para completar a mano</div></div>
        <div class="valores"><span class="valor"><b>${num(r.total, 1)}</b><i>h</i></span></div>
      </div>

      <p class="nota">Control de signos vitales durante la infusión</p>
      <div class="tabla-scroll">
        <table class="registro">
          <thead><tr><th>Hora</th><th>PA</th><th>PAM</th><th>FC</th><th>FR</th><th>Sat. O₂</th><th>T°</th><th>Obs.</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="tabla-scroll">
        <table class="registro" style="margin-top:.7rem">
          <tbody>
            <tr><td class="hora">Vía de administración (exclusiva)</td><td class="libre">central / periférica</td></tr>
            <tr><td class="hora">Fecha de vencimiento</td><td class="libre"></td></tr>
            <tr><td class="hora">Lote</td><td class="libre"></td></tr>
            <tr><td class="hora">Observaciones</td><td class="libre"></td></tr>
          </tbody>
        </table>
      </div>
      <div class="firmas"><div>Firma Médico Tratante</div><div>Firma Matrón/a encargado/a</div></div>
    </div>
  </article>`;
}

function fichaReanimacion(ctx) {
  const r = NeoCalc.reanimacion(ctx);
  const adr = BOLOS_MEDICAMENTOS.find(m => m.nombre === 'Adrenalina');
  const lineasAdr = adr.lineas.map(l => {
    const b = NeoCalc.bolo(l, ctx);
    return `<div class="linea">
      <div><div class="linea__etq">Adrenalina ${esc(l.etiqueta)}</div>
        <div class="linea__det">${esc(l.dosisTxt)} · 0,1 mg/mL</div></div>
      <div class="valores">
        <span class="valor"><b>${numDosis(b.dosis)}</b><i>mg</i></span>
        <span class="valor valor--vol"><b>${numVol(b.vol)}</b><i>mL</i></span>
      </div></div>`;
  }).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Reanimación</div>
        <div class="ficha__conc">Según peso</div></div>
    </header>
    <div class="ficha__cuerpo">
      <div class="linea">
        <div><div class="linea__etq">N° TET (diámetro interno)</div>
          <div class="linea__det">&gt; 2.000 g → 3,5 · 1.000–2.000 g → 3 · &lt; 1.000 g → 2,5${
            fx('N° TET', [['Diámetro interno', '=SI(B6>2000;3,5;SI(B6<1000;2,5;3))']])}</div></div>
        <div class="valores"><span class="valor"><b>${num(r.tet, 1)}</b><i>mm</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Distancia a la boca</div>
          <div class="linea__det">Fijación al labio${fx('Distancia a la boca', [['Fijación al labio', '=(B6/1009)+6']])}</div></div>
        <div class="valores"><span class="valor"><b>${num(r.dist, 1)}</b><i>cm</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Cardioversión sincronizada</div>
          <div class="linea__det">1ª descarga 0,5 J/Kg · 2ª descarga 2 J/Kg${
            fx('Cardioversión', [['1ª descarga', '=0,5*B6/1000'], ['2ª descarga', '=2*B6/1000']])}</div></div>
        <div class="valores">
          <span class="valor"><b>${num(r.car1, 1)}</b><i>J</i></span>
          <span class="valor"><b>${num(r.car2, 1)}</b><i>J</i></span>
        </div>
      </div>
      ${lineasAdr}
      <div class="alerta">${ICONO_AVISO}<div><b>Nota de la planilla</b>
        La fórmula de la distancia a la boca divide el peso por 1.009 en vez de 1.000 (regla peso en Kg + 6);
        la diferencia es menor a 0,03 cm.</div></div>
    </div>
  </article>`;
}

/* ====================================================================
   PASOS
   ==================================================================== */
function pintarDerivados() {
  const ctx = contexto();
  const d = [];
  if (hayPeso()) d.push(`<span class="dato dato--clave"><span>Peso</span><b>${num(ctx.kg, 3)} Kg</b></span>`);
  if (esNum(estado.edad)) d.push(`<span class="dato"><span>Edad</span><b>${estado.edad} días</b></span>`);
  if (esNum(estado.egSem)) {
    d.push(`<span class="dato dato--clave"><span>EG corregida</span><b>${ctx.egcSem} + ${Math.round(ctx.egcD)} d</b></span>`);
  }
  if (hayPeso()) d.push(`<span class="dato"><span>Superficie corporal</span><b>${num(ctx.sc, 2)} m²</b></span>`);
  $('#derivados').innerHTML = d.join('');
}

function pintarLista() {
  const q = sinTildes($('#inBuscar').value.trim());
  const coinciden = CATALOGO.filter(c => !q || c.busca.includes(q));

  /* chips de lo ya seleccionado */
  const cont = $('#seleccionados');
  if (estado.sel.length) {
    cont.hidden = false;
    cont.innerHTML = estado.sel.map(id => {
      const c = porId(id); if (!c) return '';
      return `<button type="button" class="chip" data-quitar="${esc(id)}">${esc(c.chip)}${ICONO_X}</button>`;
    }).join('') + `<button type="button" class="chip chip--vaciar" data-vaciar="1">Quitar todos</button>`;
  } else {
    cont.hidden = true; cont.innerHTML = '';
  }

  if (!coinciden.length) {
    $('#lista').innerHTML = `<p class="vacio">Sin resultados para «${esc($('#inBuscar').value.trim())}».</p>`;
    return;
  }

  const html = GRUPOS.map(g => {
    const items = coinciden.filter(c => c.grupo === g);
    if (!items.length) return '';
    const todos = items.every(c => estado.sel.includes(c.id));
    return `
      <div class="lista__grupo">
        <h3>${esc(g)}</h3>
        <button type="button" class="boton boton--texto" data-grupo="${esc(g)}" data-marcar="${todos ? '0' : '1'}">
          ${todos ? 'Quitar todos' : 'Seleccionar todos'}
        </button>
      </div>
      ${items.map(c => {
        const marcada = estado.sel.includes(c.id);
        return `<button type="button" class="opcion${marcada ? ' is-marcada' : ''}" data-id="${esc(c.id)}"
                  aria-pressed="${marcada}">
          <span class="opcion__caja">${ICONO_CHECK}</span>
          <span class="opcion__txt">
            <span class="opcion__nombre">${esc(c.nombre)}</span>
            <span class="opcion__sub">${esc(c.sub || '')}</span>
          </span>
        </button>`;
      }).join('')}`;
  }).join('');
  $('#lista').innerHTML = html;
}

function pintarResultados() {
  const ctx = contexto();
  const sel = CATALOGO.filter(c => estado.sel.includes(c.id));

  const datos = [];
  datos.push(`<span><span>Peso</span> <b>${num(ctx.g, 0)} g</b></span>`);
  if (esNum(estado.egSem)) datos.push(`<span><span>EG corregida</span> <b>${ctx.egcSem} + ${Math.round(ctx.egcD)} d</b></span>`);
  if (esNum(estado.edad)) datos.push(`<span><span>Edad</span> <b>${estado.edad} d</b></span>`);
  if (estado.nombre) datos.unshift(`<span><span>Paciente</span> <b>${esc(estado.nombre)}</b></span>`);
  if (estado.cupo) datos.push(`<span><span>Cupo</span> <b>${esc(estado.cupo)}</b></span>`);
  $('#resumen').innerHTML = `<div class="resumen__datos">${datos.join('')}</div>
    <button type="button" class="boton boton--texto" id="btnEditarPaciente">Editar datos</button>`;

  const faltan = sel.some(c => c.tipo === 'anti') && (!esNum(estado.egSem) || !esNum(estado.edad));
  const aviso = faltan
    ? `<div class="alerta">${ICONO_AVISO}<div><b>Faltan datos</b>
       Los antimicrobianos ajustan dosis e intervalo según la EG corregida y la edad cronológica.
       Sin esos datos los valores mostrados no son confiables.</div></div>` : '';

  const bloques = GRUPOS.map(g => {
    const items = sel.filter(c => c.grupo === g);
    if (!items.length) return '';
    const fichas = items.map(c =>
      c.tipo === 'bolo' ? fichaBolo(c, ctx) :
      c.tipo === 'infusion' ? fichaInfusion(c, ctx) :
      c.tipo === 'anti' ? fichaAnti(c, ctx) :
      c.tipo === 'ig' ? fichaIG(ctx) : fichaReanimacion(ctx)).join('');
    return `<h3 class="seccion">${esc(g)}</h3>${fichas}`;
  }).join('');

  $('#resultados').innerHTML = aviso + (bloques || `<p class="vacio">No hay fármacos seleccionados.</p>`) + `
    <div class="acciones">
      <button type="button" class="boton boton--contorno" id="btnEditarSeleccion">Añadir o quitar fármacos</button>
      <button type="button" class="boton boton--texto" id="btnImprimir2">Imprimir</button>
      <button type="button" class="boton boton--texto" id="btnNuevo">Nuevo paciente</button>
    </div>`;
}

/* --------------------------------------------------------- navegación */
function irA(paso) {
  if (paso === 2 && !hayPeso()) return;
  if (paso === 3 && !estado.sel.length) return;
  estado.paso = paso; guardar(); render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const p = estado.paso;
  [1, 2, 3].forEach(n => { $('#vista-' + n).hidden = n !== p; });
  $$('.paso-chip').forEach(ch => {
    const n = Number(ch.dataset.paso);
    ch.classList.toggle('is-activo', n === p);
    ch.classList.toggle('is-hecho', n < p);
    ch.disabled = (n === 2 && !hayPeso()) || (n === 3 && !estado.sel.length);
  });
  $('#btnImprimir').hidden = p !== 3;

  if (p === 1) {
    pintarDerivados();
    $('#btnAtras').hidden = true;
    $('#btnAvanzar').hidden = false;
    $('#btnAvanzar').textContent = 'Continuar';
    $('#btnAvanzar').disabled = !hayPeso();
  } else if (p === 2) {
    pintarLista();
    $('#btnAtras').hidden = false;
    $('#btnAvanzar').hidden = false;
    $('#btnAvanzar').textContent = estado.sel.length ? `Ver dosis (${estado.sel.length})` : 'Ver dosis';
    $('#btnAvanzar').disabled = !estado.sel.length;
  } else {
    pintarResultados();
    $('#btnAtras').hidden = false;
    $('#btnAvanzar').hidden = true;
  }
}

/* ------------------------------------------------------------ eventos */
function campo(sel, prop, tipo) {
  const el = $(sel);
  el.addEventListener('input', () => {
    const v = el.value;
    estado[prop] = tipo === 'num' ? (v === '' ? null : Number(v)) : v;
    if (prop === 'fn') {
      const d = diasDesde(v);
      if (d != null && d >= 0) { estado.edad = d; $('#inEdad').value = d; }
    }
    guardar();
    if (estado.paso === 1) { pintarDerivados(); $('#btnAvanzar').disabled = !hayPeso();
      $$('.paso-chip').forEach(ch => { if (Number(ch.dataset.paso) === 2) ch.disabled = !hayPeso(); }); }
  });
}

function alternar(id) {
  const i = estado.sel.indexOf(id);
  if (i >= 0) estado.sel.splice(i, 1); else estado.sel.push(id);
  guardar();
}

function init() {
  restaurar();
  if (estado.tema) document.documentElement.dataset.tema = estado.tema;

  $('#inPeso').value = estado.peso ?? '';
  $('#inEGsem').value = estado.egSem ?? '';
  $('#inEGdia').value = estado.egDia ?? '';
  $('#inEdad').value = estado.edad ?? '';
  $('#inFN').value = estado.fn || '';
  $('#inNombre').value = estado.nombre || '';
  $('#inCupo').value = estado.cupo || '';
  $('#inDiagnostico').value = estado.diagnostico || '';

  campo('#inPeso', 'peso', 'num'); campo('#inEGsem', 'egSem', 'num');
  campo('#inEGdia', 'egDia', 'num'); campo('#inEdad', 'edad', 'num');
  campo('#inFN', 'fn'); campo('#inNombre', 'nombre');
  campo('#inCupo', 'cupo'); campo('#inDiagnostico', 'diagnostico');

  $('#pasos').addEventListener('click', ev => {
    const b = ev.target.closest('.paso-chip');
    if (b && !b.disabled) irA(Number(b.dataset.paso));
  });
  $('#btnAvanzar').addEventListener('click', () => irA(estado.paso + 1));
  $('#btnAtras').addEventListener('click', () => irA(estado.paso - 1));

  /* buscador */
  let t;
  $('#inBuscar').addEventListener('input', () => {
    $('#btnBorrarBusqueda').hidden = !$('#inBuscar').value;
    clearTimeout(t); t = setTimeout(pintarLista, 90);
  });
  $('#btnBorrarBusqueda').addEventListener('click', () => {
    $('#inBuscar').value = ''; $('#btnBorrarBusqueda').hidden = true; pintarLista(); $('#inBuscar').focus();
  });

  /* selección */
  $('#vista-2').addEventListener('click', ev => {
    const op = ev.target.closest('.opcion');
    if (op) { alternar(op.dataset.id); pintarLista(); actualizarAvanzar(); return; }
    const quitar = ev.target.closest('[data-quitar]');
    if (quitar) { alternar(quitar.dataset.quitar); pintarLista(); actualizarAvanzar(); return; }
    if (ev.target.closest('[data-vaciar]')) { estado.sel = []; guardar(); pintarLista(); actualizarAvanzar(); return; }
    const grupo = ev.target.closest('[data-grupo]');
    if (grupo) {
      const q = sinTildes($('#inBuscar').value.trim());
      const items = CATALOGO.filter(c => c.grupo === grupo.dataset.grupo && (!q || c.busca.includes(q)));
      if (grupo.dataset.marcar === '1') items.forEach(c => { if (!estado.sel.includes(c.id)) estado.sel.push(c.id); });
      else estado.sel = estado.sel.filter(id => !items.some(c => c.id === id));
      guardar(); pintarLista(); actualizarAvanzar();
    }
  });

  function actualizarAvanzar() {
    $('#btnAvanzar').textContent = estado.sel.length ? `Ver dosis (${estado.sel.length})` : 'Ver dosis';
    $('#btnAvanzar').disabled = !estado.sel.length;
    $$('.paso-chip').forEach(ch => { if (Number(ch.dataset.paso) === 3) ch.disabled = !estado.sel.length; });
  }

  /* resultados: acciones y ajustes */
  $('#vista-3').addEventListener('click', ev => {
    if (ev.target.closest('#btnEditarPaciente')) irA(1);
    else if (ev.target.closest('#btnEditarSeleccion')) irA(2);
    else if (ev.target.closest('#btnImprimir2')) window.print();
    else if (ev.target.closest('#btnNuevo')) nuevoPaciente();
  });
  $('#vista-3').addEventListener('input', ev => {
    const clave = ev.target.dataset && ev.target.dataset.infusion;
    if (!clave) return;
    const v = ev.target.value === '' ? null : Number(ev.target.value);
    if (v === null) delete estado.infusiones[clave]; else estado.infusiones[clave] = v;
    guardar();
    const foco = ev.target.id;
    pintarResultados();
    const nuevo = document.getElementById(foco);
    if (nuevo) { nuevo.focus(); try { nuevo.setSelectionRange(nuevo.value.length, nuevo.value.length); } catch (e) {} }
  });
  $('#vista-3').addEventListener('change', ev => {
    if (ev.target.id === 'igPres') { estado.igPresentacion = Number(ev.target.value); guardar(); pintarResultados(); }
    if (ev.target.id === 'igDosis') { estado.igDosis = Number(ev.target.value); guardar(); pintarResultados(); }
  });

  function nuevoPaciente() {
    if (!confirm('¿Empezar con un paciente nuevo? Se borrarán los datos y la selección actual.')) return;
    Object.assign(estado, { paso: 1, peso: null, egSem: null, egDia: null, edad: null, fn: '',
      nombre: '', cupo: '', diagnostico: '', sel: [], infusiones: {} });
    ['#inPeso', '#inEGsem', '#inEGdia', '#inEdad', '#inFN', '#inNombre', '#inCupo', '#inDiagnostico']
      .forEach(s => { $(s).value = ''; });
    $('#inBuscar').value = '';
    guardar(); render(); $('#inPeso').focus();
  }

  /* diálogo de fórmulas */
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-formula]');
    if (!b) return;
    const f = FORMULAS[b.dataset.formula];
    $('#modalTitulo').textContent = f.titulo;
    $('#modalCuerpo').innerHTML = f.lineas.map(l =>
      `<div class="formula__etq">${esc(l[0])}</div><div class="formula">${esc(l[1])}</div>`).join('') +
      `<p class="nota">Celdas de la planilla: B6 = peso (g) · D5 = edad (días) · F5 = EG (semanas) ·
       I5 = EG corregida decimal · K5 = días de la EG corregida.</p>`;
    $('#modal').hidden = false;
  });
  $('#modalCerrar').addEventListener('click', () => { $('#modal').hidden = true; });
  $('#modal').addEventListener('click', ev => { if (ev.target.id === 'modal') $('#modal').hidden = true; });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') $('#modal').hidden = true; });

  $('#btnImprimir').addEventListener('click', () => window.print());
  $('#btnTema').addEventListener('click', () => {
    const raiz = document.documentElement;
    let oscuro = raiz.dataset.tema === 'oscuro';
    if (!raiz.dataset.tema) {
      oscuro = raiz.dataset.theme === 'dark' ||
        (raiz.dataset.theme !== 'light' && window.matchMedia &&
         window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    estado.tema = oscuro ? 'claro' : 'oscuro';
    raiz.dataset.tema = estado.tema; guardar();
  });

  if (estado.paso === 3 && !estado.sel.length) estado.paso = 1;
  if (estado.paso >= 2 && !hayPeso()) estado.paso = 1;
  render();
  if (estado.paso === 1) $('#inPeso').focus();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
})();
