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

### v52
- **🔴 Banner de actualización movido arriba de toda la app**: el aviso de "nueva versión disponible" ya no vive sólo dentro del menú Datos. Ahora aparece como un banner rojo full-width en el tope absoluto de la pantalla, sticky (se queda visible aunque scrollees), imposible de pasar por alto. Cuando hay update aparece automáticamente, con texto "● Hay una versión nueva disponible. Tocá para actualizar." y un botón blanco grande "↻ Actualizar ahora". El badge verde/rojo en el menú Datos sigue funcionando como antes (confirmación adicional del estado).
- **Verificación de feria con OTROS en dropdowns**: en v51 los dropdowns en feria ya muestran "Equipos: 15 + Otros: 4" — si no se veían era porque el dispositivo tenía cacheada una versión anterior. Una vez actualizado a v52 (con el banner imposible de ignorar), el problema queda resuelto definitivamente.

### v51
- **🟢🔴 Indicador de versión con detección automática de actualizaciones**: nuevo badge en el menú **Datos** que muestra el estado de la app:
  - **🟢 Verde** "● Versión 51 · actualizada" cuando estás en la última versión disponible.
  - **🔴 Rojo** "● Versión 51 · hay una nueva" + botón grande rojo "🔴 Hay una versión nueva — Tocar para actualizar" cuando el Service Worker detecta una versión nueva descargada.
- **Cómo funciona**: el SW chequea actualizaciones cada 5 minutos mientras la app está abierta. Cuando hay una versión nueva en el servidor, el SW la descarga en background pero NO la activa automáticamente — espera a que el usuario aprete el botón. Esto evita pisar el trabajo en curso. Al tocar el botón, el SW recibe `SKIP_WAITING` y toma el control; el listener `controllerchange` recarga la página automáticamente con la versión nueva ya activa.
- **Detección al abrir la app**: si al abrir hay un SW esperando (caso típico: actualización detectada en otra pestaña/sesión), el badge ya aparece en rojo de entrada.
- **Animación sutil**: el punto rojo del badge parpadea suavemente para que se note sin ser molesto.

### v50
- **🏛️ En feria: OTROS disponibles en los dropdowns de Intervención y Apoyo**: en días marcados feria judicial, los dropdowns de equipos ahora muestran tanto los miembros del ROSTER (Frias, Echague, Hidalgo, etc.) como los OTROS (Juan Diaz Loza, Juan Pablo Godoy, MARTIN, ALVARO), separados en grupos visuales ("Equipos" y "Otros"). Esto resuelve el caso típico donde 3 de los 4 OTROS trabajan el mismo día en feria. Fuera de feria, los dropdowns mantienen sólo el ROSTER (los OTROS se asignan automáticamente como G.MAT en sáb/dom).
- **🔥 BUG CRÍTICO de sincronización ARREGLADO — versión vieja pisando la nube**: un dispositivo nuevo que se conectaba a Firebase por primera vez podía pisar la nube con su estado local vacío (o con defaults pre-cargados de la versión cacheada) antes de que llegara el snapshot remoto. Causa raíz: durante la inicialización del app, varias funciones llaman `scheduleCloudPush()` (cargar DEFAULT_BIRTHDAYS, etc.), dejando un timer pendiente. Cuando finalmente Firebase autenticaba, ese push pendiente disparaba y sobrescribía la nube ANTES de que llegara el listener con los datos buenos. **Fix de raíz**: nueva flag `_initialSyncDone` que bloquea TODO push hasta que `initFirebaseSync` haya completado un pull bloqueante (`once('value')`) y aplicado los datos remotos. Recién después se habilita el push y se setea el listener para cambios incrementales. La flag se resetea al desconectar para forzar otro pull al volver a conectar.
- **🔀 Probar otra distribución (regenerar)**: nueva opción en el menú Generar al lado de "Generar mes". Cuando regenerás el mes con esta opción, el algoritmo aplica un `shuffleOffset` al índice inicial del rotador de findes, produciendo una distribución DIFERENTE manteniendo TODAS las reglas (gap 6 findes, descansos, cumpleaños, ausencias, etc.). Cada llamada sucesiva incrementa el offset (1, 2, 3, ..., vuelve a 1 después de 7), así podés probar varias variantes hasta que te guste. Verificado: 1ra generación → Sallas/Cabeza/Milisenda/Campi/Capdevila; 2da con shuffle → Campi/Sallas/Cabeza/Milisenda/Capdevila. **Distinto pero válido**.

