/* =====================================================================
   NeoDosis HSJD — lógica de la aplicación
   ===================================================================== */
(function () {
'use strict';

/* ---------------------------------------------------------------- util */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esNum = v => typeof v === 'number' && isFinite(v);

/** Formato numérico chileno (coma decimal). */
function num(v, dec) {
  if (!esNum(v)) return '—';
  return v.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
/** Dosis: 2 decimales bajo 1, 1 decimal bajo 10, 0 sobre 10. */
function numDosis(v) {
  if (!esNum(v)) return '—';
  const a = Math.abs(v);
  return num(v, a < 1 ? 3 : a < 10 ? 2 : a < 100 ? 1 : 0);
}
/** Volúmenes: siempre 2 decimales (la planilla mostraba 1 ó 2). */
const numVol = v => num(v, 2);
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Registro de fórmulas originales para el modal de auditoría. */
const FORMULAS = {};
let formulaId = 0;
function verFormula(titulo, lineas) {
  const id = 'f' + (++formulaId);
  FORMULAS[id] = { titulo, lineas: lineas.filter(l => l && l[1]) };
  if (!FORMULAS[id].lineas.length) return '';
  return `<button type="button" class="btn-formula" data-formula="${id}"
     title="Ver la fórmula original de la planilla">ƒx</button>`;
}

/* ------------------------------------------------------------- estado */
const LS = 'neodosis-hsjd-v1';
const estado = {
  nombre: '', diagnostico: '', cupo: '',
  peso: null, talla: null, fn: '', edad: null, egSem: null, egDia: 0,
  infusiones: {},           // dosis en 1 cc modificadas por el usuario
  igPresentacion: 10000, igDosis: 400, datosColapsados: false,
  tema: 'claro', vista: 'bolos'
};

function guardar() {
  try { localStorage.setItem(LS, JSON.stringify(estado)); } catch (e) { /* modo privado */ }
}
function restaurar() {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) Object.assign(estado, JSON.parse(raw));
  } catch (e) { /* ignorar */ }
}

/* ----------------------------------------------------------- contexto */
function contexto() {
  return NeoCalc.contexto({
    pesoG: estado.peso, edadDias: estado.edad, egSem: estado.egSem, egDia: estado.egDia
  });
}

function diasDesde(fechaISO) {
  if (!fechaISO) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const p = fechaISO.split('-').map(Number);
  const fn = new Date(p[0], p[1] - 1, p[2]);
  if (isNaN(fn)) return null;
  return Math.round((hoy - fn) / 86400000);
}

/* ============================== BOLOS ================================ */
const calcBolo = (linea, ctx) => NeoCalc.bolo(linea, ctx);

function cardBolo(m, ctx, hoja) {
  const lineas = m.lineas.map(l => {
    const r = calcBolo(l, ctx);
    const f = verFormula(`${m.nombre}${l.etiqueta ? ' · ' + l.etiqueta : ''}`, [
      ['Dosis a administrar', l.xlDosis], ['Volumen a administrar', l.xlVol]
    ]);
    return `
      <div class="linea">
        <div>
          ${l.etiqueta ? `<div class="linea__etq">${esc(l.etiqueta)}</div>` : ''}
          <div class="linea__dosis">${esc(l.dosisTxt)}</div>
          ${f}
        </div>
        <div class="resultado">
          <span class="valor valor--dosis"><b>${numDosis(r.dosis)}</b><i>${esc(l.unidad)}</i></span>
          ${r.vol != null ? `<span class="valor valor--vol"><b>${numVol(r.vol)}</b><i>mL</i></span>` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <article class="card" data-buscar="${esc(m.nombre.toLowerCase())}">
      <header class="card__head">
        <div>
          <div class="card__nombre">${esc(m.nombre)}</div>
          <div class="card__sub">${esc(m.conc)}</div>
        </div>
        <span class="via">${esc(m.via)}</span>
      </header>
      <div class="card__body">${lineas}</div>
      <footer class="card__pie">
        <span><b>Diluir en:</b> ${esc(m.diluir)}</span>
        <span><b>Tiempo:</b> ${esc(m.tiempo)}</span>
        <span><b>Hoja:</b> ${esc(hoja)}</span>
      </footer>
    </article>`;
}

function vistaBolos(ctx) {
  return `
    <h2 class="seccion__titulo">Bolos · hoja «Medicamentos»</h2>
    <div class="grid">${BOLOS_MEDICAMENTOS.map(m => cardBolo(m, ctx, 'Medicamentos')).join('')}</div>
    <h2 class="seccion__titulo">Bolos · hoja «Otros medicamentos»</h2>
    <div class="grid">${BOLOS_OTROS.map(m => cardBolo(m, ctx, 'Otros medicamentos')).join('')}</div>`;
}

/* =========================== INFUSIONES ============================== */
function dosisPorCC(inf) {
  const k = inf.hoja + '|' + inf.nombre;
  return esNum(estado.infusiones[k]) ? estado.infusiones[k] : inf.porCC;
}
const calcInfusion = (inf, ctx) => NeoCalc.infusion(inf, ctx, dosisPorCC(inf));

const slug = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');

function cardInfusion(inf, ctx) {
  const r = calcInfusion(inf, ctx);
  const clave = esc(inf.hoja + '|' + inf.nombre);
  const id = 'inf-' + slug(inf.hoja + '-' + inf.nombre);
  const porHora = inf.factor === 1440 ? 'min' : 'hr';
  return `
    <article class="card" data-buscar="${esc(inf.nombre.toLowerCase())}">
      <header class="card__head">
        <div>
          <div class="card__nombre">${esc(inf.nombre)}</div>
          <div class="card__sub">Dosis recomendada: ${esc(inf.rango)}</div>
        </div>
        <span class="via">BIC</span>
      </header>
      <div class="card__body">
        <div class="input-linea">
          <label for="${id}">Dosis a utilizar en 1 cc</label>
          <input type="number" id="${id}" data-infusion="${clave}" step="0.01" min="0"
                 inputmode="decimal" value="${r.D}">
          <label>${esc(inf.unidad)}</label>
        </div>
        <div class="linea">
          <div>
            <div class="linea__etq">Preparación en 24 mL</div>
            <div class="linea__dosis">1 mL/h aporta ${numDosis(r.D)} ${esc(inf.unidad.split('/ mL')[0].trim())}</div>
            ${verFormula(inf.nombre + ' · preparación en 24 mL', [['Preparación en 24 mL', inf.xl]])}
          </div>
          <div class="resultado">
            <span class="valor valor--vol"><b>${numDosis(r.prep)}</b><i>${esc(inf.prepUnidad)}</i></span>
          </div>
        </div>
      </div>
      <footer class="card__pie">
        <span><b>Preparar en:</b> ${esc(inf.preparar)}</span>
        <span><b>Base:</b> por ${porHora === 'min' ? 'minuto' : 'hora'}</span>
        <span><b>Hoja:</b> ${esc(inf.hoja)}</span>
      </footer>
    </article>`;
}

function vistaInfusiones(ctx) {
  const med = INFUSIONES.filter(i => i.hoja === 'Medicamentos');
  const otr = INFUSIONES.filter(i => i.hoja === 'Otros medicamentos');
  return `
    <p class="seccion__intro">Preparación para una jeringa de <strong>24 mL</strong>: la cantidad de fármaco
      indicada, completada con el suero señalado hasta 24 mL, entrega la dosis por mL definida a la izquierda
      (1 mL/h = esa dosis). Puede modificar la dosis por cc, tal como en la planilla.</p>
    <h2 class="seccion__titulo">Infusiones continuas · hoja «Medicamentos»</h2>
    <div class="grid">${med.map(i => cardInfusion(i, ctx)).join('')}</div>
    <h2 class="seccion__titulo">Infusiones continuas · hoja «Otros medicamentos»</h2>
    <div class="grid">${otr.map(i => cardInfusion(i, ctx)).join('')}</div>`;
}

/* ========================= ANTIMICROBIANOS =========================== */
function filaAnti(m, e, ctx) {
  const r = NeoCalc.anti(m, e, ctx, XL_FALSE);
  const { dpk, dosis, nulo, unidad } = r;

  const interTxt = r.intervalo === null ? '<span class="nulo">sin resultado</span>'
    : (esNum(r.intervalo) ? `<span class="intervalo">c/${r.intervalo} h</span>`
                          : `<span class="intervalo">${esc(r.intervalo)}</span>`);

  let volSin = '—', volCon = '—';
  if (r.volTxt) {
    volSin = `<span class="num">${esc(r.volTxt)}</span>`;
  } else {
    if (r.volSin != null) volSin = `<span class="vol">${numVol(r.volSin)}</span> <span class="num">mL</span>`;
    if (r.volCon != null) volCon = `<span class="vol">${numVol(r.volCon)}</span> <span class="num">mL</span>`;
  }

  const f = verFormula(`${m.nombre}${e.label ? ' · ' + e.label : ''}`, [
    ['Dosis por Kg', e.dosisXl], ['Intervalo', e.intervaloXl],
    ['Volumen sin restricción', e.volSinXl], ['Volumen con restricción', e.volConXl]
  ]);

  return `
    <tr>
      <td>${e.label ? `<span class="esq">${esc(e.label)}</span>` : '<span class="esq">Dosis única</span>'}${f}</td>
      <td class="num">${nulo ? '<span class="nulo">sin resultado</span>' : numDosis(dpk) + ' ' + unidad + '/Kg'}</td>
      <td class="num destacado">${dosis != null ? numDosis(dosis) + ' ' + unidad : '—'}</td>
      <td class="num">${interTxt}</td>
      <td class="num">${volSin}</td>
      <td class="num">${volCon}</td>
    </tr>`;
}

function cardAnti(m, ctx) {
  const alertas = (m.alertas || []).filter(a => a.cuando(ctx))
    .map(a => `<div class="alerta"><span>⚠</span><div><b>Revisar fórmula de la planilla</b>${esc(a.texto)}</div></div>`).join('');
  return `
    <article class="card" data-buscar="${esc(m.nombre.toLowerCase())}">
      <header class="card__head">
        <div>
          <div class="card__nombre">${esc(m.nombre)}</div>
          <div class="card__sub">
            Sin restricción de volumen: ${esc(m.concSin || '—')}${m.concCon ? ' · Con restricción: ' + esc(m.concCon) : ''}
          </div>
        </div>
        <span class="via">${esc(m.via)}</span>
      </header>
      <div class="card__body">
        <table class="tabla">
          <thead><tr>
            <th>Esquema</th><th>Dosis por Kg</th><th>Dosis a administrar</th>
            <th>Intervalo</th><th>Administrar<br>sin restricción</th><th>Administrar<br>con restricción</th>
          </tr></thead>
          <tbody>${m.esquemas.map(e => filaAnti(m, e, ctx)).join('')}</tbody>
        </table>
        ${m.nota ? `<p class="nota">${esc(m.nota)}</p>` : ''}
        ${alertas}
      </div>
      <footer class="card__pie">
        <span><b>Diluir en:</b> ${esc(m.diluir)}</span>
        <span><b>Tiempo de infusión:</b> ${esc(m.tiempo)}</span>
      </footer>
    </article>`;
}

function vistaAnti(ctx) {
  const grupos = ['Antibióticos', 'Antivirales', 'Antifúngicos'];
  const falta = (!ctx.hayEG || !ctx.hayEdad)
    ? `<p class="paciente__aviso">Muchos antimicrobianos ajustan dosis e intervalo según <strong>EG corregida</strong> y
       <strong>edad cronológica</strong>. Complete edad gestacional y edad en días para obtener los valores correctos.</p>` : '';
  return falta + grupos.map(g => `
    <h2 class="seccion__titulo">${g}</h2>
    <div class="grid grid--ancha">
      ${ANTIMICROBIANOS.filter(m => m.grupo === g).map(m => cardAnti(m, ctx)).join('')}
    </div>`).join('');
}

/* ========================= INMUNOGLOBULINA =========================== */
const calcIG = ctx => NeoCalc.ig(ctx, estado.igPresentacion, estado.igDosis);

function vistaIG(ctx) {
  const r = calcIG(ctx);
  const horas = [
    ['0', ''], ['0,5', ''], ['1', ''],
    ['aviso', 'Si paciente tolera bien la primera hora, subir goteo según volumen de horas posteriores'],
    ['2', ''], ['3', ''], ['4', ''], ['5', ''], ['6', ''],
    ['aviso', 'En caso de que aparezcan reacciones adversas, disminuir la velocidad de infusión o suspender']
  ];
  const filas = horas.map(h => h[0] === 'aviso'
    ? `<tr class="aviso"><td colspan="8">${esc(h[1])}</td></tr>`
    : `<tr><td class="hora">${h[0]}</td>${'<td class="libre"></td>'.repeat(7)}</tr>`).join('');

  return `
    <h2 class="seccion__titulo">Inmunoglobulina EV</h2>
    <div class="grid grid--ancha">
      <article class="card" data-buscar="inmunoglobulina igiv">
        <header class="card__head">
          <div>
            <div class="card__nombre">Inmunoglobulina EV</div>
            <div class="card__sub">Presentación en 100 mL · vía exclusiva</div>
          </div>
          <span class="via">EV</span>
        </header>
        <div class="card__body">
          <div class="input-linea">
            <label for="igPres">Presentación (mg/100 mL)</label>
            <select id="igPres">
              <option value="5000"${estado.igPresentacion === 5000 ? ' selected' : ''}>5.000 mg / 100 mL</option>
              <option value="10000"${estado.igPresentacion === 10000 ? ' selected' : ''}>10.000 mg / 100 mL</option>
            </select>
          </div>
          <div class="input-linea">
            <label for="igDosis">Dosis por Kg (mg)</label>
            <select id="igDosis">
              ${[400, 500, 1000].map(v => `<option value="${v}"${estado.igDosis === v ? ' selected' : ''}>${v} mg/Kg</option>`).join('')}
            </select>
          </div>

          <div class="linea">
            <div><div class="linea__etq">Dosis a administrar</div>
              ${verFormula('Inmunoglobulina · dosis', [['Dosis a administrar', '=(B6*D12)/1000']])}</div>
            <div class="resultado"><span class="valor valor--dosis"><b>${numDosis(r.dosis)}</b><i>mg</i></span></div>
          </div>
          <div class="linea">
            <div><div class="linea__etq">Volumen total a administrar</div>
              ${verFormula('Inmunoglobulina · volumen', [['Volumen total', '=(E12*100)/B12']])}</div>
            <div class="resultado"><span class="valor valor--vol"><b>${numVol(r.vol)}</b><i>mL</i></span></div>
          </div>
          <div class="linea">
            <div><div class="linea__etq">Velocidad · primeros 60 min</div>
              ${verFormula('Inmunoglobulina · velocidad inicial', [['Primeros 60 min',
                '=SI(Y(B12=5000;O(D12=400;D12=500));0,015*B6*60/1000; … ;"ERROR")']])}</div>
            <div class="resultado"><span class="valor valor--vol"><b>${num(r.v1, 1)}</b><i>mL/h</i></span></div>
          </div>
          <div class="linea">
            <div><div class="linea__etq">Velocidad · horas posteriores</div>
              ${verFormula('Inmunoglobulina · velocidad posterior', [['Horas posteriores',
                '=SI(Y(B12=5000;O(D12=400;D12=500));0,04*B6*60/1000; … ;"ERROR")']])}</div>
            <div class="resultado"><span class="valor valor--vol"><b>${num(r.v2, 1)}</b><i>mL/h</i></span></div>
          </div>
          <div class="linea">
            <div><div class="linea__etq">Tiempo total estimado</div>
              <div class="linea__dosis">Calculado por la app (la planilla deja esta casilla para completar a mano)</div></div>
            <div class="resultado"><span class="valor valor--dosis"><b>${num(r.total, 1)}</b><i>h</i></span></div>
          </div>
        </div>
        <footer class="card__pie">
          <span><b>Vía de administración:</b> vía exclusiva (central o periférica)</span>
        </footer>
      </article>

      <article class="card">
        <header class="card__head"><div><div class="card__nombre">Control de signos vitales</div>
          <div class="card__sub">Registro durante la infusión</div></div></header>
        <div class="card__body">
          <table class="tabla tabla--registro">
            <thead><tr><th>Hora</th><th>PA</th><th>PAM</th><th>FC</th><th>FR</th><th>Sat. O₂</th><th>T°</th><th>Obs.</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>
          <table class="tabla tabla--registro" style="margin-top:.8rem">
            <thead><tr><th colspan="2">Información adicional</th></tr></thead>
            <tbody>
              <tr><td class="hora">Vía de administración (vía exclusiva)</td><td class="libre">central / periférica</td></tr>
              <tr><td class="hora">Fecha de vencimiento</td><td class="libre"></td></tr>
              <tr><td class="hora">Lote</td><td class="libre"></td></tr>
              <tr><td class="hora">Observaciones</td><td class="libre"></td></tr>
            </tbody>
          </table>
          <div class="firmas">
            <div>Firma Médico Tratante</div>
            <div>Firma Matrón/a encargado/a</div>
          </div>
        </div>
      </article>
    </div>`;
}

/* =========================== REANIMACIÓN ============================= */
function vistaReanimacion(ctx) {
  const { tet, dist, car1, car2 } = NeoCalc.reanimacion(ctx);
  return `
    <h2 class="seccion__titulo">Reanimación</h2>
    <div class="grid">
      <article class="card" data-buscar="tet tubo endotraqueal intubación">
        <header class="card__head"><div><div class="card__nombre">Vía aérea</div>
          <div class="card__sub">Según peso</div></div></header>
        <div class="card__body">
          <div class="linea">
            <div><div class="linea__etq">N° TET (DI)</div>
              <div class="linea__dosis">&gt; 2.000 g → 3,5 · 1.000-2.000 g → 3 · &lt; 1.000 g → 2,5</div>
              ${verFormula('N° TET', [['Diámetro interno', '=SI(B6>2000;3,5;SI(B6<1000;2,5;3))']])}</div>
            <div class="resultado"><span class="valor valor--dosis"><b>${ctx.hayPeso ? num(tet, 1) : '—'}</b><i>mm</i></span></div>
          </div>
          <div class="linea">
            <div><div class="linea__etq">Distancia a la boca</div>
              ${verFormula('Distancia a la boca', [['Fijación al labio', '=(B6/1009)+6']])}</div>
            <div class="resultado"><span class="valor valor--dosis"><b>${ctx.hayPeso ? num(dist, 1) : '—'}</b><i>cm</i></span></div>
          </div>
          <div class="alerta"><span>⚠</span><div><b>Nota de la planilla</b>
            La fórmula original divide el peso por 1.009 en vez de 1.000 (regla peso en Kg + 6). La diferencia
            es menor a 0,03 cm; la app reproduce la fórmula tal como está en la planilla.</div></div>
        </div>
      </article>

      <article class="card" data-buscar="cardioversión desfibrilación joules">
        <header class="card__head"><div><div class="card__nombre">Cardioversión (sincronizada)</div>
          <div class="card__sub">Energía según peso</div></div></header>
        <div class="card__body">
          <div class="linea">
            <div><div class="linea__etq">1ª descarga</div><div class="linea__dosis">0,5 J/Kg</div>
              ${verFormula('Cardioversión 1ª', [['Energía', '=0,5*B6/1000']])}</div>
            <div class="resultado"><span class="valor valor--dosis"><b>${ctx.hayPeso ? num(car1, 1) : '—'}</b><i>Joules</i></span></div>
          </div>
          <div class="linea">
            <div><div class="linea__etq">2ª descarga</div><div class="linea__dosis">2 J/Kg</div>
              ${verFormula('Cardioversión 2ª', [['Energía', '=2*B6/1000']])}</div>
            <div class="resultado"><span class="valor valor--dosis"><b>${ctx.hayPeso ? num(car2, 1) : '—'}</b><i>Joules</i></span></div>
          </div>
        </div>
      </article>

      <article class="card" data-buscar="adrenalina reanimación">
        <header class="card__head"><div><div class="card__nombre">Adrenalina en reanimación</div>
          <div class="card__sub">0,1 mg/mL (1:10.000)</div></div><span class="via">EV / ET</span></header>
        <div class="card__body">
          ${BOLOS_MEDICAMENTOS.find(m => m.nombre === 'Adrenalina').lineas.map(l => {
            const r = calcBolo(l, ctx);
            return `<div class="linea">
              <div><div class="linea__etq">${esc(l.etiqueta)}</div><div class="linea__dosis">${esc(l.dosisTxt)}</div></div>
              <div class="resultado">
                <span class="valor valor--dosis"><b>${numDosis(r.dosis)}</b><i>mg</i></span>
                <span class="valor valor--vol"><b>${numVol(r.vol)}</b><i>mL</i></span>
              </div></div>`;
          }).join('')}
        </div>
        <footer class="card__pie"><span><b>Diluir en:</b> SF</span><span><b>Tiempo:</b> Bolo rápido</span></footer>
      </article>
    </div>`;
}

/* ============================== FICHA ================================ */
function vistaFicha(ctx) {
  const fBolos = [];
  BOLOS_MEDICAMENTOS.forEach(m => m.lineas.forEach((l, i) => {
    const r = calcBolo(l, ctx);
    fBolos.push(`<tr>
      <td>${i === 0 ? esc(m.nombre) : ''}</td>
      <td>${esc(l.etiqueta || '')}</td>
      <td class="num destacado">${numDosis(r.dosis)} ${esc(l.unidad)}</td>
      <td class="num vol">${numVol(r.vol)} mL</td>
      <td>${i === 0 ? esc(m.diluir) : ''}</td>
      <td>${i === 0 ? esc(m.tiempo) : ''}</td></tr>`);
  }));

  const fInf = INFUSIONES.filter(i => i.hoja === 'Medicamentos').map(inf => {
    const r = calcInfusion(inf, ctx);
    return `<tr><td>${esc(inf.nombre)}</td><td class="num">${numDosis(r.D)}</td>
      <td>${esc(inf.unidad)}</td><td class="num vol">${numDosis(r.prep)} ${esc(inf.prepUnidad)}</td></tr>`;
  }).join('');

  const hoy = new Date().toLocaleDateString('es-CL');
  return `
    <div class="ficha">
      <div class="ficha__head">
        <div>
          <h2>Calculadora Medicamentos UCI</h2>
          <p>Unidad de Neonatología · Hospital San Juan de Dios</p>
        </div>
        <div class="ficha__datos">
          <span>Fecha: <b>${esc(hoy)}</b></span>
          <span>Cupo UCI: <b>${esc(estado.cupo || '—')}</b></span>
        </div>
      </div>
      <div class="ficha__datos" style="margin-bottom:.8rem">
        <span>Paciente: <b>${esc(estado.nombre || '—')}</b></span>
        <span>Peso: <b>${ctx.hayPeso ? num(ctx.g, 0) + ' g' : '—'}</b></span>
        <span>EG corregida: <b>${ctx.hayEG ? ctx.egcSem + ' + ' + Math.round(ctx.egcD) + ' d' : '—'}</b></span>
        <span>Edad: <b>${esNum(estado.edad) ? estado.edad + ' d' : '—'}</b></span>
      </div>

      <h3 class="seccion__titulo">Bolos de medicamentos</h3>
      <table class="tabla tabla--ficha">
        <thead><tr><th>Medicamento</th><th></th><th>Dosis a administrar</th><th>Administrar</th>
          <th>Diluir en</th><th>Tiempo de infusión</th></tr></thead>
        <tbody>${fBolos.join('')}</tbody>
      </table>

      <h3 class="seccion__titulo">Infusiones continuas</h3>
      <table class="tabla tabla--ficha">
        <thead><tr><th>Medicamento</th><th>Dosis en 1 cc</th><th>Unidad de medida</th><th>Preparación en 24 mL</th></tr></thead>
        <tbody>${fInf}</tbody>
      </table>

      <p class="nota">La hoja «Versión Para Imprimir» de la planilla tomaba el volumen de la fenitoína de carga
        desde la celda de la adrenalina ET (G13 en lugar de G14). Esta ficha usa el valor correcto de la hoja
        «Medicamentos».</p>

      <div class="firmas">
        <div>Firma Médico Tratante</div>
        <div>Firma Enfermera/Matrón/a</div>
      </div>
    </div>`;
}

/* ============================ BÚSQUEDA =============================== */
function vistaBusqueda(ctx, q) {
  const t = q.toLowerCase().trim();
  const bloques = [];
  const bol = BOLOS_MEDICAMENTOS.map(m => [m, 'Medicamentos'])
    .concat(BOLOS_OTROS.map(m => [m, 'Otros medicamentos']))
    .filter(p => p[0].nombre.toLowerCase().includes(t));
  if (bol.length) bloques.push(`<h2 class="seccion__titulo">Bolos</h2>
    <div class="grid">${bol.map(p => cardBolo(p[0], ctx, p[1])).join('')}</div>`);

  const inf = INFUSIONES.filter(i => i.nombre.toLowerCase().includes(t));
  if (inf.length) bloques.push(`<h2 class="seccion__titulo">Infusiones continuas</h2>
    <div class="grid">${inf.map(i => cardInfusion(i, ctx)).join('')}</div>`);

  const ant = ANTIMICROBIANOS.filter(m => m.nombre.toLowerCase().includes(t));
  if (ant.length) bloques.push(`<h2 class="seccion__titulo">Antimicrobianos</h2>
    <div class="grid grid--ancha">${ant.map(m => cardAnti(m, ctx)).join('')}</div>`);

  if (t.length >= 3 && 'inmunoglobulina igiv inmunoglobulina ev'.includes(t)) bloques.push(vistaIG(ctx));
  if (!bloques.length) return `<p class="vacio">Sin resultados para «${esc(q)}».</p>`;
  return `<p class="seccion__intro">Resultados de la búsqueda «${esc(q)}» en todas las secciones.</p>` +
         bloques.join('');
}

/* ============================= RENDER ================================ */
function chips(ctx) {
  const c = [];
  c.push(`<span class="chip chip--destacado"><span>Peso</span><b>${ctx.hayPeso ? num(ctx.kg, 3) + ' Kg' : '—'}</b></span>`);
  c.push(`<span class="chip"><span>Edad</span><b>${esNum(estado.edad) ? estado.edad + ' días' : '—'}</b></span>`);
  c.push(`<span class="chip chip--destacado"><span>EG corregida</span><b>${
    ctx.hayEG ? ctx.egcSem + ' sem + ' + Math.round(ctx.egcD) + ' d' : '—'}</b></span>`);
  c.push(`<span class="chip"><span>EGC decimal</span><b>${ctx.hayEG ? num(ctx.egc, 2) : '—'}</b></span>`);
  c.push(`<span class="chip"><span>SC (0,05·Kg+0,05)</span><b>${ctx.hayPeso ? num(ctx.sc, 2) + ' m²' : '—'}</b></span>`);
  c.push(`<span class="chip"><span>SC ((4·Kg+7)/(90+Kg))</span><b>${ctx.hayPeso ? num(ctx.sc2, 2) + ' m²' : '—'}</b></span>`);
  return c.join('');
}

function render() {
  const ctx = contexto();
  $('#derivados').innerHTML = chips(ctx);
  $('#resumenMini').innerHTML = ctx.hayPeso
    ? `<b>${num(ctx.g, 0)} g</b>${ctx.hayEG ? ' · ' + ctx.egcSem + '+' + Math.round(ctx.egcD) : ''}` +
      `${esNum(estado.edad) ? ' · ' + estado.edad + ' d' : ''}`
    : '<span class="resumen--vacio">sin peso</span>';
  $('#avisoPeso').hidden = ctx.hayPeso;

  const q = $('#inBuscar').value.trim();
  const vistas = { bolos: vistaBolos, infusiones: vistaInfusiones, antimicrobianos: vistaAnti,
                   inmunoglobulina: vistaIG, reanimacion: vistaReanimacion, ficha: vistaFicha };

  $$('.vista').forEach(v => { v.hidden = true; });
  if (q) {
    const v = $('#vista-busqueda');
    v.innerHTML = vistaBusqueda(ctx, q);
    v.hidden = false;
  } else {
    const v = $('#vista-' + estado.vista);
    v.innerHTML = vistas[estado.vista](ctx);
    v.hidden = false;
  }
  $$('.tab').forEach(t => t.classList.toggle('is-active', !q && t.dataset.vista === estado.vista));
}

/* ============================= EVENTOS =============================== */
function bindCampo(id, prop, tipo) {
  const el = $(id);
  el.addEventListener('input', () => {
    const v = el.value;
    estado[prop] = tipo === 'num' ? (v === '' ? null : Number(v)) : v;
    if (prop === 'fn') {
      const d = diasDesde(v);
      if (d != null && d >= 0) { estado.edad = d; $('#inEdad').value = d; }
    }
    guardar(); render();
  });
}

function init() {
  restaurar();
  document.documentElement.dataset.tema = estado.tema || 'claro';

  $('#inNombre').value = estado.nombre || '';
  $('#inDiagnostico').value = estado.diagnostico || '';
  $('#inCupo').value = estado.cupo || '';
  $('#inPeso').value = estado.peso ?? '';
  $('#inTalla').value = estado.talla ?? '';
  $('#inFN').value = estado.fn || '';
  $('#inEdad').value = estado.edad ?? '';
  $('#inEGsem').value = estado.egSem ?? '';
  $('#inEGdia').value = estado.egDia ?? '';

  bindCampo('#inNombre', 'nombre'); bindCampo('#inDiagnostico', 'diagnostico');
  bindCampo('#inCupo', 'cupo'); bindCampo('#inPeso', 'peso', 'num');
  bindCampo('#inTalla', 'talla', 'num'); bindCampo('#inFN', 'fn');
  bindCampo('#inEdad', 'edad', 'num'); bindCampo('#inEGsem', 'egSem', 'num');
  bindCampo('#inEGdia', 'egDia', 'num');

  const hoy = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  $('#fechaHoy').textContent = hoy;
  $('#pieFecha').textContent = hoy;

  $('#tabs').addEventListener('click', ev => {
    const t = ev.target.closest('.tab'); if (!t) return;
    estado.vista = t.dataset.vista; $('#inBuscar').value = '';
    guardar(); render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let tBuscar;
  $('#inBuscar').addEventListener('input', () => { clearTimeout(tBuscar); tBuscar = setTimeout(render, 120); });

  document.addEventListener('input', ev => {
    const inf = ev.target.dataset && ev.target.dataset.infusion;
    if (inf) {
      const v = ev.target.value === '' ? null : Number(ev.target.value);
      if (v === null) delete estado.infusiones[inf]; else estado.infusiones[inf] = v;
      guardar();
      const foco = ev.target.id;
      render();
      const nuevo = document.getElementById(foco);
      if (nuevo) { nuevo.focus(); try { nuevo.setSelectionRange(nuevo.value.length, nuevo.value.length); } catch (e) {} }
    }
  });

  document.addEventListener('change', ev => {
    if (ev.target.id === 'igPres') { estado.igPresentacion = Number(ev.target.value); guardar(); render(); }
    if (ev.target.id === 'igDosis') { estado.igDosis = Number(ev.target.value); guardar(); render(); }
  });

  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-formula]');
    if (b) {
      const f = FORMULAS[b.dataset.formula];
      $('#modalTitulo').textContent = f.titulo;
      $('#modalCuerpo').innerHTML = f.lineas.map(l =>
        `<div class="formula__etq">${esc(l[0])}</div><div class="formula">${esc(l[1])}</div>`).join('') +
        `<p class="nota">Referencias de celdas de la planilla original: B6 = peso (g), D5 = edad (días),
         F5 = EG (semanas), I5 = EG corregida decimal, K5 = días de la EG corregida.</p>`;
      $('#modal').hidden = false;
    }
  });
  $('#modalCerrar').addEventListener('click', () => { $('#modal').hidden = true; });
  $('#modal').addEventListener('click', ev => { if (ev.target.id === 'modal') $('#modal').hidden = true; });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') $('#modal').hidden = true; });

  const aplicarColapso = () => {
    $('#paciente').classList.toggle('is-colapsado', !!estado.datosColapsados);
    $('#btnDatos').setAttribute('aria-expanded', String(!estado.datosColapsados));
  };
  aplicarColapso();
  $('#btnDatos').addEventListener('click', () => {
    estado.datosColapsados = !estado.datosColapsados; guardar(); aplicarColapso();
  });

  $('#btnImprimir').addEventListener('click', () => window.print());
  $('#btnTema').addEventListener('click', () => {
    estado.tema = (document.documentElement.dataset.tema === 'oscuro') ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = estado.tema; guardar();
  });
  $('#btnLimpiar').addEventListener('click', () => {
    if (!confirm('¿Borrar los datos del paciente y volver a los valores por defecto?')) return;
    Object.assign(estado, { nombre: '', diagnostico: '', cupo: '', peso: null, talla: null,
      fn: '', edad: null, egSem: null, egDia: 0, infusiones: {} });
    ['#inNombre', '#inDiagnostico', '#inCupo', '#inPeso', '#inTalla', '#inFN', '#inEdad', '#inEGsem', '#inEGdia']
      .forEach(s => { $(s).value = ''; });
    guardar(); render(); $('#inPeso').focus();
  });

  render();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
})();
