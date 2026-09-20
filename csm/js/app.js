/* =====================================================================
   Calculadora de medicamentos · Clínica Santa María
   Flujo en tres pasos: paciente → qué calcular → resultados.
   Los cálculos viven en js/calculo.js y los datos en los archivos
   js/datos-*.js (generados o transcritos desde la planilla).
   ===================================================================== */
(function () {
'use strict';

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
const LS = 'neocalc-csm-v1';
const LS_INSTALAR = 'neocalc-csm-aviso-instalar';
const estado = {
  paso: 1,
  peso: null, egSem: null, egDia: null, edad: null, fn: '',
  nombre: '', cama: '', diagnostico: '',
  sel: [], infusiones: {},
  igPresentacion: 10000, igDosis: 400,
  glucosaVol: null,
  nutriFormula: 'LM (leche materna)', nutriVol: null,
  weaningOpioide: 'Fentanilo', weaningDosis: 2, weaningFecha: '',
  dartFecha: '',
  tema: ''
};
const guardar = () => { try { localStorage.setItem(LS, JSON.stringify(estado)); } catch (e) {} };
function restaurar() {
  try { const r = localStorage.getItem(LS); if (r) Object.assign(estado, JSON.parse(r)); } catch (e) {}
  if (!Array.isArray(estado.sel)) estado.sel = [];
}

const contexto = () => CalcCSM.contexto({
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
const fechaCorta = f => f ? f.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }) : '';

/* ---------------------------------------------------------- catálogo */
const CATALOGO = [];
BOLOS_CSM.forEach(m => CATALOGO.push({
  id: 'b|' + m.nombre, tipo: 'bolo', grupo: 'Bolos EV',
  nombre: m.nombre, sub: [m.presentacion, m.via].filter(Boolean).join(' · '), ref: m
}));
BIC_CSM.forEach(m => CATALOGO.push({
  id: 'i|' + m.nombre, tipo: 'bic', grupo: 'Infusiones continuas',
  nombre: m.nombre.split('  ')[0].trim(), sub: m.concentracion, ref: m,
  alias: 'bic infusion goteo ' + m.nombre
}));
ORALES_CSM.forEach(m => CATALOGO.push({
  id: 'o|' + m.nombre, tipo: 'oral', grupo: 'Medicamentos orales',
  nombre: m.nombre, sub: m.concentracion, ref: m, alias: 'oral vo ' + (m.magistral ? 'magistral' : '')
}));
ANTIBIOTICOS_CSM.forEach(m => CATALOGO.push({
  id: 'a|' + m.nombre, tipo: 'anti', grupo: 'Antibióticos',
  nombre: m.nombre, sub: 'Tabla por edad gestacional, edad y peso', ref: m,
  alias: 'antibiotico ' + (m.fuente || '')
}));
CATALOGO.push({ id: 'e|urgencia', tipo: 'urgencia', grupo: 'Otros cálculos', nombre: 'Hoja de urgencia',
  sub: 'TET, CAU, CVU y fármacos de urgencia', alias: 'reanimacion intubacion tet cau cvu paro' });
CATALOGO.push({ id: 'e|glucosa', tipo: 'glucosa', grupo: 'Otros cálculos', nombre: 'Carga de glucosa',
  sub: 'Fleboclisis y carga según suero', alias: 'sg glucosa fleboclisis goteo carga' });
CATALOGO.push({ id: 'e|ig', tipo: 'ig', grupo: 'Otros cálculos', nombre: 'Gammaglobulina EV',
  sub: 'Dosis, volumen y velocidades', alias: 'igiv gamaglobulina inmunoglobulina' });
CATALOGO.push({ id: 'e|dart', tipo: 'dart', grupo: 'Esquemas', nombre: 'DART (dexametasona)',
  sub: 'Esquema de 10 días', alias: 'dexametasona dart displasia' });
CATALOGO.push({ id: 'e|weaning', tipo: 'weaning', grupo: 'Esquemas', nombre: 'Weaning de opioides a metadona',
  sub: 'Equivalencia y bajada en 6 u 11 días', alias: 'metadona fentanilo morfina destete abstinencia' });
CATALOGO.push({ id: 'e|nutricion', tipo: 'nutricion', grupo: 'Otros cálculos', nombre: 'Aportes nutricionales',
  sub: 'Fórmulas lácteas y fortificantes', alias: 'nutricion leche formula fortificante calorias mct' });

CATALOGO.forEach(c => {
  c.busca = sinTildes(c.nombre + ' ' + (c.sub || '') + ' ' + (c.alias || ''));
  c.chip = c.nombre + (c.tipo === 'bic' ? ' · infusión' : c.tipo === 'oral' ? ' · oral' : '');
});
const porId = id => CATALOGO.find(c => c.id === id);
const GRUPOS = ['Bolos EV', 'Infusiones continuas', 'Medicamentos orales', 'Antibióticos', 'Esquemas', 'Otros cálculos'];

/* ==================================================================== */
/* FICHAS                                                               */
/* ==================================================================== */
function valorLinea(l, ctx) {
  const r = CalcCSM.bolo(l, ctx);
  const dosis = r.dosis == null ? '' :
    `<span class="valor"><b>${numDosis(r.dosis)}</b><i>${esc(l.unidad || '')}</i></span>`;
  let vol = '';
  if (l.vol === 'texto') vol = `<span class="valor valor--vol"><b>${esc(l.f)}</b><i>${esc(l.unidadVol || '')}</i></span>`;
  else if (r.vol != null) vol = `<span class="valor valor--vol"><b>${l.vol === 'fijo' ? num(r.vol, 0) : numVol(r.vol)}</b><i>${esc(l.unidadVol || 'mL')}</i></span>`;
  return dosis + vol;
}

function fichaBolo(item, ctx) {
  const m = item.ref;
  const lineas = m.lineas.map(l => `
      <div class="linea">
        <div>
          ${l.etiqueta ? `<div class="linea__etq">${esc(l.etiqueta)}</div>` : ''}
          <div class="linea__det">${esc(l.dosisTxt || '')}${l.detalle ? ' · ' + esc(l.detalle) : ''}${
            fx(m.nombre + (l.etiqueta ? ' · ' + l.etiqueta : ''),
               [['Dosis a administrar', l.xlDosis], ['Volumen a administrar', l.xlVol]])}</div>
          ${l.concLinea ? `<div class="linea__det">${esc(l.concLinea)}</div>` : ''}
        </div>
        <div class="valores">${valorLinea(l, ctx)}</div>
      </div>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(m.nombre)}</div>
        <div class="ficha__conc">${esc(m.presentacion)}</div></div>
      <span class="via">${esc(m.via)}</span>
    </header>
    <div class="ficha__cuerpo">${lineas}
      ${m.concentracion ? `<p class="nota"><b>Concentración recomendada:</b> ${esc(m.concentracion)}</p>` : ''}
      ${m.nota ? `<div class="alerta">${ICONO_AVISO}<div>${esc(m.nota)}</div></div>` : ''}
    </div>
    <footer class="ficha__pie">
      ${m.diluir ? `<span><b>Diluir en:</b> ${esc(m.diluir)}</span>` : ''}
      ${m.tiempo ? `<span><b>Tiempo:</b> ${esc(m.tiempo)}</span>` : ''}
    </footer>
  </article>`;
}

function fichaOral(item, ctx) {
  const m = item.ref;
  const lineas = m.lineas.map(l => `
      <div class="linea">
        <div>
          <div class="linea__det">${esc(l.dosisTxt || '')}${
            fx(m.nombre, [['Dosis a administrar', l.xlDosis], ['Volumen a administrar', l.xlVol]])}</div>
          ${l.concLinea && l.concLinea !== m.concentracion ? `<div class="linea__det">${esc(l.concLinea)}</div>` : ''}
        </div>
        <div class="valores">${valorLinea(l, ctx)}</div>
      </div>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(m.nombre)}${
        m.magistral ? '<span class="marca-fila">Magistral</span>' : ''}</div>
        <div class="ficha__conc">${esc(m.concentracion)}</div></div>
      <span class="via">${esc(m.via || 'VO')}</span>
    </header>
    <div class="ficha__cuerpo">${lineas}
      ${m.nota ? `<div class="alerta">${ICONO_AVISO}<div>${esc(m.nota)}</div></div>` : ''}
    </div>
  </article>`;
}

function fichaBic(item, ctx) {
  const m = item.ref;
  const lineas = m.lineas.map((l, i) => {
    const clave = m.nombre + '|' + i;
    const propia = estado.infusiones[clave];
    const r = CalcCSM.infusion(l, ctx, esNum(propia) ? propia : undefined);
    const unidadCorta = (l.unidad || '').replace(/\s*\/\s*mL$/, '');
    return `
      <div class="linea"><div style="flex:1 1 100%">
        <div class="linea__etq">${esc(l.dosisRec || 'Dosis')}</div>
        <div class="ajuste">
          <label for="bic-${idHtml(clave)}">Dosis a utilizar</label>
          <input type="number" id="bic-${idHtml(clave)}" data-bic="${esc(clave)}"
                 step="0.001" min="0" inputmode="decimal" value="${r.D}">
          <label>${esc(unidadCorta)}</label>
        </div>
      </div></div>
      <div class="linea">
        <div><div class="linea__det">Preparación para 48 mL (dura 48 h a 1 mL/h)${
          fx(m.nombre + ' · preparación', [['Preparación en 48 mL', l.xlPrep], ['Volumen del frasco', l.xlVial]])}</div></div>
        <div class="valores">
          <span class="valor"><b>${numDosis(r.prep)}</b><i>${esc(l.prepUnidad || '')}</i></span>
          ${r.vial != null ? `<span class="valor valor--vol"><b>${numVol(r.vial)}</b><i>mL del fármaco</i></span>` : ''}
          ${r.solvente != null ? `<span class="valor valor--vol"><b>${numVol(r.solvente)}</b><i>mL de solvente</i></span>` : ''}
        </div>
      </div>
      ${l.nota ? `<p class="nota">${esc(l.nota)}</p>` : ''}`;
  }).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(m.nombre)}</div>
        <div class="ficha__conc">Concentración recomendada: ${esc(m.concentracion)}</div></div>
      <span class="via">BIC</span>
    </header>
    <div class="ficha__cuerpo">${lineas}</div>
    <footer class="ficha__pie">
      <span><b>Preparar en:</b> ${esc(m.lineas[0].preparar || '')}</span>
      <span><b>Completar hasta:</b> 48 mL</span>
    </footer>
  </article>`;
}

function fichaAnti(item, ctx) {
  const m = item.ref;
  const r = CalcCSM.antibiotico(m, ctx);
  const nEsq = m.esquemas.length;
  const cabecera = m.columnas.map(c => `<th>${esc(c)}</th>`).join('') +
    m.esquemas.map(e => `<th>${esc(e)}${nEsq > 1 ? '' : ''} (mg/Kg)</th><th>Dosis</th><th>Intervalo</th>`).join('');

  const filas = r.filas.map(f => {
    const celdas = f.crit.map((c, i) => `<td data-etq="${esc(m.columnas[i] || '')}">${esc(c)}${
      f.coincide && i === 0 ? '<span class="marca-fila">Este paciente</span>' : ''}</td>`).join('');
    const valores = f.dosis.map((d, i) => `
      <td class="num" data-etq="${esc(m.esquemas[i])} mg/Kg">${numDosis(f.mgkg[i])}</td>
      <td class="num fuerte" data-etq="${esc(m.esquemas[i])} dosis">${ctx.hayPeso ? numDosis(d) + ' mg' : '—'}${
        f.porToma ? `<br><span class="num" style="font-weight:400;font-size:.8rem">${numDosis(f.porToma[i])} mg por toma</span>` : ''}</td>
      <td class="num" data-etq="Intervalo"><span class="intervalo">c/${f.intervalo[i]} h</span></td>`).join('');
    return `<tr class="${f.coincide ? 'coincide' : ''}">${celdas}${valores}</tr>`;
  }).join('');

  const carga = r.carga ? `<div class="linea">
      <div><div class="linea__etq">${esc(m.carga.etiqueta)}</div>
        <div class="linea__det">${esc(r.carga.crit)} · ${numDosis(r.carga.mgkg)} mg/Kg</div></div>
      <div class="valores"><span class="valor"><b>${numDosis(r.carga.dosis)}</b><i>mg</i></span></div>
    </div>` : '';

  const sinDatos = (!ctx.hayEG || !ctx.hayEdad)
    ? `<div class="alerta">${ICONO_AVISO}<div><b>Faltan datos</b>
       Sin edad gestacional y edad cronológica no se puede marcar la fila que corresponde al paciente.</div></div>` : '';

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">${esc(m.nombre)}</div>
        <div class="ficha__conc">${esc(m.fuente || 'SOCHINF 2020')}</div></div>
    </header>
    <div class="ficha__cuerpo">
      ${carga}
      ${sinDatos}
      <div class="tabla-scroll">
        <table class="tabla"><thead><tr>${cabecera}</tr></thead><tbody>${filas}</tbody></table>
      </div>
      ${m.nota ? `<p class="nota">${esc(m.nota)}</p>` : ''}
      <p class="nota">Las dosis salen de las fórmulas de la planilla; la fila marcada es la que corresponde
         a la edad gestacional, la edad y el peso ingresados.</p>
    </div>
  </article>`;
}

function fichaUrgencia(ctx) {
  const u = CalcCSM.urgencia(ctx);
  const accesos = u.accesos.map(a => `
    <div class="linea">
      <div><div class="linea__etq">${esc(a.nombre)}</div>
        <div class="linea__det">${esc(a.medida)}${fx('Hoja de urgencia · ' + a.nombre,
          [[a.nombre, a.xl], [a.medida, a.xlMedida]])}</div></div>
      <div class="valores">
        <span class="valor"><b>${esc(a.valor)}</b><i>${esc(a.unidad)}</i></span>
        <span class="valor valor--vol"><b>${num(a.calc, 1)}</b><i>${esc(a.medidaUnidad)}</i></span>
      </div>
    </div>`).join('');

  const grupos = u.grupos.map(g => `
    <h4 class="seccion">${esc(g.titulo)}</h4>
    ${g.farmacos.map(f => `
      <div class="linea">
        <div><div class="linea__etq">${esc(f.nombre)}${f.via ? ' · ' + esc(f.via) : ''}</div>
          <div class="linea__det">${esc(f.dosisTxt)}${f.conc ? ' · ' + esc(f.conc) : ''}${
            fx('Urgencia · ' + f.nombre, [['Dosis', f.xlDosis], ['Volumen', f.xlVol]])}</div></div>
        <div class="valores">
          <span class="valor"><b>${numDosis(f.dosisCalc)}</b><i>${esc(f.unidad)}</i></span>
          <span class="valor valor--vol"><b>${numVol(f.volCalc)}</b><i>mL</i></span>
        </div>
      </div>`).join('')}`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Hoja de urgencia</div>
        <div class="ficha__conc">Accesos y fármacos según peso</div></div>
    </header>
    <div class="ficha__cuerpo">${accesos}${grupos}</div>
  </article>`;
}

function fichaGlucosa(ctx) {
  const r = CalcCSM.glucosa(ctx, estado.glucosaVol);
  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Carga de glucosa</div>
        <div class="ficha__conc">Fleboclisis y carga según concentración del suero</div></div>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="glVol">Volumen</label>
        <input type="number" id="glVol" step="1" min="0" inputmode="numeric" value="${r.volKg}">
        <label>mL/Kg/día</label>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Volumen al día</div>
          <div class="linea__det">${fx('Carga de glucosa', [['Volumen día', GLUCOSA_CSM.xlVolDia], ['Goteo', GLUCOSA_CSM.xlGoteo]])}</div></div>
        <div class="valores">
          <span class="valor"><b>${numDosis(r.volDia)}</b><i>mL/día</i></span>
          <span class="valor valor--vol"><b>${num(r.goteo, 1)}</b><i>mL/h</i></span>
        </div>
      </div>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Suero</th><th>Carga de glucosa</th></tr></thead>
          <tbody>${r.sueros.map(s => `<tr>
            <td data-etq="Suero">${esc(s.nombre)}</td>
            <td class="num fuerte" data-etq="Carga">${num(s.carga, 2)} mg/Kg/min</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="nota">Fórmula de la planilla: (volumen × % del suero / 100) / 1440 × 1000.</p>
    </div>
  </article>`;
}

function fichaDart(ctx) {
  const filas = CalcCSM.dart(ctx, estado.dartFecha);
  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">DART · dexametasona</div>
        <div class="ficha__conc">Esquema de 10 días · ${esc(DART_CSM.intervalo)}</div></div>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="dartFecha">Fecha de inicio</label>
        <input type="date" id="dartFecha" value="${esc(estado.dartFecha)}">
      </div>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Día</th>${estado.dartFecha ? '<th>Fecha</th>' : ''}<th>Dosis (mg/Kg/dosis)</th>
            <th>Dosis</th><th>Volumen</th></tr></thead>
          <tbody>${filas.map(f => `<tr>
            <td data-etq="Día">Día ${f.dia}</td>
            ${estado.dartFecha ? `<td data-etq="Fecha">${esc(fechaCorta(f.fecha))}</td>` : ''}
            <td class="num" data-etq="mg/Kg/dosis">${num(f.mgkg, 3)}</td>
            <td class="num fuerte" data-etq="Dosis">${numDosis(f.mg)} mg</td>
            <td class="num vol" data-etq="Volumen">${numVol(f.mL)} mL</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="nota"><b>Dilución:</b> ${esc(DART_CSM.dilucion)}${
        fx('DART', [['Dosis (mg)', DART_CSM.xlDosis], ['Volumen (mL)', DART_CSM.xlVol]])}</p>
    </div>
  </article>`;
}

function fichaWeaning(ctx) {
  const r = CalcCSM.weaning(ctx, estado.weaningOpioide, estado.weaningDosis, estado.weaningFecha);
  const esquemas = r.esquemas.map(e => `
    <h4 class="seccion">${esc(e.titulo)}</h4>
    <div class="tabla-scroll">
      <table class="tabla">
        <thead><tr><th>Día</th>${estado.weaningFecha ? '<th>Fecha</th>' : ''}
          <th>Dosis diaria</th><th>Dosis unitaria</th><th>Intervalo</th></tr></thead>
        <tbody>${e.dias.map(d => d.suspender
          ? `<tr><td data-etq="Día">Día ${d.dia}</td>${estado.weaningFecha ? `<td data-etq="Fecha">${esc(fechaCorta(d.fecha))}</td>` : ''}
             <td colspan="3" class="fuerte" data-etq="Indicación">Suspender</td></tr>`
          : `<tr><td data-etq="Día">Día ${d.dia}</td>
             ${estado.weaningFecha ? `<td data-etq="Fecha">${esc(fechaCorta(d.fecha))}</td>` : ''}
             <td class="num" data-etq="Dosis diaria">${numDosis(d.total)} mg</td>
             <td class="num fuerte" data-etq="Dosis unitaria">${numDosis(d.unitaria)} mg</td>
             <td class="num" data-etq="Intervalo"><span class="intervalo">c/${d.intervalo} h</span></td></tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Weaning de opioides a metadona</div>
        <div class="ficha__conc">${esc(WEANING_CSM.referencia)}</div></div>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="wOpioide">Opioide</label>
        <select id="wOpioide">
          ${WEANING_CSM.opioides.map(o => `<option${o.nombre === estado.weaningOpioide ? ' selected' : ''}>${esc(o.nombre)}</option>`).join('')}
        </select>
        <label for="wDosis">Dosis</label>
        <input type="number" id="wDosis" step="0.1" min="0" inputmode="decimal" value="${estado.weaningDosis}">
        <label>mcg/Kg/h</label>
        <label for="wFecha">Inicio</label>
        <input type="date" id="wFecha" value="${esc(estado.weaningFecha)}">
      </div>
      <div class="linea">
        <div><div class="linea__etq">Metadona equivalente</div>
          <div class="linea__det">${numDosis(r.mcgHora)} mcg/h de ${esc(estado.weaningOpioide.toLowerCase())}${
            fx('Weaning · equivalencia', [['Dosis mcg/h', '=peso/1000 × dosis'],
              ['Metadona diaria', (WEANING_CSM.opioides.find(o => o.nombre === estado.weaningOpioide) || {}).xl]])}</div></div>
        <div class="valores"><span class="valor"><b>${numDosis(r.diaria)}</b><i>mg/día</i></span></div>
      </div>
      ${esquemas}
    </div>
  </article>`;
}

function fichaIG(ctx) {
  const r = CalcCSM.ig(ctx, estado.igPresentacion, estado.igDosis);
  const horas = ['0', '0,5', '1', 'aviso1', '2', '3', '4', '5', '6', 'aviso2'];
  const avisos = {
    aviso1: 'Si el paciente tolera bien la primera hora, subir goteo según el volumen de horas posteriores',
    aviso2: 'Si aparecen reacciones adversas, disminuir la velocidad de infusión o suspender'
  };
  const filas = horas.map(h => avisos[h]
    ? `<tr class="aviso"><td colspan="8">${esc(avisos[h])}</td></tr>`
    : `<tr><td class="hora">${h}</td>${'<td class="libre"></td>'.repeat(7)}</tr>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Gammaglobulina EV</div>
        <div class="ficha__conc">Vía exclusiva</div></div>
      <span class="via">EV</span>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="igPres">Presentación</label>
        <select id="igPres">
          ${IG_CSM.presentaciones.map(p => `<option value="${p}"${estado.igPresentacion === p ? ' selected' : ''}>${p.toLocaleString('es-CL')} mg / 100 mL</option>`).join('')}
        </select>
        <label for="igDosis">Dosis</label>
        <select id="igDosis">
          ${IG_CSM.dosis.map(v => `<option value="${v}"${estado.igDosis === v ? ' selected' : ''}>${v} mg/Kg</option>`).join('')}
        </select>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Dosis a administrar</div></div>
        <div class="valores"><span class="valor"><b>${numDosis(r.dosis)}</b><i>mg</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Volumen total</div></div>
        <div class="valores"><span class="valor valor--vol"><b>${numVol(r.vol)}</b><i>mL</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Velocidad · primeros 60 min</div></div>
        <div class="valores"><span class="valor valor--vol"><b>${num(r.v1, 1)}</b><i>mL/h</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Velocidad · horas posteriores</div></div>
        <div class="valores"><span class="valor valor--vol"><b>${num(r.v2, 1)}</b><i>mL/h</i></span></div>
      </div>
      <div class="linea">
        <div><div class="linea__etq">Tiempo total estimado</div>
          <div class="linea__det">Calculado por la app; la planilla deja la casilla para completar a mano</div></div>
        <div class="valores"><span class="valor"><b>${num(r.total, 1)}</b><i>h</i></span></div>
      </div>
      <p class="nota">Control de signos vitales durante la infusión</p>
      <div class="tabla-scroll">
        <table class="registro">
          <thead><tr><th>Hora</th><th>PA</th><th>PAM</th><th>FC</th><th>FR</th><th>Sat. O₂</th><th>T°</th><th>Obs.</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="firmas"><div>Firma médico tratante</div><div>Firma enfermera/o</div></div>
    </div>
  </article>`;
}

function fichaNutricion(ctx) {
  const f = FORMULAS_CSM.find(x => x.nombre === estado.nutriFormula) || FORMULAS_CSM[0];
  const r = CalcCSM.nutricion(ctx, f, estado.nutriVol);
  const filas = [
    ['Volumen al día', numDosis(r.volDia) + ' mL'],
    ['Calorías al día', numDosis(r.calDia) + ' cal'],
    ['Calorías por kilo', numDosis(r.calKg) + ' cal/Kg'],
    ['Proteínas', num(r.protKg, 2) + ' g/Kg'],
    ['Calcio', numDosis(r.caKg) + ' mg/Kg'],
    ['Fósforo', numDosis(r.pKg) + ' mg/Kg'],
    ['Hierro', num(r.feKg, 2) + ' mg/Kg'],
    ['Sodio', num(r.naKg, 2) + ' mEq/Kg'],
    ['Potasio', num(r.kKg, 2) + ' mEq/Kg'],
    ['Zinc', num(r.znDia, 2) + ' mg/día'],
    ['Vitamina D', numDosis(r.vitDDia) + ' UI/día']
  ].map(([a, b]) => `<tr><td data-etq="Aporte">${esc(a)}</td><td class="num fuerte" data-etq="Valor">${esc(b)}</td></tr>`).join('');

  return `<article class="ficha">
    <header class="ficha__cab">
      <div><div class="ficha__nombre">Aportes nutricionales</div>
        <div class="ficha__conc">Hoja «Formulas» de la planilla</div></div>
    </header>
    <div class="ficha__cuerpo">
      <div class="ajuste">
        <label for="nuFormula">Fórmula</label>
        <select id="nuFormula">
          ${FORMULAS_CSM.map(x => `<option${x.nombre === f.nombre ? ' selected' : ''}>${esc(x.nombre)}</option>`).join('')}
        </select>
        <label for="nuVol">Volumen</label>
        <input type="number" id="nuVol" step="5" min="0" inputmode="numeric" value="${r.volKg}">
        <label>mL/Kg/día</label>
      </div>
      <div class="tabla-scroll">
        <table class="tabla"><tbody>${filas}</tbody></table>
      </div>
      <h4 class="seccion">Con MCT (1 mL aporta 8,5 cal)</h4>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>MCT</th><th>Calorías por kilo</th></tr></thead>
          <tbody>${r.mct.map(m => `<tr><td data-etq="MCT">${m.pct} %</td>
            <td class="num fuerte" data-etq="Cal/Kg">${numDosis(m.calKg)} cal/Kg</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </article>`;
}

/* ==================================================================== */
/* PASOS                                                                */
/* ==================================================================== */
function pintarDerivados() {
  const ctx = contexto();
  const d = [];
  if (hayPeso()) d.push(`<span class="dato dato--clave"><span>Peso</span><b>${num(ctx.kg, 3)} Kg</b></span>`);
  if (esNum(estado.edad)) d.push(`<span class="dato"><span>Edad</span><b>${estado.edad} días</b></span>`);
  if (esNum(estado.egSem)) d.push(`<span class="dato dato--clave"><span>EG corregida</span><b>${ctx.egcSem} + ${Math.round(ctx.egcD)} d</b></span>`);
  if (hayPeso()) d.push(`<span class="dato"><span>Superficie corporal</span><b>${num(ctx.sc, 2)} m²</b></span>`);
  $('#derivados').innerHTML = d.join('');
}

function pintarLista() {
  const q = sinTildes($('#inBuscar').value.trim());
  const coinciden = CATALOGO.filter(c => !q || c.busca.includes(q));
  const cont = $('#seleccionados');
  if (estado.sel.length) {
    cont.hidden = false;
    cont.innerHTML = estado.sel.map(id => {
      const c = porId(id); if (!c) return '';
      return `<button type="button" class="chip" data-quitar="${esc(id)}">${esc(c.chip)}${ICONO_X}</button>`;
    }).join('') + `<button type="button" class="chip chip--vaciar" data-vaciar="1">Quitar todos</button>`;
  } else { cont.hidden = true; cont.innerHTML = ''; }

  if (!coinciden.length) {
    $('#lista').innerHTML = `<p class="vacio">Sin resultados para «${esc($('#inBuscar').value.trim())}».</p>`;
    return;
  }
  $('#lista').innerHTML = GRUPOS.map(g => {
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
        return `<button type="button" class="opcion${marcada ? ' is-marcada' : ''}" data-id="${esc(c.id)}" aria-pressed="${marcada}">
          <span class="opcion__caja">${ICONO_CHECK}</span>
          <span class="opcion__txt">
            <span class="opcion__nombre">${esc(c.nombre)}</span>
            <span class="opcion__sub">${esc(c.sub || '')}</span>
          </span>
        </button>`;
      }).join('')}`;
  }).join('');
}

function pintarResultados() {
  const ctx = contexto();
  const sel = CATALOGO.filter(c => estado.sel.includes(c.id));
  const datos = [];
  if (estado.nombre) datos.push(`<span><span>Paciente</span> <b>${esc(estado.nombre)}</b></span>`);
  datos.push(`<span><span>Peso</span> <b>${num(ctx.g, 0)} g</b></span>`);
  if (esNum(estado.egSem)) datos.push(`<span><span>EG corregida</span> <b>${ctx.egcSem} + ${Math.round(ctx.egcD)} d</b></span>`);
  if (esNum(estado.edad)) datos.push(`<span><span>Edad</span> <b>${estado.edad} d</b></span>`);
  datos.push(`<span><span>SC</span> <b>${num(ctx.sc, 2)} m²</b></span>`);
  if (estado.cama) datos.push(`<span><span>Cama</span> <b>${esc(estado.cama)}</b></span>`);
  $('#resumen').innerHTML = `<div class="resumen__datos">${datos.join('')}</div>
    <button type="button" class="boton boton--texto" id="btnEditarPaciente">Editar datos</button>`;

  const bloques = GRUPOS.map(g => {
    const items = sel.filter(c => c.grupo === g);
    if (!items.length) return '';
    const fichas = items.map(c =>
      c.tipo === 'bolo' ? fichaBolo(c, ctx) :
      c.tipo === 'oral' ? fichaOral(c, ctx) :
      c.tipo === 'bic' ? fichaBic(c, ctx) :
      c.tipo === 'anti' ? fichaAnti(c, ctx) :
      c.tipo === 'urgencia' ? fichaUrgencia(ctx) :
      c.tipo === 'glucosa' ? fichaGlucosa(ctx) :
      c.tipo === 'dart' ? fichaDart(ctx) :
      c.tipo === 'weaning' ? fichaWeaning(ctx) :
      c.tipo === 'nutricion' ? fichaNutricion(ctx) : fichaIG(ctx)).join('');
    return `<h3 class="seccion">${esc(g)}</h3>${fichas}`;
  }).join('');

  $('#resultados').innerHTML = (bloques || `<p class="vacio">No hay nada seleccionado.</p>`) + `
    <div class="acciones">
      <button type="button" class="boton boton--contorno" id="btnEditarSeleccion">Añadir o quitar</button>
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
    actualizarAvanzar();
  } else {
    pintarResultados();
    $('#btnAtras').hidden = false;
    $('#btnAvanzar').hidden = true;
  }
}

function actualizarAvanzar() {
  $('#btnAvanzar').textContent = estado.sel.length ? `Ver resultados (${estado.sel.length})` : 'Ver resultados';
  $('#btnAvanzar').disabled = !estado.sel.length;
  $$('.paso-chip').forEach(ch => { if (Number(ch.dataset.paso) === 3) ch.disabled = !estado.sel.length; });
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
    if (estado.paso === 1) {
      pintarDerivados();
      $('#btnAvanzar').disabled = !hayPeso();
      $$('.paso-chip').forEach(ch => { if (Number(ch.dataset.paso) === 2) ch.disabled = !hayPeso(); });
    }
  });
}

function alternar(id) {
  const i = estado.sel.indexOf(id);
  if (i >= 0) estado.sel.splice(i, 1); else estado.sel.push(id);
  guardar();
}

function repintarConservandoFoco() {
  const foco = document.activeElement ? document.activeElement.id : null;
  const pos = document.activeElement && document.activeElement.selectionStart;
  pintarResultados();
  if (foco) {
    const nuevo = document.getElementById(foco);
    if (nuevo) {
      nuevo.focus();
      try { if (pos != null) nuevo.setSelectionRange(pos, pos); } catch (e) {}
    }
  }
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
  $('#inCama').value = estado.cama || '';
  $('#inDiagnostico').value = estado.diagnostico || '';

  campo('#inPeso', 'peso', 'num'); campo('#inEGsem', 'egSem', 'num');
  campo('#inEGdia', 'egDia', 'num'); campo('#inEdad', 'edad', 'num');
  campo('#inFN', 'fn'); campo('#inNombre', 'nombre');
  campo('#inCama', 'cama'); campo('#inDiagnostico', 'diagnostico');

  $('#pasos').addEventListener('click', ev => {
    const b = ev.target.closest('.paso-chip');
    if (b && !b.disabled) irA(Number(b.dataset.paso));
  });
  $('#btnAvanzar').addEventListener('click', () => irA(estado.paso + 1));
  $('#btnAtras').addEventListener('click', () => irA(estado.paso - 1));

  let t;
  $('#inBuscar').addEventListener('input', () => {
    $('#btnBorrarBusqueda').hidden = !$('#inBuscar').value;
    clearTimeout(t); t = setTimeout(pintarLista, 90);
  });
  $('#btnBorrarBusqueda').addEventListener('click', () => {
    $('#inBuscar').value = ''; $('#btnBorrarBusqueda').hidden = true; pintarLista(); $('#inBuscar').focus();
  });

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

  $('#vista-3').addEventListener('click', ev => {
    if (ev.target.closest('#btnEditarPaciente')) irA(1);
    else if (ev.target.closest('#btnEditarSeleccion')) irA(2);
    else if (ev.target.closest('#btnImprimir2')) window.print();
    else if (ev.target.closest('#btnNuevo')) nuevoPaciente();
  });

  $('#vista-3').addEventListener('input', ev => {
    const t = ev.target;
    if (t.dataset && t.dataset.bic) {
      const v = t.value === '' ? null : Number(t.value);
      if (v === null) delete estado.infusiones[t.dataset.bic]; else estado.infusiones[t.dataset.bic] = v;
    } else if (t.id === 'glVol') estado.glucosaVol = t.value === '' ? null : Number(t.value);
    else if (t.id === 'nuVol') estado.nutriVol = t.value === '' ? null : Number(t.value);
    else if (t.id === 'wDosis') estado.weaningDosis = t.value === '' ? 0 : Number(t.value);
    else if (t.id === 'dartFecha') estado.dartFecha = t.value;
    else if (t.id === 'wFecha') estado.weaningFecha = t.value;
    else return;
    guardar(); repintarConservandoFoco();
  });

  $('#vista-3').addEventListener('change', ev => {
    const t = ev.target;
    if (t.id === 'igPres') estado.igPresentacion = Number(t.value);
    else if (t.id === 'igDosis') estado.igDosis = Number(t.value);
    else if (t.id === 'nuFormula') { estado.nutriFormula = t.value; estado.nutriVol = null; }
    else if (t.id === 'wOpioide') estado.weaningOpioide = t.value;
    else return;
    guardar(); pintarResultados();
  });

  function nuevoPaciente() {
    if (!confirm('¿Empezar con un paciente nuevo? Se borrarán los datos y la selección actual.')) return;
    Object.assign(estado, { paso: 1, peso: null, egSem: null, egDia: null, edad: null, fn: '',
      nombre: '', cama: '', diagnostico: '', sel: [], infusiones: {},
      glucosaVol: null, nutriVol: null, dartFecha: '', weaningFecha: '' });
    ['#inPeso', '#inEGsem', '#inEGdia', '#inEdad', '#inFN', '#inNombre', '#inCama', '#inDiagnostico']
      .forEach(s => { $(s).value = ''; });
    $('#inBuscar').value = '';
    guardar(); render(); $('#inPeso').focus();
  }

  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-formula]');
    if (!b) return;
    const f = FORMULAS[b.dataset.formula];
    $('#modalTitulo').textContent = f.titulo;
    $('#modalCuerpo').innerHTML = f.lineas.map(l =>
      `<div class="formula__etq">${esc(l[0])}</div><div class="formula">${esc(l[1])}</div>`).join('') +
      `<p class="nota">Celdas de la planilla: peso en gramos, D5/C6 según la hoja, F5/D3 = superficie corporal,
       I4 = EG corregida.</p>`;
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

  avisoInstalacion();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function avisoInstalacion() {
  const caja = $('#instalar');
  const instalada = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                    window.navigator.standalone === true;
  let descartado = false;
  try { descartado = localStorage.getItem(LS_INSTALAR) === '1'; } catch (e) {}
  if (instalada || descartado) return;

  const ua = navigator.userAgent || '';
  const esIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const esSafari = esIOS && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  $('#instalarTexto').textContent = esIOS
    ? (esSafari ? 'Téngala como app: Compartir → «Añadir a pantalla de inicio».'
                : 'Ábrala en Safari y use Compartir → «Añadir a pantalla de inicio».')
    : 'Puede instalarla como app y usarla sin conexión.';
  caja.hidden = false;

  $('#instalarCerrar').addEventListener('click', () => {
    caja.hidden = true;
    try { localStorage.setItem(LS_INSTALAR, '1'); } catch (e) {}
  });

  let propuesta = null;
  window.addEventListener('beforeinstallprompt', ev => {
    ev.preventDefault(); propuesta = ev;
    $('#instalarTexto').textContent = 'Instálela como app para usarla sin conexión.';
    $('#instalarAccion').hidden = false;
    caja.hidden = false;
  });
  $('#instalarAccion').addEventListener('click', async () => {
    if (!propuesta) return;
    propuesta.prompt(); await propuesta.userChoice; propuesta = null;
    caja.hidden = true;
    try { localStorage.setItem(LS_INSTALAR, '1'); } catch (e) {}
  });
  window.addEventListener('appinstalled', () => {
    caja.hidden = true;
    try { localStorage.setItem(LS_INSTALAR, '1'); } catch (e) {}
  });
}

document.addEventListener('DOMContentLoaded', init);
})();
