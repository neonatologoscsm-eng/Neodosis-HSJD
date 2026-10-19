/* =====================================================================
   NeoDosis HSJD — Base de datos de fármacos
   Réplica fiel de la planilla "Cálculo de medicamentos de alto riesgo"
   Unidad de Neonatología · Hospital San Juan de Dios
   ---------------------------------------------------------------------
   Cada valor calculado conserva la fórmula original de Excel en el campo
   `xl` para poder auditarla desde la interfaz.
   Contexto de cálculo (ctx):
     ctx.g    = peso en gramos            (Excel: B6)
     ctx.kg   = peso en kilos             (B6/1000)
     ctx.d    = edad cronológica en días  (D5)
     ctx.eg   = edad gestacional decimal  (F5)
     ctx.egc  = EG corregida decimal      (I5 = F5 + D5/7)
     ctx.egcD = días de la EGC            (K5)
   ===================================================================== */

/* Sentinela que replica el valor FALSO que devuelve Excel cuando una
   cadena de IF() no cubre el caso (en Excel ese FALSO se propaga como 0). */
const XL_FALSE = Symbol('excel-false');

/* ------------------------------------------------------------------ */
/* HOJA "Medicamentos" — Bolos                                         */
/* ------------------------------------------------------------------ */
const BOLOS_MEDICAMENTOS = [
  {
    nombre: 'Adenosina', conc: '3 mg/ mL', via: 'EV',
    diluir: 'No diluir', tiempo: '1 - 2 seg',
    lineas: [{ dosisTxt: '0,1 mg/Kg', porKg: 0.1, unidad: 'mg', div: 3,
               xlDosis: '=(0,1*B6)/1000', xlVol: '=(E11/3)' }]
  },
  {
    nombre: 'Adrenalina', conc: '0,1 mg/mL (1:10.000)', via: 'EV / ET',
    diluir: 'SF', tiempo: 'Bolo rápido',
    lineas: [
      { etiqueta: 'EV', dosisTxt: '0,03 mg/Kg', porKg: 0.03, unidad: 'mg', div: 0.1,
        xlDosis: '=(0,03*B6)/1000', xlVol: '=(E12/0,1)' },
      { etiqueta: 'ET', dosisTxt: '0,05 mg/Kg', porKg: 0.05, unidad: 'mg', div: 0.1,
        xlDosis: '=(0,05*B6)/1000', xlVol: '=(E13/0,1)' }
    ]
  },
  {
    nombre: 'Fenitoína', conc: '5 mg/mL', via: 'EV',
    diluir: 'SF', tiempo: '15-30 minutos',
    lineas: [
      { etiqueta: 'Carga', dosisTxt: '20 mg/Kg', porKg: 20, unidad: 'mg', div: 5,
        xlDosis: '=(B6*20)/1000', xlVol: '=(E14/5)' },
      { etiqueta: 'Mantención', dosisTxt: '3 mg/Kg/dosis', porKg: 3, unidad: 'mg', div: 5,
        xlDosis: '=(B6*3)/1000', xlVol: '=E15/5' }
    ]
  },
  {
    nombre: 'Fenobarbital', conc: '10 mg/mL', via: 'EV',
    diluir: 'SF', tiempo: 'Bolo lento',
    lineas: [
      { etiqueta: 'Carga', dosisTxt: '20 mg/Kg', porKg: 20, unidad: 'mg', div: 10,
        xlDosis: '=(B6*20)/1000', xlVol: '=(E16/10)' },
      { etiqueta: 'Mantención', dosisTxt: '3 mg/Kg/dosis', porKg: 3, unidad: 'mg', div: 10,
        xlDosis: '=(B6*3)/1000', xlVol: '=(E17/10)' }
    ]
  },
  {
    nombre: 'Fentanilo', conc: '10 mcg / mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: 'Bolo lento',
    lineas: [{ dosisTxt: '1 mcg/Kg', porKg: 1, unidad: 'mcg', div: 10,
               xlDosis: '=(B6*1)/1000', xlVol: '=(E18/10)' }]
  },
  {
    nombre: 'Flumazenil', conc: '100 mcg/mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: '15 segundos',
    lineas: [{ dosisTxt: '5 mcg/ Kg', porKg: 5, unidad: 'mcg', div: 100,
               xlDosis: '=(B6*5)/1000', xlVol: '=(E19/100)' }]
  },
  {
    nombre: 'Hidrato de cloral', conc: '100 mg/mL', via: 'VO o rectal',
    diluir: 'No diluir', tiempo: 'No aplica',
    lineas: [{ dosisTxt: '40 mg/ Kg', porKg: 40, unidad: 'mg', div: 100,
               xlDosis: '=(B6*40)/1000', xlVol: '=(E20/100)' }]
  },
  {
    nombre: 'Levetiracetam', conc: '5 mg/mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: '15 minutos',
    lineas: [
      { etiqueta: 'Carga', dosisTxt: '40 mg/Kg', porKg: 40, unidad: 'mg', div: 5,
        xlDosis: '=(B6*40)/1000', xlVol: '=(E21/5)' },
      { etiqueta: 'Mantención', dosisTxt: '40 mg/Kg/dosis', porKg: 40, unidad: 'mg', div: 5,
        xlDosis: '=(B6*40)/1000', xlVol: '=(E22/5)' }
    ]
  },
  {
    nombre: 'Lorazepam', conc: '2 mg/ mL', via: 'EV',
    diluir: 'No diluir', tiempo: '15 minutos',
    lineas: [{ dosisTxt: '0,05 mg/Kg', porKg: 0.05, unidad: 'mg', div: 2,
               xlDosis: '=(B6*0,05)/1000', xlVol: '=(E23/2)' }]
  },
  {
    nombre: 'Metadona', conc: '1 mg/mL', via: 'EV',
    diluir: 'SF', tiempo: 'Bolo rápido',
    lineas: [{ dosisTxt: '0,1 mg/Kg', porKg: 0.1, unidad: 'mg', div: 1,
               xlDosis: '=(B6*0,1)/1000', xlVol: '=(E24/1)' }]
  },
  {
    nombre: 'Midazolam', conc: '1 mg/mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: 'Bolo lento',
    lineas: [{ dosisTxt: '0,2 mg/ Kg', porKg: 0.2, unidad: 'mg', div: 1,
               xlDosis: '=(B6*0,2)/1000', xlVol: '=(E25/1)' }]
  },
  {
    nombre: 'Morfina', conc: '0,1 mg/0,1 mL', via: 'EV',
    diluir: 'SG 5% o 10% o SF', tiempo: 'Bolo lento',
    lineas: [{ dosisTxt: '0,1 mg/ Kg', porKg: 0.1, unidad: 'mg', div: 0.1,
               xlDosis: '=(B6*0,1)/1000', xlVol: '=(E26/0,1)' }]
  },
  {
    nombre: 'Naloxona', conc: '0,4 mg/mL', via: 'EV o IM',
    diluir: 'No diluir', tiempo: 'Bolo rápido',
    lineas: [{ dosisTxt: '0,1 mg/ Kg', porKg: 0.1, unidad: 'mg', div: 0.4,
               xlDosis: '=(B6*0,1)/1000', xlVol: '=(E27/0,4)' }]
  },
  {
    nombre: 'Propofol', conc: '2 mg/mL', via: 'EV',
    diluir: 'SG 5%', tiempo: '60 segundos',
    lineas: [{ dosisTxt: '1 mg/Kg', porKg: 1, unidad: 'mg', div: 2,
               xlDosis: '=(B6*1)/1000', xlVol: '=(E28/2)' }]
  },
  {
    nombre: 'Vecuronio', conc: '1 mg/mL', via: 'EV',
    diluir: 'SF o SG 5%', tiempo: 'Bolo lento',
    lineas: [{ dosisTxt: '0,1 mg/ Kg', porKg: 0.1, unidad: 'mg', div: 1,
               xlDosis: '=(B6*0,1)/1000', xlVol: '=(E29/1)' }]
  }
];

