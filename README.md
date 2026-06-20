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

### v33
- **🐛 Bug HOY arreglado**: antes el botón HOY tenía la clase `.vt` y disparaba el cambio de vista a `undefined`, dejando la pantalla en blanco. Ahora HOY es un botón independiente con su propio handler.
- **📐 HOY ancho completo abajo del view-toggle**: el layout ahora es Mes / Semana / Día arriba y **📅 HOY** ancho completo abajo cubriendo los 3 tabs. Más fácil de tocar.
- **✎ Botón Editar arriba a la derecha del tile**: la edición sale del panel "Gestionar día" y va arriba a la derecha del bloque de equipos como un botón rápido. Al tocarlo cambia a "✓ Listo".
- **➕ Botón "+" al lado de cada equipo en modo edición**: cuando entrás en modo edición, aparecen botones "+" punteados a la derecha de Equipo de Intervención y Equipo de Apoyo. Permiten agregar otra persona al equipo (modal con todo el roster + otros). Útil para agregar un 3er o 4to miembro al toque.

### v32
- **📐 Layout del header refinado**:
  - **Desktop**: el botón HOY va al final, después de Día → orden **Mes / Semana / Día / 📅 HOY**.
  - **Mobile**: HOY también va integrado al final del view-toggle (📅 con número del día actual). El bloque entero se alinea a la derecha y no ocupa el ancho completo.
- **📏 Contenido no se tapa con los botones de abajo**: aumenté el padding bottom de la app y le puse fondo sólido + sombrita a la barra de los 4 botones (Generar/Marcar/Personalizar/Datos). El contenido del calendario queda visible arriba de la barra sin tapársele.

### v31
- **📅 Botón HOY visible en el header**: nuevo botón **"📅 HOY"** arriba a la derecha del título (en mobile solo el ícono con el número del día actual). Al tocarlo te lleva al día de hoy en cualquier vista, abre el panel del día y hace scroll al detalle. Toast informativo ("📅 Hoy: Sábado 20" o "Ya estás en hoy" si no cambiaste de día). Antes había un botón "Hoy" escondido adentro del picker — ahora está siempre a mano.

### v30
- **🛠️ 3er miembro del equipo detectado SIEMPRE (sin depender de la config del generador)**: agregué un fallback en `findTeamMembers` que si la config no aclara el 3ro, lo encuentra por sí solo buscando en los slots cualquier persona del ROSTER sola (que no sea ALVARO ni MARTIN — esos son gestión). Así si alguien edita la config del generador y se "olvida" del 3ro, la vista Día/Mes igual lo muestra como parte del equipo y no como OTROS. Verificado con config corrupta: Martes 30 con Sallas+Ibañez+Martinez muestra los 3 juntos aunque la config solo diga {Sallas, Ibañez}.

### v29
- **🎯 Vista Día simplificada con "Gestionar día" unificado**: la vista Día ahora tiene la misma estructura que el panel del Mes — Equipo de Intervención + Apoyo arriba y **⚙️ Gestionar día** abajo. El panel desplegable es el mismo de ambos lados: cambios de feriado, feria judicial, reemplazos y filas funcionan idénticamente desde cualquier vista. Si tocás "Editar filas" desde la vista Día, te lleva a la vista Mes con el editor abierto.

### v28
- **🖥️ Vista mes en PC**: nombres enteros (no abreviados) en los tiles del calendario. En mobile siguen abreviados para no ocupar tanto.
- **📦 Gestión de materiales en los tiles del calendario**: cuando un slot tiene a ALVARO o MARTIN solos, ahora se ve como "📦 G. MAT. ALVARO" (o MARTIN) en vez de mostrar solo el nombre. Se ve igual en Mes y en Semana.
- **↪ + Agregar reemplazo dentro de Gestionar día**: para no sobrecargar el panel del día, moví el botón "+ Agregar reemplazo" dentro de "Gestionar día" → sección "Reemplazos". En el botón de Gestionar día aparece el badge "↪N" si hay reemplazos.
- **🔃 Gestionar día se cierra al cambiar de día**: si tenés el panel desplegado y tocás otro día del calendario, se cierra automáticamente.
- **📅 Semana muestra equipo de 3**: la vista Semana ya mostraba el 3er miembro como pill aparte (Martinez abajo de Sallas+Ibañez). Verificado.

