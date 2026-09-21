# Calculadoras de medicamentos neonatales

Este repositorio contiene **dos aplicaciones**, cada una réplica fiel de la
planilla que usa su unidad:

| Aplicación | Enlace | APK |
|---|---|---|
| **NeoDosis HSJD** — Hospital San Juan de Dios | https://neonatologoscsm-eng.github.io/Neodosis-HSJD/ | [`apk-prueba`](https://github.com/neonatologoscsm-eng/Neodosis-HSJD/releases/tag/apk-prueba) |
| **NeoCalc CSM** — Clínica Santa María ([detalle](csm/README.md)) | https://neonatologoscsm-eng.github.io/Neodosis-HSJD/csm/ | [`apk-csm`](https://github.com/neonatologoscsm-eng/Neodosis-HSJD/releases/tag/apk-csm) |

Lo que sigue documenta la aplicación del **Hospital San Juan de Dios**; la de
Clínica Santa María tiene su propio [README](csm/README.md).

---

# NeoDosis HSJD

Aplicación web para el **cálculo de medicamentos de alto riesgo** de la Unidad de
Neonatología del Hospital San Juan de Dios.

Replica de forma fiel el contenido y **todas** las fórmulas de la planilla
institucional *«Cálculo de medicamentos de alto riesgo»* (versión atropina,
vasopresina e isoproterenol), pero con una interfaz pensada para usarse junto a
la cuna: se ingresan **peso, edad gestacional y edad cronológica** y la app
calcula al instante dosis, volúmenes, intervalos y preparaciones.

---

## Cómo se usa

La app trabaja en tres pasos:

1. **Paciente** — se ingresa el **peso (g)**, la **edad gestacional al nacer** (semanas + días) y la
   **edad cronológica** (días de vida o fecha de nacimiento). El peso es lo único obligatorio; la EG y
   la edad se usan para ajustar los antimicrobianos. Bajo «Datos para la ficha impresa» pueden
   agregarse nombre, cupo y diagnóstico.
2. **Fármacos** — **un único listado alfabético** con los 75 fármacos y cálculos de la planilla,
   sin separarlos por tipo: cada opción lleva una etiqueta (*bolo*, *infusión continua*,
   *antibiótico*, *antiviral*, *antifúngico*, *otro cálculo*) que dice de qué tabla viene. Se
   escribe parte del nombre —o del tipo— para filtrar, se marcan todos los que se quiera consultar
   y los seleccionados quedan como chips arriba. «Seleccionar todos» marca lo que esté a la vista
   (todo el listado, o sólo lo filtrado).
3. **Dosis** — la app muestra únicamente los fármacos pedidos, con sus dosis, volúmenes,
   intervalos y preparaciones, más el botón **Imprimir** para dejar la hoja en la ficha.
   Cada ficha **encabeza con el intervalo que corresponde a este paciente** (ver más abajo).

Se abre con `index.html` en cualquier navegador: no necesita servidor, internet ni instalación.
Los datos quedan guardados en el navegador (`localStorage`) hasta que se presiona
**Nuevo paciente**; nunca salen del dispositivo.

### Uso sin conexión / como app del teléfono

Si se publica en un servidor (o en la intranet del hospital), la app registra un
*service worker* y queda disponible sin conexión; desde el navegador del teléfono
puede añadirse a la pantalla de inicio y se abre como aplicación.

```bash
# servidor local de prueba
python3 -m http.server 8080
# luego abrir http://localhost:8080
```

## Intervalo recomendado en cada ficha

Toda ficha de resultado empieza con un bloque que resume **qué corresponde a este
paciente** según la EG corregida, la edad cronológica y el peso ingresados (los tres
criterios van escritos en el encabezado del bloque):

- **Antimicrobianos** — dosis a administrar, mg/Kg por dosis y el **intervalo en grande**
  (`cada 12 h`, `Por una vez`, etc.) para cada esquema (bacteriemia, meningitis, carga,
  profilaxis…). Es el mismo valor de la columna «Intervalo» de la tabla, que se mantiene:
  sólo deja de haber que buscarlo. Si falta la EG o la edad y la fórmula depende de ellas,
  el bloque dice **«requiere EG y edad»** en vez de mostrar un número calculado con ceros;
  las fórmulas que no dependen de esos datos (por ejemplo azitromicina, cada 24 h) sí se muestran.
- **Bolos** — la planilla no define intervalo, así que la ficha lo dice: *«Dosis puntual, sin
  intervalo en la planilla · repetir sólo según indicación médica»*.
- **Infusiones continuas** — *«Infusión continua, sin intervalo»*, con el rango recomendado
  de la planilla para titular.
- **Inmunoglobulina EV** — *«Dosis única»*; la planilla no repite la dosis.

