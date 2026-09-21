/* =====================================================================
   Calculadora de medicamentos · Clínica Santa María
   Hojas con estructura propia: ANTIBIOTICOS, Hoja de Urgencia, DART,
   WEANING OPIODES, C Glucosa, GGlobulina y Formulas (nutrición).
   Los valores son los de la planilla; los criterios de cada fila se
   expresan además como condición para poder resaltar la que corresponde
   al paciente (en la planilla esa elección se hace a ojo).
   ===================================================================== */

/* ------------------------------------------------------------------ */
/* ANTIBIOTICOS — cada fármaco es una tabla; `aplica` reproduce el      */
/* criterio escrito en la propia fila (EG, edad postnatal, peso).       */
/* ------------------------------------------------------------------ */
const ANTIBIOTICOS_CSM = [
  {
    nombre: 'Ampicilina', fuente: 'SOCHINF 2020',
    columnas: ['Edad gestacional (sem)', 'Edad postnatal (días)'],
    esquemas: ['Bacteriemia', 'Meningitis'],
    filas: [
      { crit: ['≤ 34', '≤ 7'],        aplica: c => c.eg <= 34 && c.d <= 7,
        dosis: [50, 100], intervalo: [12, 8] },
      { crit: ['≤ 34', '≥ 8 y ≤ 28'], aplica: c => c.eg <= 34 && c.d >= 8 && c.d <= 28,
        dosis: [75, 75],  intervalo: [12, 6] },
      { crit: ['> 34', '≤ 7'],        aplica: c => c.eg > 34 && c.d <= 7,
        dosis: [50, 100], intervalo: [8, 8] },
      { crit: ['> 34', '≥ 8 y ≤ 28'], aplica: c => c.eg > 34 && c.d >= 8 && c.d <= 28,
        dosis: [50, 75],  intervalo: [8, 6] }
    ]
  },
  {
    nombre: 'Gentamicina',
    columnas: ['Edad gestacional (sem)', 'Edad postnatal (días)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['≤ 29', '≤ 7'],   aplica: c => c.eg <= 29 && c.d <= 7,  dosis: [5], intervalo: [48] },
      { crit: ['≤ 29', '8 - 28'], aplica: c => c.eg <= 29 && c.d >= 8 && c.d <= 28, dosis: [5], intervalo: [36] },
      { crit: ['≤ 29', '≥ 29'],  aplica: c => c.eg <= 29 && c.d >= 29, dosis: [5], intervalo: [24] },
      { crit: ['30 - 34', '≤ 7'], aplica: c => c.eg >= 30 && c.eg <= 34 && c.d <= 7, dosis: [5], intervalo: [36] },
      { crit: ['30 - 34', '≥ 8'], aplica: c => c.eg >= 30 && c.eg <= 34 && c.d >= 8, dosis: [5], intervalo: [24] },
      { crit: ['≥ 35', 'Todas'], aplica: c => c.eg >= 35, dosis: [5], intervalo: [24] }
    ],
    nota: 'Controlar niveles plasmáticos según protocolo.'
  },
  {
    nombre: 'Amikacina',
    columnas: ['Peso (g)', 'Edad postnatal'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['< 800', '< 14 días'],      aplica: c => c.g < 800 && c.d < 14,  dosis: [16], intervalo: [48] },
      { crit: ['< 800', '≥ 14 días'],      aplica: c => c.g < 800 && c.d >= 14, dosis: [20], intervalo: [42] },
      { crit: ['801 - 1.200', '< 14 días'], aplica: c => c.g >= 801 && c.g <= 1200 && c.d < 14,  dosis: [16], intervalo: [42] },
      { crit: ['801 - 1.200', '≥ 14 días'], aplica: c => c.g >= 801 && c.g <= 1200 && c.d >= 14, dosis: [20], intervalo: [36] },
      { crit: ['1.201 - 2.000', '< 14 días'], aplica: c => c.g >= 1201 && c.g <= 2000 && c.d < 14,  dosis: [15], intervalo: [36] },
      { crit: ['1.201 - 2.000', '≥ 14 días'], aplica: c => c.g >= 1201 && c.g <= 2000 && c.d >= 14, dosis: [18], intervalo: [30] },
      { crit: ['2.001 - 2.800', '< 14 días'], aplica: c => c.g >= 2001 && c.g <= 2800 && c.d < 14,  dosis: [15], intervalo: [36] },
      { crit: ['2.001 - 2.800', '≥ 14 días'], aplica: c => c.g >= 2001 && c.g <= 2800 && c.d >= 14, dosis: [18], intervalo: [24] },
      { crit: ['> 2.800', '< 14 días'], aplica: c => c.g > 2800 && c.d < 14,  dosis: [15], intervalo: [30] },
      { crit: ['> 2.800', '≥ 14 días'], aplica: c => c.g > 2800 && c.d >= 14, dosis: [18], intervalo: [20] }
    ],
    nota: 'Nivel plasmático: sí, pre y post 3ª dosis (30 min).'
  },
  {
    nombre: 'Cloxacilina',
    columnas: ['Edad gestacional', 'Edad postnatal (días)', 'Peso'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['Todas', '≤ 7', '≤ 2 kg'],   aplica: c => c.d <= 7 && c.g <= 2000, dosis: [25], intervalo: [12] },
      { crit: ['Todas', '≤ 7', '> 2 kg'],   aplica: c => c.d <= 7 && c.g > 2000,  dosis: [25], intervalo: [8] },
      { crit: ['Todas', '8 - 28', '≤ 2 kg'], aplica: c => c.d >= 8 && c.d <= 28 && c.g <= 2000, dosis: [25], intervalo: [8] },
      { crit: ['Todas', '8 - 28', '> 2 kg'], aplica: c => c.d >= 8 && c.d <= 28 && c.g > 2000,  dosis: [25], intervalo: [6] }
    ]
  },
  {
    nombre: 'Vancomicina',
    columnas: ['Edad postnatal (días)', 'Peso de nacimiento (g)'],
    esquemas: ['Mantención'],
    carga: { etiqueta: 'Dosis de carga', valores: [
      { crit: '0 - 7 días',   aplica: c => c.d <= 7,  mgkg: 16 },
      { crit: '8 - 14 días',  aplica: c => c.d >= 8 && c.d <= 14, mgkg: 20 },
      { crit: '15 - 28 días', aplica: c => c.d >= 15 && c.d <= 28, mgkg: 23 }
    ]},
    porDia: true,
    filas: [
      { crit: ['0 - 7', '< 700'],        aplica: c => c.d <= 7 && c.g < 700,   dosis: [15], intervalo: [8], dividir: 3 },
      { crit: ['0 - 7', '700 - 1.000'],  aplica: c => c.d <= 7 && c.g >= 700 && c.g <= 1000, dosis: [21], intervalo: [8], dividir: 3 },
      { crit: ['0 - 7', '1.001 - 1.500'], aplica: c => c.d <= 7 && c.g >= 1001 && c.g <= 1500, dosis: [27], intervalo: [8], dividir: 3 },
      { crit: ['0 - 7', '1.501 - 2.500'], aplica: c => c.d <= 7 && c.g >= 1501 && c.g <= 2500, dosis: [30], intervalo: [6], dividir: 4 },
      { crit: ['0 - 7', '> 2.500'],      aplica: c => c.d <= 7 && c.g > 2500,  dosis: [36], intervalo: [6], dividir: 4 },
      { crit: ['8 - 14', '< 700'],       aplica: c => c.d >= 8 && c.d <= 14 && c.g < 700, dosis: [21], intervalo: [8], dividir: 3 },
      { crit: ['8 - 14', '700 - 1.000'], aplica: c => c.d >= 8 && c.d <= 14 && c.g >= 700 && c.g <= 1000, dosis: [27], intervalo: [8], dividir: 3 },
      { crit: ['8 - 14', '1.001 - 1.500'], aplica: c => c.d >= 8 && c.d <= 14 && c.g >= 1001 && c.g <= 1500, dosis: [36], intervalo: [8], dividir: 3 },
      { crit: ['8 - 14', '1.501 - 2.500'], aplica: c => c.d >= 8 && c.d <= 14 && c.g >= 1501 && c.g <= 2500, dosis: [40], intervalo: [6], dividir: 4 },
      { crit: ['8 - 14', '> 2.500'],     aplica: c => c.d >= 8 && c.d <= 14 && c.g > 2500, dosis: [48], intervalo: [6], dividir: 4 },
      { crit: ['15 - 28', '< 700'],      aplica: c => c.d >= 15 && c.d <= 28 && c.g < 700, dosis: [24], intervalo: [8], dividir: 3 },
      { crit: ['15 - 28', '700 - 1.000'], aplica: c => c.d >= 15 && c.d <= 28 && c.g >= 700 && c.g <= 1000, dosis: [42], intervalo: [8], dividir: 3 },
      { crit: ['15 - 28', '1.001 - 1.500'], aplica: c => c.d >= 15 && c.d <= 28 && c.g >= 1001 && c.g <= 1500, dosis: [45], intervalo: [8], dividir: 3 },
      { crit: ['15 - 28', '1.501 - 2.500'], aplica: c => c.d >= 15 && c.d <= 28 && c.g >= 1501 && c.g <= 2500, dosis: [52], intervalo: [6], dividir: 4 },
      { crit: ['15 - 28', '> 2.500'],    aplica: c => c.d >= 15 && c.d <= 28 && c.g > 2500, dosis: [60], intervalo: [6], dividir: 4 }
    ],
    nota: 'La dosis de mantención de la planilla está en mg/Kg/día y se reparte en las tomas del intervalo. Nivel plasmático: sí, previo a la 4ª dosis, 10-20 mg/dL.'
  },
  {
    nombre: 'Cefotaxima',
    columnas: ['Edad gestacional (sem)', 'Edad postnatal (días)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['Todas', '0 - 7'], aplica: c => c.d <= 7, dosis: [50], intervalo: [12] },
      { crit: ['< 32', '≥ 7'],    aplica: c => c.eg < 32 && c.d >= 7, dosis: [50], intervalo: [8] },
      { crit: ['≥ 32', '≥ 7'],    aplica: c => c.eg >= 32 && c.d >= 7, dosis: [37.5], intervalo: [6] }
    ]
  },
  {
    nombre: 'Cefazolina', fuente: 'Neofax 2020',
    columnas: ['Edad gestacional (sem)', 'Edad postnatal (días)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['≤ 29', '0 - 28'],  aplica: c => c.eg <= 29 && c.d <= 28, dosis: [25], intervalo: [12] },
      { crit: ['≤ 29', '> 28'],    aplica: c => c.eg <= 29 && c.d > 28,  dosis: [25], intervalo: [8] },
      { crit: ['30 - 36', '0 - 14'], aplica: c => c.eg >= 30 && c.eg <= 36 && c.d <= 14, dosis: [25], intervalo: [12] },
      { crit: ['30 - 36', '> 14'], aplica: c => c.eg >= 30 && c.eg <= 36 && c.d > 14, dosis: [25], intervalo: [8] },
      { crit: ['37 - 44', '0 - 7'], aplica: c => c.eg >= 37 && c.eg <= 44 && c.d <= 7, dosis: [25], intervalo: [12] },
      { crit: ['37 - 44', '> 7'],  aplica: c => c.eg >= 37 && c.eg <= 44 && c.d > 7, dosis: [25], intervalo: [8] },
      { crit: ['≥ 45', 'Todos'],   aplica: c => c.eg >= 45, dosis: [25], intervalo: [6] }
    ],
    nota: 'La planilla calcula la dosis (25 mg/Kg) sólo en la primera fila; el intervalo es el que cambia por fila.'
  },
  {
    nombre: 'Piperacilina / Tazobactam',
    columnas: ['Edad postmenstrual (sem)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['< 30'],      aplica: c => c.egc < 30, dosis: [100], intervalo: [8] },
      { crit: ['30 - 35'],   aplica: c => c.egc >= 30 && c.egc <= 35, dosis: [80], intervalo: [6] },
      { crit: ['> 35 - 49'], aplica: c => c.egc > 35 && c.egc <= 49, dosis: [80], intervalo: [4] }
    ]
  },
  {
    nombre: 'Meropenem',
    columnas: ['Edad gestacional (sem)', 'Edad postnatal (días)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['< 32', '< 14'],  aplica: c => c.eg < 32 && c.d < 14,  dosis: [20], intervalo: [12] },
      { crit: ['< 32', '≥ 14'],  aplica: c => c.eg < 32 && c.d >= 14, dosis: [20], intervalo: [8] },
      { crit: ['≥ 32', '< 14'],  aplica: c => c.eg >= 32 && c.d < 14, dosis: [20], intervalo: [8] },
      { crit: ['≥ 32', '≥ 14'],  aplica: c => c.eg >= 32 && c.d >= 14, dosis: [30], intervalo: [8] },
      { crit: ['Infección SNC o Pseudomonas', 'Independiente de la EG'], aplica: () => false,
        dosis: [40], intervalo: [8], siempre: true }
    ]
  },
  {
    nombre: 'Metronidazol',
    columnas: ['Edad postmenstrual (sem)'],
    esquemas: ['Mantención'],
    carga: { etiqueta: 'Dosis de carga', valores: [{ crit: 'Todas', aplica: () => true, mgkg: 15 }] },
    filas: [
      { crit: ['24 - 25'], aplica: c => c.egc >= 24 && c.egc <= 25, dosis: [7.5], intervalo: [24] },
      { crit: ['26 - 27'], aplica: c => c.egc >= 26 && c.egc <= 27, dosis: [10],  intervalo: [24] },
      { crit: ['28 - 33'], aplica: c => c.egc >= 28 && c.egc <= 33, dosis: [7.5], intervalo: [12] },
      { crit: ['34 - 40'], aplica: c => c.egc >= 34 && c.egc <= 40, dosis: [7.5], intervalo: [8] },
      { crit: ['> 40'],    aplica: c => c.egc > 40, dosis: [7.5], intervalo: [6] }
    ]
  },
  {
    nombre: 'Linezolid',
    columnas: ['Edad gestacional (sem)', 'Edad postnatal (días)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['≤ 34', '≤ 7'], aplica: c => c.eg <= 34 && c.d <= 7, dosis: [10], intervalo: [12] },
      { crit: ['≤ 34', '> 7'], aplica: c => c.eg <= 34 && c.d > 7,  dosis: [10], intervalo: [8] },
      { crit: ['> 35', 'Todas'], aplica: c => c.eg > 35, dosis: [10], intervalo: [8] }
    ]
  },
  {
    nombre: 'Azitromicina',
    columnas: ['Indicación'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['Bordetella pertussis, 5 días'], aplica: () => false, siempre: true, dosis: [10], intervalo: [24] },
      { crit: ['Conjuntivitis por Chlamydia trachomatis, 3 días'], aplica: () => false, siempre: true, dosis: [20], intervalo: [24] },
      { crit: ['Neumonía por Ureaplasma urealyticum, 3 días'], aplica: () => false, siempre: true, dosis: [20], intervalo: [24] }
    ]
  },
  {
    nombre: 'Cotrimoxazol',
    columnas: ['Edad gestacional (sem)'],
    esquemas: ['Dosis'],
    filas: [{ crit: ['Todas'], aplica: () => true, dosis: [12], intervalo: [12] }],
    nota: 'La planilla expresa esta dosis en mg/Kg/día.'
  },
  {
    nombre: 'Ciprofloxacino',
    columnas: ['Edad postmenstrual (sem)'],
    esquemas: ['Dosis'],
    filas: [
      { crit: ['< 34'], aplica: c => c.egc < 34, dosis: [7.5], intervalo: [12] },
      { crit: ['≥ 34'], aplica: c => c.egc >= 34, dosis: [12.5], intervalo: [12] }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Hoja de Urgencia                                                     */
/* ------------------------------------------------------------------ */
const URGENCIA_CSM = {
  accesos: [
    { nombre: 'TET', valor: c => c.g > 1999 ? '3,5' : c.g > 999 ? '3' : c.g > 400 ? '2,5' : '—',
      unidad: 'mm', medida: 'Fijar', calc: c => 6 + c.g / 1000, medidaUnidad: 'cm',
      xl: '=SI(C6>1999;"3,5";SI(C6>999;"3";SI(C6>400;"2,5")))', xlMedida: '=6+C6/1000' },
    { nombre: 'CAU', valor: c => c.g > 2000 ? '5' : c.g > 400 ? '3,5' : '—',
      unidad: 'Fr', medida: 'Introducir', calc: c => (c.g / 1000 * 3) + 9, medidaUnidad: 'cm + cordón',
      xl: '=SI(C6>2000;"5";SI(C6>400;"3,5"))', xlMedida: '=(C6/1000*3)+9' },
    { nombre: 'CVU', valor: c => c.g > 2000 ? '5' : c.g > 400 ? '3,5' : '—',
      unidad: 'Fr', medida: 'Introducir', calc: c => ((c.g / 1000 * 3) + 9) / 2 + 1, medidaUnidad: 'cm + cordón',
      xl: '=SI(C6>2000;"5";SI(C6>400;"3,5"))', xlMedida: '=((C6/1000*3)+9)/2+1' }
  ],
  grupos: [
    { titulo: 'Reanimación', farmacos: [
      { nombre: 'Adrenalina', conc: '0,1 mg/mL (1:10.000)', via: 'EV', dosisTxt: '0,02 mg/Kg',
        k: 0.02, unidad: 'mg', div: 0.1, xlDosis: '=(0,02*C6)/1000', xlVol: '=(F18/0,1)' },
      { nombre: 'Adrenalina', conc: '0,1 mg/mL (1:10.000)', via: 'ET', dosisTxt: '0,05 mg/Kg',
        k: 0.05, unidad: 'mg', div: 0.1, xlDosis: '=(0,05*C6)/1000', xlVol: '=(F19/0,1)' },
      { nombre: 'Suero fisiológico', conc: '', via: 'EV', dosisTxt: '10 mL/Kg',
        k: 10, unidad: 'mL', div: 1, xlDosis: '=C6/1000*10', xlVol: '=F20' }
    ]},
    { titulo: 'Intubación programada', farmacos: [
      { nombre: 'Atropina', conc: '0,1 mg/mL', via: 'EV', dosisTxt: '0,02 mg/Kg',
        k: 0.02, unidad: 'mg', div: 0.1, xlDosis: '=(C6*0,02)/1000', xlVol: '=F21/0,1' },
      { nombre: 'Fentanilo', conc: '10 mcg/mL', via: 'EV', dosisTxt: '1 mcg/Kg',
        k: 1, unidad: 'mcg', div: 10, xlDosis: '=(C6*1)/1000', xlVol: '=(F22/10)' },
      { nombre: 'Midazolam (> 34 sem)', conc: '0,5 mg/mL', via: 'EV', dosisTxt: '0,2 mg/Kg',
        k: 0.2, unidad: 'mg', div: 0.5, xlDosis: '=C6/1000*0,2', xlVol: '=F23/0,5' }
    ]},
    { titulo: 'Antagonistas', farmacos: [
      { nombre: 'Flumazenil', conc: '100 mcg/mL', via: 'EV', dosisTxt: '5 mcg/Kg',
        k: 5, unidad: 'mcg', div: 100, xlDosis: '=(C6*5)/1000', xlVol: '=(F24/100)' },
      { nombre: 'Naloxona', conc: '0,4 mg/mL', via: 'EV o IM', dosisTxt: '0,1 mg/Kg',
        k: 0.1, unidad: 'mg', div: 0.4, xlDosis: '=(C6*0,1)/1000', xlVol: '=(F25/0,4)' }
    ]},
    { titulo: 'Anticonvulsivantes', farmacos: [
      { nombre: 'Fenobarbital', conc: '20 mg/mL', via: 'EV', dosisTxt: '20 mg/Kg',
        k: 20, unidad: 'mg', div: 20, xlDosis: '=C6/1000*20', xlVol: '=F26/20' },
      { nombre: 'Levetiracetam', conc: '5 mg/mL', via: 'EV', dosisTxt: '20 mg/Kg',
        k: 20, unidad: 'mg', div: 5, xlDosis: '=C6/1000*20', xlVol: '=F27/5' }
    ]},
    { titulo: 'Antiarrítmico', farmacos: [
      { nombre: 'Adenosina', conc: '0,3 mg/mL', via: 'EV', dosisTxt: '0,05 mg/Kg',
        k: 0.05, unidad: 'mg', div: 0.3, xlDosis: '=C6/1000*0,05', xlVol: '=F28/0,3' }
    ]}
  ]
};

/* ------------------------------------------------------------------ */
/* DART — dexametasona, esquema de 10 días                              */
/* ------------------------------------------------------------------ */
const DART_CSM = {
  dilucion: '1 cc dexametasona fosfato (amp 4 mg/mL) + 19 cc API → concentración final 0,2 mg/mL',
  concentracion: 0.2,
  intervalo: 'Cada 12 h',
  dias: [
    { dia: 1, mgkg: 0.075 }, { dia: 2, mgkg: 0.075 }, { dia: 3, mgkg: 0.075 },
    { dia: 4, mgkg: 0.05 },  { dia: 5, mgkg: 0.05 },  { dia: 6, mgkg: 0.05 },
    { dia: 7, mgkg: 0.025 }, { dia: 8, mgkg: 0.025 },
    { dia: 9, mgkg: 0.01 },  { dia: 10, mgkg: 0.01 }
  ],
  xlDosis: '=C4*C8/1000', xlVol: '=D8/0,2'
};

/* ------------------------------------------------------------------ */
/* WEANING DE OPIOIDES A METADONA                                       */
/* Robertson, Pediatr Crit Care Med 2000;1(2)                           */
/* ------------------------------------------------------------------ */
const WEANING_CSM = {
  referencia: 'Robertson, Pediatr Crit Care Med 2000; Vol. 1, Nº 2',
  opioides: [
    { nombre: 'Fentanilo', unidad: 'mcg/Kg/h', divisor: 0.001, xl: '=((dosis mcg/h/1000)*0,1)/0,001*4' },
    { nombre: 'Morfina',   unidad: 'mcg/Kg/h', divisor: 0.1,   xl: '=((dosis mcg/h/1000)*0,1)/0,1*4' }
  ],
  esquemas: [
    { titulo: '< 14 días de uso de opioides', dias: [
      { dia: 1, factor: 1,   entre: 4, intervalo: 6 },
      { dia: 2, factor: 0.8, entre: 3, intervalo: 8 },
      { dia: 3, factor: 0.6, entre: 3, intervalo: 8 },
      { dia: 4, factor: 0.4, entre: 2, intervalo: 12 },
      { dia: 5, factor: 0.2, entre: 1, intervalo: 24 },
      { dia: 6, suspender: true }
    ]},
    { titulo: '≥ 14 días de uso de opioides', dias: [
      { dia: 1, factor: 1,    entre: 4, intervalo: 6 },
      { dia: 2, factor: 1,    entre: 4, intervalo: 6 },
      { dia: 3, factor: 0.8,  entre: 4, intervalo: 6 },
      { dia: 4, factor: 0.8,  entre: 4, intervalo: 6 },
      { dia: 5, factor: 0.6,  entre: 3, intervalo: 8 },
      { dia: 6, factor: 0.6,  entre: 3, intervalo: 8 },
      { dia: 7, factor: 0.4,  entre: 2, intervalo: 12 },
      { dia: 8, factor: 0.4,  entre: 2, intervalo: 12 },
      { dia: 9, factor: 0.2,  entre: 1, intervalo: 24 },
      { dia: 10, factor: 0.2, entre: 1, intervalo: 24 },
      { dia: 11, suspender: true }
    ]}
  ]
};

/* ------------------------------------------------------------------ */
/* C Glucosa — carga de glucosa según fleboclisis                       */
/* ------------------------------------------------------------------ */
const GLUCOSA_CSM = {
  volPorKg: 30,
  sueros: [
    { nombre: 'SG 5%',    pct: 5 },
    { nombre: 'SG 10%',   pct: 10 },
    { nombre: 'SG 12,5%', pct: 12.5 },
    { nombre: 'SG 15%',   pct: 15 },
    { nombre: 'SG 20%',   pct: 20 }
  ],
  xlVolDia: '=C1*C6/1000', xlGoteo: '=D6/24', xlCarga: '=(C6*% /100)/1440*1000'
};

/* ------------------------------------------------------------------ */
/* Gammaglobulina EV                                                    */
/* ------------------------------------------------------------------ */
const IG_CSM = { presentaciones: [5000, 10000], dosis: [400, 500, 600, 1000] };