### v27
- **🎂 Cumpleaños precargados**: la app ya viene con los 19 cumpleaños del equipo cargados de fábrica. Cuando la abrís por primera vez (sin datos guardados), aparecen automáticamente. Si los modificás o sincronizás con Firebase, los cambios persisten. Si los borrás y querés volver a tenerlos, hay un botón nuevo **"🎂 Cargar precargados"** en el modal de Cumpleaños.

### v26
- **⚙️ Panel "Gestionar día"**: en el detalle del día reemplacé los 3 botones grandes ("Marcar feriado", "Marcar feria judicial", "Editar filas") por un único botón **"⚙️ Gestionar día"** que despliega un panel con todas las acciones agrupadas por categoría (Marcadores / Edición avanzada). Cuando el día tiene algún marcador activo, se ve como badge al lado del título.

### v25
- **🩹 Equipos de 3 personas EN TODAS LAS VISTAS, intervención Y apoyo**: hice un helper único `findTeamMembers` que detecta los 3 miembros de cualquier equipo de 3. Ahora se muestra el tercero correctamente tanto en el **Equipo de Intervención** como en el **Equipo de Apoyo** (cuando es de 3), en panel del mes y en vista Día. También los reemplazos saben quién pertenece a cada equipo (los 3, incluido el tercero del apoyo).

### v24
- **🩹 Fix del 3er miembro más robusto**: la detección ahora encuentra al tercero del equipo de 3 sin importar exactamente cómo esté formateado el slot en los datos. Antes había casos en que se escapaba como "OTROS".
- **📦 Sección "Gestión de materiales"**: en la vista Día, los slots con ALVARO o MARTIN se muestran en un bloque dorado distintivo llamado "Gestión de materiales" (en vez de "Otros"). El dropdown está restringido a ALVARO y MARTIN solamente, así no podés asignar a otro por error.

### v23
- **🩹 Vista Día: el 3er miembro del equipo ya no aparece como "Otros"**: en la vista Día, cuando el equipo es de 3 personas (ej: Sallas+Ibañez+Martinez), el tercero (Martinez) se reconoce como parte del Equipo de Intervención y aparece adentro, ancho completo, debajo de los otros 2. Antes salía como "OTROS" abajo, separado, lo que daba confuso.

### v22
- **🩹 Equipos de 3 personas en el panel del día**: cuando el equipo de intervención es de 3 (como Sallas+Ibañez+Martinez), el tercero ahora aparece abajo en una pill ancho completo, no se pierde. Se ve tanto en el panel del Mes como en la vista Día. En modo edición también se puede cambiar como select.

### v21
- **🔄 Buscar actualización de la app**: nuevo botón en Datos y nube. Al tocar limpia el cache del service worker, fuerza al SW a aplicar la versión nueva y recarga la página. Ya no hace falta cerrar y reabrir la PWA manualmente cada vez que subo una versión nueva. Los datos locales (turnos, colores, cumpleaños, reemplazos) se mantienen intactos.

### v20
- **🔁 Reemplazos sin redundancia y separados por equipo**: cuando un reemplazo apunta a alguien del Equipo de Intervención aparece como "REEMPLAZOS DEL DÍA" entre Intervención y Apoyo. Cuando apunta a alguien del Apoyo, aparece como "REEMPLAZOS DEL APOYO" debajo del Apoyo. El × para borrar va al lado de cada item. Ya no se duplica abajo del card.

### v19
- **🔁 Leyenda de reemplazo entre Intervención y Apoyo**: en el panel del Mes y en la vista Día, los reemplazos del día se ven como un bloque violeta "REEMPLAZOS DEL DÍA (N)" arriba del Equipo de Apoyo, así está visible siempre la leyenda "X reemplaza a Y" sin tener que mirar abajo.
- **🤝 Equipo de Apoyo también se puede reemplazar**: al elegir "a quién reemplaza" en el form, ahora aparecen tanto los del Equipo de Intervención como los del Equipo de Apoyo.
- **📤 Reemplazos en la imagen exportada**: el mes compartido por WhatsApp ahora trae al final una lista con todos los reemplazos del mes ("Día 5 — Gomez reemplaza a Capdevila").
- **📊 Estadísticas**: nuevo botón en Generación que abre un modal con:
  - "Este mes" → días por equipo y por persona (barras de colores)
  - "Histórico total" → días acumulados por equipo desde que se empezó a generar, ordenados, con indicador de balance.

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