Donde la planilla no define un intervalo, la app **lo dice explícitamente** en vez de dejar el
dato en blanco: no inventa intervalos que la planilla no contiene.

## Qué contiene (equivalencia con la planilla)

| Hoja original | Dónde está en la app | Contenido |
|---|---|---|
| `Medicamentos` | Grupos **Bolos** e **Infusiones continuas** | 15 bolos (19 esquemas: carga/mantención, EV/ET) y 13 infusiones continuas |
| `Otros medicamentos` | Grupos **Bolos** e **Infusiones continuas** | 6 bolos (albúmina, amiodarona, atropina, gluconato de calcio, sulfato de magnesio, verapamilo) y 5 infusiones (amiodarona, ketamina, furosemida, isoproterenol, vasopresina) |
| `Antimicrobianos` | Grupos **Antibióticos**, **Antivirales** y **Antifúngicos** | 22 antibióticos, 7 antivirales y 4 antifúngicos, con esquemas de bacteriemia/meningitis, profilaxis/tratamiento y carga/mantención, y volúmenes con y sin restricción de volumen |
| `Inmunoglobulina` | **Otros cálculos → Inmunoglobulina EV** | Dosis, volumen, velocidades de infusión, hoja de control de signos vitales y datos de lote/firma |
| `Reanimación` | **Otros cálculos → Reanimación** | N° de TET, distancia a la boca, cardioversión y adrenalina |
| `Versión Para Imprimir` | Botón **Imprimir** del paso 3 | Hoja del paciente con los fármacos consultados |

Cada valor calculado tiene un botón **ƒx** que muestra la fórmula original de la
planilla (con sus referencias de celda) para poder auditarlo.

### Celdas de referencia

| Celda | Significado |
|---|---|
| `B6` | Peso en gramos |
| `D5` | Edad cronológica en días |
| `F5` | Edad gestacional en semanas |
| `I5` | EG corregida decimal (`F5 + D5/7`) |
| `K5` | Días de la EG corregida |
| `F6` | Superficie corporal |

---

## Verificación de fidelidad

El directorio [`verificacion/`](verificacion/) contiene un intérprete
independiente de las fórmulas de Excel que **recalcula la planilla original** y
la compara celda por celda con lo que entrega la aplicación:

```bash
pip install openpyxl
cd verificacion && python3 comparar.py planilla_original.xlsx
```

Resultado de la última ejecución:

```
Pacientes probados : 1566     (pesos 450–4500 g × EG 24–41 sem × edad 0–90 d)
Celdas comparadas  : 447876
Diferencias no esperadas : 0
```

Las únicas divergencias son **1.100 casos documentados** en los que la cadena de
`SI()` de la planilla no cubre la combinación de EG y edad: Excel devuelve
`FALSO` y arrastra una **dosis de 0 mg**, mientras que la app muestra
«sin resultado» con una alerta (ver *Cefepime* y *Zidovudina VO* más abajo).

---

## Hallazgos de la auditoría de la planilla

La app **reproduce el resultado de la planilla** en todos estos casos, pero los
muestra señalizados en pantalla para que la unidad decida si corresponde
corregir el documento original.

| Fármaco / valor | Qué ocurre en la planilla | Qué hace la app |
|---|---|---|
| **Ceftazidima** (intervalo) | Las fórmulas apuntan a `K5` (días de la EGC) y a `E5`, que es la **celda de texto** «EG (semanas)». Como en Excel cualquier texto es mayor que cualquier número, ambos esquemas devuelven siempre **8 h** | Muestra 8 h + alerta explicando la referencia equivocada |
| **Metronidazol** (mantención) | `SI(Y(K5=26;K5=27);10;7,5)`: una celda no puede valer 26 y 27 a la vez, por lo que siempre entrega **7,5 mg/Kg** | Muestra 7,5 mg/Kg + alerta (probablemente se buscaba 10 mg/Kg entre 26 y 27 semanas) |
| **Cloxacilina** (bacteriemia) | La segunda condición evalúa `I5>28` (EGC) en lugar de `D5>28` (edad); con EGC ≤ 28 y edad > 28 d cae en el valor por defecto de 6 h, mientras que el esquema de meningitis —que sí usa la edad— daría 8 h | Muestra el valor de la planilla + alerta cuando se da esa combinación |
| **Cefepime** (bacteriemia) | La fórmula sólo cubre «EGC ≤ 36 y edad ≤ 28 d» o «EGC > 36 y edad > 28 d». Fuera de eso devuelve `FALSO` y la dosis calculada queda en **0 mg** | Muestra «sin resultado» + alerta, en vez de una dosis de 0 |
| **Zidovudina VO** | Usa `D5<30` y `D5>30`: con EGC < 30 semanas y exactamente 30 días de vida no hay resultado (0 mg) | Muestra «sin resultado» + alerta (la dosis EV equivalente sería 2,3 mg/Kg) |
| **Distancia a la boca** (Reanimación) | `=(B6/1009)+6` divide por 1.009 en vez de 1.000 (regla «peso en Kg + 6») | Reproduce la fórmula + nota; la diferencia es < 0,03 cm |
| **Gentamicina** (intervalo) | Una condición usa `D5<=34` (edad) donde parece corresponder `I5<=34` (EGC); el resultado coincide con el valor por defecto (24 h), así que no cambia ninguna dosis | Reproduce la fórmula |
| **Fenitoína en «Versión Para Imprimir»** | La hoja de impresión toma el volumen de la carga desde `G13` (adrenalina ET) en lugar de `G14` | La impresión usa el valor correcto de la hoja «Medicamentos» |
| **Peso en «Otros medicamentos»** | Esa hoja tiene su propia celda de peso, independiente del resto del libro (quedó en 800 g) | La app usa un **único peso** para todas las secciones |
| **Superficie corporal** | La hoja «Medicamentos» usa `0,05·Kg + 0,05` y «Otros medicamentos» usa `(4·Kg + 7)/(90 + Kg)` | Se muestran ambas, identificadas por su fórmula |