### v49
- **🎨 Exportación PDF/imagen profesional, sin torta de cumpleaños**: la imagen del mes ahora se renderiza desde cero (no clona la vista). Layout corporativo: header con franja azul, título "Turnos de Intervenciones" + mes en grande a la izquierda, fecha de emisión a la derecha; grilla limpia Lun-Dom con headers grises (Sáb/Dom en rojo); cada día con pills coloreadas de los equipos + 📦 G.MAT; tags **FERIA** / **FERIADO** cuando aplica; bloques inferiores con **Reemplazos del mes**, **Ausencias del mes** y leyenda de **Equipos** con todos los miembros; footer con marca y versión. NO incluye iconos de cumpleaños (🎂) — la imagen es para uso institucional.
- **🗑️ Botón "Borrar este día"**: nuevo botón rojo al final de la sección "Gestionar equipos" del card del día. Al apretarlo confirma con detalle qué se va a borrar (equipos, reemplazos, marcadores de feriado/feria, G.MAT, extras) y limpia todo lo del día específico. Equivale a la opción "Borrar mes" pero acotada a un solo día.

### v48
- **🧹 Extras removido de "Gestionar equipos"**: la sección ✨ Extras se sacó del modo Gestionar equipos. Los días feria con 4+ personas igual funcionan: usás "+" del Intervención (slot 0) y "+" del Apoyo (slot 1) para cargarlos. Si necesitás una 5ta persona, otro "+" del Apoyo la pone en un slot adicional. Estructura final del modo Gestionar equipos: Equipos + Reemplazos + G.MAT (Sáb/Dom) + Replicar (Feria).
- **👤 Ausencias planificadas**: nueva opción en el menú Generar. Permite cargar ausencias por rango de fechas para cualquier persona (roster + otros). Cada ausencia bloquea al equipo de esa persona para que el generador no le asigne turnos en esos días. Funciona igual que el bloqueo por cumpleaños (hard exclude). Modal con lista de ausencias activas (con × para borrar) y formulario para agregar (persona + Desde + Hasta). Las ausencias se persisten cross-month y se sincronizan a la nube. Verificado: Frias ausente del 10-15 ago → el generador asignó Hidalgo, Sallas, Campi, Milisenda en esos días, sin Frias.

### v47
- **🧹 "Gestionar día" eliminado**: el panel colapsable "⚙️ Gestionar día" se removió por completo. Todas sus opciones quedaron integradas arriba a simple vista:
  - **Feriado** → botón rápido ☆ en la barra superior
  - **Feria judicial** → botón rápido ⚖ en la barra superior
  - **Reemplazos** → dentro de "Gestionar equipos"
  - **Extras** → dentro de "Gestionar equipos"
  - **Replicar día (feria)** → dentro de "Gestionar equipos" (solo cuando el día está marcado como feria)
- **Estructura final del card del día**:
  - Barra: `[☆] [⚖]` ··· `[✎ Gestionar equipos]`
  - Equipo de Intervención (con `+` en edit)
  - Equipo de Apoyo (con `+` en edit)
  - Al activar Gestionar equipos: **Reemplazos** → **Extras** → **G.MAT** (Sáb/Dom) → **Replicar** (Feria)

### v46
- **🔧 "Editar" renombrado a "Gestionar equipos"**: el botón en la barra superior del card del día ahora dice **"✎ Gestionar equipos"** (en lugar de "Editar"). Hace lo mismo: activa los dropdowns para cambiar gente y los botones "+" para agregar.
- **↪ Reemplazos movido al modo "Gestionar equipos"**: cuando activás el botón, además de los dropdowns aparece la sección **Reemplazos** justo debajo de los equipos, con su botón "+ Agregar reemplazo". Antes estaba dentro de "Gestionar día"; ahora queda más cerca de los equipos.
- **📦 Gestión de Materiales editable inline (sólo sábado/domingo no-feria)**: cuando estás en sábado o domingo (y no es feria judicial), al activar "Gestionar equipos" aparece también la sección **📦 GESTIÓN DE MATERIALES** con un dropdown para elegir entre ALVARO, MARTIN o "— sin asignar —". Permite cambiar manualmente quién hace G.MAT ese día sin tocar el resto del equipo. Hint visible: "Alterna Alvaro/Martín cada finde (asignado automáticamente al generar)". En días de semana o feria, la sección no aparece (no aplica).
- **Estructura final del card del día**:
  - Barra superior: `[★] [⚖]` ··· `✎ Gestionar equipos`
  - Equipo de Intervención
  - Equipo de Apoyo
  - (Si Gestionar equipos activo) Reemplazos + G.MAT (Sáb/Dom)
  - Gestionar día → Extras + Marcadores

