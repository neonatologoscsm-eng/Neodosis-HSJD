# Calculadora de Medicamentos · Clínica Santa María

Aplicación de la planilla **«Calculadora de medicamentos»** de la Unidad de
Neonatología de Clínica Santa María (Dra. Claudia Ávila, 2021), con la identidad
institucional de la clínica y el mismo flujo de tres pasos de la app del HSJD:
**paciente → qué calcular → resultados**.

- **Enlace:** https://neonatologoscsm-eng.github.io/Neodosis-HSJD/csm/
- **APK de prueba:** [prelanzamiento `apk-csm`](https://github.com/neonatologoscsm-eng/Neodosis-HSJD/releases/tag/apk-csm)

## Qué contiene (equivalencia con la planilla)

| Hoja original | Dónde está en la app | Contenido |
|---|---|---|
| `MED BOLO` | **Bolos EV** | 47 fármacos (63 esquemas con cargas y mantenciones), con presentación, dilución, concentración recomendada, tiempo de infusión y notas |
| `MED BIC` | **Infusiones continuas** | 15 fármacos (17 esquemas), preparación para 48 mL con volumen del frasco y del solvente |
| `MED ORALES` | **Medicamentos orales** | 32 fármacos, con marca de preparado magistral y notas de conservación |
| `ANTIBIOTICOS` | **Antibióticos** | 14 tablas (SOCHINF 2020 / Neofax 2020) por edad gestacional, edad postnatal y peso |
| `Hoja de Urgencia` | **Otros cálculos** | TET, CAU, CVU y fármacos de reanimación, intubación, antagonistas, anticonvulsivantes y antiarrítmico |
| `C Glucosa` | **Otros cálculos** | Fleboclisis, goteo y carga de glucosa para SG 5 a 20 % |
| `GGlobulina` | **Otros cálculos** | Gammaglobulina EV: dosis, volumen, velocidades y hoja de control |
| `Formulas` | **Otros cálculos** | Aportes nutricionales de 20 fórmulas lácteas y fortificantes, con MCT |
| `DART` | **Esquemas** | Dexametasona, esquema de 10 días con fechas |
| `WEANING OPIODES` | **Esquemas** | Equivalencia a metadona y bajada en 6 u 11 días |

Cada valor calculado tiene un botón **ƒx** que muestra la fórmula original de la
planilla.

## Diferencia útil respecto de la planilla

En las tablas de antibióticos la planilla muestra todas las filas y la elección
de cuál corresponde se hace a ojo. La app marca en ámbar —**«este paciente»**—
la fila que cumple los criterios de edad gestacional, edad postnatal y peso
ingresados. Los valores son los mismos: sólo se señala la fila.

## Verificación

```bash
pip install openpyxl
cd verificacion-csm && python3 comparar.py planilla_csm.xlsx
```

Última ejecución:

```
Pacientes probados : 905      (pesos 500–4200 g × EG 25–40 sem × edad 0–45 d)
Celdas comparadas  : 357475
Diferencias        : 0
```

Los datos de `js/datos-medicamentos.js` **se generan** desde la planilla con
`verificacion-csm/extraer.py`: los coeficientes de dosis y los divisores de
volumen se leen de las fórmulas, no se transcriben a mano.

## Nota sobre datos personales

La planilla original traía el nombre de dos pacientes reales (hojas `DART` y
`GGlobulina`) y sus fechas asociadas. La copia de `verificacion-csm/` está
anonimizada: esos campos se borraron antes de subirla, porque el repositorio es
público. Conviene revisar la planilla que circula en la unidad por el mismo
motivo.

## Aviso clínico

Herramienta de apoyo. **No reemplaza el juicio clínico**: toda dosis debe ser
verificada por el médico tratante y por enfermería antes de administrarse.