Además, la app muestra los volúmenes con **dos decimales** (la planilla mostraba
uno en la hoja de antimicrobianos) y el tiempo total de infusión de la
inmunoglobulina, que en la planilla es una casilla vacía para completar a mano.

---

## Distribución para probar en la unidad

Dos vías, ambas automáticas desde GitHub Actions:

| Vía | Cómo se genera | Para quién |
|---|---|---|
| **Enlace web (PWA)** | `.github/workflows/pages.yml` regenera la rama `gh-pages` en cada cambio; GitHub Pages sirve el sitio. Se instala en el teléfono desde el navegador («Añadir a pantalla de inicio») y funciona sin conexión | Todo el equipo, en Android, iPhone o computador |
| **APK de Android** | `.github/workflows/apk.yml` empaqueta la app con Capacitor y publica el archivo en el prelanzamiento `apk-prueba` de *Releases* | Quien prefiera una app instalada |
| **iPhone / iPad** | Desde Safari: *Compartir → Añadir a pantalla de inicio*. Queda a pantalla completa, con el logo de la unidad y funciona sin conexión | Todo el equipo con iPhone |

En iPhone no hay un archivo instalable equivalente al APK: Apple sólo permite
instalar desde la App Store o TestFlight, y ambas exigen el Apple Developer
Program. `.github/workflows/ios.yml` deja el proyecto de iOS compilando en un
runner de macOS para cuando se decida publicarlo; los pasos están en
[`packaging/README.md`](packaging/README.md).

### El enlace

El sitio está publicado en:

**https://neonatologoscsm-eng.github.io/Neodosis-HSJD/**

Se sirve desde la rama `gh-pages`, que el flujo `pages.yml` regenera con el
contenido de `main` cada vez que cambia la aplicación; al final comprueba que el
sitio, el manifiesto, el icono de iOS y el guion de la aplicación responden.

### Sobre la firma del APK

El APK se firma con la clave de depuración de Android: sirve para probar, no para
publicar en Google Play. Para la versión definitiva hay que crear una clave propia
y firmar un `assembleRelease` o un Android App Bundle (ver `packaging/README.md`).

Las instrucciones para los colegas que van a probarla están en
[`docs/PRUEBA.md`](docs/PRUEBA.md).

---

## Estructura del proyecto

```
index.html                  Estructura de los tres pasos
css/styles.css              Estilos Material Design (claro/oscuro, impresión, móvil)
js/calculo.js               Núcleo de cálculo: las fórmulas de la planilla
js/data.js                  Bolos e infusiones continuas
js/antimicrobianos.js       Antibióticos, antivirales y antifúngicos
js/app.js                   Flujo de pasos, catálogo buscable, estado y render
sw.js, manifest.webmanifest Uso sin conexión / instalación como app
assets/                     Logotipo de la unidad
verificacion/               Intérprete de Excel y prueba de fidelidad
packaging/                  Empaquetado Android (Capacitor) para el APK de prueba
.github/workflows/          Publicación del sitio y compilación del APK
docs/PRUEBA.md              Instrucciones para el equipo que prueba la app
```

### Para actualizar dosis o agregar un fármaco

Toda la información clínica está en `js/data.js` (bolos e infusiones) y
`js/antimicrobianos.js` (antimicrobianos), en estructuras legibles que replican
las columnas de la planilla. Tras cualquier cambio conviene volver a ejecutar la
prueba de `verificacion/` o actualizar la planilla de referencia.

---

## Aviso clínico

Herramienta de apoyo para el equipo de la unidad. **No reemplaza el juicio
clínico**: toda dosis debe ser verificada por el médico tratante y por
enfermería/matronería antes de administrarse.