/* ------------------------------------------------------------------ */
/* HOJA "Otros medicamentos" — Bolos                                   */
/* ------------------------------------------------------------------ */
const BOLOS_OTROS = [
  {
    nombre: 'Albúmina', conc: '20% (20 g/100 mL)', via: 'EV',
    diluir: 'API', tiempo: '4-6 Hr',
    lineas: [{ dosisTxt: '1 g/Kg', porKg: 1, unidad: 'g', vol: d => (d * 100) / 20,
               xlDosis: '=(1*B6)/1000', xlVol: '=(E11*100)/20' }]
  },
  {
    nombre: 'Amiodarona', conc: '1,5 mg/mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: '20 - 60 min',
    lineas: [{ dosisTxt: '5 mg/Kg', porKg: 5, unidad: 'mg', div: 1.5,
               xlDosis: '=(B6*5)/1000', xlVol: '=(E12/1,5)' }]
  },
  {
    nombre: 'Atropina', conc: '0,1 mg/mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: 'Bolo rápido',
    lineas: [{ dosisTxt: '0,01 mg/Kg', porKg: 0.01, unidad: 'mg', div: 0.1,
               xlDosis: '=(B6*0,01)/1000', xlVol: '=(E13/0,1)' }]
  },
  {
    nombre: 'Gluconato de calcio', conc: '50 mg/mL (al medio)', via: 'EV por vía central',
    diluir: 'API', tiempo: 'Bolo lento',
    lineas: [{ dosisTxt: '100 mg/Kg', porKg: 100, unidad: 'mg', div: 50,
               xlDosis: '=(B6*100)/1000', xlVol: '=(E14/50)' }]
  },
  {
    nombre: 'Sulfato de magnesio', conc: '100 mg/mL', via: 'EV',
    diluir: 'SG 5% o SF', tiempo: 'Bolo rápido',
    lineas: [{ dosisTxt: '25 mg/Kg', porKg: 25, unidad: 'mg', div: 100,
               xlDosis: '=(B6*25)/1000', xlVol: '=(E15/100)' }]
  },
  {
    nombre: 'Verapamilo', conc: '0,5 mg/mL', via: 'EV',
    diluir: 'SG 5%', tiempo: 'Bolo lento',
    lineas: [{ dosisTxt: '0,1 mg/Kg', porKg: 0.1, unidad: 'mg', div: 0.5,
               xlDosis: '=(B6*0,1)/1000', xlVol: '=(E16/0,5)' }]
  }
];

