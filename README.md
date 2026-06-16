# Turnos de Intervenciones — App

PWA (Progressive Web App) para gestionar y consultar los turnos de intervenciones desde el celular. Una vez desplegada en GitHub Pages, se instala como una app nativa en cualquier teléfono.

## ✨ Funcionalidades

- 📅 **Tres vistas** estilo Google Calendar: Mes, Semana y Día
- 🧑‍🤝‍🧑 **Equipo a cargo + Equipo de apoyo**: al tocar cualquier día (en cualquier vista) ves quién está a cargo y quién es el apoyo (calculado automáticamente — el del día siguiente; si se repite, salta al próximo día con un equipo distinto)
- 🔍 **Filtros**: arriba del calendario hay 2 desplegables — una para filtrar por persona (ves sólo sus días) y otra para filtrar por equipo (los equipos detectados en el mes en curso). Se combinan.
- ↶ **Deshacer**: cada día guarda hasta los últimos 10 cambios, con botón "Deshacer último cambio" en el panel de edición
- 🖥️ **Responsive**: en celular es compacta; en compu se expande tipo Google Calendar (1400px)
- 🎨 Equipos coloreados según el código histórico del Excel
- ✏️ Edición por día: tap en una fecha → desplegables para cambiar los nombres
- 📱 Instalable como app en Android e iOS (PWA)
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