### v45
- **⭐ Botones rápidos Feriado / Feria judicial arriba del card**: ahora al tocar un día, arriba a la izquierda aparecen 2 botones cuadrados al lado del "✎ Editar": **☆** para feriado y **⚖** para feria judicial. Tocás una vez y queda marcado (el botón se pone en color: feriado amarillo, feria rojo). Volvés a tocar y lo quitás. Un paso menos: ya no hace falta abrir Gestionar día → Marcadores. Las opciones siguen estando en Gestionar día también, no se rompió nada.
- **📆 Estadísticas con rango personalizado (Desde / Hasta)**: nueva pestaña "📆 Rango" en el modal de Estadísticas, entre "Este mes" e "Histórico total". Cuando la elegís, aparecen 4 selectores arriba (mes y año Desde, mes y año Hasta). Cambia automáticamente al ajustar los selectores. Calcula días por equipo y por persona en TODO el rango seleccionado, sumando los meses persistidos. Default: Enero-mes actual del año en curso. Ejemplo: Agosto-Octubre 2026 muestra "Sallas+Ibañez 15 días, Capdevila+Gomez 14, ...". Si elegís Desde > Hasta, las invierte automáticamente.

### v44
- **🐛 BUG CRÍTICO ARREGLADO — feria judicial bloqueaba el día**: cuando marcabas un día sin datos como feria judicial (típico en enero o julio), un error JS rompía toda la renderización del panel. Síntomas: el botón seguía diciendo "Marcar como feria judicial" en lugar de cambiar a "Quitar", no aparecía "Replicar este día", no se podían cargar personas — el día quedaba "bloqueado" hasta hacer "Borrar mes actual". **Causa raíz**: en `buildDayInfoBlock`, cuando el día no tenía datos, `slots` era `null` en lugar de `[]` (incoherente con el resto del código). Después en la lógica de feria hacía `slots[1]` → crash con `Cannot read properties of null (reading '1')`. **Fix**: `slots` ahora siempre es array (`|| []` en lugar de `|| null`), coherente con el resto del código. Verificado: cero errores JS, panel re-renderiza completo, "Quitar feria judicial" y "Replicar" aparecen, dropdowns vacíos funcionan, se puede cargar gente.

### v43
- **🛠️ Bug enero 2027 — panel del día "en blanco" al editar**: cuando un día no tenía equipo asignado y entrabas en modo Editar, sólo aparecía un placeholder "Sin equipo asignado" sin dropdowns para elegir. Ahora si entrás en modo Editar y no hay equipo, aparecen **2 dropdowns vacíos** en Equipo de Intervención para que elijas directamente sin tener que pasar por el "+".
- **🛌 Descanso post-feria en febrero/agosto**: cuando generás el mes siguiente a un mes de feria (febrero después de enero, agosto después de julio), el algoritmo recolecta todos los equipos que aparecieron en la **última semana del mes de feria** y los pone en el `restExclude` de la PRIMERA semana del mes nuevo. Así, los que vienen trabajando del 16 al 31 de enero no arrancan febrero — el algoritmo prefiere a los que estaban descansando (los que hicieron 1-15 de feria o los que no entraron a feria).
- **📦 Gestión de Materiales auto-asignada alternando Alvaro/Martín cada finde**: el generador ahora asigna automáticamente ALVARO o MARTIN como Gestión de Materiales en cada finde (sábado + domingo), alternando entre ellos. Si el último G.MAT fue ALVARO, este finde es MARTIN, y viceversa. La alternancia es persistente cross-month (se guarda y se recupera con `rebuildHistoryFromMonths`). NO se asigna en findes de feria. Verificado en Agosto 2026: MARTIN → ALVARO → MARTIN → ALVARO → MARTIN, alterna perfecto.