/* ------------------------------------------------------------------ */
/* Infusiones continuas (preparación para 24 mL)                       */
/*  factor 1440 = dosis por minuto · 24 h ; factor 24 = dosis por hora  */
/*  div 1000 = la dosis viene en mcg/mUI y la preparación se expresa    */
/*  en mg/UI                                                           */
/* ------------------------------------------------------------------ */
const INFUSIONES = [
  { hoja: 'Medicamentos', nombre: 'Adrenalina', rango: '0,1-1 mcg/Kg/min',
    preparar: 'SG 5%, 10% o Suero fisiológico', porCC: 1, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D34*60*24)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Alprostadil (Prostaglandina E1)', rango: '0,01 - 0,1 mcg/Kg/min',
    preparar: 'SG 5% o Suero fisiológico', porCC: 0.01, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1, prepUnidad: 'mcg', xl: '=(B6*D35*60*24)/1000' },
  { hoja: 'Medicamentos', nombre: 'Dobutamina', rango: '2 - 20 mcg/Kg/min',
    preparar: 'SG 5%, 10% o Suero fisiológico', porCC: 20, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D36*60*24)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Dopamina', rango: '2-20 mcg/Kg/min',
    preparar: 'SG 5%, 10% o Suero fisiológico', porCC: 20, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D37*60*24)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Fentanilo', rango: '0,5 - 5 mcg/Kg/hr',
    preparar: 'SG 5% o Suero fisiológico', porCC: 5, unidad: 'mcg/Kg/hr / mL',
    factor: 24, div: 1, prepUnidad: 'mcg', xl: '=(B6*D38*24)/1000' },
  { hoja: 'Medicamentos', nombre: 'Insulina', rango: '0,01 - 0,1 UI/Kg/hr',
    preparar: 'Suero fisiológico', porCC: 0.1, unidad: 'UI/Kg/hr / mL',
    factor: 24, div: 1, prepUnidad: 'UI', xl: '=(B6*D39*24)/1000' },
  { hoja: 'Medicamentos', nombre: 'Midazolam', rango: '100 - 200 mcg/Kg/hr',
    preparar: 'SG 5% o Suero fisiológico', porCC: 100, unidad: 'mcg/Kg/hr / mL',
    factor: 24, div: 1000, prepUnidad: 'mg', xl: '=(B6*D40*24)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Milrinona', rango: '0,3 - 0,75 mcg/Kg/min',
    preparar: 'SG 5% o Suero fisiológico', porCC: 1, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*60*24*D41)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Morfina', rango: '20-40 mcg/Kg/hr',
    preparar: 'SG 5%, 10% o Suero fisiológico', porCC: 20, unidad: 'mcg/Kg/hr / mL',
    factor: 24, div: 1000, prepUnidad: 'mg', xl: '=(B6*D42*24)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Noradrenalina', rango: '0,1 - 1 mcg/Kg/min',
    preparar: 'Suero glucosado al 5%', porCC: 1, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D43*60*24)/1000/1000' },
  { hoja: 'Medicamentos', nombre: 'Precedex (dexmedetomidina)', rango: '0,05-0,8 mcg/Kg/hr',
    preparar: 'SG 5% o Suero fisiológico', porCC: 0.6, unidad: 'mcg/Kg/hr / mL',
    factor: 24, div: 1, prepUnidad: 'mcg', xl: '=(B6*D44*24)/1000' },
  { hoja: 'Medicamentos', nombre: 'Propofol', rango: '1 – 3 mg/Kg/hr',
    preparar: 'Suero glucosado al 5%', porCC: 3, unidad: 'mg/Kg/hr / mL',
    factor: 24, div: 1, prepUnidad: 'mg', xl: '=(B6*D45*24)/1000' },
  { hoja: 'Medicamentos', nombre: 'Vecuronio', rango: '0,2-0,5 mg/Kg/hr',
    preparar: 'SG 5% o Suero fisiológico', porCC: 0.2, unidad: 'mg/Kg/hr / mL',
    factor: 24, div: 1, prepUnidad: 'mg', xl: '=(B6*D46*24)/1000' },
  { hoja: 'Otros medicamentos', nombre: 'Amiodarona', rango: '7-15 mcg/Kg/min',
    preparar: 'SG 5% o SF', porCC: 15, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D21*24*60)/1000/1000' },
  { hoja: 'Otros medicamentos', nombre: 'Ketamina', rango: '10-40 mcg/Kg/min',
    preparar: 'SG 5% o SF', porCC: 15, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D22*24*60)/1000/1000' },
  { hoja: 'Otros medicamentos', nombre: 'Furosemida', rango: '0,05-1 mg/Kg/h',
    preparar: 'SF', porCC: 1, unidad: 'mg/Kg/h / mL',
    factor: 24, div: 1, prepUnidad: 'mg', xl: '=(B6*D23*24)/1000' },
  { hoja: 'Otros medicamentos', nombre: 'Isoproterenol', rango: '0,05-0,5 mcg/Kg/min',
    preparar: 'SF', porCC: 0.1, unidad: 'mcg/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'mg', xl: '=(B6*D24*24*60)/1000/1000' },
  { hoja: 'Otros medicamentos', nombre: 'Vasopresina', rango: '0,1-1,2 mU/Kg/min',
    preparar: 'SG 5% o SF', porCC: 1, unidad: 'mUI/Kg/min / mL',
    factor: 1440, div: 1000, prepUnidad: 'UI', xl: '=(B6*D25*24*60)/1000/1000' }
];
