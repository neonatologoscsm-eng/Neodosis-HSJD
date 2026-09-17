# Empaquetado Android

La aplicación es una web estática; este directorio sólo la envuelve con
[Capacitor](https://capacitorjs.com) para generar un **APK de prueba** que
funciona sin conexión (los archivos van dentro del APK).

El APK lo compila GitHub Actions (`.github/workflows/apk.yml`); no hace falta
tener Android Studio. Para hacerlo a mano, con el SDK de Android y JDK 21:

```bash
cd packaging
mkdir -p www && cp -r ../index.html ../manifest.webmanifest ../sw.js ../css ../js ../assets www/
npm install
npx cap add android
npx cap sync android
npx @capacitor/assets generate --android      # iconos con el logo de la unidad
cd android && ./gradlew assembleDebug
# android/app/build/outputs/apk/debug/app-debug.apk
```

El APK que produce el flujo de trabajo está firmado con la **clave de depuración**
estándar de Android: sirve para instalar y probar, no para publicar en Google Play.
Para la versión definitiva hay que generar una clave propia y firmar un
`assembleRelease` (o un Android App Bundle).
