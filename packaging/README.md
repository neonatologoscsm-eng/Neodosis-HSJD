# Empaquetado móvil

La aplicación es una web estática; este directorio sólo la envuelve con
[Capacitor](https://capacitorjs.com) para generar las apps nativas, que
funcionan sin conexión (los archivos van dentro de la app).

## Android

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


## iOS

Apple no permite instalar una app fuera de la App Store sin firmarla, así que
**no existe un equivalente al APK**. Las vías posibles son:

| Vía | Qué exige | Para cuántos |
|---|---|---|
| **App web en la pantalla de inicio** (lo que se usa hoy) | Nada: Safari → Compartir → *Añadir a pantalla de inicio* | Sin límite |
| **TestFlight** | Apple Developer Program (99 USD/año) y subir la app desde un Mac o desde CI | Hasta 10.000 probadores |
| **Ad Hoc** | Apple Developer Program y registrar el UDID de cada iPhone | 100 dispositivos por año |
| **App Store** | Apple Developer Program y revisión de Apple | Público general |

El flujo `.github/workflows/ios.yml` genera el proyecto de iOS y comprueba que
compila (sin firma), dejando el `.xcarchive` como artefacto. Para publicar en
TestFlight hay que añadir la firma:

1. Crear en App Store Connect la app con el identificador
   `cl.hsjd.neonatologia.neodosis`.
2. Generar un certificado de distribución y un perfil de aprovisionamiento.
3. Guardarlos como *secrets* del repositorio y firmar el archivo con
   `xcodebuild -exportArchive` usando un `ExportOptions.plist` de tipo
   `app-store`, subiéndolo después con `xcrun altool` o `xcrun notarytool`.

En un Mac con Xcode el camino manual es:

```bash
cd packaging
mkdir -p www && cp -r ../index.html ../manifest.webmanifest ../sw.js ../css ../js ../assets www/
npm install
npx cap add ios
npx cap sync ios
npx @capacitor/assets generate --ios
open ios/App/App.xcworkspace     # firmar con el equipo de desarrollo y ejecutar
```
