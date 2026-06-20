# Turnos de Intervenciones — App

PWA (Progressive Web App) para gestionar y consultar los turnos de intervenciones desde el celular. Una vez desplegada en GitHub Pages, se instala como una app nativa en cualquier teléfono.

## ✨ Funcionalidades

- 📅 **Tres vistas** estilo Google Calendar: Mes, Semana y Día
- 🧑‍🤝‍🧑 **Equipo de intervención + Equipo de apoyo**: al tocar cualquier día (en cualquier vista) ves quién está a cargo y quién es el apoyo (calculado automáticamente — el del día siguiente; si se repite, salta al próximo día con un equipo distinto)
- 🔄 **Reemplazos rápidos**: las píldoras del equipo de intervención son tap-able. Tocás un nombre y elegís el reemplazo de los 15 del roster — para cuando alguien no puede ese día.
- 🎲 **Generador de mes inteligente**:
  - Pantalla previa para definir los **equipos** (parejas) y el **máximo de días por mes** de cada uno
  - Lógica: L+Ma, Mi+J, V, S+D. El fin de semana **rota globalmente** entre los equipos (cada finde le toca a un equipo distinto en secuencia)
  - Los días de semana se balancean automáticamente al equipo menos usado del mes
  - Respeta los topes (máx/mes) y los feriados ya marcados
- 🟡 **Feriados**: botón "Marcar como feriado" en el panel del día. El día se pinta de amarillo con marca "F"
- 🔍 **Filtros**: por persona y por equipo del mes (combinables)
- ↶ **Deshacer**: hasta los últimos 10 cambios por día
- 🖥️ **Responsive**: en celular es compacta; en compu se expande tipo Google Calendar (1400px)
- 🎨 Equipos coloreados según el código histórico del Excel
- 📱 Instalable como app en Android e iOS (PWA)
- ☁️ **Sincronización opcional en la nube** (Firebase): los datos viajan entre PC y celular automáticamente
- 💾 Todos los datos quedan guardados en el teléfono (localStorage)
- 🔄 Exportar/importar backups en JSON
- 📶 Funciona sin internet una vez instalada
- 🗂️ Trae cargados ~35 meses históricos del Excel original
- 👆 Navegación rápida: flechas, swipe horizontal, o tap en el título para elegir mes/año
- 🔢 Número de versión visible en el menú

## 📦 Estructura del proyecto

```
turnos-app/
├── index.html              # Punto de entrada
├── styles.css              # Estilos
├── data.js                 # Roster, colores, datos iniciales
├── app.js                  # Lógica principal
├── manifest.json           # Manifest PWA (instalación)
├── service-worker.js       # Cache offline
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
├── .nojekyll               # Para que GitHub Pages no procese como Jekyll
└── README.md
```

## 🚀 Cómo subirla a GitHub y desplegarla

### Paso 1 — Crear el repositorio

1. Andá a https://github.com/new
2. Nombre del repo: `turnos-intervenciones` (o el que quieras)
3. Visibilidad: **Public** (es necesario para GitHub Pages gratis)
4. **No** marques "Add a README" — lo vamos a subir nosotros
5. Hacé click en **Create repository**

### Paso 2 — Subir los archivos

**Opción A — Por la web (más fácil):**

1. En la página del repo recién creado, hacé click en **uploading an existing file**
2. Arrastrá **todos los archivos y la carpeta `icons/`** de esta app
3. Escribí un mensaje de commit como "Primera versión" y hacé click en **Commit changes**

**Opción B — Por la terminal (si tenés Git):**

```bash
cd turnos-app
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/turnos-intervenciones.git
git push -u origin main
```

### Paso 3 — Activar GitHub Pages

1. En el repo, andá a **Settings** (arriba a la derecha)
2. En el menú izquierdo, hacé click en **Pages**
3. En **Source**, elegí **Deploy from a branch**
4. En **Branch**, seleccioná **main** y **/ (root)**, después hacé click en **Save**
5. Esperá unos 30 segundos. Aparecerá una URL como:
   `https://TU_USUARIO.github.io/turnos-intervenciones/`

### Paso 4 — Instalar la app en el celular

Abrí esa URL en el navegador del teléfono y:

**En Android (Chrome):**
- Aparecerá un banner "Agregar a pantalla de inicio". Hacé click.
- O: menú ⋮ → "Instalar app" / "Agregar a pantalla de inicio"

**En iPhone (Safari):**
- Tocá el botón **Compartir** (cuadrado con flecha hacia arriba)
- Tocá **"Agregar a pantalla de inicio"**

