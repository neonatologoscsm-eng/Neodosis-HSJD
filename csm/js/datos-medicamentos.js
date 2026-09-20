/* =====================================================================
   Calculadora de medicamentos · Clínica Santa María
   ARCHIVO GENERADO — no editar a mano.
   Lo produce verificacion-csm/extraer.py leyendo la planilla original:
   los coeficientes de dosis y los divisores de volumen salen de sus
   fórmulas, no de una transcripción.
   ===================================================================== */

const BOLOS_CSM = [
  {
    "nombre": "Aciclovir",
    "presentacion": "Fco 250 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mg/mL DD (Fco+ 5 cc SF-->1 cc + 9 cc SF)",
    "tiempo": "60 minutos",
    "nota": "No refrigerar. Uso inmediato",
    "lineas": [
      {
        "dosisTxt": "20 mg/kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=B3*20/1000",
        "xlVol": "=E9/5"
      }
    ]
  },
  {
    "nombre": "Adenosina",
    "presentacion": "3 mg/ mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,3 mg/mL DS (1+9 SF)",
    "tiempo": "1 - 2 seg",
    "nota": "No refrigerar. Uso inmediato",
    "lineas": [
      {
        "dosisTxt": "0,1 mg/Kg",
        "base": "kg",
        "k": 0.1,
        "unidad": "mg",
        "vol": "div",
        "f": 0.3,
        "xlDosis": "=(0.1*B3)/1000",
        "xlVol": "=(E10/0.3)"
      }
    ]
  },
  {
    "nombre": "Adrenalina",
    "presentacion": "1 mg/mL (1:1.000)",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,1 mg/ mL DS (1 cc+9 cc SF) (1:10.000)",
    "tiempo": "Bolo rápido",
    "nota": "Uso inmediato",
    "lineas": [
      {
        "dosisTxt": "0,03 mg/Kg",
        "base": "kg",
        "k": 0.03,
        "unidad": "mg",
        "vol": "div",
        "f": 0.1,
        "xlDosis": "=(0.03*B3)/1000",
        "xlVol": "=(E11/0.1)"
      },
      {
        "etiqueta": "ET",
        "dosisTxt": "0,05 mg/Kg",
        "base": "kg",
        "k": 0.05,
        "unidad": "mg",
        "vol": "div",
        "f": 0.1,
        "xlDosis": "=(0.05*B3)/1000",
        "xlVol": "=(E12/0.1)"
      }
    ]
  },
  {
    "nombre": "Amikacina",
    "presentacion": "50 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mg/mL DS(1 cc +9 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Uso inmediato. Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "15 mg/kg",
        "base": "kg",
        "k": 15.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*15)/1000",
        "xlVol": "=E13/5"
      }
    ]
  },
  {
    "nombre": "Aminofilina",
    "presentacion": "25 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "2,5 mg/mL DS ( 1 cc + 9 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "Carga 6 mg/kg",
        "base": "kg",
        "k": 6.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.5,
        "xlDosis": "=(B3*6)/1000",
        "xlVol": "=E14/2.5"
      },
      {
        "dosisTxt": "Mantencion: 2 mg/kg",
        "base": "kg",
        "k": 2.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.5,
        "xlDosis": "=(B3*2)/1000",
        "xlVol": "=E15/2.5"
      }
    ]
  },
  {
    "nombre": "Ampicilina",
    "presentacion": "Fco 500 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "100 mg/mL DS (1 fco +5 cc SF)",
    "tiempo": "Bolo",
    "nota": "Uso inmediato.Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "50 mg/kg",
        "base": "kg",
        "k": 50.0,
        "unidad": "mg",
        "vol": "div",
        "f": 100.0,
        "xlDosis": "=(B3*50)/1000",
        "xlVol": "=E16/100"
      }
    ]
  },
  {
    "nombre": "Anfotericina B deoxicolato",
    "presentacion": "Fco 50 mg",
    "via": "EV",
    "diluir": "SG5%",
    "concentracion": "0,5 mg/mL DD (1 Fco +10 cc SG5% -->1 cc +9 cc SG5%)",
    "tiempo": "6 horas",
    "nota": "Proteger de luz-CVC-NO SF",
    "lineas": [
      {
        "dosisTxt": "dosis inicio 0,5 mg/kg",
        "base": "kg",
        "k": 0.5,
        "unidad": "mg",
        "vol": "div",
        "f": 0.5,
        "xlDosis": "=(B3*0.5)/1000",
        "xlVol": "=E17/0.5"
      },
      {
        "dosisTxt": "dosis máx: 1,5 mg/kg",
        "base": "kg",
        "k": 1.5,
        "unidad": "mg",
        "vol": "div",
        "f": 0.5,
        "xlDosis": "=(B3*1.5)/1000",
        "xlVol": "=E18/0.5"
      }
    ]
  },
  {
    "nombre": "Anfotericina B liposomal",
    "presentacion": "Fco 50 mg",
    "via": "EV",
    "diluir": "API/SG5%",
    "concentracion": "2 mg/mL DD ( 1 Fco +5 cc SG5% --> 1 cc +4 cc SG5%)",
    "tiempo": "2 horas",
    "nota": "Proteger luz-NO SF",
    "lineas": [
      {
        "dosisTxt": "5 mg/kg",
        "base": "kg",
        "k": 5.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*5)/1000",
        "xlVol": "=E19/2"
      }
    ]
  },
  {
    "nombre": "Atropina",
    "presentacion": "1mg/ mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,1 mg/mL DS (1 cc+ 9 cc SF)",
    "tiempo": "Bolo 1 min",
    "nota": "Uso inmediato",
    "lineas": [
      {
        "dosisTxt": "0.02 mg/kg",
        "base": "kg",
        "k": 0.02,
        "unidad": "mg",
        "vol": "div",
        "f": 0.1,
        "xlDosis": "=(B3*0.02)/1000",
        "xlVol": "=E20/0.1"
      }
    ]
  },
  {
    "nombre": "Bicarbonato de Na",
    "presentacion": "Amp 8.4% 1 meq/mL",
    "via": "EV",
    "diluir": "ABD",
    "concentracion": "0,5 mEq/mL DS ( 1 cc +1 cc ABD)",
    "tiempo": "30 min",
    "nota": "Uso inmediato",
    "lineas": [
      {
        "dosisTxt": "1 mEq/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mEq",
        "vol": "div",
        "f": 0.5,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=E21/0.5"
      }
    ]
  },
  {
    "nombre": "Cafeina Citrato",
    "presentacion": "20 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "10 mg/mL DS ( 1 mL + 1 cc SF)",
    "tiempo": "30 min",
    "nota": "Uso inmediato Via exclusiva",
    "lineas": [
      {
        "dosisTxt": "Carga: 20 mg/Kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*20)/1000",
        "xlVol": "=E22/10"
      },
      {
        "dosisTxt": "Mantencion: 10 mg/kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*10)/1000",
        "xlVol": "=E23/10",
        "tiempoLinea": "10 min"
      }
    ]
  },
  {
    "nombre": "Cefazolina",
    "presentacion": "Fco 1 gr",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "50 mg/mL DD ( 1 Fco + 10 cc SF --> 1 cc +1 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "25 mg/kg",
        "base": "kg",
        "k": 25.0,
        "unidad": "mg",
        "vol": "div",
        "f": 50.0,
        "xlDosis": "=(B3*25)/1000",
        "xlVol": "=E24/50"
      }
    ]
  },
  {
    "nombre": "Cefotaxima",
    "presentacion": "Fco 1 gr",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "50 mg/ml DD (1 Fco +10 ccSF --> 1 cc +1 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Proteger de luz. Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "50 mg/kg",
        "base": "kg",
        "k": 50.0,
        "unidad": "mg",
        "vol": "div",
        "f": 50.0,
        "xlDosis": "=(B3*50)/1000",
        "xlVol": "=E25/50"
      }
    ]
  },
  {
    "nombre": "Ciprofloxacino",
    "presentacion": "2 mg/mL",
    "via": "EV",
    "diluir": "Sin diluir",
    "concentracion": "2 mg/mL",
    "tiempo": "60 minutos",
    "nota": "Proteger de la luz, no refrigerar.Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "10 mg/kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*10)/1000",
        "xlVol": "=E26/2"
      }
    ]
  },
  {
    "nombre": "Cloxacilina",
    "presentacion": "Fco 500 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "50 mg/mL DS ( 1 Fco +10 cc SF)",
    "tiempo": "Bolo",
    "nota": "Estable a Tº ambiente < 8 h .Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "50 mg/kg",
        "base": "kg",
        "k": 50.0,
        "unidad": "mg",
        "vol": "div",
        "f": 50.0,
        "xlDosis": "=(B3*50)/1000",
        "xlVol": "=E27/50"
      }
    ]
  },
  {
    "nombre": "Fenitoína",
    "presentacion": "50 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mg/mL DS ( 1 cc + 9 cc SF)",
    "tiempo": "30 minutos",
    "nota": "NO VVC. NO SG: Precipita",
    "lineas": [
      {
        "dosisTxt": "Carga :20 mg/Kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*20)/1000",
        "xlVol": "=(E28/5)"
      },
      {
        "dosisTxt": "Mantención: 3 mg/Kg/dosis",
        "base": "kg",
        "k": 3.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*3)/1000",
        "xlVol": "=E29/5"
      }
    ]
  },
  {
    "nombre": "Fenobarbital",
    "presentacion": "200 mg/mL",
    "via": "EV",
    "diluir": "SF/API",
    "concentracion": "20 mg/mL DS ( 1 cc + 9 cc SF)",
    "tiempo": "Carga: 30 minutos",
    "nota": "Usar de inmediato",
    "lineas": [
      {
        "dosisTxt": "Carga: 20 mg/Kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "div",
        "f": 20.0,
        "xlDosis": "=(B3*20)/1000",
        "xlVol": "=(E30/20)"
      },
      {
        "dosisTxt": "Mantención: 3 mg/Kg/dosis",
        "base": "kg",
        "k": 3.0,
        "unidad": "mg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*3)/1000",
        "xlVol": "=(E31/10)",
        "concLinea": "10 mg/ml DS (0.5 cc + 9,5 cc SF)",
        "tiempoLinea": "Bolo rápido"
      }
    ]
  },
  {
    "nombre": "Fentanilo",
    "presentacion": "50 mcg / mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "10 mcg/mL DS ( 1 cc+ 4 cc SF)",
    "tiempo": "Bolo lento",
    "nota": "Proteger de la luz. Estable 24 h refrigerado",
    "lineas": [
      {
        "dosisTxt": "1 mcg/Kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mcg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=(E32/10)"
      }
    ]
  },
  {
    "nombre": "Fluconazol",
    "presentacion": "2 mg/mL",
    "via": "EV",
    "diluir": "Sin diluir",
    "concentracion": "2 mg/mL",
    "tiempo": "60 minutos",
    "nota": "Usar de inmediato",
    "lineas": [
      {
        "dosisTxt": "Carga: 25 mg/kg",
        "base": "kg",
        "k": 25.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*25)/1000",
        "xlVol": "=E33/2"
      },
      {
        "dosisTxt": "Mantencion: 12 mg/Kg",
        "base": "kg",
        "k": 12.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*12)/1000",
        "xlVol": "=E34/2"
      }
    ]
  },
  {
    "nombre": "Flumazenil",
    "presentacion": "100 mcg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "10 mcg/mL DS (1 cc + 9 cc SF)",
    "tiempo": "15 segundos",
    "nota": "Utilizar antes de 24 h",
    "lineas": [
      {
        "dosisTxt": "5 mcg/ Kg",
        "base": "kg",
        "k": 5.0,
        "unidad": "mcg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*5)/1000",
        "xlVol": "=(E35/10)"
      }
    ]
  },
  {
    "nombre": "Furosemida",
    "presentacion": "20 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "2 mg/mL DS ( 1 cc +9 cc SF)",
    "tiempo": "Bolo",
    "nota": "Proteger de luz. Usar antes de 24 h. No refrigerar",
    "lineas": [
      {
        "dosisTxt": "1 mg/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=E36/2"
      }
    ]
  },
  {
    "nombre": "Gamaglobulina",
    "presentacion": "5 grs/100ml",
    "via": "EV",
    "diluir": "Sin diluir",
    "concentracion": "0,05 gr/mL",
    "tiempo": "6 h",
    "nota": "No congelar. Descartar sobrante.Monitorizar PA",
    "lineas": [
      {
        "dosisTxt": "1 gr/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "g",
        "vol": "div",
        "f": 0.05,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=E37/0.05"
      }
    ]
  },
  {
    "nombre": "Ganciclovir",
    "presentacion": "Fco 500 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "10 mg/mL DD ( 1 Fco +10 cc SF--> 1 cc + 4 cc SF)",
    "tiempo": "60 minutos",
    "nota": "No refrigerar",
    "lineas": [
      {
        "dosisTxt": "6 mg/Kg",
        "base": "kg",
        "k": 6.0,
        "unidad": "mg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*6)/1000",
        "xlVol": "=E38/10"
      }
    ]
  },
  {
    "nombre": "Gentamicina",
    "presentacion": "40 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "2 mg/mL DD ( 1 cc +9 cc SF--> 1 cc + 1 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "5 mg/kg",
        "base": "kg",
        "k": 5.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*5)/1000",
        "xlVol": "=E39/2"
      }
    ]
  },
  {
    "nombre": "Gluconato Calcio 10%",
    "presentacion": "0,1 gr/ml",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,05 gr/mL DS ( 5 cc + 5cc SF)",
    "tiempo": "30 minutos",
    "nota": "Preferir VVC",
    "lineas": [
      {
        "dosisTxt": "2 ml/kg",
        "base": "kg",
        "k": 2.0,
        "unidad": "mL",
        "vol": "div",
        "f": 0.5,
        "xlDosis": "=(B3*2)/1000",
        "xlVol": "=E40/0.5"
      }
    ]
  },
  {
    "nombre": "Hidrocortisona",
    "presentacion": "Fco 100 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "1 mg/mL DD ( 1 Fco + 10 cc SF --> 1 cc + 9 cc SF)",
    "tiempo": "Bolo",
    "nota": "Dosis diaria, administrar cada 8-12 h. Monitorizar PA y glicemia",
    "lineas": [
      {
        "dosisTxt": "Dosis hipotensión",
        "base": "sc",
        "k": 30.0,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=D3*30",
        "xlVol": "=E41/1",
        "detalle": "30 mg/m2 /dia"
      },
      {
        "dosisTxt": "Dosis de Estrés en I. Adrenal",
        "base": "sc",
        "k": 100.0,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=D3*100",
        "xlVol": "=E43/1",
        "detalle": "100 mg/m2/dia"
      },
      {
        "dosisTxt": "Dosis de mantención",
        "base": "sc",
        "k": 8.0,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=D3*8",
        "xlVol": "=E45/1",
        "detalle": "8 mg/m2/dia"
      }
    ]
  },
  {
    "nombre": "Indometacina",
    "presentacion": "Fco 1 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,5 mg/mL DS ( 1 Fco + 2 ml SF)",
    "tiempo": "30 minutos",
    "nota": "Preferir uso inmediato",
    "lineas": [
      {
        "dosisTxt": "0,2 mg/kg",
        "base": "kg",
        "k": 0.2,
        "unidad": "mg",
        "vol": "div",
        "f": 0.5,
        "xlDosis": "=(B3*0.2)/1000",
        "xlVol": "=E47/0.5"
      }
    ]
  },
  {
    "nombre": "Levetiracetam",
    "presentacion": "100 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mg/mL DD ( 1ml + 9 cc SF --> 1 cc +1 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Preferir uso inmediato",
    "lineas": [
      {
        "dosisTxt": "Carga: 20 mg/Kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*20)/1000",
        "xlVol": "=(E48/5)"
      },
      {
        "dosisTxt": "Mantención: 40 mg/Kg/dosis",
        "base": "kg",
        "k": 40.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*40)/1000",
        "xlVol": "=(E49/5)"
      }
    ]
  },
  {
    "nombre": "Linezolid",
    "presentacion": "2 mg/mL",
    "via": "EV",
    "diluir": "Sin diluir",
    "concentracion": "2mg/mL",
    "tiempo": "30 minutos",
    "nota": "Proteger de la luz. Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "10 mg/Kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*10)/1000",
        "xlVol": "=E50/2"
      }
    ]
  },
  {
    "nombre": "Lorazepam",
    "presentacion": "2 mg/ mL",
    "via": "EV",
    "diluir": "Sin diluir",
    "tiempo": "15 minutos",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "0,05 mg/Kg",
        "base": "kg",
        "k": 0.05,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*0.05)/1000",
        "xlVol": "=(E51/2)"
      }
    ]
  },
  {
    "nombre": "Meropenem",
    "presentacion": "Fco 500 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "10 mg/mL DD ( 1 Fco + 10 cc SF--> 1 cc +4 cc SF)",
    "tiempo": "2-3 horas",
    "nota": "Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "20 mg/Kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "div",
        "f": 10.0,
        "xlDosis": "=(B3*20)/1000",
        "xlVol": "=E52/10"
      }
    ]
  },
  {
    "nombre": "Metadona",
    "presentacion": "5 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "1 mg/mL DS (1 cc + 4 cc SF)",
    "tiempo": "Bolo rápido",
    "nota": "Descartar solucion no utilizada",
    "lineas": [
      {
        "dosisTxt": "0,1 mg/Kg",
        "base": "kg",
        "k": 0.1,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=(B3*0.1)/1000",
        "xlVol": "=(E53/1)"
      }
    ]
  },
  {
    "nombre": "Metronidazol",
    "presentacion": "Fco 5 mg/mL",
    "via": "EV",
    "diluir": "Sin diluir",
    "concentracion": "5 mg/mL",
    "tiempo": "60 minutos",
    "nota": "Proteger Luz.Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "Carga: 15 mg/Kg",
        "base": "kg",
        "k": 15.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*15)/1000",
        "xlVol": "=E54/5"
      },
      {
        "dosisTxt": "Mantencion: 7,5 mg/Kg",
        "base": "kg",
        "k": 7.5,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*7.5)/1000",
        "xlVol": "=E55/5"
      }
    ]
  },
  {
    "nombre": "Micafungina",
    "presentacion": "Fco 50 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "1 mg/mL DD ( 1 Fco + 10ml SF--> 1cc + 4 cc SF)",
    "tiempo": "60 minutos",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "4 mg/Kg",
        "base": "kg",
        "k": 4.0,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=(B3*4)/1000",
        "xlVol": "=E56/1"
      },
      {
        "dosisTxt": "SNC: 10 mg/kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=(B3*10)/1000",
        "xlVol": "=E57/1"
      }
    ]
  },
  {
    "nombre": "Midazolam",
    "presentacion": "5 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,5 mg/mL DS ( 1cc + 9 cc SF)",
    "tiempo": "Bolo lento",
    "nota": "Estable a Tº ambiente 24 hors",
    "lineas": [
      {
        "dosisTxt": "0,2 mg/ Kg",
        "base": "kg",
        "k": 0.2,
        "unidad": "mg",
        "vol": "div",
        "f": 0.5,
        "xlDosis": "=(B3*0.2)/1000",
        "xlVol": "=(E58/0.5)"
      }
    ]
  },
  {
    "nombre": "Morfina",
    "presentacion": "10 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "0,1 mg/mL DS ( 1 cc + 9 cc SF)",
    "tiempo": "Bolo lento",
    "nota": "Descartar cuando solucion presente oscurecimiento",
    "lineas": [
      {
        "dosisTxt": "0,1 mg/ Kg",
        "base": "kg",
        "k": 0.1,
        "unidad": "mg",
        "vol": "div",
        "f": 0.1,
        "xlDosis": "=(B3*0.1)/1000",
        "xlVol": "=(E59/0.1)"
      }
    ]
  },
  {
    "nombre": "Naloxona",
    "presentacion": "0,4 mg/mL",
    "via": "EV o IM",
    "diluir": "No diluir",
    "tiempo": "Bolo rapido",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "0,1 mg/ Kg",
        "base": "kg",
        "k": 0.1,
        "unidad": "mg",
        "vol": "div",
        "f": 0.4,
        "xlDosis": "=(B3*0.1)/1000",
        "xlVol": "=(E60/0.4)"
      }
    ]
  },
  {
    "nombre": "Omeprazol",
    "presentacion": "Fco 40 mg",
    "via": "EV",
    "diluir": "API",
    "concentracion": "4mg/mL DS ( 1 Fco + 10 ml Solvente)",
    "tiempo": "30 min",
    "nota": "Proteger de luz, No refrigerar. Desechar si > 4 h",
    "lineas": [
      {
        "dosisTxt": "1 mg/Kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "div",
        "f": 4.0,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=E61/4"
      }
    ]
  },
  {
    "nombre": "Paracetamol",
    "presentacion": "Fco 10 mg/mL",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mg/ ml DS ( 1 cc + 1 cc SF)",
    "tiempo": "30 minutos",
    "nota": "Usar solucion antes de 6 h",
    "lineas": [
      {
        "dosisTxt": "15 mg/kg",
        "base": "kg",
        "k": 15.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*15)/1000",
        "xlVol": "=E62/5"
      }
    ]
  },
  {
    "nombre": "Penicilina",
    "presentacion": "Fco 1.000.000 UI",
    "via": "EV",
    "diluir": "API/SF",
    "concentracion": "100.000 UI/ml DS ( 1 Fco - 10 ml SF)",
    "tiempo": "30 minutos",
    "nota": "NO usar SG: precipita",
    "lineas": [
      {
        "dosisTxt": "50.000 UI/kg",
        "base": "kg",
        "k": 50000.0,
        "unidad": "UI",
        "vol": "div",
        "f": 100000.0,
        "xlDosis": "=(B3*50000)/1000",
        "xlVol": "=E63/100000"
      }
    ]
  },
  {
    "nombre": "Piperacilina Tazobactam",
    "presentacion": "Fco 4 gr Piperacilina+20 cc H20",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "50 mg/mL DD ( 1 Fco + 20 cc SF --> 1 cc + 3cc SF)",
    "tiempo": "60 minutos",
    "nota": "Ver dosis en antibioticos. NO administrar junto a aminoglucosidos",
    "lineas": [
      {
        "dosisTxt": "80 mg/Kg",
        "base": "kg",
        "k": 80.0,
        "unidad": "mg",
        "vol": "div",
        "f": 50.0,
        "xlDosis": "=(B3*80)/1000",
        "xlVol": "=E64/50"
      },
      {
        "dosisTxt": "100 mg/Kg",
        "base": "kg",
        "k": 100.0,
        "unidad": "mg",
        "vol": "div",
        "f": 50.0,
        "xlDosis": "=(B3*100)/1000",
        "xlVol": "=E65/50"
      }
    ]
  },
  {
    "nombre": "Propofol",
    "presentacion": "10 mg/2 mL",
    "via": "EV",
    "diluir": "SG 5%",
    "concentracion": "2 mg/ml ( DS 2 mL + 3 cc SG5%)",
    "tiempo": "60 segundos",
    "nota": "Desechar si > 6h",
    "lineas": [
      {
        "dosisTxt": "1 mg/Kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "div",
        "f": 2.0,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=(E66/2)"
      }
    ]
  },
  {
    "nombre": "Remifentanilo",
    "presentacion": "Fco 1 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mcg/mL DT ( 1 Fco + 10 cc SF--> 1 cc + 9 cc SF--> 1 cc + 1 cc SF)",
    "tiempo": "3-5 minutos",
    "nota": "Almacenar T ambiente",
    "lineas": [
      {
        "dosisTxt": "1 mcg/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mcg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=E67/5"
      }
    ]
  },
  {
    "nombre": "Sildenafil",
    "presentacion": "8mg/10 ml",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "8 mg/10 mL",
    "tiempo": "3 horas",
    "nota": "Dosis hora 0,13 mg/Kg/h",
    "lineas": [
      {
        "dosisTxt": "0,42 mg/Kg",
        "base": "kg",
        "k": 0.42,
        "unidad": "mg",
        "vol": "mul",
        "f": 1.25,
        "xlDosis": "=B3*0.42/1000",
        "xlVol": "=E68*10/8"
      }
    ]
  },
  {
    "nombre": "Vancomicina",
    "presentacion": "Fco 500 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "5 mg/mL DD ( 1 Fco + 10 cc SF--> 1 cc + 9 cc SF)",
    "tiempo": "1-4 horas",
    "nota": "Ver dosis en antibioticos",
    "lineas": [
      {
        "dosisTxt": "1 mg/kg ( 5mg-15 mg/kg)",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "div",
        "f": 5.0,
        "xlDosis": "=(B3*1)/1000",
        "xlVol": "=E69/5"
      }
    ]
  },
  {
    "nombre": "Vecuronio",
    "presentacion": "Fco 4 mg",
    "via": "EV",
    "diluir": "SF",
    "concentracion": "1 mg/mL DS ( 1 Fco +4 cc SF)",
    "tiempo": "Bolo lento",
    "nota": "Monitoreo FC PA",
    "lineas": [
      {
        "dosisTxt": "0,1 mg/ Kg",
        "base": "kg",
        "k": 0.1,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "xlDosis": "=(B3*0.1)/1000",
        "xlVol": "=(E70/1)"
      }
    ]
  },
  {
    "nombre": "Zidovudina",
    "presentacion": "200 mg/100 mL",
    "via": "EV",
    "diluir": "Sin diluir",
    "concentracion": "200 mg/100 mL",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "1,5 mg/Kg",
        "base": "kg",
        "k": 1.5,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.5,
        "xlDosis": "=(B3*1.5)/1000",
        "xlVol": "=(E71*100)/200"
      }
    ]
  }
];

