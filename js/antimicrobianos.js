/* =====================================================================
   NeoDosis HSJD — Hoja "Antimicrobianos"
   Réplica exacta de las fórmulas condicionales de la planilla.
     I = EGC decimal (I5)   ·   D = edad en días (D5)   ·   g = peso (B6)
   Cada esquema conserva la fórmula original de Excel para auditoría.
   ===================================================================== */

const ANTIMICROBIANOS = [
/* ----------------------------- ANTIBIÓTICOS ----------------------------- */
{
  grupo: 'Antibióticos', nombre: 'Ampicilina', via: 'EV',
  concSin: '30 mg/mL', concCon: '100 mg/mL', cSin: 30, cCon: 100,
  diluir: 'SF', tiempo: 'Bolo directo',
  esquemas: [
    { label: 'Bacteriemia',
      dosis: c => (c.egc <= 34 && c.d <= 7) ? 50 : (c.egc <= 34 && c.d >= 8) ? 75
                : (c.egc > 34 && c.d <= 7) ? 50 : (c.egc > 34 && c.d >= 8) ? 50 : 'error',
      dosisXl: '=SI(Y(I5<=34;D5<=7);50;SI(Y(I5<=34;D5>=8);75;SI(Y(I5>34;D5<=7);50;SI(Y(I5>34;D5>=8);50;"error"))))',
      intervalo: c => (c.egc <= 34 && c.d <= 7) ? 12 : (c.egc <= 34 && c.d >= 8) ? 12
                : (c.egc > 34 && c.d <= 7) ? 8 : (c.egc > 34 && c.d >= 8) ? 8 : 'error',
      intervaloXl: '=SI(Y(I5<=34;D5<=7);12;SI(Y(I5<=34;D5>=8);12;SI(Y(I5>34;D5<=7);8;SI(Y(I5>34;D5>=8);8;"error"))))' },
    { label: 'Meningitis',
      dosis: c => (c.egc <= 34 && c.d <= 7) ? 100 : (c.egc <= 34 && c.d >= 8) ? 75
                : (c.egc > 34 && c.d <= 7) ? 100 : (c.egc > 34 && c.d >= 8) ? 75 : 'error',
      dosisXl: '=SI(Y(I5<=34;D5<=7);100;SI(Y(I5<=34;D5>=8);75;SI(Y(I5>34;D5<=7);100;SI(Y(I5>34;D5>=8);75;"error"))))',
      intervalo: c => (c.egc <= 34 && c.d <= 7) ? 8 : (c.egc <= 34 && c.d >= 8) ? 6
                : (c.egc > 34 && c.d <= 7) ? 8 : (c.egc > 34 && c.d >= 8) ? 6 : 'error',
      intervaloXl: '=SI(Y(I5<=34;D5<=7);8;SI(Y(I5<=34;D5>=8);6;SI(Y(I5>34;D5<=7);8;SI(Y(I5>34;D5>=8);6;"error"))))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Amikacina', via: 'EV',
  concSin: '3 mg/mL', concCon: '10 mg/mL', cSin: 3, cCon: 10,
  diluir: 'SF o SG 5, 10 y 20%', tiempo: '1 h',
  esquemas: [
    { dosis: c => {
        const g = c.g, d = c.d;
        if (g <= 800 && d < 14) return 16;
        if (g <= 800 && d >= 14) return 20;
        if (g > 800 && g <= 1200 && d < 14) return 16;
        if (g > 800 && g <= 1200 && d >= 14) return 20;
        if (g > 1200 && g <= 2000 && d < 14) return 15;
        if (g > 1200 && g <= 2000 && d >= 14) return 18;
        if (g > 2000 && g <= 2800 && d < 14) return 15;
        if (g > 2000 && g <= 2800 && d >= 14) return 18;
        if (g > 2800 && d < 14) return 15;
        if (g > 2800 && d >= 14) return 18;
        return 'error';
      },
      dosisXl: '=SI(Y(B6<=800;D5<14);16;SI(Y(B6<=800;D5>=14);20; … ;SI(Y(B6>2800;D5>=14);18;"error")))',
      intervalo: c => {
        const g = c.g, d = c.d;
        if (g <= 800 && d < 14) return 48;
        if (g <= 800 && d >= 14) return 42;
        if (g > 800 && g <= 1200 && d < 14) return 42;
        if (g > 800 && g <= 1200 && d >= 14) return 36;
        if (g > 1200 && g <= 2000 && d < 14) return 36;
        if (g > 1200 && g <= 2000 && d >= 14) return 30;
        if (g > 2000 && g <= 2800 && d < 14) return 36;
        if (g > 2000 && g <= 2800 && d >= 14) return 24;
        if (g > 2800 && d < 14) return 30;
        if (g > 2800 && d >= 14) return 20;
        return 'error';
      },
      intervaloXl: '=SI(Y(B6<=800;D5<14);48;SI(Y(B6<=800;D5>=14);42; … ;SI(Y(B6>2800;D5>=14);20;"error")))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Azitromicina EV', via: 'EV',
  concSin: '2 mg/mL', cSin: 2,
  diluir: 'API', tiempo: '1 h',
  esquemas: [{ dosis: () => 10, dosisXl: '10', intervalo: () => 24, intervaloXl: '24' }]
},
{
  grupo: 'Antibióticos', nombre: 'Azitromicina VO', via: 'VO',
  concSin: '200 mg/5 mL',
  diluir: 'API', tiempo: 'NO APLICA',
  nota: 'La planilla calcula el volumen oral a partir de la misma dosis de la azitromicina EV (10 mg/Kg).',
  esquemas: [{ dosis: () => 10, dosisXl: '=Azitromicina EV (E15)', intervalo: () => 24, intervaloXl: '24',
               volSin: dose => (dose * 5) / 200, volSinXl: '=(G15*5)/200' }]
},
{
  grupo: 'Antibióticos', nombre: 'Cefadroxilo', via: 'VO',
  concSin: '250 mg/5 mL',
  diluir: 'API', tiempo: 'NO APLICA',
  esquemas: [
    { label: 'Profilaxis ITU', dosis: () => 20, dosisXl: '20', intervalo: () => 24, intervaloXl: '24',
      volSin: dose => (dose * 5) / 250, volSinXl: '=(G18*5)/250',
      volCon: dose => (dose * 5) / 250, volConXl: '=(G18*5)/250' },
    { label: 'Tratamiento', dosis: () => 25, dosisXl: '25', intervalo: () => 12, intervaloXl: '12',
      volSin: dose => (dose * 5) / 250, volSinXl: '=(H18*5)/250',
      volCon: dose => (dose * 5) / 250, volConXl: '=(H18*5)/250' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Cefazolina', via: 'EV',
  concSin: '20 mg/mL', concCon: '100 mg/mL', cSin: 20, cCon: 100,
  diluir: 'SF', tiempo: '1 h',
  esquemas: [
    { dosis: () => 25, dosisXl: '25',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 28) return 12;
        if (I <= 29 && D > 28) return 8;
        if (I >= 30 && I <= 36 && D <= 14) return 12;
        if (I >= 30 && I <= 36 && D > 14) return 8;
        if (I >= 37 && I <= 44 && D <= 7) return 12;
        if (I >= 37 && I <= 44 && D > 7) return 8;
        return 6;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<=28);12;SI(Y(I5<=29;D5>28);8;SI(Y(I5>=30;I5<=36;D5<=14);12;SI(Y(I5>=30;I5<=36;D5>14);8;SI(Y(I5>=37;I5<=44;D5<=7);12;SI(Y(I5>=37;I5<=44;D5>7);8;6))))))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Cefepime', via: 'EV',
  concSin: '40 mg/mL', cSin: 40,
  diluir: 'SG 5, 10% o SF', tiempo: '30 min',
  esquemas: [
    { label: 'Bacteriemia',
      dosis: c => (c.egc <= 36 && c.d <= 28) ? 30 : (c.egc > 36 && c.d > 28) ? 50 : XL_FALSE,
      dosisXl: '=SI(Y(I5<=36;D5<=28);30;SI(Y(I5>36;D5>28);50))',
      intervalo: () => 12, intervaloXl: '12' },
    { label: 'Meningitis', dosis: () => 50, dosisXl: '50', intervalo: () => 12, intervaloXl: '12' }
  ],
  alertas: [{
    cuando: c => !((c.egc <= 36 && c.d <= 28) || (c.egc > 36 && c.d > 28)),
    texto: 'La fórmula original de bacteriemia sólo contempla EGC ≤ 36 con edad ≤ 28 d, o EGC > 36 con edad > 28 d. Para este paciente Excel devuelve FALSO (dosis 0). Verificar dosis con el equipo/farmacia.'
  }]
},
{
  grupo: 'Antibióticos', nombre: 'Cefotaxima', via: 'EV',
  concSin: '40 mg/mL', cSin: 40, concCon: '40 mg/mL', cCon: 40,
  diluir: 'SF', tiempo: '1 h',
  esquemas: [
    { label: 'Bacteriemia', dosis: () => 50, dosisXl: '50',
      intervalo: c => (c.d < 7) ? 12 : (c.egc < 32 && c.d >= 7) ? 8 : (c.egc >= 32 && c.d >= 7) ? 6 : XL_FALSE,
      intervaloXl: '=SI(Y(D5<7);12;SI(Y(I5<32;D5>=7);8;SI(Y(I5>=32;D5>=7);6)))' },
    { label: 'Meningitis', dosis: () => 50, dosisXl: '50',
      intervalo: c => (c.d <= 7) ? 8 : (c.d >= 8) ? 6 : XL_FALSE,
      intervaloXl: '=SI(Y(D5<=7);8;SI(Y(D5>=8);6))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Ceftazidima', via: 'EV',
  concSin: '50 mg/mL', concCon: '100 mg/mL', cSin: 50, cCon: 100,
  diluir: 'SG 5, 10% o SF', tiempo: '1 h',
  esquemas: [
    { label: 'Bacteriemia', dosis: () => 30, dosisXl: '30',
      intervalo: () => 8,
      intervaloXl: '=SI(Y(K5<=29;E5<=28);12;SI(Y(K5<=29;E5>28);8; … ;8))))))' },
    { label: 'Meningitis', dosis: () => 50, dosisXl: '50',
      intervalo: () => 8,
      intervaloXl: '=SI(Y(E5<=7);12;SI(Y(E5>=8);8))' }
  ],
  alertas: [{
    cuando: () => true,
    texto: 'En la planilla las fórmulas de intervalo apuntan a K5 (días de la EGC) y a E5 (celda de texto "EG (semanas)"), no a la EGC ni a la edad. Por eso ambos intervalos devuelven siempre 8 h. La app reproduce ese resultado; revisar con farmacia antes de corregirlo.'
  }]
},
{
  grupo: 'Antibióticos', nombre: 'Ciprofloxacino', via: 'EV',
  concSin: '2 mg/mL', cSin: 2,
  diluir: 'SG 5, 10% o SF', tiempo: '1 h',
  esquemas: [
    { dosis: c => (c.egc <= 36) ? 10 : (c.egc > 36) ? 15 : XL_FALSE,
      dosisXl: '=SI(Y(I5<=36);10;SI(Y(I5>36);15))',
      intervalo: () => 12, intervaloXl: '12' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Ciprofloxacino VO', via: 'VO',
  concSin: 'No aplica',
  diluir: 'API', tiempo: 'NO APLICA',
  esquemas: [
    { dosis: c => (c.egc <= 36) ? 10 : (c.egc > 36) ? 15 : XL_FALSE,
      dosisXl: '=SI(Y(I5<=36);10;SI(Y(I5>36);15))',
      intervalo: () => 12, intervaloXl: '12',
      volTxt: 'Volumen relacionado a la dosis indicada' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Cloxacilina', via: 'EV',
  concSin: '40 mg/mL', concCon: '100 mg/mL', cSin: 40, cCon: 100,
  diluir: 'SF', tiempo: '30 min',
  esquemas: [
    { label: 'Bacteriemia', dosis: () => 25, dosisXl: '25',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 28) return 12;
        if (I <= 29 && I > 28) return 8;          /* la planilla compara I5>28, no D5>28 */
        if (I > 29 && I <= 36 && D <= 14) return 12;
        if (I > 29 && I <= 36 && D > 14) return 8;
        if (I > 36 && I <= 44 && D <= 7) return 12;
        if (I > 36 && I <= 44 && D > 7) return 8;
        return 6;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<=28);12;SI(Y(I5<=29;I5>28);8;SI(Y(I5>29;I5<=36;D5<=14);12;SI(Y(I5>29;I5<=36;D5>14);8;SI(Y(I5>36;I5<=44;D5<=7);12;SI(Y(I5>36;I5<=44;D5>7);8;6))))))' },
    { label: 'Meningitis', dosis: () => 50, dosisXl: '50',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 28) return 12;
        if (I <= 29 && D > 28) return 8;
        if (I > 29 && I <= 36 && D <= 14) return 12;
        if (I > 29 && I <= 36 && D > 14) return 8;
        if (I > 36 && I <= 44 && D <= 7) return 12;
        if (I > 36 && I <= 44 && D > 7) return 8;
        return 6;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<=28);12;SI(Y(I5<=29;D5>28);8;SI(Y(I5>29;I5<=36;D5<=14);12;SI(Y(I5>29;I5<=36;D5>14);8;SI(Y(I5>36;I5<=44;D5<=7);12;SI(Y(I5>36;I5<=44;D5>7);8;6))))))' }
  ],
  alertas: [{
    cuando: c => c.egc <= 28 && c.d > 28,
    texto: 'En bacteriemia la planilla evalúa "EGC > 28" en lugar de "edad > 28 días" en la segunda condición; con esta EGC y esta edad el resultado cae en el valor por defecto (6 h). El esquema de meningitis, que sí usa la edad, indicaría 8 h.'
  }]
},
{
  grupo: 'Antibióticos', nombre: 'Colistin', via: 'EV',
  concSin: '10.000 UI/mL', cSin: 0.3,
  diluir: 'SF o SG 5%', tiempo: 'NO APLICA',
  nota: 'La planilla calcula el volumen dividiendo la dosis por 0,3 (equivalencia usada para la presentación de 10.000 UI/mL).',
  esquemas: [{ dosis: () => 3, dosisXl: '3', intervalo: () => 8, intervaloXl: '8',
               volSin: d => d / 0.3, volSinXl: '=(G30/0,3)' }]
},
{
  grupo: 'Antibióticos', nombre: 'Cotrimoxazol (en base a trimetoprim)', via: 'EV',
  concSin: '0,64 mg/mL', concCon: '1,06 mg/mL', cSin: 0.64, cCon: 1.06,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [
    { label: 'Stenotrophomona', dosis: () => 5, dosisXl: '5', intervalo: () => 12, intervaloXl: '12' },
    { label: 'Profilaxis ITU', dosis: () => 2, dosisXl: '2', intervalo: () => 24, intervaloXl: '24' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Ertapenem', via: 'EV',
  concSin: '20 mg/mL', cSin: 20,
  diluir: 'SF', tiempo: '1 h',
  esquemas: [{ dosis: () => 15, dosisXl: '15', intervalo: () => 12, intervaloXl: '12' }]
},
{
  grupo: 'Antibióticos', nombre: 'Gentamicina', via: 'EV',
  concSin: '5 mg/mL', concCon: '10 mg/mL', cSin: 5, cCon: 10,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [
    { dosis: () => 5, dosisXl: '5',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 7) return 48;
        if (I <= 29 && D > 7 && D <= 28) return 36;
        if (I <= 29 && D > 28) return 24;
        if (I > 29 && I <= 34 && D <= 7) return 36;
        if (I > 29 && D <= 34 && D > 7) return 24;
        return 24;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<=7);48;SI(Y(I5<=29;D5>7;D5<=28);36;SI(Y(I5<=29;D5>28);24;SI(Y(I5>29;I5<=34;D5<=7);36;SI(Y(I5>29;D5<=34;D5>7);24;24)))))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Linezolid', via: 'EV',
  concSin: '2 mg/mL', cSin: 2,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [{ dosis: () => 10, dosisXl: '10', intervalo: () => 8, intervaloXl: '8' }]
},
{
  grupo: 'Antibióticos', nombre: 'Meropenem', via: 'EV',
  concSin: '5 mg/mL', concCon: '20 mg/mL', cSin: 5, cCon: 20,
  diluir: 'API o SF', tiempo: '1 h',
  esquemas: [
    { label: 'Bacteriemia',
      dosis: c => (c.egc >= 32 && c.d >= 14) ? 30 : 20,
      dosisXl: '=SI(Y(I5>=32;D5>=14);30;20)',
      intervalo: c => (c.egc < 32 && c.d <= 13) ? 12 : 8,
      intervaloXl: '=SI(Y(I5<32;D5<=13);12;8)' },
    { label: 'Meningitis', dosis: () => 40, dosisXl: '40',
      intervalo: c => (c.egc < 32 && c.d <= 13) ? 12 : 8,
      intervaloXl: '=SI(Y(I5<32;D5<=13);12;8)' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Metronidazol', via: 'EV',
  concSin: '5 mg/mL', cSin: 5, cCon: 5,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [
    { label: 'Carga', dosis: () => 15, dosisXl: '15',
      intervalo: () => 'Por una vez', intervaloXl: 'Por una vez' },
    { label: 'Mantención', dosis: () => 7.5,
      dosisXl: '=SI(Y(K5=26;K5=27);10;7,5)',
      intervalo: c => (c.egc <= 27) ? 24 : (c.egc > 27 && c.egc <= 33) ? 12
                    : (c.egc > 33 && c.egc <= 40) ? 8 : (c.egc > 40) ? 6 : XL_FALSE,
      intervaloXl: '=SI(Y(I5<=27);24;SI(Y(I5>27;I5<=33);12;SI(Y(I5>33;I5<=40);8;SI(Y(I5>40);6))))' }
  ],
  alertas: [{
    cuando: () => true,
    texto: 'La fórmula de mantención es SI(Y(K5=26;K5=27);10;7,5): una misma celda no puede valer 26 y 27 a la vez, por lo que siempre entrega 7,5 mg/Kg/dosis. Probablemente se buscaba 10 mg/Kg entre las 26 y 27 semanas de EGC.'
  }]
},
{
  grupo: 'Antibióticos', nombre: 'Metronidazol VO', via: 'VO',
  concSin: 'No aplica', cSin: 5, cCon: 5,
  diluir: 'API', tiempo: 'NO APLICA',
  esquemas: [
    { label: 'Carga', dosis: () => 15, dosisXl: '15',
      intervalo: () => 'Por una vez', intervaloXl: 'Por una vez' },
    { label: 'Mantención', dosis: () => 7.5, dosisXl: '=SI(Y(K5=26;K5=27);10;7,5)',
      intervalo: c => (c.egc <= 27) ? 24 : (c.egc > 27 && c.egc <= 33) ? 12
                    : (c.egc > 33 && c.egc <= 40) ? 8 : (c.egc > 40) ? 6 : XL_FALSE,
      intervaloXl: '=SI(Y(I5<=27);24;SI(Y(I5>27;I5<=33);12;SI(Y(I5>33;I5<=40);8;SI(Y(I5>40);6))))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Penicilina G', via: 'EV',
  concSin: '50.000 UI/mL', concCon: '100.000 UI/mL', cSin: 50000, cCon: 100000,
  diluir: 'SG 5%', tiempo: '1 h', unidadDosis: 'UI',
  esquemas: [
    { label: 'Sífilis', dosis: () => 50000, dosisXl: '=(50000*B6)/1000', unidad: 'UI',
      intervalo: () => '12 h (primeros 7 días) · 8 h (después de 7 días)',
      intervaloXl: 'J42=12 (primeros 7 días) · K42=8 (después de 7 días)' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Piperacilina / Tazobactam (en base a piperacilina)', via: 'EV',
  concSin: '50 mg/mL', concCon: '200 mg/mL', cSin: 50, cCon: 200,
  diluir: 'API, SF, SG 5%', tiempo: '1 h',
  esquemas: [
    { dosis: () => 100, dosisXl: '100',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D < 28) return 12;
        if (I > 29 && I <= 36 && D <= 14) return 12;
        if (I > 36 && I <= 45 && D <= 7) return 12;
        return 8;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<28);12;SI(Y(I5>29;I5<=36;D5<=14);12;SI(Y(I5>36;I5<=45;D5<=7);12;8)))' }
  ]
},
{
  grupo: 'Antibióticos', nombre: 'Vancomicina', via: 'EV',
  concSin: '5 mg/mL', concCon: '10 mg/mL', cSin: 5, cCon: 10,
  diluir: 'SF o SG 5%', tiempo: '2 h',
  intervaloComun: true,
  esquemas: [
    { label: 'Bacteriemia', dosis: () => 10, dosisXl: '10',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 14) return 12;
        if (I <= 29 && D > 14) return 8;
        if (I > 29 && I <= 36 && D <= 14) return 8;
        if (I > 29 && I <= 36 && D > 14) return 6;
        if (I > 36 && D <= 7) return 8;
        if (I > 36 && D > 7) return 6;
        return XL_FALSE;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<=14);12;SI(Y(I5<=29;D5>14);8;SI(Y(I5>29;I5<=36;D5<=14);8;SI(Y(I5>29;I5<=36;D5>14);6;SI(Y(I5>36;D5<=7);8;SI(Y(I5>36;D5>7);6))))))' },
    { label: 'Meningitis', dosis: () => 15, dosisXl: '15',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 14) return 12;
        if (I <= 29 && D > 14) return 8;
        if (I > 29 && I <= 36 && D <= 14) return 8;
        if (I > 29 && I <= 36 && D > 14) return 6;
        if (I > 36 && D <= 7) return 8;
        if (I > 36 && D > 7) return 6;
        return XL_FALSE;
      },
      intervaloXl: '(mismo intervalo que bacteriemia, celda combinada J44:K45)' }
  ]
},
/* ------------------------------ ANTIVIRALES ----------------------------- */
{
  grupo: 'Antivirales', nombre: 'Aciclovir', via: 'EV',
  concSin: '7 mg/mL', cSin: 7,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [
    { dosis: () => 20, dosisXl: '20',
      intervalo: c => (c.egc <= 33) ? 12 : 8,
      intervaloXl: '=SI(Y(I5<=33);12;8)' }
  ]
},
{
  grupo: 'Antivirales', nombre: 'Ganciclovir', via: 'EV',
  concSin: '10 mg/mL', cSin: 10,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [{ dosis: () => 6, dosisXl: '6', intervalo: () => 12, intervaloXl: '12' }]
},
{
  grupo: 'Antivirales', nombre: 'Nevirapina', via: 'VO',
  concSin: '10 mg/mL', cSin: 10, cCon: 10,
  diluir: 'No aplica', tiempo: '—',
  esquemas: [
    { label: 'Profilaxis', dosis: () => 2, dosisXl: '2',
      intervalo: () => '4 - 48 - 72 horas de vida', intervaloXl: '4 - 48 - 72 horas de vida' },
    { label: 'Tratamiento',
      dosis: c => (c.egc < 37 && c.d < 7) ? 4 : (c.egc < 37 && c.d >= 7) ? 6 : (c.egc >= 37) ? 6 : XL_FALSE,
      dosisXl: '=SI(Y(I5<37;D5<7);4;SI(Y(I5<37;D5>=7);6;SI(Y(I5>=37);6)))',
      intervalo: () => 12, intervaloXl: '12' }
  ]
},
{
  grupo: 'Antivirales', nombre: 'Oseltamivir', via: 'VO',
  concSin: '12 mg/mL', cSin: 12,
  diluir: 'No aplica', tiempo: '—',
  esquemas: [
    { dosis: c => (c.egc < 38) ? 1 : (c.egc >= 38 && c.egc <= 40) ? 1.5 : (c.egc > 40) ? 3 : XL_FALSE,
      dosisXl: '=SI(Y(I5<38);1;SI(Y(I5>=38;I5<=40);1,5;SI(Y(I5>40);3)))',
      intervalo: () => 12, intervaloXl: '12' }
  ]
},
{
  grupo: 'Antivirales', nombre: 'Valganciclovir', via: 'VO',
  concSin: '30 mg/mL', concCon: '50 mg/mL', cSin: 30, cCon: 50,
  diluir: 'No aplica', tiempo: '—',
  esquemas: [{ dosis: () => 16, dosisXl: '16', intervalo: () => 12, intervaloXl: '12' }]
},
{
  grupo: 'Antivirales', nombre: 'Zidovudina EV', via: 'EV',
  concSin: '4 mg/mL', cSin: 4,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  esquemas: [
    { dosis: c => {
        const I = c.egc, D = c.d;
        if (I < 30 && D < 30) return 1.5;
        if (I < 30 && D >= 30) return 2.3;
        if (I >= 30 && I < 35 && D < 15) return 1.5;
        if (I >= 30 && I < 35 && D >= 15) return 2.3;
        if (I >= 35) return 3;
        return XL_FALSE;
      },
      dosisXl: '=SI(Y(I5<30;D5<30);1,5;SI(Y(I5<30;D5>=30);2,3;SI(Y(I5>=30;I5<35;D5<15);1,5;SI(Y(I5>=30;I5<35;D5>=15);2,3;SI(Y(I5>=35);3)))))',
      intervalo: () => 12, intervaloXl: '12' }
  ]
},
{
  grupo: 'Antivirales', nombre: 'Zidovudina VO', via: 'VO',
  concSin: '10 mg/mL', cSin: 10,
  diluir: 'No aplica', tiempo: '—',
  esquemas: [
    { dosis: c => {
        const I = c.egc, D = c.d;
        if (I < 30 && D < 30) return 2;
        if (I < 30 && D > 30) return 3;     /* la planilla usa D5>30, deja fuera D5=30 */
        if (I >= 30 && I < 35 && D < 15) return 2;
        if (I >= 30 && I < 35 && D >= 15) return 3;
        if (I >= 35) return 4;
        return XL_FALSE;
      },
      dosisXl: '=SI(Y(I5<30;D5<30);2;SI(Y(I5<30;D5>30);3;SI(Y(I5>=30;I5<35;D5<15);2;SI(Y(I5>=30;I5<35;D5>=15);3;SI(Y(I5>=35);4)))))',
      intervalo: () => 12, intervaloXl: '12' }
  ],
  alertas: [{
    cuando: c => c.egc < 30 && c.d === 30,
    texto: 'Con EGC < 30 semanas y exactamente 30 días de vida la fórmula oral no cubre el caso (usa D5<30 y D5>30) y Excel devuelve FALSO. La dosis EV para el mismo caso sería 2,3 mg/Kg.'
  }]
},
/* ------------------------------ ANTIFÚNGICOS ---------------------------- */
{
  grupo: 'Antifúngicos', nombre: 'Anfotericina B Deoxicolato', via: 'EV',
  concSin: '0,1 mg/mL', concCon: '0,5 mg/mL', cSin: 0.1, cCon: 0.5,
  diluir: 'SG 5, 10, 15 y 20%', tiempo: '6 h',
  esquemas: [{ dosis: () => 1, dosisXl: '1', intervalo: () => 24, intervaloXl: '24' }]
},
{
  grupo: 'Antifúngicos', nombre: 'Anfotericina B Liposomal', via: 'EV',
  concSin: '0,5 mg/mL', concCon: '2 mg/mL', cSin: 0.5, cCon: 2,
  diluir: 'SG 5%', tiempo: '2 h',
  esquemas: [{ dosis: () => 3, dosisXl: '3', intervalo: () => 24, intervaloXl: '24' }]
},
{
  grupo: 'Antifúngicos', nombre: 'Caspofungina', via: 'EV',
  concSin: '0,5 mg/mL', concCon: '0,5 mg/mL', cSin: 0.5, cCon: 0.5,
  diluir: 'API o SF', tiempo: '1 h',
  esquemas: [{ dosis: () => 2, dosisXl: '2', intervalo: () => 24, intervaloXl: '24' }]
},
{
  grupo: 'Antifúngicos', nombre: 'Fluconazol', via: 'EV',
  concSin: '2 mg/mL', cSin: 2, cCon: 2,
  diluir: 'SF o SG 5%', tiempo: '1 h',
  nota: 'Vía oral: la planilla indica "No aplica" para concentración y volumen.',
  esquemas: [
    { label: 'Profilaxis', dosis: () => 3, dosisXl: '3',
      intervalo: () => '24 h (M-J)', intervaloXl: '24 h (M-J)' },
    { label: 'Tratamiento', dosis: () => 12, dosisXl: '12',
      intervalo: c => {
        const I = c.egc, D = c.d;
        if (I <= 29 && D <= 14) return 48;
        if (I <= 29 && D > 14) return 24;
        if (I >= 30 && D <= 7) return 48;
        if (I >= 30 && D > 7) return 24;
        return XL_FALSE;
      },
      intervaloXl: '=SI(Y(I5<=29;D5<=14);48;SI(Y(I5<=29;D5>14);24;SI(Y(I5>=30;D5<=7);48;SI(Y(I5>=30;D5>7);24))))' }
  ]
}
];