### v42
- **✨ Sección "Extras" en Gestionar día**: nueva sección debajo de "Reemplazos" para asignar personas de OTROS (Juan Díaz Loza, Juan Pablo Godoy, Alvaro, Martín) como extras del día. Útil principalmente para feria judicial donde tres o cuatro de esos pueden trabajar el mismo día. Cada extra se ve como pill de color con × para quitarlo. Botón "+ Agregar extra" abre un picker con los OTROS.
- **🏛️ En feria los extras NO se muestran como "Gestión de materiales"**: en días marcados feria judicial, los tiles del calendario (Mes y Semana) muestran a ALVARO y MARTIN como pills normales con su nombre, no como "📦 G. MAT.". La etiqueta de gestión de materiales queda reservada para sábados y domingos fuera de feria.
- Estructura final del panel Gestionar día: **Reemplazos → Extras → Marcadores** (feriado / feria judicial / replicar día).

### v41
- **🐛 Apoyo en feria escribía sobre intervención**: bug crítico. En días feria, al cambiar una persona del Equipo de Apoyo, el cambio iba al slot[0] (intervención) y reemplazaba a alguien del equipo de intervención. Causa: el cálculo de `apSlotIdx` usaba `findTeamSlot` que devuelve el primer slot con equipo (= slot 0). Ahora cuando es feria, se fuerza `apSlotIdx = 1` (slot del apoyo). Verificado: en día feria con sólo intervención cargada, al elegir Capdevila en el primer dropdown del Apoyo, se crea correctamente `[["Frias","Echague"],["Capdevila",null]]` con la intervención intacta.
- **Sobre los dropdowns grises**: cuando el día feria todavía no tiene apoyo cargado, los dropdowns del Apoyo aparecen vacíos con "—" (grises) — es el estado vacío esperando que elijas. No es bug, es la indicación visual de que falta seleccionar.

### v40
- **🏛️ Feria judicial: 4 personas en el mismo día como 2 equipos**: cuando un día está marcado como feria judicial, el panel muestra las **primeras 2 personas como Equipo de Intervención** (slot 0 del mismo día) y las **otras 2 como Equipo de Apoyo** (slot 1 del MISMO día, no del día siguiente). Antes el apoyo se buscaba siempre en el día siguiente. También se oculta la nota "Entra el ..." porque no aplica en feria. El "+" en cada equipo agrega al slot correspondiente (intervención → slot 0; apoyo → slot 1) manteniendo el 2x2 prolijo.

### v39
- **🪟 2x2 para 4 personas en feria**: cuando agregás personas con el "+", el sistema ahora **rellena los huecos** existentes en las filas antes de crear filas nuevas. Así, en días de feria judicial con 4 personas, queda 2 arriba y 2 abajo (en lugar de 2 arriba + 1 + 1 sueltas). Aplica también a días normales.
- **♻️ Regeneración no se contamina con la generación anterior**: bug encontrado. Cuando regenerabas un mes una segunda vez, el algoritmo seguía viendo los findes y el uso de la 1ra generación → la rotación quedaba desbalanceada. Ahora el historial (recentWeekends, weekendIdx, teamHistory) se RECONSTRUYE desde cero cada vez, escaneando todos los meses persistidos pero EXCLUYENDO el mes que se está regenerando. Resultado: la regeneración es determinística y respeta exactamente las mismas reglas siempre. También se excluyen enero/julio (feria) del rebuild para que no contaminen la rotación normal. Verificado: regenerar Ago 2026 dos veces da resultado idéntico.

### v38
- **📋 Replicar día en un rango (feria judicial)**: cuando un día está marcado como feria judicial, en "Gestionar día" aparece la opción **"📋 Replicar este día en un rango"**. Abre un modal con dos campos (desde / hasta) y copia las personas asignadas a todos los días del rango, marcando también feria judicial en cada uno. Por defecto sugiere desde el día siguiente hasta el 15 o el fin de mes (según convenga). Pensado para feria de enero/julio donde típicamente las mismas personas hacen del 1 al 15 y otras del 16 al 31 — cargás el día 1, replicás hasta el 15, y después modificás puntualmente lo que necesites.