const BIC_CSM = [
  {
    "nombre": "Adrenalina/Epinefrina",
    "detalle": "1mg/ 1 mL",
    "concentracion": "1 mg/ 1 ml",
    "lineas": [
      {
        "dosisRec": "Inotropo + VDS 0,01-0,1 mcg/Kg/min",
        "preparar": "SG 5%, 10% o SF",
        "porCC": 0.1,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.0,
        "xlPrep": "=(B3*E10*60*24)/1000/1000*2",
        "xlVial": "=(H10*1)/1"
      },
      {
        "dosisRec": "VCS =0,1 -1 mcg/kg/min",
        "preparar": "SG5%, 10% o SF",
        "porCC": 1,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.0,
        "xlPrep": "=(B3*E11*24*60)/1000/1000*2",
        "xlVial": "=(H11*1)/1"
      }
    ]
  },
  {
    "nombre": "Alprostadil (Prostaglandina E1)",
    "detalle": "500 mcg/1 mL",
    "concentracion": "10 mcg/ 1 mL",
    "lineas": [
      {
        "dosisRec": "0,01 - 0,1 mcg/Kg/min",
        "preparar": "SG5% o SF",
        "porCC": 0.01,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1,
        "prepUnidad": "mcg",
        "vialTipo": "mul",
        "vialF": 0.1,
        "xlPrep": "=(B3*E12*60*24)/1000*2",
        "xlVial": "=(H12*1)/10"
      }
    ]
  },
  {
    "nombre": "Dobutamina",
    "detalle": "250 mg/ 5mL",
    "concentracion": "250 mg / 5 mL",
    "lineas": [
      {
        "dosisRec": "2 - 20 mcg/Kg/min",
        "preparar": "SG 5%, 10% o SF",
        "porCC": 20,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 0.02,
        "xlPrep": "=(B3*E13*60*24)/1000/1000*2",
        "xlVial": "=(H13*5)/250"
      }
    ]
  },
  {
    "nombre": "Dopamina",
    "detalle": "200 mg/ 5 mL · Dosis > 10: VCP/VCS",
    "concentracion": "200 mg/ 5 mL",
    "lineas": [
      {
        "dosisRec": "Dopaminergico 2-4 mcg/Kg/min",
        "preparar": "SG 5%, 10% o SF",
        "porCC": 4,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 0.025,
        "xlPrep": "=(B3*E14*60*24)/1000/1000*2",
        "xlVial": "=(H14*5)/200"
      },
      {
        "dosisRec": "Inotropo 5-10 mcg/kg/min",
        "preparar": "SG 5%, 10% o SF",
        "porCC": 10,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 0.025,
        "xlPrep": "=(B3*E15*24*60)/1000/1000*2",
        "xlVial": "=(H15*5)/200"
      }
    ]
  },
  {
    "nombre": "Fentanilo",
    "detalle": "500 mcg/ 10 mL",
    "concentracion": "500 mcg/ 10 mL",
    "lineas": [
      {
        "dosisRec": "0,5- 5 mcg/Kg/hr",
        "preparar": "SG5% o SF",
        "porCC": 5,
        "unidad": "mcg/Kg/ hr/mL",
        "factor": 24,
        "div": 1,
        "prepUnidad": "mcg",
        "vialTipo": "mul",
        "vialF": 0.02,
        "xlPrep": "=(B3*E16*24)/1000*2",
        "xlVial": "=(H16*10)/500"
      }
    ]
  },
  {
    "nombre": "Insulina",
    "detalle": "Actrapid 100 UI/mL",
    "concentracion": "10 UI/mL",
    "lineas": [
      {
        "dosisRec": "0,01 - 0,1 UI/Kg/hr",
        "preparar": "SG 5%, 10% o SF",
        "porCC": 0.1,
        "unidad": "UI/ Kg/ hr/mL",
        "factor": 24,
        "div": 1,
        "prepUnidad": "UI",
        "vialTipo": "mul",
        "vialF": 0.1,
        "xlPrep": "=(B3*E17*24)/1000*2",
        "xlVial": "=H17*1/10"
      }
    ]
  },
  {
    "nombre": "Midazolam",
    "detalle": "5mg/1 mL",
    "concentracion": "5mg/ 5mL",
    "lineas": [
      {
        "dosisRec": "100 - 200 mcg/Kg/hr",
        "preparar": "SG5% o SF",
        "porCC": 100,
        "unidad": "mcg/Kg/ hr/mL",
        "factor": 24,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.0,
        "xlPrep": "=(B3*E18*24)/1000/1000*2",
        "xlVial": "=(H18*5)/5"
      }
    ]
  },
  {
    "nombre": "Milrinona",
    "detalle": "10 mg/ 10 mL",
    "concentracion": "1 mg/ 1 mL",
    "lineas": [
      {
        "dosisRec": "0,3 - 0,75 mcg/Kg/min",
        "preparar": "SG5% o SF",
        "porCC": 0.5,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.0,
        "xlPrep": "=(B3*60*24*E19)/1000/1000*2",
        "xlVial": "=(H19*1)"
      }
    ]
  },
  {
    "nombre": "Morfina",
    "detalle": "10 mg/ 1 mL",
    "concentracion": "10 mg/ 1 mL",
    "lineas": [
      {
        "dosisRec": "20-40 mcg/Kg/hr",
        "preparar": "SG 5%, 10% o SF",
        "porCC": 20,
        "unidad": "mcg/Kg/ hr/mL",
        "factor": 24,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 0.1,
        "xlPrep": "=(B3*E20*24)/1000/1000*2",
        "xlVial": "=(H20*1)/10"
      }
    ]
  },
  {
    "nombre": "Noradrenalina",
    "detalle": "4 mg/ 4 mL",
    "concentracion": "4 mg/ 4 mL",
    "lineas": [
      {
        "dosisRec": "0,1 - 1 mcg/kg/min",
        "preparar": "SG 5%",
        "porCC": 1,
        "unidad": "mcg/Kg/min / mL",
        "factor": 1440,
        "div": 1000,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.0,
        "xlPrep": "=(B3*E21*60*24)/1000/1000*2",
        "xlVial": "=(H21*4)/4"
      }
    ]
  },
  {
    "nombre": "Precedex (dexmedetomidina)",
    "detalle": "200 mcg/ 2 mL",
    "concentracion": "200 mcg/ 2 mL",
    "lineas": [
      {
        "dosisRec": "0,05-0,8 mcg/Kg/hr",
        "preparar": "SG5% o SF",
        "porCC": 0.6,
        "unidad": "mcg/Kg/ hr/mL",
        "factor": 24,
        "div": 1,
        "prepUnidad": "mcg",
        "vialTipo": "mul",
        "vialF": 0.01,
        "xlPrep": "=(B3*E22*24)/1000*2",
        "xlVial": "=(H22*2)/200"
      }
    ]
  },
  {
    "nombre": "Propofol",
    "detalle": "200 mg/ 20 mL",
    "concentracion": "200 mg/ 20 mL",
    "lineas": [
      {
        "dosisRec": "1 – 3 mg/Kg/hr",
        "preparar": "SG 5%",
        "porCC": 3,
        "unidad": "mg/Kg/ hr/mL",
        "factor": 24,
        "div": 1,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 0.1,
        "xlPrep": "=(B3*E23*24)/1000*2",
        "xlVial": "=(H23*20)/200"
      }
    ]
  },
  {
    "nombre": "Sildenafil",
    "detalle": "8 mg/10 ml",
    "concentracion": "8 mg/10 ml",
    "lineas": [
      {
        "dosisRec": "0,06 mg/k/h",
        "preparar": "SG5% o SF",
        "porCC": 0.06,
        "unidad": "mg/Kg/ hr/mL",
        "factor": 24,
        "div": 1,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.25,
        "xlPrep": "=(B3*E24*24)/1000*2",
        "xlVial": "= H24*10/8"
      }
    ]
  },
  {
    "nombre": "Vecuronio",
    "detalle": "10 mg",
    "concentracion": "10 mg/ 10 mL",
    "lineas": [
      {
        "dosisRec": "0,2-0,5 mg/kg/hr",
        "preparar": "SG5% o SF",
        "porCC": 0.2,
        "unidad": "mg/Kg/ hr/mL",
        "factor": 24,
        "div": 1,
        "prepUnidad": "mg",
        "vialTipo": "mul",
        "vialF": 1.0,
        "xlPrep": "=(B3*E25*24)/1000*2",
        "xlVial": "=(H25*10)/10"
      }
    ]
  },
  {
    "nombre": "Vasopresina",
    "concentracion": "20 UI/1 mL",
    "lineas": [
      {
        "dosisRec": "0,0003-0,0006 UI/kg/min",
        "preparar": "SG5% o SF",
        "porCC": 0.0006,
        "unidad": "UI/Kg/min/mL",
        "factor": 1440,
        "div": 1,
        "prepUnidad": "UI",
        "vialTipo": "div",
        "vialF": 20.0,
        "xlPrep": "=(B3*E26*60*24)/1000*2",
        "xlVial": "=H26/20",
        "nota": "D max 0,0012"
      }
    ]
  }
];

