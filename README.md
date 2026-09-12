# 💓 Control de Presión Arterial

PWA **mobile-first** para llevar un registro de la presión arterial de un paciente: mide y archiva la **presión sistólica**, la **diastólica** y las **pulsaciones por minuto**, todo con una interfaz de estilo **Neubrutalismo**.

Funciona totalmente **sin conexión** y es **instalable** en dispositivos móviles y de escritorio, ya que los datos se guardan localmente en el navegador (privacy-first, sin servidores).

## ✨ Funcionalidades

- **Nueva medición** — Formulario con validación de rangos:
  - Presión sistólica (60–260 mmHg)
  - Presión diastólica (40–160 mmHg)
  - Pulsaciones por minuto (30–250 bpm)
  - Fecha/hora editable + nota opcional.
- **Clasificación automática** — Cada lectura se etiqueta según las guías de la AHA:
  `Normal` · `Elevada` · `HTA Etapa 1` · `HTA Etapa 2` · `CRISIS`, con un color distintivo.
- **Estadísticas** — Última lectura destacada y promedios de sistólica, diastólica, pulso y número total de registros (últimas 7 mediciones).
- **Gráficas de tendencia** — Dos gráficos SVG dibujados a mano (sin dependencias) con la evolución de la presión y del pulso.
- **Historial** — Lista ordenada de más reciente a más antigua, con fecha relativa (`Hoy`, `Ayer`, …), nota y acciones.
- **Editar y eliminar** — Corrige una lectura o bórrala con confirmación.
- **Exportar datos** — Descarga todo el historial en **JSON** o **CSV**.
- **PWA instalable y offline** — Service worker generado con Workbox; precachea la app completa.

## 🖥️ Interfaz

Estética **Neubrutalismo**:

- Bordes negros gruesos (3px) y sombras duras `6px 6px 0`.
- Colores planos y vibrantes (amarillo, teal, rojo, azul y púrpura sobre fondo crema `#F4F1DE`).
- Tipografías empaquetadas localmente: **Archivo Black** para títulos y **Space Mono** para las cifras.
- Diseño *mobile-first*: botón flotante "+", hoja de registro tipo *bottom sheet*, tarjetas apiladas y toast de confirmación.

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | UI y lógica |
| [Vite](https://vite.dev/) | Bundler y dev server |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Manifest + Service Worker (Workbox) |
| [@fontsource](https://fontsource.org/) | Fuentes Archivo Black y Space Mono |
| `localStorage` | Persistencia de registros (sin backend) |

## 🚀 Puesta en marcha

Requisitos: [Node.js](https://nodejs.org/) o [Bun](https://bun.sh/).

```bash
bun install        # o: npm install
bun run dev        # desarrollo con HMR
bun run build      # build de producción + PWA en dist/
bun run preview    # sirve el build para probar la PWA
bun run lint       # oxlint
```

### Probar la PWA

Para verificar el funcionamiento offline, instalación y manifest:

```bash
bun run build && bun run preview
```

Abre `http://localhost:4173`, usa la app, desconecta la red (DevTools → Network → Offline) y recarga: sigue funcionando. Desde el navegador (Chrome/Edge) puedes **instalarla** con el botón "Instalar" del encabezado o con la opción *Instalar aplicación* del menú.

## 🗂️ Estructura

```
├── index.html                  # Meta, theme-color, apple-touch-icon
├── vite.config.ts              # Config + plugin PWA
├── scripts/
│   └── generate-icons.mjs      # Genera los íconos PNG del manifest
├── public/
│   ├── favicon.svg
│   └── icons/                  # Íconos PWA (192/512/maskable/apple)
└── src/
    ├── App.tsx                 # Layout, estado y flujo principal
    ├── main.tsx                # Registro del service worker y fuentes
    ├── index.css               # Tokens de estilo y reset
    ├── App.css                 # Estilos Neubrutalismo
    ├── types.ts                # Tipo BloodPressureRecord
    ├── hooks/
    │   └── useRecords.ts       # CRUD en localStorage
    ├── utils/
    │   ├── classification.ts   # Clasificación AHA
    │   └── format.ts           # Formato de fechas
    └── components/
        ├── RecordForm.tsx      # Formulario (crear/editar)
        ├── StatsCard.tsx       # Última lectura + promedios
        ├── TrendChart.tsx      # Gráficas SVG de tendencia
        ├── RecordList.tsx      # Historial
        ├── ExportButton.tsx    # Exportar JSON/CSV
        └── ConfirmDialog.tsx   # Confirmación de borrado
```

## 🔒 Privacidad y datos

Los registros se almacenan **solo en el navegador** (`localStorage`, clave `blood-pressure-records-v1`). No se envían a ningún servidor. Ten en cuenta que borrar los datos de navegación del dispositivo elimina el historial; usa la **exportación JSON/CSV** para respaldarlo.

> ⚠️ **Aviso**: esta aplicación es una herramienta de registro personal y **no sustituye el consejo médico**. Si aparece una clasificación `CRISIS` o tienes síntomas, acude a urgencias o consulta a un profesional de la salud.

## 📜 Licencia

Uso libre con fines educativos y personales.