Listo, la app queda como un ícono nativo y se abre en pantalla completa.

## 🔧 Personalización

### Cambiar los colores de los equipos

Abrí `data.js` y editá el objeto `COLORS`:

```javascript
const COLORS = {
  'Hidalgo': '#FFC000',   // amarillo
  'Frias': '#8EAADB',     // azul claro
  // ... etc
};
```

### Agregar o sacar gente del roster

En `data.js`:

```javascript
const ROSTER = [
  'Cabeza', 'Campi', /* ... */
  'NuevaPersona'  // ← agregar acá
];
```

Y asignarle un color en `COLORS`.

### Subir cambios y refrescar la app

Después de cambiar los archivos, subilos al repo y la app se actualiza sola la próxima vez que se abre con internet (el service worker la refresca). Si querés forzar la actualización, abrí la app, ve al menú → "Borrar mes actual" y volvé a abrir.

## 💾 Backup y restauración

- **Para hacer backup**: botón **Más** abajo → **Exportar datos (JSON)**. Te descarga un archivo `turnos-backup-AAAA-MM-DD.json`.
- **Para restaurar**: **Más** → **Importar datos (JSON)** → seleccioná el archivo.

Recomendación: hacer backup periódicamente y guardarlo en Drive o email.

## ❓ Preguntas frecuentes

**¿Necesito un dominio propio?**
No. GitHub Pages te da una URL gratis: `https://TU_USUARIO.github.io/turnos-intervenciones/`

**¿Los datos están en la nube?**
No, viven en el teléfono (localStorage). Para sincronizar entre dispositivos, usá exportar/importar.

**¿Funciona sin internet?**
Sí, una vez que la cargaste la primera vez. El service worker la cachea.

**¿Cuánto cuesta?**
Cero. GitHub Pages es gratis para repos públicos.

**¿Y si quiero que solo yo la vea?**
Para repos privados, GitHub Pages cuesta plata. Alternativa gratis: Cloudflare Pages o Netlify (ambos permiten hostear desde un repo privado gratis).

## 📄 Licencia

Uso personal. Modificar a gusto.

## 📜 Changelog

### v18
- **🎨 Colores específicos por mes** (override): en el modal de Colores ahora hay un toggle "🌐 Todos los meses / 📅 Solo [Mes Año]". Si cambiás un color en modo "Solo este mes", queda aplicado únicamente para ese mes — el resto sigue con el color general. Útil cuando cambia la composición de un equipo de un mes a otro. Los personajes con override muestran un 📅 al lado y la fila queda con fondo lila claro.
- Botón "🗑️ Borrar todos los colores especiales de [Mes Año]" en el modal para limpiar overrides de golpe.

### v17
- **🔁 Reemplazos visibles siempre** (no solo en modo edición). Bloque violeta con la lista de reemplazos + botón "+ Agregar reemplazo" arriba del "Editar filas del día". Se ve igual en el panel del Mes y en la vista Día.
- **🔥 Firebase precargado**: los 4 campos (API Key, Auth Domain, Database URL, Project ID) vienen llenos por defecto. En una PC nueva solo tenés que poner email + password y conectar.

### v16
- **🎲 ⚖️ 🎨 ☁️ 4 botones de categoría en lugar del "…Más"**: ahora abajo a la pantalla hay 4 botones chicos (Generar, Marcar, Personalizar, Datos). Cada uno abre solo su mini-lista corta — no más lista enorme.

### v15
- **🎂 Cumpleaños**: nuevo modal en el menú para definir la fecha de cumpleaños de cada persona. El día que alguien cumple años, su equipo NO recibe turno del generador (se busca otro). Visual: ícono 🎂 en la esquina del día en el calendario.
- **🔁 Reemplazos**: en el modo edición del día hay un botón "+ Reemplazo" violeta. Te pide a quién reemplaza (alguien del día) y quién lo reemplaza (cualquier persona del roster). El reemplazo aparece debajo de las filas del día en color violeta distintivo ("ALVARO ↪ reemplaza a Cabeza"). En el calendario, los días con reemplazos muestran un ↪ violeta en la esquina.
- **🗂️ Menú organizado por categorías**: ahora "…Más" tiene 4 secciones (Generación, Marcadores, Personalización, Datos y nube). Antes era una lista plana.
- **☁️ Sincronización mejorada**: nuevos botones "⬇️ Forzar descarga de la nube" y "⬆️ Forzar subida a la nube" en el modal de sync. Solución para el caso "dice sincronizado pero no aparece nada" (forzás la descarga manualmente).
- **🔑 Contraseña del generador quitada**: ya no pide contraseña para generar el mes. Si querés volver a tener una traba, decímelo y la pongo de otra forma.