### v37
- **🛌 Descanso post-finde (Sáb-Dom → no Lun-Mar inmediato)**: bug en la lógica de generación detectado. Cuando un mes arrancaba en Sáb-Dom (como agosto 2026), el equipo asignado al finde inicial podía aparecer también en Lun-Mar de la semana siguiente — porque el `used` se resetea por semana y no había tracking cruzado. Ahora se mantiene un `prevWeekendTeamIdx` que se agrega al `restExclude` de la siguiente semana, así el equipo del finde descansa al menos hasta Mié-Jue. Verificado con 5 regeneraciones consecutivas (Ago-Nov 2026): ningún equipo de finde aparece en el Lun-Mar siguiente.

### v36
- **🔄 Sync Firebase bidireccional real-time (incluye borrados)**: el listener de Firebase ya existía pero tenía un bug — cuando borrabas un mes en PC, mobile recibía el snapshot pero solo APLICABA las claves recibidas (no detectaba las que faltaban). Ahora `applyRemoteData` también elimina del localStorage local cualquier clave `turnos:*` que ya no esté en el snapshot remoto. Así, borrar un mes en PC se refleja al instante en mobile y viceversa. Toast informativo cuando se aplican borrados ("🔄 N cambios sincronizados (incluye borrados)").
- **🗑️ Borrar mes con limpieza completa**: ahora también elimina marcadores de feriado/feria judicial, reemplazos y overrides de colores del mes. Push inmediato a la nube.
- **⚖️ Enero y julio (feria judicial) excluidos del generador**: si intentás generar enero o julio, aparece un cartel explicando que son meses de feria judicial y los equipos rotan distinto. No se genera nada automático. Los meses siguientes (febrero y agosto) saltan el check de continuidad para que puedas generar normalmente.
- **🔁 Rotación de slot semanal por equipo**: agregado tracking del último slot semanal que hizo cada equipo (Lun-Mar / Mié-Jue / Vie). Al volver a tocar, el algoritmo PREFIERE darle un slot distinto al que tuvo antes. Ej: si Frias hizo Mié-Jue, la próxima vez le toca Lun-Mar o Vie. Es preferencia soft (no hard) — si no hay alternativa, igual se respeta la rotación principal. Verificado con generación de Ago-Oct 2026: ningún equipo repite el mismo slot semanal dos veces consecutivas.

### v35
- **🔄 Rotación de findes mejorada (no repetir antes de 6 sábados)**: antes la lógica solo bloqueaba al equipo del finde **anterior** y se reseteaba mes a mes — eso provocaba que, por ejemplo, Capdevila+Gomez hiciera el 15/Ago y volviera el 12/Sep (solo 3 findes después). Ahora hay un historial cross-month de los últimos findes y al menos deben pasar **6 sábados** antes que un equipo vuelva a hacer finde. Con 7 equipos, eso significa rotación pareja perfecta. Verificado con generación de 5 meses seguidos (Ago–Dic 2026): todos los equipos respetan el gap, salvo un caso forzado por cumpleaños (4-oct = Gómez) que entra al fallback. Si tenés meses ya generados antes de v35 conviene regenerarlos para que arranque la nueva rotación.

### v34
- **🧹 Modo edición simplificado**: cuando entrás en modo Editar ya no aparece la sección "FILAS DEL DÍA" abajo (era redundante con el "+" al lado de cada equipo). Solo queda lo necesario: los selects de cada equipo, el "+" para sumar persona, y un botón "Deshacer" si hubo cambios.
- **❌ Botón × para quitar persona extra**: cuando agregás un 3ro al equipo (o ya viene uno predefinido como Martinez), en modo Editar aparece una × roja al lado de la pill para quitarlo directamente. Funciona igual en intervención y en apoyo.
- **🎲 "Borrar mes" movido a Generar**: la opción "🗑️ Borrar mes actual" ya no está en Datos. Ahora vive en **🎲 Generar** junto a "🎲 Generar mes", que es donde tiene más sentido.
- **⌃ Flechita para cerrar el panel del día**: arriba a la derecha del título del día ("Viernes 5") hay un botón ⌃ que cierra el panel completo. Más rápido que tocar el día de nuevo en el calendario.

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