const ORALES_CSM = [
  {
    "nombre": "Acido Folico",
    "magistral": true,
    "concentracion": "Jarabe 1 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "1 mg/Kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "div",
        "f": 1.0,
        "unidadVol": "mL",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F9/1)"
      }
    ]
  },
  {
    "nombre": "Acido Urso",
    "magistral": false,
    "concentracion": "Jarabe 250 mg/5 mL",
    "via": "VO",
    "nota": "Mantener T° ambiente",
    "lineas": [
      {
        "dosisTxt": "15 mg/kg",
        "base": "kg",
        "k": 15.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.02,
        "unidadVol": "mL",
        "xlDosis": "=(C3*15)/1000",
        "xlVol": "=(F10*5)/250"
      }
    ]
  },
  {
    "nombre": "Biogaia",
    "magistral": false,
    "concentracion": "Gotas",
    "via": "VO",
    "nota": "Mantener T° ambiente",
    "lineas": [
      {
        "vol": "fijo",
        "f": 5.0,
        "unidadVol": "Gotas",
        "xlVol": "5"
      }
    ]
  },
  {
    "nombre": "BionBB",
    "magistral": false,
    "concentracion": "Gotas",
    "via": "VO",
    "nota": "Mantener T° ambiente",
    "lineas": [
      {
        "vol": "fijo",
        "f": 6.0,
        "unidadVol": "Gotas",
        "xlVol": "6"
      }
    ]
  },
  {
    "nombre": "Cafeina Citrato",
    "magistral": true,
    "concentracion": "Jarabe 10 mg/mL",
    "via": "VO",
    "nota": "Mantener refrigerado",
    "lineas": [
      {
        "dosisTxt": "10 mg/kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.1,
        "unidadVol": "mL",
        "xlDosis": "=(C3*10)/1000",
        "xlVol": "=(F13*1)/10"
      }
    ]
  },
  {
    "nombre": "Captopril",
    "magistral": true,
    "concentracion": "Solucion Oral 0,1 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "0,01mg/kg",
        "base": "kg",
        "k": 0.01,
        "unidad": "mg",
        "vol": "mul",
        "f": 10.0,
        "unidadVol": "mL",
        "xlDosis": "=(C3*0.01)/1000",
        "xlVol": "=(F14*1/0.1)"
      }
    ]
  },
  {
    "nombre": "Cefadroxilo",
    "magistral": false,
    "concentracion": "Jarabe 250 mg/5 ml",
    "via": "VO",
    "nota": "Mantener refrigerado",
    "lineas": [
      {
        "dosisTxt": "15 mg/kg",
        "base": "kg",
        "k": 15.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.02,
        "unidadVol": "mL",
        "xlDosis": "=(C3*15)/1000",
        "xlVol": "=(F15*5)/250"
      }
    ]
  },
  {
    "nombre": "Cloruro de Potasio 10%",
    "magistral": false,
    "concentracion": "Ampolla 1 gr/10 mL",
    "via": "VO",
    "lineas": [
      {
        "dosisTxt": "1 Meq/kg/dia",
        "base": "kg",
        "k": 1.0,
        "unidad": "Meq",
        "vol": "mul",
        "f": 0.7692307692307692,
        "unidadVol": "mL/dia",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F16*1)/1.3"
      }
    ]
  },
  {
    "nombre": "Cloruro de Sodio 10%",
    "magistral": false,
    "concentracion": "Ampolla 2 gr/20 ml",
    "via": "VO",
    "lineas": [
      {
        "dosisTxt": "1 Meq/Kg/dia",
        "base": "kg",
        "k": 1.0,
        "unidad": "Meq",
        "vol": "mul",
        "f": 0.5882352941176471,
        "unidadVol": "mL/dia",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F17*1)/1.7"
      }
    ]
  },
  {
    "nombre": "Digoxina",
    "magistral": false,
    "concentracion": "Solucion Oral 50 mcg/mL",
    "via": "VO",
    "nota": "Mantener T° ambiente",
    "lineas": [
      {
        "dosisTxt": "5 mcg/kg",
        "base": "kg",
        "k": 5.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.02,
        "unidadVol": "mL",
        "xlDosis": "=(C3*5)/1000",
        "xlVol": "=(F18*1)/50"
      }
    ]
  },
  {
    "nombre": "Enalapril",
    "magistral": true,
    "concentracion": "Jarabe 0,1 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "0,04mg/kg",
        "base": "kg",
        "k": 0.04,
        "unidad": "mg",
        "vol": "mul",
        "f": 10.0,
        "unidadVol": "mL",
        "xlDosis": "=(C3*0.04)/1000",
        "xlVol": "=(F19*1/0.1)"
      }
    ]
  },
  {
    "nombre": "Esomeprazol",
    "magistral": true,
    "concentracion": "Sobres 10 mg",
    "via": "VO",
    "lineas": [
      {
        "dosisTxt": "0,5 mg/kg",
        "base": "kg",
        "k": 0.5,
        "unidad": "mg",
        "vol": "igual",
        "f": 1.0,
        "kDirecta": 0.5,
        "unidadVol": "mg",
        "xlDosis": "=(C3*0.5)/1000",
        "xlVol": "=(C3*0.5)/1000"
      }
    ]
  },
  {
    "nombre": "Espironolactona",
    "magistral": true,
    "concentracion": "Suspension 5 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "1 mg/k",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.2,
        "unidadVol": "mL",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F21*1)/5"
      }
    ]
  },
  {
    "nombre": "Fenobarbital",
    "magistral": true,
    "concentracion": "Suspension 3 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "3 mg/kg",
        "base": "kg",
        "k": 3.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.3333333333333333,
        "unidadVol": "mL",
        "xlDosis": "=(C3*3)/1000",
        "xlVol": "=(F22*1)/3"
      }
    ]
  },
  {
    "nombre": "Flecainide",
    "magistral": true,
    "concentracion": "Suspension 5 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "2mg/kg",
        "base": "kg",
        "k": 2.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.2,
        "unidadVol": "mL",
        "xlDosis": "=(C3*2)/1000",
        "xlVol": "=(F23*1)/5"
      }
    ]
  },
  {
    "nombre": "Fluconazol",
    "magistral": false,
    "concentracion": "Suspension 200 mg/5 mL",
    "via": "VO",
    "nota": "Mantener refrigerado",
    "lineas": [
      {
        "dosisTxt": "6 mg/kg",
        "base": "kg",
        "k": 6.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.025,
        "unidadVol": "mL",
        "xlDosis": "=(C3*6)/1000",
        "xlVol": "=(F24*5)/200"
      }
    ]
  },
  {
    "nombre": "Fosfato monopotasico",
    "magistral": true,
    "concentracion": "Jarabe 40mg/mL 9mg P Ele/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "20 mg/Kg",
        "base": "kg",
        "k": 20.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.025,
        "unidadVol": "mL",
        "xlDosis": "=(C3*20)/1000",
        "xlVol": "=(F25*1)/40"
      }
    ]
  },
  {
    "nombre": "Furosemida",
    "magistral": false,
    "concentracion": "Jarabe 10 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "1 mg/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.1,
        "unidadVol": "mL",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F26*1)/10"
      }
    ]
  },
  {
    "nombre": "Carbonato de Calcio",
    "magistral": true,
    "concentracion": "Suspension 250 mg/mL 100 mg Ca Ele/mL",
    "via": "VO",
    "nota": "Mantener refrigerado",
    "lineas": [
      {
        "dosisTxt": "50 mg/kg Ca Ele",
        "base": "kg",
        "k": 50.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.01,
        "unidadVol": "mL",
        "xlDosis": "=(C3*50)/1000",
        "xlVol": "=(F27*1)/100"
      }
    ]
  },
  {
    "nombre": "Hidrato de cloral 10%",
    "magistral": true,
    "concentracion": "Solucion oral 100 mg/mL",
    "via": "VO o rectal",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "40 mg/ Kg",
        "base": "kg",
        "k": 40.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.01,
        "unidadVol": "mL",
        "xlDosis": "=(C3*40)/1000",
        "xlVol": "=(F28*1)/100"
      }
    ]
  },
  {
    "nombre": "Hidroclorotiazida",
    "magistral": true,
    "concentracion": "Jarabe 2 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "1 mg/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.5,
        "unidadVol": "mL",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F29*1)/2"
      }
    ]
  },
  {
    "nombre": "Ibuprofeno",
    "magistral": false,
    "concentracion": "Jarabe 100 mg/ 5mL",
    "via": "VO",
    "lineas": [
      {
        "dosisTxt": "10 mg/kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.05,
        "unidadVol": "mL",
        "xlDosis": "=(C3*10)/1000",
        "xlVol": "=(F30*5)/100"
      }
    ]
  },
  {
    "nombre": "Levetiracetam",
    "magistral": false,
    "concentracion": "Jarabe 100 mg/mL",
    "via": "VO",
    "nota": "Proteger de luz",
    "lineas": [
      {
        "dosisTxt": "30 mg/kg",
        "base": "kg",
        "k": 30.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.01,
        "unidadVol": "mL",
        "xlDosis": "=(C3*30)/1000",
        "xlVol": "=(F31*1)/100"
      }
    ]
  },
  {
    "nombre": "Maltofer",
    "magistral": false,
    "concentracion": "Gotas 50 mg/ mL",
    "via": "VO",
    "lineas": [
      {
        "dosisTxt": "2 mg/kg",
        "base": "kg",
        "k": 2.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.4,
        "unidadVol": "gotas",
        "xlDosis": "=(C3*2)/1000",
        "xlVol": "=(F32*20)/50"
      },
      {
        "dosisTxt": "6 mg/kg",
        "base": "kg",
        "k": 6.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.4,
        "unidadVol": "gotas",
        "xlDosis": "=(C3*6)/1000",
        "xlVol": "=(F33*20)/50"
      }
    ]
  },
  {
    "nombre": "Metadona",
    "magistral": false,
    "concentracion": "Ampolla 10 mg/ 2ml",
    "via": "VO",
    "nota": "Diluir a 1 mg/ml en H2O esteril.",
    "lineas": [
      {
        "dosisTxt": "0,1mg/kg",
        "base": "kg",
        "k": 0.1,
        "unidad": "mg",
        "vol": "mul",
        "f": 1.0,
        "unidadVol": "mL",
        "xlDosis": "=(C3*0.1)/1000",
        "xlVol": "=(F34*1/1)"
      }
    ]
  },
  {
    "nombre": "Nifedipino",
    "magistral": true,
    "concentracion": "Solucion oral 2mg/ml",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "0,5 mg/Kg",
        "base": "kg",
        "k": 0.5,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.5,
        "unidadVol": "mL",
        "xlDosis": "=(C3*0.5)/1000",
        "xlVol": "=(F35*1)/2"
      }
    ]
  },
  {
    "nombre": "Omeprazol",
    "magistral": true,
    "concentracion": "Suspension 2mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "1mg/kg",
        "base": "kg",
        "k": 1.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.5,
        "unidadVol": "mL",
        "xlDosis": "=(C3*1)/1000",
        "xlVol": "=(F36*1)/2"
      }
    ]
  },
  {
    "nombre": "Paracetamol",
    "magistral": false,
    "concentracion": "Jarabe 120 mg/5 mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "10 mg/kg",
        "base": "kg",
        "k": 10.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.041666666666666664,
        "unidadVol": "mL",
        "xlDosis": "=(C3*10)/1000",
        "xlVol": "=(F37*5)/120"
      },
      {
        "dosisTxt": "2 gotas/kg",
        "vol": "igual",
        "f": 1.0,
        "kDirecta": 2.0,
        "unidadVol": "Gotas",
        "xlVol": "=(C3*2)/1000",
        "concLinea": "Gotas 100 mg/ml"
      }
    ]
  },
  {
    "nombre": "Propanolol",
    "magistral": true,
    "concentracion": "Jarabe 1mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "0,25 mg/kg",
        "base": "kg",
        "k": 0.25,
        "unidad": "mg",
        "vol": "mul",
        "f": 1.0,
        "unidadVol": "mL",
        "xlDosis": "=(C3*0.25)/1000",
        "xlVol": "=(F39*1/1)"
      }
    ]
  },
  {
    "nombre": "Sildenafil",
    "magistral": true,
    "concentracion": "Suspension 2,5mg/mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "2 mg/k",
        "base": "kg",
        "k": 2.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.4,
        "unidadVol": "mL",
        "xlDosis": "=(C3*2)/1000",
        "xlVol": "=(F40*1)/2.5"
      }
    ]
  },
  {
    "nombre": "Vitamina D",
    "magistral": false,
    "concentracion": "200UI/gota",
    "via": "VO",
    "lineas": [
      {
        "dosisTxt": "400-800 UI",
        "vol": "texto",
        "f": "2-4",
        "unidadVol": "Gotas",
        "xlVol": "2-4"
      }
    ]
  },
  {
    "nombre": "Zidovudina",
    "magistral": false,
    "concentracion": "Jarabe 50 mg/5 mL",
    "via": "VO",
    "nota": "Proteger de luz/ Consevar refrigerado",
    "lineas": [
      {
        "dosisTxt": "2 mg/kg",
        "base": "kg",
        "k": 2.0,
        "unidad": "mg",
        "vol": "mul",
        "f": 0.1,
        "unidadVol": "mL",
        "xlDosis": "=(C3*2)/1000",
        "xlVol": "=(F42*5)/50"
      }
    ]
  }
];