### v14
- **⚖️ Feria judicial** (color rojo, distinto al amarillo del feriado):
  - Botón "Marcar como feria judicial" en el panel de cada día (igual que feriado)
  - Botón "Marcar mes completo como feria judicial" en el menú (para enero)
  - Botón "Marcar rango de días como feria judicial" en el menú (para julio 13-26)
  - El generador la respeta igual que los feriados (no asigna equipos esos días)
  - Visual distinto: rojo en el calendario, badge "FJ" en la esquina, badge rojo en el panel
- **📤 Compartir mes (imagen)**:
  - Nuevo botón en el menú que exporta el calendario del mes actual como imagen PNG
  - En mobile: abre el menú de compartir nativo (incluye WhatsApp) gracias al Web Share API
  - En PC: descarga la imagen para que la compartas manualmente
  - Incluye título "Turnos de Intervenciones — [Mes] [Año]" y footer con fecha de generación

### v13
- **🔄 Rotación automática de cupos altos entre meses** (toggle en el modal del generador). Cuando está activa:
  - Mantiene el template de cupos que vos definiste (ej: 3 equipos con 5 y 4 con 4)
  - Cada mes, los equipos con **menos días totales en el historial** reciben los cupos más altos
  - Los equipos van rotando solos entre cupos altos y bajos → balance casi perfecto en el largo plazo
  - El contador del modal muestra qué equipos van a tener cupo alto este mes (preview)
- Test verificado: en 3 meses, todos los equipos quedan entre 12 y 13 días (diferencia máx-mín = 1).

### v12
- **Continuidad entre meses**: si el mes anterior termina en medio de un slot (Lun, Mié o Sáb), el día 1 del mes nuevo arranca con el mismo equipo para completar ese slot. La rotación de fines de semana y el descanso post-viernes también heredan del mes anterior.
- **No se puede generar un mes si el anterior no tiene datos**: alert claro que dice qué mes hay que generar primero (ej: "Primero generá Octubre 2026").
- **🔑 Contraseña para generar turnos**: primera vez se define (con confirmación), después se pide cada vez que se genera. Botón en el menú para borrarla/cambiarla.
- **Equipo de apoyo editable**: en el modo edición del panel del día, los pills del equipo de apoyo también son selects (igual que los de intervención).

### v11
- **Diagnóstico de sincronización mejorado**: cuadro de status arriba del modal de Sync con feedback en vivo. Botón "🔍 Probar si Firebase cargó". Mensajes de error con sugerencia de solución.
- **Service Worker network-first** para HTML/JS/CSS: las nuevas versiones llegan rápido. Firebase nunca se cachea.

### v10
- **☁️ Sincronización en la nube** (Firebase): los datos se sincronizan automáticamente entre PC y celular. Setup de una sola vez con Firebase (gratis):
  1. Crear proyecto en console.firebase.google.com
  2. Habilitar Realtime Database + Authentication (Email/Password)
  3. Copiar config en el modal "☁️ Sincronización en la nube" del menú
  4. Listo — todos los cambios se sincronizan en segundos
- Indicador de estado en el menú: ⚪ Sin conectar / 🟡 Conectando / 🟢 Sincronizado / 🔵 Sincronizando / 🔴 Error

### v9
- **Generador con reglas HARD** (no son sugerencias, son constraints estrictos):
  - Mismo equipo NO puede hacer el mismo slot 2 semanas seguidas (fin del bug de "3 viernes con Campi+Montilla")
  - Si un equipo hace **viernes**, la semana siguiente solo puede hacer **fin de semana** (no Lun-Mar/Mié-Jue/Vie). Así descansan entre activo y apoyo.
- **Smart 2-day splitting**: si un slot de 2 días no tiene equipo con cupo, se parte en 2 equipos distintos (1 día cada uno). Antes los días quedaban vacíos.
- **Contador de cupos** en el modal del generador: suma de máx/mes vs días del mes. Se actualiza en vivo:
  - 🟢 Verde cuando = días del mes
  - 🟡 Amarillo cuando sobran
  - 🔴 Rojo cuando faltan

### v8
- **Generador mucho más equitativo**:
  - Ya no repite el mismo equipo en el mismo slot 2 semanas seguidas (fin de bug de "3 viernes seguidos con Campi+Montilla")
  - Balance **cross-month**: los equipos que hicieron más días el mes pasado tienen menos prioridad este mes. Se va auto-balanceando con el tiempo.
  - Los feriados nacionales se respetan automáticamente
