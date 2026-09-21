# NeoDosis HSJD · versión de prueba

Guía breve para el equipo de la unidad que va a probar la aplicación **antes** de la
versión definitiva.

> La app es una herramienta de apoyo. **Toda dosis debe verificarse** con el médico
> tratante y con enfermería/matronería antes de administrarse. Si algo no calza con
> la planilla, avise: es justamente lo que queremos detectar en esta prueba.

## Los enlaces

- **Hospital San Juan de Dios:** https://neonatologoscsm-eng.github.io/Neodosis-HSJD/
- **Clínica Santa María:** https://neonatologoscsm-eng.github.io/Neodosis-HSJD/csm/

Las instrucciones que siguen valen igual para las dos: cada una se instala por
separado y queda con el logo de su institución.

## Opción 1 · Abrirla desde el enlace (sirve en cualquier equipo)

1. Abra el enlace en el teléfono, el computador o el PC de la unidad.
2. Funciona de inmediato, sin instalar nada.
3. Si quiere tenerla como una app en el teléfono:
   - **Android (Chrome):** menú ⋮ → *Añadir a pantalla principal* / *Instalar aplicación*.
   - **iPhone (Safari):** botón Compartir → *Añadir a pantalla de inicio* (detalle en la opción 2).

Una vez agregada queda con el logo de la unidad, se abre a pantalla completa y
**sigue funcionando sin señal ni wifi** (se guarda en el teléfono la primera vez que
se abre con conexión).

## Opción 2 · Instalarla en el iPhone

En iPhone **no se puede instalar un archivo de app** como en Android: Apple sólo
permite instalar desde la App Store o TestFlight. La forma de tenerla como app,
que es la que usamos para esta prueba, es añadirla a la pantalla de inicio:

1. Abra **https://neonatologoscsm-eng.github.io/Neodosis-HSJD/** en **Safari**
   (no en Chrome ni desde otra app).
2. Toque el botón **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elija **Añadir a pantalla de inicio** y confirme.

Queda con el logo de la unidad y el nombre *NeoDosis*, se abre a pantalla
completa —sin barras del navegador— y **funciona sin señal ni wifi** una vez que
se abrió la primera vez con conexión. Los datos del paciente quedan sólo en ese
teléfono.

Si el iPhone está en modo oscuro, la app también lo sigue.

## Opción 3 · Instalar el APK en Android

Útil si prefiere una app instalada de verdad o si el teléfono no tiene conexión la
primera vez.

1. Descargue el archivo `NeoDosis-HSJD-prueba-*.apk` desde la sección
   **Releases** del repositorio (prelanzamiento «versión de prueba»).
2. Ábralo desde las descargas. Android avisará que la instalación proviene de una
   fuente desconocida: hay que autorizar esa app (Chrome o Archivos) por única vez.
3. Quedará instalada como **NeoDosis HSJD** y funciona completamente sin conexión.

El APK está firmado con la clave de depuración de Android: sirve para probar, no es
la versión que se publicaría en Google Play.

## Qué conviene revisar

- Que las dosis, volúmenes e intervalos coincidan con la planilla que se usa hoy.
- Que los fármacos que se usan a diario sean fáciles de encontrar en el buscador.
- Que la información que aparece sea la necesaria: si falta o sobra algo, decirlo.
- Los avisos en ámbar: marcan puntos donde la planilla original tiene fórmulas
  que conviene revisar (están explicados en el README del proyecto).
- Cómo se ve la hoja impresa desde el paso 3.

## Cómo avisar de un problema

Anote el **peso, la edad gestacional y la edad** que usó, el fármaco, lo que mostró la
app y lo que esperaba. Con eso se reproduce y se corrige.