- **🇦🇷 Precarga de feriados nacionales de Argentina**: nuevo botón en el menú. Carga TODOS los feriados del año actual (Año Nuevo, Carnaval, Memoria, Malvinas, Viernes Santo, Trabajador, Revolución de Mayo, Güemes, Belgrano, Independencia, San Martín, Diversidad, Soberanía, Inmaculada, Navidad). El cálculo de Pascua/Carnaval/Viernes Santo es dinámico por año.
- **Tiles del mes NO editables**: en mobile eran muy chicos y se cambiaba alguien sin querer al elegir el día. Ahora el calendario es solo lectura; para editar se toca el día → panel desplegable → ahí sí los pills son editables (igual que en vista Semana y Día).

### v7
- **Colores configurables por persona** (menú "🎨 Colores de personas"): tocás el cuadradito de color y elegís el que quieras. Útil cuando alguien cambia de equipo de intervención.
- **Equipos de 3 personas** soportados en el generador (ej. Sallas + Ibañez + Martinez). Botón "+" en la config para agregar 3ra persona a cualquier equipo.
- **Colores default actualizados** a la distribución real de equipos:
  - Equipo durazno: Sallas + Ibañez + Martinez
  - Equipo amarillo: Hidalgo + Laporta
  - Equipo verde: Cabeza + Celina
  - Equipo azul: Frias + Echague
  - Equipo violeta: Capdevila + Gomez
  - Equipo gris: Campi + Montilla
  - Equipo naranja oscuro: Milisenda + Diaz
- **Fix del "—" sobrante**: cuando una fila tiene un solo nombre, el select vacío del costado ya no aparece. El nombre ocupa todo el ancho y aparece un "+" para agregar compañero si querés.

### v6
- **Generador con cap ESTRICTO**: si ponés "máx/mes: 4", se respeta a rajatabla. Los días que sobran quedan vacíos y aparece un toast indicando cuántos no se asignaron (para que subas el cupo)
- **TODOS los tiles editables**: en cualquier vista (mes / semana / día) tocás un pill y se abre el dropdown con los 15 del roster + "Otros". Reemplazos rápidos sin abrir el panel.
- **Pills de "Otros" ancho completo**: cuando una fila de Otros tiene un solo nombre (oficios MARTIN / ALVARO / abogados), el pill ocupa todo el ancho del tile en lugar de dejar un hueco al lado.

### v5
- "Equipo a cargo" → renombrado a "Equipo de intervención" en todas las vistas
- **Tiles editables**: las píldoras del equipo de intervención son tap-ables → dropdown con los 15 del roster para hacer reemplazos rápidos sin abrir el editor
- **Generador mejorado**:
  - Pantalla previa para definir parejas de equipos + máximo de días por mes de cada uno
  - Lógica de rotación de fin de semana (cada finde le toca a un equipo distinto en secuencia, ciclando todos)
  - Días de semana balanceados al equipo menos usado
  - Respeta tope máximo por equipo y feriados
- Equipos por defecto reducidos a 7 (lo típico) y configurables desde la app

### v4
- **Generador automático de mes**: respeta la lógica L+Ma / Mi+J / V / S+D con equipos al azar sin repetir dentro de la misma semana
- **Feriados**: botón en el panel del día para marcar/quitar feriado. Día pintado de amarillo con marca "F"
- **Panel de día limpio**: sólo muestra info (cargo + apoyo) por defecto. El editor avanzado queda colapsado tras "✎ Editar filas del día"
- **Roster limpio**: removidos ALVARO GRIGNOLA y MARTIN VILLANUEVA (duplicados); FERIADO ya no está en el dropdown porque ahora es un flag separado
- **Migración automática**: entradas viejas de "FERIADO" en los datos se convierten al nuevo sistema de flag

### v3
- Tres vistas (Mes / Semana / Día) estilo Google Calendar
- "Equipo a cargo + Equipo de apoyo" en panel de edición (no solo en vista Día)
- Filtros: por persona y por equipo del mes (se combinan)
- Deshacer cambios por día (hasta 10 niveles de undo)
- Roster reorganizado: "Abogados" se mueve a "Otros" (gente que no hace turnos regulares)
- Número de versión visible en el menú
- Desktop responsive estilo Google Calendar

### v2
- Vistas Semana y Día
- Lógica de Equipo de Apoyo (anclado al día siguiente)
- Layout desktop ampliado

### v1
- Versión inicial PWA con vista mensual, dropdowns y persistencia local
