// ============================================================
// Turnos de Intervenciones — App principal
// ============================================================

const APP_VERSION = '46';

const MES_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const STORAGE_PREFIX = 'turnos:';
const STORAGE_VERSION_KEY = 'turnos:_seed_version';
const HISTORY_PREFIX = 'turnos:hist:';
const FERIADO_PREFIX = 'turnos:feriado:';
const FERIA_JUD_PREFIX = 'turnos:feria_jud:';
const GEN_CONFIG_KEY = 'turnos:gen_config';
const WEEKEND_ROT_KEY = 'turnos:gen_weekend_idx';
// Historial de los últimos N findes (lista de team indices) para que un equipo no
// vuelva a hacer finde hasta que pasen al menos 6 findes desde el último.
const WEEKEND_RECENT_KEY = 'turnos:gen_weekend_recent';
const WEEKEND_RECENT_MIN_GAP = 6;
// Último ALVARO/MARTIN asignado a Gestión de Materiales (alternancia finde a finde).
const GMAT_LAST_KEY = 'turnos:gen_last_gmat';
const TEAM_HISTORY_KEY = 'turnos:gen_team_history';
const PERSON_COLORS_KEY = 'turnos:person_colors';
const PERSON_COLORS_MONTH_PREFIX = 'turnos:person_colors_month:';
const FIREBASE_CONFIG_KEY = 'turnos:firebase_config';
const FIREBASE_LAST_SYNC_KEY = 'turnos:firebase_last_sync';
const GEN_PASSWORD_KEY = 'turnos:gen_password';
const GEN_AUTO_ROTATE_KEY = 'turnos:gen_auto_rotate';
const BIRTHDAYS_KEY = 'turnos:birthdays';
const REPLACEMENTS_PREFIX = 'turnos:replacements:';
const MAX_HISTORY_PER_DAY = 10;

// ---------- Estado ----------
const today = new Date();
const state = {
  view: 'month',
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate(),
  selectedDay: null,
  data: {},
  filterPerson: null,
  filterTeam: null,
  editingDay: false,      // si el editor avanzado está expandido
};

let deferredInstallPrompt = null;

// ---------- Persistencia ----------
function monthKeyOf(y, m) { return `${y}-${String(m).padStart(2, '0')}`; }
function storageKeyOf(y, m) { return STORAGE_PREFIX + monthKeyOf(y, m); }

function loadMonthData(y, m) {
  const key = storageKeyOf(y, m);
  let data;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) data = JSON.parse(stored);
  } catch (e) { console.warn('Read storage error', e); }
  if (!data) {
    const seedKey = monthKeyOf(y, m);
    data = (typeof SEED_DATA !== 'undefined' && SEED_DATA[seedKey])
      ? deepCopy(SEED_DATA[seedKey]) : {};
  }
  // Migrar entradas legacy de FERIADO al flag aparte
  data = migrateLegacyFeriados(y, m, data);
  return data;
}

function saveMonthData(y, m, data) {
  const key = storageKeyOf(y, m);
  try {
    if (Object.keys(data).length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(data));
    scheduleCloudPush();
  } catch (e) {
    showToast('Error al guardar');
    console.error('Save failed', e);
  }
}

function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

// ---------- Historial (deshacer) ----------
function historyKey(y, m, d) {
  return `${HISTORY_PREFIX}${y}-${String(m).padStart(2,'0')}-${d}`;
}
function pushHistory(y, m, d, prevState) {
  const key = historyKey(y, m, d);
  let stack = [];
  try { stack = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
  stack.push(deepCopy(prevState || []));
  while (stack.length > MAX_HISTORY_PER_DAY) stack.shift();
  try { localStorage.setItem(key, JSON.stringify(stack)); }
  catch (e) { console.warn('History save error', e); }
}
function popHistory(y, m, d) {
  const key = historyKey(y, m, d);
  try {
    const stack = JSON.parse(localStorage.getItem(key) || '[]');
    if (stack.length === 0) return null;
    const prev = stack.pop();
    if (stack.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(stack));
    return prev;
  } catch { return null; }
}
function hasHistory(y, m, d) {
  const key = historyKey(y, m, d);
  try {
    const stack = JSON.parse(localStorage.getItem(key) || '[]');
    return stack.length > 0;
  } catch { return false; }
}
function clearAllHistory() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(HISTORY_PREFIX)) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

// Saves a snapshot before edits
function snapshotDayBeforeEdit(day) {
  pushHistory(state.year, state.month, day, state.data[String(day)] || []);
}

// ---------- Feriados ----------
function feriadoKey(y, m) {
  return `${FERIADO_PREFIX}${y}-${String(m).padStart(2,'0')}`;
}
function loadFeriados(y, m) {
  try {
    const raw = localStorage.getItem(feriadoKey(y, m));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveFeriados(y, m, feriados) {
  const key = feriadoKey(y, m);
  try {
    if (Object.keys(feriados).length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(feriados));
    scheduleCloudPush();
  } catch (e) { console.warn('Save feriado error', e); }
}
function isFeriado(y, m, d) {
  if (y === state.year && m === state.month) {
    return !!(state._feriados && state._feriados[String(d)]);
  }
  const f = loadFeriados(y, m);
  return !!f[String(d)];
}
function toggleFeriado(day) {
  if (!state._feriados) state._feriados = {};
  const k = String(day);
  if (state._feriados[k]) {
    delete state._feriados[k];
    showToast('Feriado quitado');
  } else {
    state._feriados[k] = true;
    showToast('Marcado como feriado');
  }
  saveFeriados(state.year, state.month, state._feriados);
}

// ---------- FERIA JUDICIAL (similar a feriado, color rojo) ----------
function feriaJudKey(y, m) {
  return `${FERIA_JUD_PREFIX}${y}-${String(m).padStart(2,'0')}`;
}
function loadFeriaJud(y, m) {
  try {
    const raw = localStorage.getItem(feriaJudKey(y, m));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveFeriaJud(y, m, fj) {
  const key = feriaJudKey(y, m);
  try {
    if (Object.keys(fj).length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(fj));
    scheduleCloudPush();
  } catch (e) { console.warn('Save feria jud error', e); }
}
function isFeriaJud(y, m, d) {
  if (y === state.year && m === state.month) {
    return !!(state._feriaJud && state._feriaJud[String(d)]);
  }
  const f = loadFeriaJud(y, m);
  return !!f[String(d)];
}
function toggleFeriaJud(day) {
  if (!state._feriaJud) state._feriaJud = {};
  const k = String(day);
  if (state._feriaJud[k]) {
    delete state._feriaJud[k];
    showToast('Feria judicial quitada');
  } else {
    state._feriaJud[k] = true;
    showToast('Marcado como feria judicial');
  }
  saveFeriaJud(state.year, state.month, state._feriaJud);
}
// Marca TODOS los días del mes actual como feria judicial (caso enero)
function markWholeMonthAsFeriaJud() {
  const days = new Date(state.year, state.month, 0).getDate();
  if (!confirm(`Marcar TODOS los ${days} días de ${MES_NAMES[state.month-1]} ${state.year} como feria judicial?`)) return;
  if (!state._feriaJud) state._feriaJud = {};
  for (let d = 1; d <= days; d++) {
    state._feriaJud[String(d)] = true;
  }
  saveFeriaJud(state.year, state.month, state._feriaJud);
  rerenderActiveView();
  if (state.selectedDay !== null) renderDetail();
  showToast(`Mes completo marcado como feria judicial`);
}
// Marca un rango de días del mes actual (caso julio 13-26)
function markRangeAsFeriaJud() {
  const startStr = prompt(`Marcar feria judicial: día de inicio (1-${new Date(state.year, state.month, 0).getDate()})`);
  if (!startStr) return;
  const endStr = prompt('Día de fin (inclusive):');
  if (!endStr) return;
  const start = parseInt(startStr);
  const end = parseInt(endStr);
  const maxD = new Date(state.year, state.month, 0).getDate();
  if (isNaN(start) || isNaN(end) || start < 1 || end > maxD || start > end) {
    showToast('Rango inválido');
    return;
  }
  if (!state._feriaJud) state._feriaJud = {};
  for (let d = start; d <= end; d++) {
    state._feriaJud[String(d)] = true;
  }
  saveFeriaJud(state.year, state.month, state._feriaJud);
  rerenderActiveView();
  if (state.selectedDay !== null) renderDetail();
  showToast(`Días ${start} a ${end} marcados como feria judicial`);
}

// Devuelve true si el día NO debe asignarse un equipo (feriado o feria judicial)
function isSkipDay(y, m, d) {
  return isFeriado(y, m, d) || isFeriaJud(y, m, d);
}

// ---------- CUMPLEAÑOS (por persona) ----------
// Storage: { "NombrePersona": "MM-DD", ... }
let _birthdaysCache = null;
function loadBirthdays() {
  if (_birthdaysCache !== null) return _birthdaysCache;
  try {
    const raw = localStorage.getItem(BIRTHDAYS_KEY);
    if (raw === null) {
      // Primera vez: cargamos los defaults y los persistimos (así se sincronizan
      // con Firebase). Si después el user quiere borrarlos, los reseteamos en {}.
      _birthdaysCache = { ...DEFAULT_BIRTHDAYS };
      try {
        localStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(_birthdaysCache));
      } catch {}
    } else {
      _birthdaysCache = JSON.parse(raw || '{}');
    }
  } catch { _birthdaysCache = { ...DEFAULT_BIRTHDAYS }; }
  return _birthdaysCache;
}
function saveBirthdays(b) {
  _birthdaysCache = b;
  try {
    localStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(b));
    scheduleCloudPush();
  } catch (e) { console.warn('Save birthdays error', e); }
}
function setBirthday(person, mmdd) {
  const b = loadBirthdays();
  if (mmdd) b[person] = mmdd;
  else delete b[person];
  saveBirthdays(b);
}
// Devuelve las personas que cumplen el día y, m, d
function birthdaysOn(y, m, d) {
  const b = loadBirthdays();
  const target = `${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const list = [];
  for (const person in b) {
    if (b[person] === target) list.push(person);
  }
  return list;
}
// Devuelve los índices de equipos que TIENEN alguien cumpleaños el día y, m, d
function teamsWithBirthdayOn(teams, y, m, d) {
  const bd = birthdaysOn(y, m, d);
  if (bd.length === 0) return [];
  const idxs = [];
  teams.forEach((t, i) => {
    const members = [t.a, t.b, t.c].filter(Boolean);
    if (members.some(name => bd.includes(name))) idxs.push(i);
  });
  return idxs;
}

// ---------- REEMPLAZOS (por día) ----------
// Storage: turnos:replacements:YYYY-MM => { "5": [{ replacement: "MARTIN", original: "Cabeza" }, ...] }
function replacementsKey(y, m) {
  return `${REPLACEMENTS_PREFIX}${y}-${String(m).padStart(2,'0')}`;
}
function loadReplacements(y, m) {
  try {
    const raw = localStorage.getItem(replacementsKey(y, m));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveReplacements(y, m, data) {
  const key = replacementsKey(y, m);
  try {
    if (Object.keys(data).length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(data));
    scheduleCloudPush();
  } catch (e) { console.warn('Save replacements error', e); }
}
function getReplacementsForDay(y, m, d) {
  if (y === state.year && m === state.month) {
    return (state._replacements && state._replacements[String(d)]) || [];
  }
  const r = loadReplacements(y, m);
  return r[String(d)] || [];
}
function addReplacement(day, replacement, original) {
  if (!state._replacements) state._replacements = {};
  if (!state._replacements[String(day)]) state._replacements[String(day)] = [];
  state._replacements[String(day)].push({ replacement, original });
  saveReplacements(state.year, state.month, state._replacements);
}
function removeReplacement(day, idx) {
  if (!state._replacements || !state._replacements[String(day)]) return;
  state._replacements[String(day)].splice(idx, 1);
  if (state._replacements[String(day)].length === 0) delete state._replacements[String(day)];
  saveReplacements(state.year, state.month, state._replacements);
}

// Bloque visible debajo de la tarjeta del día: SÓLO el botón "+ Agregar reemplazo".
// La lista de reemplazos existentes se muestra DENTRO de buildDayInfoBlock,
// entre Intervención y Apoyo (o debajo del Apoyo, según a quién apunte el reemplazo).
// Construye el botón "⚙️ Gestionar día" + panel desplegable.
// Se usa tanto en el panel del Mes (renderDetail) como en la vista Día (renderDayView)
// para que la experiencia sea idéntica desde ambas vistas.
// Requiere que state.year/state.month/state.data ya estén alineados con el día.
function buildManagePanel(day) {
  const wrap = document.createElement('div');
  wrap.className = 'manage-wrap';

  const isFer = isFeriado(state.year, state.month, day);
  const isFj = isFeriaJud(state.year, state.month, day);
  const reps = getReplacementsForDay(state.year, state.month, day);

  const btn = document.createElement('button');
  btn.className = 'manage-btn' + (state._manageOpen ? ' open' : '');
  let badges = '';
  if (isFer) badges += ' <span class="manage-badge feriado">★</span>';
  if (isFj)  badges += ' <span class="manage-badge feria-jud">🔴</span>';
  if (state.editingDay) badges += ' <span class="manage-badge editing">✎</span>';
  if (reps.length > 0) badges += ` <span class="manage-badge rep">↪${reps.length}</span>`;
  btn.innerHTML = `⚙️ Gestionar día${badges} <span class="manage-arrow">${state._manageOpen ? '▴' : '▾'}</span>`;
  btn.addEventListener('click', () => {
    state._manageOpen = !state._manageOpen;
    // Re-renderizar la vista activa para reflejar el cambio
    if (state.view === 'month') renderDetail();
    else if (state.view === 'day') renderDayView();
    else rerenderActiveView();
  });
  wrap.appendChild(btn);

  if (state._manageOpen) {
    const panel = document.createElement('div');
    panel.className = 'manage-panel';

    // (Reemplazos se mueve a la sección de "Gestionar equipos" del card del día —
    // queda más cerca de los equipos y se ve junto al G.MAT.)

    // Sección "Extras" — personas adicionales (OTROS) que no son intervención ni apoyo.
    // Para feria judicial se usan extras como Juan Diaz Loza / Juan Pablo Godoy / Alvaro / Martín.
    // Fuera de feria, ALVARO y MARTIN sólo se muestran como "gestión de materiales" en sáb/dom.
    const extras = collectExtras(state.year, state.month, day);
    const lblExtras = document.createElement('div');
    lblExtras.className = 'manage-section-label';
    lblExtras.textContent = `✨ Extras${extras.length > 0 ? ` (${extras.length})` : ''}`;
    panel.appendChild(lblExtras);

    if (extras.length > 0) {
      const extrasList = document.createElement('div');
      extrasList.className = 'extras-list';
      extras.forEach(({ name, slotIdx, sideIdx }) => {
        const row = document.createElement('div');
        row.className = 'extra-row';
        const pill = document.createElement('span');
        pill.className = 'extra-pill';
        pill.style.background = colorFor(name);
        pill.style.color = textColorFor(name);
        pill.textContent = name;
        row.appendChild(pill);
        const del = document.createElement('button');
        del.className = 'extra-del';
        del.textContent = '×';
        del.title = `Quitar a ${name}`;
        del.addEventListener('click', () => {
          if (!confirm(`¿Quitar a ${name} de los extras del día ${day}?`)) return;
          snapshotDayBeforeEdit(day);
          if (state.data[String(day)] && state.data[String(day)][slotIdx]) {
            state.data[String(day)][slotIdx][sideIdx] = null;
            // Si quedó vacío, lo saco
            const s = state.data[String(day)][slotIdx];
            if (!s[0] && !s[1]) {
              state.data[String(day)].splice(slotIdx, 1);
              if (state.data[String(day)].length === 0) delete state.data[String(day)];
            }
          }
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView();
          renderDetail();
          showToast(`✓ ${name} quitado`);
        });
        row.appendChild(del);
        extrasList.appendChild(row);
      });
      panel.appendChild(extrasList);
    }

    const addExtraBtn = document.createElement('button');
    addExtraBtn.className = 'manage-item';
    addExtraBtn.innerHTML = '+ Agregar extra';
    addExtraBtn.addEventListener('click', () => openAddExtraForm(day));
    panel.appendChild(addExtraBtn);

    // Sección "Marcadores"
    const lblMark = document.createElement('div');
    lblMark.className = 'manage-section-label';
    lblMark.textContent = '⚖️ Marcadores';
    panel.appendChild(lblMark);

    const feriBtn = document.createElement('button');
    feriBtn.className = 'manage-item' + (isFer ? ' active feriado-active' : '');
    feriBtn.innerHTML = isFer ? '★ Quitar feriado' : '☆ Marcar como feriado';
    feriBtn.addEventListener('click', () => {
      toggleFeriado(day);
      rerenderActiveView();
      if (state.view === 'month') renderDetail();
      else if (state.view === 'day') renderDayView();
    });
    panel.appendChild(feriBtn);

    const fjBtn = document.createElement('button');
    fjBtn.className = 'manage-item' + (isFj ? ' active feria-jud-active' : '');
    fjBtn.innerHTML = isFj ? '🔴 Quitar feria judicial' : '⭕ Marcar como feria judicial';
    fjBtn.addEventListener('click', () => {
      toggleFeriaJud(day);
      rerenderActiveView();
      if (state.view === 'month') renderDetail();
      else if (state.view === 'day') renderDayView();
    });
    panel.appendChild(fjBtn);

    // Si el día está marcado como feria judicial, mostrar opción para replicar
    // este día (sus slots) en un rango de días. Útil para llenar feria de enero/julio
    // donde típicamente la misma persona/equipo hace varios días seguidos.
    if (isFj) {
      const dimNow = new Date(state.year, state.month, 0).getDate();
      const replicateBtn = document.createElement('button');
      replicateBtn.className = 'manage-item';
      replicateBtn.innerHTML = '📋 Replicar este día en un rango';
      replicateBtn.title = 'Copiar las personas asignadas hoy a varios días consecutivos';
      replicateBtn.addEventListener('click', () => openReplicateDayForm(day));
      panel.appendChild(replicateBtn);
    }

    wrap.appendChild(panel);
  }

  return wrap;
}

// Modal "Replicar este día desde X hasta Y" — copia los slots del día actual
// a todos los días del rango, marcándolos también como feria judicial.
function openReplicateDayForm(srcDay) {
  const dim = new Date(state.year, state.month, 0).getDate();
  const srcSlots = state.data[String(srcDay)];
  if (!srcSlots || srcSlots.length === 0) {
    showToast('Este día no tiene personas asignadas todavía');
    return;
  }
  // Resumen de quién está asignado hoy (para que el usuario vea qué va a replicar)
  const people = [];
  srcSlots.forEach(s => {
    if (s[0]) people.push(s[0]);
    if (s[1]) people.push(s[1]);
  });
  const peopleStr = people.length > 0 ? people.join(', ') : '(día vacío)';

  // Por defecto: desde día siguiente hasta fin de la primera quincena o fin de mes
  const defFrom = Math.min(srcDay + 1, dim);
  const defTo = srcDay <= 15 ? Math.min(15, dim) : dim;

  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-card modal-card-small">
      <div class="modal-head">
        <h2>📋 Replicar día ${srcDay}</h2>
        <button class="modal-close" data-act="cancel">×</button>
      </div>
      <div class="modal-body" style="padding:14px 16px;">
        <div style="font-size:13px;color:#3a3a3c;margin-bottom:10px;">
          Se van a copiar las personas asignadas el día <b>${srcDay}</b> a todos los días del rango.
          También se marcará feria judicial en cada uno.
        </div>
        <div style="background:#fff8e0;border-radius:8px;padding:8px 10px;font-size:12px;color:#8a5a00;margin-bottom:12px;">
          <b>Asignados hoy:</b> ${peopleStr}
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="font-size:13px;flex:1;">
            Desde el día
            <input type="number" id="rep-from" min="1" max="${dim}" value="${defFrom}" class="rep-day-input">
          </label>
          <label style="font-size:13px;flex:1;">
            hasta el día
            <input type="number" id="rep-to" min="1" max="${dim}" value="${defTo}" class="rep-day-input">
          </label>
        </div>
        <div style="font-size:11px;color:#8e8e93;margin-top:10px;">
          Los días que ya tengan personas asignadas se sobrescriben. ${MES_NAMES[state.month-1]} tiene ${dim} días.
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn secondary" data-act="cancel">Cancelar</button>
        <button class="modal-btn primary" data-act="apply">Replicar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
  overlay.querySelectorAll('[data-act="cancel"]').forEach(b => b.addEventListener('click', close));
  overlay.querySelector('[data-act="apply"]').addEventListener('click', () => {
    let from = parseInt(overlay.querySelector('#rep-from').value, 10);
    let to = parseInt(overlay.querySelector('#rep-to').value, 10);
    if (!from || !to || from < 1 || to < 1 || from > dim || to > dim) {
      alert('Días inválidos. Tienen que estar entre 1 y ' + dim);
      return;
    }
    if (from > to) { const t = from; from = to; to = t; }
    // Clonar los slots del día origen (deep copy para que cada día tenga su propio array)
    const cloneSlots = () => srcSlots.map(s => [s[0] || null, s[1] || null]);
    if (!state._feriaJud) state._feriaJud = {};
    let count = 0;
    for (let d = from; d <= to; d++) {
      if (d === srcDay) continue;  // no nos pisamos a nosotros mismos
      state.data[String(d)] = cloneSlots();
      // También marcar feria judicial en cada día replicado
      state._feriaJud[String(d)] = true;
      count++;
    }
    saveMonthData(state.year, state.month, state.data);
    saveFeriaJud(state.year, state.month, state._feriaJud);
    rerenderActiveView();
    if (state.view === 'month') renderDetail();
    else if (state.view === 'day') renderDayView();
    showToast(`📋 Replicado en ${count} día${count !== 1 ? 's' : ''} (${from}–${to})`);
    close();
  });
}

// Construye el botón "⚙️ Gestionar día" + panel desplegable — versión LEGACY (mantenida).
function buildReplacementsBlock(day) {
  const wrap = document.createElement('div');
  wrap.className = 'replacements-block';

  const reps = getReplacementsForDay(state.year, state.month, day);

  // Botón "+ Reemplazo" siempre visible
  const addRepBtn = document.createElement('button');
  addRepBtn.className = 'add-btn replacement-add-btn full-width-btn';
  addRepBtn.textContent = reps.length > 0 ? '+ Agregar otro reemplazo' : '+ Agregar reemplazo';
  addRepBtn.addEventListener('click', () => openReplacementForm(day));
  wrap.appendChild(addRepBtn);

  return wrap;
}

// Recolecta las personas OTROS asignadas a un día como "extras" (slots fuera
// del equipo principal y del apoyo). Útil para la sección Extras del Gestionar día.
function collectExtras(y, m, d) {
  const isCur = (y === state.year && m === state.month);
  const slots = isCur ? (state.data[String(d)] || []) : (loadMonthData(y, m)[String(d)] || []);
  if (!slots || slots.length === 0) return [];
  const teamMembers = findTeamMembers(slots);
  const teamSlotIdx = teamMembers ? teamMembers.mainSlotIdx : -1;
  const thirdSlotIdx = teamMembers && teamMembers.thirdSlotIdx !== null ? teamMembers.thirdSlotIdx : -1;
  const isFeria = isFeriaJud(y, m, d);
  const extras = [];
  slots.forEach((slot, slotIdx) => {
    if (slotIdx === teamSlotIdx || slotIdx === thirdSlotIdx) return;
    // En feria, el slot[1] es el apoyo: tampoco lo tomamos como extra.
    if (isFeria && slotIdx === 1) return;
    for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
      const name = slot[sideIdx];
      if (name && OTROS.includes(name)) {
        extras.push({ name, slotIdx, sideIdx });
      }
    }
  });
  return extras;
}

// Modal "+ Agregar extra al día" — agrega una persona de OTROS como slot extra del día.
function openAddExtraForm(day) {
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  const opts = OTROS.map(n => `<option value="${n}">${n}</option>`).join('');
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-card modal-card-small">
      <div class="modal-head">
        <h2>✨ Agregar extra — día ${day}</h2>
        <button class="modal-close" data-act="cancel">×</button>
      </div>
      <div class="modal-body" style="padding:14px 16px;">
        <label style="font-size:13px;color:#6c6c70;">Persona</label>
        <select id="extra-person-select" class="rep-select" style="margin-top:6px;">${opts}</select>
        <div style="font-size:11px;color:#8e8e93;margin-top:10px;">
          Los extras se agregan como fila adicional. Aparecen abajo del equipo en el detalle del día.
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn secondary" data-act="cancel">Cancelar</button>
        <button class="modal-btn primary" data-act="save">Agregar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
  overlay.querySelectorAll('[data-act="cancel"]').forEach(b => b.addEventListener('click', close));
  overlay.querySelector('[data-act="save"]').addEventListener('click', () => {
    const name = overlay.querySelector('#extra-person-select').value;
    if (!name) { close(); return; }
    snapshotDayBeforeEdit(day);
    if (!state.data[String(day)]) state.data[String(day)] = [];
    // Buscar primero un slot con un hueco
    let filled = false;
    for (const s of state.data[String(day)]) {
      if (!s[0]) { s[0] = name; filled = true; break; }
      if (!s[1]) { s[1] = name; filled = true; break; }
    }
    if (!filled) {
      state.data[String(day)].push([name, null]);
    }
    saveMonthData(state.year, state.month, state.data);
    rerenderActiveView();
    if (state.view === 'month') renderDetail();
    else if (state.view === 'day') renderDayView();
    showToast(`✨ ${name} agregado como extra`);
    close();
  });
}

// Form rápido para agregar una persona al equipo de intervención o apoyo
function openAddPersonForm(day, kind, apoyoInfo) {
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  const title = kind === 'apoyo' ? 'Agregar al equipo de apoyo' : 'Agregar al equipo de intervención';
  const targetDay = kind === 'apoyo' && apoyoInfo ? apoyoInfo.d : day;
  const targetY = kind === 'apoyo' && apoyoInfo ? apoyoInfo.y : state.year;
  const targetM = kind === 'apoyo' && apoyoInfo ? apoyoInfo.m : state.month;
  // Personas elegibles: roster completo + otros
  const opts = ROSTER.concat(OTROS).map(n =>
    `<option value="${n}">${n}</option>`
  ).join('');
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-card modal-card-small">
      <div class="modal-head">
        <h2>➕ ${title}</h2>
        <button class="modal-close" data-act="cancel">×</button>
      </div>
      <div class="modal-body" style="padding:14px 16px;">
        <label style="font-size:13px;color:#6c6c70;">Persona a agregar</label>
        <select id="add-person-select" class="rep-select" style="margin-top:8px;">${opts}</select>
        <div style="font-size:11px;color:#8e8e93;margin-top:10px;">
          Se agregará como una nueva fila en el día ${targetDay}.
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn secondary" data-act="cancel">Cancelar</button>
        <button class="modal-btn primary" data-act="save">Agregar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
  overlay.querySelectorAll('[data-act="cancel"]').forEach(b => b.addEventListener('click', close));
  overlay.querySelector('[data-act="save"]').addEventListener('click', () => {
    const name = overlay.querySelector('#add-person-select').value;
    if (!name) { close(); return; }

    // Decidir qué mes/datos modificar (puede ser otro mes si es apoyo de fin de mes)
    let data;
    const isCurMonth = (targetY === state.year && targetM === state.month);
    if (isCurMonth) {
      snapshotDayBeforeEdit(targetDay);
      data = state.data;
    } else {
      data = loadMonthData(targetY, targetM);
    }
    if (!data[String(targetDay)]) data[String(targetDay)] = [];
    const daySlots = data[String(targetDay)];

    // Estrategia de inserción según el tipo (intervención = slot 0, apoyo = slot 1):
    //  - Si "intervención": rellenar huecos del slot[0]; si no hay, push.
    //  - Si "apoyo": rellenar huecos del slot[1]; si no existe, crearlo en posición 1.
    //  - En días de feria, esto asegura que las primeras 2 personas vayan a intervención
    //    y las otras 2 al apoyo (formando un 2x2 limpio en el tile).
    let filled = false;
    if (kind === 'apoyo') {
      // Asegurar que existan al menos 2 slots
      while (daySlots.length < 2) daySlots.push([null, null]);
      const s1 = daySlots[1];
      if (!s1[0]) { s1[0] = name; filled = true; }
      else if (!s1[1]) { s1[1] = name; filled = true; }
      // Si slot 1 ya tiene los dos llenos, crear un slot 2 (raro)
      if (!filled) { daySlots.push([name, null]); filled = true; }
    } else {
      // Intervención: rellenar huecos del slot 0 primero
      if (daySlots.length === 0) daySlots.push([null, null]);
      const s0 = daySlots[0];
      if (!s0[0]) { s0[0] = name; filled = true; }
      else if (!s0[1]) { s0[1] = name; filled = true; }
      else {
        // Slot 0 lleno: rellenar el primer hueco encontrado en otros slots
        for (let i = 1; i < daySlots.length; i++) {
          const s = daySlots[i];
          if (!s[0]) { s[0] = name; filled = true; break; }
          if (!s[1]) { s[1] = name; filled = true; break; }
        }
        if (!filled) { daySlots.push([name, null]); filled = true; }
      }
    }
    if (isCurMonth) {
      state.data = data;
      saveMonthData(state.year, state.month, state.data);
    } else {
      saveMonthData(targetY, targetM, data);
    }
    rerenderActiveView();
    if (state.view === 'month') renderDetail();
    else if (state.view === 'day') renderDayView();
    showToast(`✓ ${name} agregado al día ${targetDay}`);
    close();
  });
}

// Form rápido para agregar un reemplazo (usado en el editor del día)
function openReplacementForm(day) {
  // Listar personas del día (para "a quién reemplaza")
  const slots = state.data[String(day)] || [];
  const peopleInDay = [];

  // Personas del equipo de intervención (slots del día)
  slots.forEach(s => {
    if (s[0] && !peopleInDay.includes(s[0])) peopleInDay.push(s[0]);
    if (s[1] && !peopleInDay.includes(s[1])) peopleInDay.push(s[1]);
  });

  // Personas del equipo de APOYO (el que entra después)
  const teamRes = findTeamSlot(slots);
  const teamSlot = teamRes ? teamRes.slot : null;
  const apoyo = findApoyo(state.year, state.month, day, teamSlot);
  if (apoyo) {
    [apoyo.team[0], apoyo.team[1]].forEach(n => {
      if (n && !peopleInDay.includes(n)) peopleInDay.push(n);
    });
    // 3er miembro del apoyo si es equipo de 3
    if (apoyo.members && apoyo.members.c && !peopleInDay.includes(apoyo.members.c)) {
      peopleInDay.push(apoyo.members.c);
    }
  }
  // 3er miembro del equipo de Intervención del día (si lo hay)
  const todayMembers = findTeamMembers(slots);
  if (todayMembers && todayMembers.c && !peopleInDay.includes(todayMembers.c)) {
    peopleInDay.push(todayMembers.c);
  }

  if (peopleInDay.length === 0) {
    alert('No hay nadie asignado este día para reemplazar.');
    return;
  }

  // Construir un mini-modal inline (no se usa prompt para que se vea piola en mobile)
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-card modal-card-small">
      <div class="modal-head">
        <h2>➕ Nuevo reemplazo</h2>
        <button class="modal-close" type="button">×</button>
      </div>
      <div class="rep-form">
        <label>A quién reemplaza:</label>
        <select id="rep-original" class="rep-select"></select>
        <label>Quién lo reemplaza:</label>
        <select id="rep-replacement" class="rep-select"></select>
        <div class="modal-footer">
          <button class="modal-btn secondary" type="button" id="rep-cancel">Cancelar</button>
          <button class="modal-btn primary" type="button" id="rep-save">Guardar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const origSel = overlay.querySelector('#rep-original');
  const repSel = overlay.querySelector('#rep-replacement');

  peopleInDay.forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p;
    origSel.appendChild(o);
  });

  const allPeople = [...new Set([...ROSTER, ...OTROS])].sort((a,b) => a.localeCompare(b));
  allPeople.forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p;
    repSel.appendChild(o);
  });

  function close() { document.body.removeChild(overlay); }
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
  overlay.querySelector('#rep-cancel').addEventListener('click', close);
  overlay.querySelector('#rep-save').addEventListener('click', () => {
    const original = origSel.value;
    const replacement = repSel.value;
    if (!original || !replacement) {
      alert('Tenés que elegir ambos.');
      return;
    }
    if (original === replacement) {
      alert('No se puede reemplazar a sí mismo.');
      return;
    }
    addReplacement(day, replacement, original);
    close();
    rerenderActiveView();
    renderDetail();
    showToast(`${replacement} reemplaza a ${original}`);
  });
}

// ---------- Exportar mes como imagen + compartir ----------
async function exportAndShareMonth() {
  if (typeof html2canvas === 'undefined') {
    showToast('Esperá unos segundos a que cargue el módulo de imagen y reintentá');
    return;
  }

  // Forzar vista mes y deseleccionar día
  if (state.view !== 'month') {
    state.view = 'month';
    state.selectedDay = null;
    rerenderActiveView();
    renderDetail();
    await new Promise(r => setTimeout(r, 200));
  }

  showToast('Generando imagen del mes...');

  // Crear contenedor offscreen con título + calendario clonado
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff;padding:24px;width:1240px;font-family:-apple-system,system-ui,sans-serif;';

  const title = document.createElement('h1');
  title.textContent = `Turnos de Intervenciones — ${MES_NAMES[state.month - 1]} ${state.year}`;
  title.style.cssText = 'margin:0 0 16px;font-size:24px;color:#1c1c1e;text-align:center;';
  wrap.appendChild(title);

  // Clonar el calendario actual
  const monthView = document.getElementById('view-month');
  if (!monthView) {
    showToast('No hay vista de mes para exportar');
    return;
  }
  const clone = monthView.cloneNode(true);
  clone.querySelectorAll('.filtered-out, .filter-match').forEach(el => {
    el.classList.remove('filtered-out', 'filter-match');
  });
  wrap.appendChild(clone);

  // Lista de reemplazos del mes (si los hay)
  const allReps = state._replacements || {};
  const repDays = Object.keys(allReps).map(Number).filter(d => allReps[String(d)] && allReps[String(d)].length > 0).sort((a,b) => a-b);
  if (repDays.length > 0) {
    const repsSection = document.createElement('div');
    repsSection.style.cssText = 'margin-top:16px;padding:12px;background:#f7f4fc;border-left:4px solid #5e35b1;border-radius:8px;';
    const repsTitle = document.createElement('div');
    repsTitle.style.cssText = 'font-weight:700;font-size:14px;color:#311b92;margin-bottom:8px;';
    repsTitle.textContent = '↪ Reemplazos del mes';
    repsSection.appendChild(repsTitle);
    repDays.forEach(d => {
      const reps = allReps[String(d)];
      reps.forEach(rep => {
        const line = document.createElement('div');
        line.style.cssText = 'font-size:13px;color:#311b92;padding:3px 0;';
        line.innerHTML = `<b>Día ${d}</b> — <b>${rep.replacement}</b> reemplaza a ${rep.original}`;
        repsSection.appendChild(line);
      });
    });
    wrap.appendChild(repsSection);
  }

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top:12px;text-align:right;font-size:11px;color:#888;';
  const now = new Date();
  footer.textContent = `Generado ${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})} — Turnos de Intervenciones v${APP_VERSION}`;
  wrap.appendChild(footer);

  document.body.appendChild(wrap);

  try {
    const canvas = await html2canvas(wrap, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    canvas.toBlob(async (blob) => {
      const fileName = `Turnos ${MES_NAMES[state.month - 1]} ${state.year}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Turnos ${MES_NAMES[state.month - 1]} ${state.year}`,
            files: [file]
          });
          showToast('Compartido');
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Descargado. Compartilo desde la galería.');
    }, 'image/png');

  } catch (e) {
    console.error('Export error:', e);
    showToast('Error generando imagen');
  } finally {
    document.body.removeChild(wrap);
  }
}

// Migra entradas legacy de 'FERIADO' en slots al sistema de flag aparte
function migrateLegacyFeriados(y, m, data) {
  let changed = false;
  const feriados = loadFeriados(y, m);
  const out = {};
  for (const day in data) {
    const slots = data[day];
    const cleanSlots = [];
    for (const slot of slots) {
      if (slot[0] === 'FERIADO' || slot[1] === 'FERIADO') {
        feriados[day] = true;
        changed = true;
        // Si el otro lado tiene un nombre real, conservarlo
        const other = slot[0] === 'FERIADO' ? slot[1] : slot[0];
        if (other) cleanSlots.push([other, null]);
      } else {
        cleanSlots.push(slot);
      }
    }
    if (cleanSlots.length > 0) out[day] = cleanSlots;
  }
  if (changed) {
    saveFeriados(y, m, feriados);
    saveMonthData(y, m, out);
    return out;
  }
  return data;
}

// Read any day's data (from current state or storage / seed)
function getDayDataAny(y, m, d) {
  if (y === state.year && m === state.month) {
    return state.data[String(d)] || null;
  }
  return loadMonthData(y, m)[String(d)] || null;
}

// Recarga estado completo del mes (data + feriados) - llamado al cambiar de mes
function reloadCurrentMonth() {
  state.data = loadMonthData(state.year, state.month);
  state._feriados = loadFeriados(state.year, state.month);
  state._feriaJud = loadFeriaJud(state.year, state.month);
  state._replacements = loadReplacements(state.year, state.month);
}

// ---------- Inicialización del seed ----------
function initSeed() {
  const v = localStorage.getItem(STORAGE_VERSION_KEY);
  if (v === SEED_VERSION) return;
  if (typeof SEED_DATA === 'undefined') return;
  for (const key in SEED_DATA) {
    const k = STORAGE_PREFIX + key;
    if (localStorage.getItem(k) === null) {
      try { localStorage.setItem(k, JSON.stringify(SEED_DATA[key])); }
      catch (e) { console.warn('Could not seed', key, e); break; }
    }
  }
  localStorage.setItem(STORAGE_VERSION_KEY, SEED_VERSION);
}

// ---------- Helpers visuales ----------
function abbrev(name) {
  if (!name) return '';
  // En pantallas anchas (desktop) mostramos el nombre completo
  if (typeof window !== 'undefined' && window.innerWidth >= 768) return name;
  if (name.length <= 4) return name;
  if (name.includes(' ')) {
    return name.split(' ').map(s => s[0]).join('').slice(0, 4);
  }
  return name.slice(0, 4);
}
function colorFor(name) {
  if (!name) return '#E5E5EA';
  // Prioridad: override del mes actual → custom global → default → fallback
  const monthOverrides = loadPersonColorsMonth(state.year, state.month);
  if (monthOverrides[name]) return monthOverrides[name];
  const custom = loadPersonColors();
  return custom[name] || COLORS[name] || '#E5E5EA';
}
function textColorFor(name) {
  if (WHITE_TEXT.has(name)) return '#FFFFFF';
  const c = colorFor(name);
  if (c.startsWith('#')) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b);
    return lum < 130 ? '#FFFFFF' : '#1c1c1e';
  }
  return '#1c1c1e';
}

// ---------- Colores custom por persona (globales) ----------
let _personColorsCache = null;
function loadPersonColors() {
  if (_personColorsCache !== null) return _personColorsCache;
  try {
    _personColorsCache = JSON.parse(localStorage.getItem(PERSON_COLORS_KEY) || '{}');
  } catch { _personColorsCache = {}; }
  return _personColorsCache;
}
function savePersonColors(colors) {
  _personColorsCache = colors;
  try {
    localStorage.setItem(PERSON_COLORS_KEY, JSON.stringify(colors));
    scheduleCloudPush();
  } catch (e) { console.warn('Save colors error', e); }
}

// ---------- Colores específicos por mes (override) ----------
let _personColorsMonthCache = {};  // { "YYYY-MM": {name: color, ...} }
function monthColorsKey(y, m) {
  return `${PERSON_COLORS_MONTH_PREFIX}${y}-${String(m).padStart(2,'0')}`;
}
function loadPersonColorsMonth(y, m) {
  const k = `${y}-${String(m).padStart(2,'0')}`;
  if (_personColorsMonthCache[k] !== undefined) return _personColorsMonthCache[k];
  try {
    _personColorsMonthCache[k] = JSON.parse(localStorage.getItem(monthColorsKey(y, m)) || '{}');
  } catch { _personColorsMonthCache[k] = {}; }
  return _personColorsMonthCache[k];
}
function savePersonColorsMonth(y, m, colors) {
  const k = `${y}-${String(m).padStart(2,'0')}`;
  _personColorsMonthCache[k] = colors;
  try {
    if (Object.keys(colors).length === 0) localStorage.removeItem(monthColorsKey(y, m));
    else localStorage.setItem(monthColorsKey(y, m), JSON.stringify(colors));
    scheduleCloudPush();
  } catch (e) { console.warn('Save month colors error', e); }
}
function clearPersonColorsMonth(y, m) {
  savePersonColorsMonth(y, m, {});
}

// ---------- Sincronización en la nube (Firebase) ----------
let _fbApp = null;
let _fbAuth = null;
let _fbDb = null;
let _fbUser = null;
let _syncTimer = null;
let _suppressNextPush = false; // Para no rebotar al aplicar datos remotos

function resetPersonColors() {
  _personColorsCache = {};
  localStorage.removeItem(PERSON_COLORS_KEY);
}

// Config Firebase precargada (para no tener que copiar 4 campos cada vez en PC nueva)
const DEFAULT_FIREBASE_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAwxoFkT0ZrBbtPTJhcOnEHs8X_T5W9UwY",
    authDomain: "turnos-intervenciones.firebaseapp.com",
    databaseURL: "https://turnos-intervenciones-default-rtdb.firebaseio.com",
    projectId: "turnos-intervenciones"
  },
  email: '',
  password: ''
};

function loadFirebaseConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY) || 'null');
    if (stored) return stored;
  } catch {}
  // Si no hay nada guardado, devolver los defaults (sin email/password)
  return JSON.parse(JSON.stringify(DEFAULT_FIREBASE_CONFIG));
}
function saveFirebaseConfig(cfg) {
  if (cfg === null) {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  } else {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
  }
}

function setSyncStatus(status, msg) {
  const el = document.getElementById('sync-status-indicator');
  if (el) {
    el.className = `sync-status-indicator ${status}`;
    const labels = {
      'idle': '⚪ Sin conectar',
      'connecting': '🟡 Conectando...',
      'connected': '🟢 Sincronizado',
      'syncing': '🔵 Sincronizando...',
      'error': '🔴 Error'
    };
    el.textContent = msg || labels[status] || status;
  }
}

// Status visible dentro del modal de sincronización
function setSyncInlineStatus(status, msg) {
  const el = document.getElementById('sync-inline-status');
  if (!el) return;
  el.className = `sync-inline-status ${status}`;
  el.textContent = msg;
  console.log('[sync]', status, msg);
}

async function initFirebaseSync() {
  setSyncInlineStatus('connecting', '🟡 Verificando configuración...');
  const cfg = loadFirebaseConfig();
  if (!cfg || !cfg.firebase || !cfg.email || !cfg.password) {
    setSyncStatus('idle');
    setSyncInlineStatus('idle', '⚪ Faltan datos para conectar');
    return false;
  }
  if (typeof firebase === 'undefined') {
    setSyncStatus('error', '🔴 SDK no cargó');
    setSyncInlineStatus('error',
      '🔴 Firebase SDK no se cargó.\n' +
      'Posibles causas:\n' +
      '• Sin internet al abrir la app\n' +
      '• Bloqueador de scripts activo\n' +
      'Intentá: cerrar la app y volver a abrirla con internet.');
    return false;
  }
  try {
    setSyncInlineStatus('connecting', '🟡 Inicializando Firebase...');
    if (!_fbApp) {
      _fbApp = firebase.initializeApp(cfg.firebase);
      _fbAuth = firebase.auth();
      _fbDb = firebase.database();
    }
    setSyncInlineStatus('connecting', '🟡 Iniciando sesión con ' + cfg.email + '...');
    let cred;
    try {
      cred = await _fbAuth.signInWithEmailAndPassword(cfg.email, cfg.password);
    } catch (e) {
      // Primera vez: crear cuenta
      if (e.code === 'auth/user-not-found' ||
          e.code === 'auth/invalid-login-credentials' ||
          e.code === 'auth/invalid-credential') {
        setSyncInlineStatus('connecting', '🟡 Primera vez. Creando cuenta...');
        cred = await _fbAuth.createUserWithEmailAndPassword(cfg.email, cfg.password);
      } else {
        throw e;
      }
    }
    _fbUser = cred.user;
    setupRemoteListener();
    setSyncStatus('connected');
    setSyncInlineStatus('connected', '🟢 Conectado como ' + _fbUser.email);
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    const errCode = e.code || 'error';
    let hint = '';
    if (errCode === 'auth/operation-not-allowed') {
      hint = '\n\n👉 Habilitá "Email/Password" en\nFirebase → Authentication → Sign-in method';
    } else if (errCode === 'auth/invalid-api-key' || errCode === 'auth/api-key-not-valid' || errCode.includes('api-key')) {
      hint = '\n\n👉 La API Key está mal. Copiala de nuevo del Firebase Console.';
    } else if (errCode === 'auth/weak-password') {
      hint = '\n\n👉 La contraseña tiene que tener al menos 6 caracteres.';
    } else if (errCode === 'auth/wrong-password') {
      hint = '\n\n👉 Contraseña incorrecta para ese mail.';
    } else if (errCode === 'PERMISSION_DENIED' || (e.message && e.message.includes('Permission'))) {
      hint = '\n\n👉 Configurá las Database Rules. Mirá el README.';
    } else if (errCode === 'auth/network-request-failed') {
      hint = '\n\n👉 Sin conexión. Probá de nuevo con internet.';
    }
    setSyncStatus('error', `🔴 ${errCode}`);
    setSyncInlineStatus('error', `🔴 ${errCode}\n${e.message || ''}${hint}`);
    return false;
  }
}

function setupRemoteListener() {
  if (!_fbUser || !_fbDb) return;
  const ref = _fbDb.ref(`users/${_fbUser.uid}/data`);
  ref.on('value', (snap) => {
    const data = snap.val();
    if (!data || !data._timestamp) return;
    const lastSync = parseInt(localStorage.getItem(FIREBASE_LAST_SYNC_KEY) || '0');
    if (data._timestamp <= lastSync) return; // Datos viejos, ignorar
    applyRemoteData(data);
    localStorage.setItem(FIREBASE_LAST_SYNC_KEY, String(data._timestamp));
  }, (err) => {
    console.error('Firebase listener error:', err);
    setSyncStatus('error', `🔴 ${err.message}`);
  });
}

function applyRemoteData(data) {
  _suppressNextPush = true;

  // Construir set de claves que SÍ están en el remoto (para detectar borrados)
  const remoteKeys = new Set();
  Object.keys(data).forEach(key => {
    if (key.startsWith('turnos:') &&
        !key.startsWith('turnos:hist:') &&
        key !== FIREBASE_CONFIG_KEY &&
        key !== FIREBASE_LAST_SYNC_KEY) {
      remoteKeys.add(key);
    }
  });

  // PASO 1: borrar las claves locales `turnos:*` que NO están en el remoto.
  // Esto permite que borrar un mes en un dispositivo se refleje en los demás.
  const localKeysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('turnos:') &&
        !key.startsWith('turnos:hist:') &&
        key !== FIREBASE_CONFIG_KEY &&
        key !== FIREBASE_LAST_SYNC_KEY &&
        !remoteKeys.has(key)) {
      localKeysToRemove.push(key);
    }
  }
  localKeysToRemove.forEach(k => localStorage.removeItem(k));

  // PASO 2: aplicar las claves del remoto al localStorage
  Object.keys(data).forEach(key => {
    if (key.startsWith('turnos:') &&
        !key.startsWith('turnos:hist:') &&
        key !== FIREBASE_CONFIG_KEY &&
        key !== FIREBASE_LAST_SYNC_KEY) {
      if (data[key] === null || data[key] === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, data[key]);
      }
    }
  });

  // Invalidar caches y recargar
  _personColorsCache = null;
  _personColorsMonthCache = {};
  _birthdaysCache = null;
  state.data = loadMonthData(state.year, state.month);
  state._feriados = loadFeriados(state.year, state.month);
  state._feriaJud = loadFeriaJud(state.year, state.month);
  state._replacements = loadReplacements(state.year, state.month);
  rerenderActiveView();
  renderFilters();
  if (state.selectedDay !== null) renderDetail();
  setSyncStatus('connected');
  if (localKeysToRemove.length > 0) {
    showToast(`🔄 ${localKeysToRemove.length} cambio${localKeysToRemove.length > 1 ? 's' : ''} sincronizado${localKeysToRemove.length > 1 ? 's' : ''} (incluye borrados)`);
  } else {
    showToast('🔄 Datos sincronizados');
  }
  setTimeout(() => { _suppressNextPush = false; }, 100);
}

function scheduleCloudPush() {
  if (_suppressNextPush) return;
  if (!_fbUser || !_fbDb) return;
  if (_syncTimer) clearTimeout(_syncTimer);
  setSyncStatus('syncing');
  _syncTimer = setTimeout(() => pushToCloud(), 1500);
}

async function pushToCloud() {
  if (!_fbUser || !_fbDb) return;
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('turnos:') &&
        !key.startsWith('turnos:hist:') &&
        key !== FIREBASE_CONFIG_KEY &&
        key !== FIREBASE_LAST_SYNC_KEY) {
      data[key] = localStorage.getItem(key);
    }
  }
  data._timestamp = Date.now();
  try {
    await _fbDb.ref(`users/${_fbUser.uid}/data`).set(data);
    localStorage.setItem(FIREBASE_LAST_SYNC_KEY, String(data._timestamp));
    setSyncStatus('connected');
  } catch (e) {
    console.error('Push to cloud failed:', e);
    setSyncStatus('error', `🔴 ${e.message}`);
  }
}

// Forzar descarga desde la nube (ignora timestamp local)
async function forcePullFromCloud() {
  if (!_fbUser || !_fbDb) {
    showToast('Primero conectate a Firebase');
    return;
  }
  if (!confirm('⚠️ Esto va a REEMPLAZAR todos los datos locales con los que están en la nube. ¿Continuar?')) return;
  setSyncInlineStatus('working', '⬇️ Descargando datos de la nube...');
  try {
    const snap = await _fbDb.ref(`users/${_fbUser.uid}/data`).once('value');
    const data = snap.val();
    if (!data) {
      setSyncInlineStatus('warn', '⚠️ No hay datos en la nube para descargar.');
      return;
    }
    applyRemoteData(data);
    if (data._timestamp) localStorage.setItem(FIREBASE_LAST_SYNC_KEY, String(data._timestamp));
    setSyncInlineStatus('ok', '✅ Datos descargados de la nube y aplicados localmente.');
    showToast('⬇️ Descarga completada');
  } catch (e) {
    console.error('Force pull error:', e);
    setSyncInlineStatus('error', `🔴 Error descargando: ${e.message}`);
  }
}

// Forzar subida a la nube
async function forcePushToCloud() {
  if (!_fbUser || !_fbDb) {
    showToast('Primero conectate a Firebase');
    return;
  }
  if (!confirm('⬆️ Esto va a REEMPLAZAR todos los datos en la nube con los que tenés localmente. ¿Continuar?')) return;
  setSyncInlineStatus('working', '⬆️ Subiendo datos locales a la nube...');
  try {
    await pushToCloud();
    setSyncInlineStatus('ok', '✅ Datos subidos a la nube correctamente.');
    showToast('⬆️ Subida completada');
  } catch (e) {
    console.error('Force push error:', e);
    setSyncInlineStatus('error', `🔴 Error subiendo: ${e.message}`);
  }
}

async function disconnectSync() {
  if (_fbAuth) {
    try { await _fbAuth.signOut(); } catch (e) {}
  }
  _fbApp = null; _fbAuth = null; _fbDb = null; _fbUser = null;
  saveFirebaseConfig(null);
  localStorage.removeItem(FIREBASE_LAST_SYNC_KEY);
  setSyncStatus('idle');
  showToast('Sincronización desconectada');
}

// ---------- Contraseña del generador ----------
// Hash simple (no es criptografía seria, solo evita que el usuario casual genere)
function hashGenPassword(pwd) {
  let h = 5381;
  for (let i = 0; i < pwd.length; i++) {
    h = ((h << 5) + h) + pwd.charCodeAt(i);
    h = h & 0xFFFFFFFF;
  }
  return String(h);
}
function loadGenPasswordHash() {
  return localStorage.getItem(GEN_PASSWORD_KEY) || null;
}
function saveGenPasswordHash(hash) {
  if (hash) localStorage.setItem(GEN_PASSWORD_KEY, hash);
  else localStorage.removeItem(GEN_PASSWORD_KEY);
  scheduleCloudPush();
}
// Verifica que la contraseña ingresada coincida con la guardada.
// Si no hay contraseña guardada, pide al usuario que defina una.
// Retorna true si el usuario está autorizado a generar.
function checkGenPassword() {
  const storedHash = loadGenPasswordHash();
  if (!storedHash) {
    // Primera vez: definir contraseña
    const pwd1 = prompt('Definí una contraseña para generar turnos.\nSe te va a pedir cada vez que generes:');
    if (!pwd1 || pwd1.length < 4) {
      if (pwd1 !== null) alert('La contraseña tiene que tener al menos 4 caracteres.');
      return false;
    }
    const pwd2 = prompt('Repetí la contraseña para confirmarla:');
    if (pwd1 !== pwd2) {
      alert('Las contraseñas no coinciden.');
      return false;
    }
    saveGenPasswordHash(hashGenPassword(pwd1));
    showToast('Contraseña guardada');
    return true;
  }
  // Ya hay contraseña: pedirla
  const pwd = prompt('Ingresá la contraseña para generar:');
  if (!pwd) return false;
  if (hashGenPassword(pwd) !== storedHash) {
    alert('Contraseña incorrecta.');
    return false;
  }
  return true;
}
function resetGenPassword() {
  if (!confirm('¿Borrar la contraseña del generador? Después podrás definir una nueva.')) return;
  saveGenPasswordHash(null);
  showToast('Contraseña borrada. Definí una nueva al generar.');
}

// ---------- Buscar y aplicar actualización de la app ----------
// Sin esto, hay que cerrar y reabrir la PWA cada vez que se sube una nueva versión.
async function checkForUpdate() {
  const msg = 'Buscar nueva versión de la app?\n\n' +
    '✅ TUS DATOS LOCALES NO SE PIERDEN (turnos, colores, cumpleaños, reemplazos, sincronización con la nube).\n\n' +
    'Solo se recargan los archivos de la app.';
  if (!confirm(msg)) return;

  showToast('🔄 Limpiando cache y recargando...');

  try {
    // 1. Desregistrar TODOS los service workers (el SW viejo no sirve más caché viejo)
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        try { await reg.unregister(); } catch (e) { /* ignorar */ }
      }
    }

    // 2. Borrar TODAS las caches del Cache Storage
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n).catch(() => {})));
    }

    // 3. Recargar bypaseando el HTTP cache (con query param efímero)
    setTimeout(() => {
      const u = new URL(window.location.href);
      u.searchParams.set('_v', Date.now());
      window.location.replace(u.toString());
    }, 400);
  } catch (e) {
    console.error('Update error:', e);
    showToast('🔴 Error buscando actualización');
  }
}

// ---------- Modal de Estadísticas ----------
let _statsScope = 'month'; // 'month' | 'total'

function openStatsSettings() {
  document.getElementById('stats-modal').classList.remove('hidden');
  populateStatsRangePickers();
  renderStats();
}

// Popular los selects de Desde/Hasta con meses y años disponibles
function populateStatsRangePickers() {
  const fromM = document.getElementById('stats-range-from-m');
  const fromY = document.getElementById('stats-range-from-y');
  const toM = document.getElementById('stats-range-to-m');
  const toY = document.getElementById('stats-range-to-y');
  if (!fromM || !fromY || !toM || !toY) return;
  // Defaults: si no hay rango seleccionado, "este año" (enero-diciembre del año actual)
  if (_statsRangeFromY === null) {
    _statsRangeFromY = state.year; _statsRangeFromM = 1;
    _statsRangeToY = state.year; _statsRangeToM = state.month;
  }
  // Meses
  [fromM, toM].forEach(sel => {
    sel.innerHTML = '';
    MES_NAMES.forEach((name, i) => {
      const o = document.createElement('option');
      o.value = String(i + 1); o.textContent = name;
      sel.appendChild(o);
    });
  });
  // Años: rango del año actual ±5
  const baseY = state.year;
  [fromY, toY].forEach(sel => {
    sel.innerHTML = '';
    for (let y = baseY - 5; y <= baseY + 5; y++) {
      const o = document.createElement('option');
      o.value = String(y); o.textContent = String(y);
      sel.appendChild(o);
    }
  });
  fromM.value = String(_statsRangeFromM);
  fromY.value = String(_statsRangeFromY);
  toM.value = String(_statsRangeToM);
  toY.value = String(_statsRangeToY);
  // Listeners (idempotentes — usamos onchange)
  fromM.onchange = () => { _statsRangeFromM = parseInt(fromM.value, 10); renderStats(); };
  fromY.onchange = () => { _statsRangeFromY = parseInt(fromY.value, 10); renderStats(); };
  toM.onchange = () => { _statsRangeToM = parseInt(toM.value, 10); renderStats(); };
  toY.onchange = () => { _statsRangeToY = parseInt(toY.value, 10); renderStats(); };
}
function closeStatsSettings() {
  document.getElementById('stats-modal').classList.add('hidden');
}
// Cuenta días por persona en el mes actual (de state.data)
function countDaysByPersonInCurrentMonth() {
  const counts = {};
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const slot = state.data[String(d)];
    if (!slot || slot.length === 0) continue;
    slot.forEach(s => {
      [s[0], s[1]].forEach(name => {
        if (!name) return;
        counts[name] = (counts[name] || 0) + 1;
      });
    });
  }
  return counts;
}
// Cuenta días por equipo en el mes actual
function countDaysByTeamInCurrentMonth() {
  const cfg = loadGenConfig();
  const teams = cfg.teams || [];
  const counts = teams.map(() => 0);
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const slot = state.data[String(d)];
    if (!slot || slot.length === 0) continue;
    const main = slot[0];
    if (!main) continue;
    const idx = teams.findIndex(t =>
      (t.a === main[0] && t.b === main[1]) ||
      (t.a === main[1] && t.b === main[0])
    );
    if (idx >= 0) counts[idx]++;
  }
  return { teams, counts };
}

// Cuenta días por equipo en un rango de meses (inclusive)
function countDaysByTeamInRange(fromY, fromM, toY, toM) {
  const cfg = loadGenConfig();
  const teams = cfg.teams || [];
  const counts = teams.map(() => 0);
  let y = fromY, m = fromM;
  while (y < toY || (y === toY && m <= toM)) {
    const data = (y === state.year && m === state.month) ? state.data : loadMonthData(y, m);
    const dim = new Date(y, m, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const slot = data[String(d)];
      if (!slot || slot.length === 0) continue;
      const main = slot[0];
      if (!main) continue;
      const idx = teams.findIndex(t =>
        (t.a === main[0] && t.b === main[1]) ||
        (t.a === main[1] && t.b === main[0])
      );
      if (idx >= 0) counts[idx]++;
    }
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return { teams, counts };
}

// Cuenta días por persona en un rango de meses (inclusive)
function countDaysByPersonInRange(fromY, fromM, toY, toM) {
  const counts = {};
  let y = fromY, m = fromM;
  while (y < toY || (y === toY && m <= toM)) {
    const data = (y === state.year && m === state.month) ? state.data : loadMonthData(y, m);
    const dim = new Date(y, m, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const slot = data[String(d)];
      if (!slot || slot.length === 0) continue;
      slot.forEach(s => {
        [s[0], s[1]].forEach(name => {
          if (!name) return;
          counts[name] = (counts[name] || 0) + 1;
        });
      });
    }
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return counts;
}

// Estado del rango seleccionado (persistido por sesión)
let _statsRangeFromY = null, _statsRangeFromM = null;
let _statsRangeToY = null, _statsRangeToM = null;
function renderStats() {
  const content = document.getElementById('stats-content');
  content.innerHTML = '';

  // Estado del toggle
  document.querySelectorAll('#stats-modal .scope-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.statsScope === _statsScope);
  });
  // Mostrar pickers de rango sólo en scope 'range'
  const pickers = document.getElementById('stats-range-pickers');
  if (pickers) pickers.classList.toggle('hidden', _statsScope !== 'range');

  if (_statsScope === 'range') {
    // Normalizar rango (asegurar que from <= to)
    let fromY = _statsRangeFromY, fromM = _statsRangeFromM;
    let toY = _statsRangeToY, toM = _statsRangeToM;
    if (fromY > toY || (fromY === toY && fromM > toM)) {
      [fromY, toY] = [toY, fromY]; [fromM, toM] = [toM, fromM];
    }
    const intro = document.createElement('div');
    intro.className = 'stats-intro';
    intro.textContent = `Días asignados desde ${MES_NAMES[fromM-1]} ${fromY} hasta ${MES_NAMES[toM-1]} ${toY}`;
    content.appendChild(intro);

    // Por equipo en rango
    const { teams, counts } = countDaysByTeamInRange(fromY, fromM, toY, toM);
    const teamSection = document.createElement('div');
    teamSection.className = 'stats-section';
    const teamTitle = document.createElement('h3');
    teamTitle.textContent = '🤝 Por equipo (intervención)';
    teamSection.appendChild(teamTitle);
    const maxCount = Math.max(1, ...counts);
    teams.forEach((t, idx) => {
      const teamName = [t.a, t.b, t.c].filter(Boolean).join(' + ');
      const row = document.createElement('div');
      row.className = 'stats-row';
      const label = document.createElement('div');
      label.className = 'stats-label';
      label.textContent = teamName;
      label.style.background = colorFor(t.a);
      label.style.color = textColorFor(t.a);
      const barWrap = document.createElement('div');
      barWrap.className = 'stats-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'stats-bar';
      bar.style.width = `${(counts[idx] / maxCount) * 100}%`;
      bar.style.background = colorFor(t.a);
      barWrap.appendChild(bar);
      const num = document.createElement('div');
      num.className = 'stats-num';
      num.textContent = `${counts[idx]} días`;
      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(num);
      teamSection.appendChild(row);
    });
    content.appendChild(teamSection);

    // Por persona en rango
    const personCounts = countDaysByPersonInRange(fromY, fromM, toY, toM);
    const personSection = document.createElement('div');
    personSection.className = 'stats-section';
    const personTitle = document.createElement('h3');
    personTitle.textContent = '👤 Por persona';
    personSection.appendChild(personTitle);
    const sortedPeople = Object.keys(personCounts).sort((a, b) => personCounts[b] - personCounts[a]);
    const maxP = Math.max(1, ...Object.values(personCounts));
    sortedPeople.forEach(name => {
      const row = document.createElement('div');
      row.className = 'stats-row';
      const label = document.createElement('div');
      label.className = 'stats-label';
      label.textContent = name;
      label.style.background = colorFor(name);
      label.style.color = textColorFor(name);
      const barWrap = document.createElement('div');
      barWrap.className = 'stats-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'stats-bar';
      bar.style.width = `${(personCounts[name] / maxP) * 100}%`;
      bar.style.background = colorFor(name);
      barWrap.appendChild(bar);
      const num = document.createElement('div');
      num.className = 'stats-num';
      num.textContent = `${personCounts[name]} d`;
      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(num);
      personSection.appendChild(row);
    });
    content.appendChild(personSection);
    return;
  }

  if (_statsScope === 'month') {
    const monthName = `${MES_NAMES[state.month-1]} ${state.year}`;
    const intro = document.createElement('div');
    intro.className = 'stats-intro';
    intro.textContent = `Días asignados durante ${monthName}`;
    content.appendChild(intro);

    // Por equipo
    const { teams, counts } = countDaysByTeamInCurrentMonth();
    const teamSection = document.createElement('div');
    teamSection.className = 'stats-section';
    const teamTitle = document.createElement('h3');
    teamTitle.textContent = '🤝 Por equipo (intervención)';
    teamSection.appendChild(teamTitle);
    const maxCount = Math.max(1, ...counts);
    teams.forEach((t, idx) => {
      const teamName = [t.a, t.b, t.c].filter(Boolean).join(' + ');
      const row = document.createElement('div');
      row.className = 'stats-row';
      const label = document.createElement('div');
      label.className = 'stats-label';
      label.textContent = teamName;
      label.style.background = colorFor(t.a);
      label.style.color = textColorFor(t.a);
      const barWrap = document.createElement('div');
      barWrap.className = 'stats-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'stats-bar';
      bar.style.width = `${(counts[idx] / maxCount) * 100}%`;
      bar.style.background = colorFor(t.a);
      barWrap.appendChild(bar);
      const num = document.createElement('div');
      num.className = 'stats-num';
      num.textContent = `${counts[idx]} días`;
      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(num);
      teamSection.appendChild(row);
    });
    content.appendChild(teamSection);

    // Por persona
    const personCounts = countDaysByPersonInCurrentMonth();
    const personSection = document.createElement('div');
    personSection.className = 'stats-section';
    const personTitle = document.createElement('h3');
    personTitle.textContent = '👤 Por persona';
    personSection.appendChild(personTitle);

    const sortedPeople = Object.keys(personCounts).sort((a, b) => personCounts[b] - personCounts[a]);
    const maxP = Math.max(1, ...Object.values(personCounts));
    sortedPeople.forEach(name => {
      const row = document.createElement('div');
      row.className = 'stats-row';
      const label = document.createElement('div');
      label.className = 'stats-label';
      label.textContent = name;
      label.style.background = colorFor(name);
      label.style.color = textColorFor(name);
      const barWrap = document.createElement('div');
      barWrap.className = 'stats-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'stats-bar';
      bar.style.width = `${(personCounts[name] / maxP) * 100}%`;
      bar.style.background = colorFor(name);
      barWrap.appendChild(bar);
      const num = document.createElement('div');
      num.className = 'stats-num';
      num.textContent = `${personCounts[name]} d`;
      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(num);
      personSection.appendChild(row);
    });
    content.appendChild(personSection);

  } else {
    // Histórico total — usa teamHistory acumulado
    const intro = document.createElement('div');
    intro.className = 'stats-intro';
    intro.textContent = `Días acumulados desde que se empezó a generar (todos los meses)`;
    content.appendChild(intro);

    const hist = loadTeamHistory();
    const cfg = loadGenConfig();
    const teams = cfg.teams || [];
    const histSection = document.createElement('div');
    histSection.className = 'stats-section';
    const histTitle = document.createElement('h3');
    histTitle.textContent = '🤝 Por equipo (acumulado)';
    histSection.appendChild(histTitle);

    const entries = teams.map(t => ({
      team: t,
      days: hist[teamKey(t)]?.totalDays || 0
    })).sort((a, b) => b.days - a.days);

    const maxC = Math.max(1, ...entries.map(e => e.days));
    entries.forEach(e => {
      const teamName = [e.team.a, e.team.b, e.team.c].filter(Boolean).join(' + ');
      const row = document.createElement('div');
      row.className = 'stats-row';
      const label = document.createElement('div');
      label.className = 'stats-label';
      label.textContent = teamName;
      label.style.background = colorFor(e.team.a);
      label.style.color = textColorFor(e.team.a);
      const barWrap = document.createElement('div');
      barWrap.className = 'stats-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'stats-bar';
      bar.style.width = `${(e.days / maxC) * 100}%`;
      bar.style.background = colorFor(e.team.a);
      barWrap.appendChild(bar);
      const num = document.createElement('div');
      num.className = 'stats-num';
      num.textContent = `${e.days} d`;
      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(num);
      histSection.appendChild(row);
    });
    content.appendChild(histSection);

    // Diferencia máx-mín como métrica de balance
    if (entries.length > 1) {
      const diff = entries[0].days - entries[entries.length-1].days;
      const balanceNote = document.createElement('div');
      balanceNote.className = 'stats-balance-note';
      balanceNote.innerHTML = `<b>Balance:</b> diferencia máx-mín = ${diff} días. ${diff <= 1 ? '✅ Excelente equilibrio.' : diff <= 3 ? '👍 Buen equilibrio.' : '⚠️ Equilibrio mejorable: activá la rotación automática.'}`;
      content.appendChild(balanceNote);
    }
  }
}

// ---------- Modal de cumpleaños ----------
function openBirthdaysSettings() {
  document.getElementById('birthdays-modal').classList.remove('hidden');
  renderBirthdaysSettings();
}
function closeBirthdaysSettings() {
  document.getElementById('birthdays-modal').classList.add('hidden');
}
function renderBirthdaysSettings() {
  const list = document.getElementById('birthdays-list');
  list.innerHTML = '';
  const allPeople = [...new Set([...ROSTER, ...OTROS])].sort((a,b) => a.localeCompare(b));
  const b = loadBirthdays();
  allPeople.forEach(person => {
    const row = document.createElement('div');
    row.className = 'birthdays-row';

    const name = document.createElement('div');
    name.className = 'birthdays-name';
    name.textContent = person;
    name.style.background = colorFor(person);
    name.style.color = textColorFor(person);

    const inputs = document.createElement('div');
    inputs.className = 'birthdays-inputs';

    const monthSel = document.createElement('select');
    monthSel.className = 'bd-select';
    const emptyM = document.createElement('option');
    emptyM.value = ''; emptyM.textContent = 'Mes';
    monthSel.appendChild(emptyM);
    MES_NAMES.forEach((mn, i) => {
      const o = document.createElement('option');
      o.value = String(i+1).padStart(2,'0');
      o.textContent = mn;
      monthSel.appendChild(o);
    });

    const daySel = document.createElement('select');
    daySel.className = 'bd-select';
    const emptyD = document.createElement('option');
    emptyD.value = ''; emptyD.textContent = 'Día';
    daySel.appendChild(emptyD);
    for (let d = 1; d <= 31; d++) {
      const o = document.createElement('option');
      o.value = String(d).padStart(2,'0');
      o.textContent = d;
      daySel.appendChild(o);
    }

    const stored = b[person];
    if (stored) {
      const [mm, dd] = stored.split('-');
      monthSel.value = mm;
      daySel.value = dd;
    }

    function save() {
      const mm = monthSel.value;
      const dd = daySel.value;
      if (mm && dd) {
        setBirthday(person, `${mm}-${dd}`);
      } else if (!mm && !dd) {
        setBirthday(person, null);
      }
      rerenderActiveView();
    }
    monthSel.addEventListener('change', save);
    daySel.addEventListener('change', save);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'bd-clear';
    clearBtn.textContent = '×';
    clearBtn.title = 'Quitar cumpleaños';
    clearBtn.addEventListener('click', () => {
      setBirthday(person, null);
      monthSel.value = '';
      daySel.value = '';
      rerenderActiveView();
    });

    inputs.appendChild(monthSel);
    inputs.appendChild(daySel);
    inputs.appendChild(clearBtn);

    row.appendChild(name);
    row.appendChild(inputs);
    list.appendChild(row);
  });
}

// ---------- Modal de configuración de sincronización ----------
function openSyncSettings() {
  document.getElementById('sync-modal').classList.remove('hidden');
  renderSyncSettings();
}
function closeSyncSettings() {
  document.getElementById('sync-modal').classList.add('hidden');
}
function renderSyncSettings() {
  const cfg = loadFirebaseConfig() || { firebase: {}, email: '', password: '' };
  document.getElementById('fb-apikey').value = cfg.firebase?.apiKey || '';
  document.getElementById('fb-authdomain').value = cfg.firebase?.authDomain || '';
  document.getElementById('fb-dburl').value = cfg.firebase?.databaseURL || '';
  document.getElementById('fb-projectid').value = cfg.firebase?.projectId || '';
  document.getElementById('fb-email').value = cfg.email || '';
  document.getElementById('fb-password').value = cfg.password || '';
}
function isToday(y, m, d) {
  return y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate();
}
function isWeekend(y, m, d) {
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}

// ---------- Helpers de renderización de pills (editables) ----------
// Construye una pill (div o select) para mostrar un nombre.
// opts: { editable, onChange, className, ariaLabel }
function makePill(name, opts = {}) {
  const cls = opts.className || 'pill';
  if (opts.editable) {
    const sel = document.createElement('select');
    sel.className = cls + ' pill-edit';
    if (opts.ariaLabel) sel.setAttribute('aria-label', opts.ariaLabel);
    if (name) {
      sel.style.background = colorFor(name);
      sel.style.color = textColorFor(name);
    } else {
      sel.classList.add('empty');
    }
    // Opciones: Equipo + Otros
    const empty = document.createElement('option');
    empty.value = ''; empty.textContent = '—';
    sel.appendChild(empty);
    const ogR = document.createElement('optgroup');
    ogR.label = 'Equipo';
    ROSTER.forEach(n => {
      const o = document.createElement('option');
      o.value = n; o.textContent = n;
      if (n === name) o.selected = true;
      ogR.appendChild(o);
    });
    sel.appendChild(ogR);
    const ogO = document.createElement('optgroup');
    ogO.label = 'Otros';
    OTROS.forEach(n => {
      const o = document.createElement('option');
      o.value = n; o.textContent = n;
      if (n === name) o.selected = true;
      ogO.appendChild(o);
    });
    sel.appendChild(ogO);
    // Eventos: no propagar para no abrir el panel del día
    sel.addEventListener('click', (e) => e.stopPropagation());
    sel.addEventListener('change', (e) => {
      e.stopPropagation();
      const newName = e.target.value || null;
      if (opts.onChange) opts.onChange(newName);
    });
    return sel;
  }
  // Read-only
  const pill = document.createElement('span');
  pill.className = cls;
  if (name) {
    pill.textContent = opts.abbrev ? abbrev(name) : name;
    pill.style.background = colorFor(name);
    pill.style.color = textColorFor(name);
  } else {
    pill.classList.add('empty');
    pill.textContent = '';
  }
  return pill;
}

// Renderiza los pills de un slot. Si el slot tiene UN solo nombre (otro lado null),
// devuelve UN pill ancho. Si no, devuelve 2 pills side-by-side.
// opts: { editable, day, slotIdx, className, abbrev }
function renderSlotPills(slot, opts = {}) {
  const [a, b] = slot;
  const hasA = !!a, hasB = !!b;
  const oneOnly = (hasA && !hasB) || (!hasA && hasB);

  // Full-width: cuando solo hay 1 nombre, sin importar si es team o otros
  if (oneOnly) {
    const n = hasA ? a : b;
    const sideIdx = hasA ? 0 : 1;
    const pill = makePill(n, {
      editable: opts.editable,
      className: (opts.className || 'pill') + ' pill-wide',
      abbrev: opts.abbrev,
      onChange: opts.editable ? (newName) => {
        opts.editable && opts.onChange && opts.onChange(opts.slotIdx, sideIdx, newName);
      } : null,
    });
    return [pill];
  }

  // Standard: 2 pills side by side
  return [a, b].map((n, sideIdx) => makePill(n, {
    editable: opts.editable,
    className: opts.className,
    abbrev: opts.abbrev,
    onChange: opts.editable ? (newName) => {
      opts.editable && opts.onChange && opts.onChange(opts.slotIdx, sideIdx, newName);
    } : null,
  }));
}

// Handler unificado: actualiza un nombre en data del día actual
function updateSlotName(day, slotIdx, sideIdx, newName) {
  snapshotDayBeforeEdit(day);
  if (!state.data[String(day)]) state.data[String(day)] = [];
  while (state.data[String(day)].length <= slotIdx) {
    state.data[String(day)].push([null, null]);
  }
  state.data[String(day)][slotIdx][sideIdx] = newName;
  cleanupDay(day);
  saveMonthData(state.year, state.month, state.data);
  rerenderActiveView();
  if (state.view === 'month' && state.selectedDay !== null) renderDetail();
}

// ---------- Lógica de Equipo de intervención / Equipo de apoyo ----------
function teamsEqual(t1, t2) {
  if (!t1 || !t2) return false;
  const a1 = t1[0] || '', b1 = t1[1] || '';
  const a2 = t2[0] || '', b2 = t2[1] || '';
  return (a1 === a2 && b1 === b2) || (a1 === b2 && b1 === a2);
}

// Determina si una pareja parece ser un "equipo" (gente del roster)
function isRosterTeam(pair) {
  if (!pair) return false;
  const a = pair[0], b = pair[1];
  const isRoster = (n) => n && ROSTER.indexOf(n) >= 0;
  return isRoster(a) || isRoster(b);
}

// Encuentra el primer slot que sea un equipo del roster.
// Devuelve {slot, idx} o null
function findTeamSlot(slots) {
  if (!slots) return null;
  for (let i = 0; i < slots.length; i++) {
    if (isRosterTeam(slots[i])) return { slot: slots[i], idx: i };
  }
  return null;
}

// Encuentra el slot del día que contiene un G.MAT (ALVARO o MARTIN solos).
// Retorna: { slotIdx, sideIdx, name } o null.
function findGmatSlot(slots) {
  if (!slots) return null;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    const lone = (s[0] && !s[1]) ? { side: 0, name: s[0] }
              : (!s[0] && s[1]) ? { side: 1, name: s[1] } : null;
    if (lone && GESTION_MATERIALES.includes(lone.name)) {
      return { slotIdx: i, sideIdx: lone.side, name: lone.name };
    }
  }
  return null;
}

// Devuelve los miembros del equipo presente en `slots`, incluyendo el 3ro si existe.
// Retorna: { a, b, c | null, mainSlotIdx, thirdSlotIdx | null }
function findTeamMembers(slots) {
  if (!slots) return null;
  const tRes = findTeamSlot(slots);
  if (!tRes) return null;
  const a = tRes.slot[0], b = tRes.slot[1];
  let c = null, thirdSlotIdx = null;

  // Estrategia 1: leer de la config (si el equipo del día coincide con uno definido)
  try {
    const cfg = loadGenConfig();
    const team = cfg.teams.find(t =>
      (t.a === a && t.b === b) || (t.a === b && t.b === a)
    );
    if (team && team.c) {
      for (let i = 0; i < slots.length; i++) {
        if (i === tRes.idx) continue;
        const s = slots[i];
        if (!s) continue;
        if (s[0] === team.c || s[1] === team.c) {
          c = team.c;
          thirdSlotIdx = i;
          break;
        }
      }
      // La config dice que hay 3ro pero no está en los slots: igual lo incluimos
      if (!c) c = team.c;
    }
  } catch {}

  // Estrategia 2 (FALLBACK robusto): si la config no aclara, busco un slot
  // que tenga una persona DEL ROSTER sola (no ALVARO ni MARTIN, porque son
  // los de gestión de materiales). Ese es probablemente el 3ro del equipo.
  if (!c) {
    for (let i = 0; i < slots.length; i++) {
      if (i === tRes.idx) continue;
      const s = slots[i];
      if (!s) continue;
      const single = (s[0] && !s[1]) ? s[0] : (s[1] && !s[0]) ? s[1] : null;
      if (single &&
          ROSTER.indexOf(single) >= 0 &&
          GESTION_MATERIALES.indexOf(single) === -1) {
        c = single;
        thirdSlotIdx = i;
        break;
      }
    }
  }

  return { a, b, c, mainSlotIdx: tRes.idx, thirdSlotIdx };
}

// Busca el "equipo de apoyo" = el primer equipo distinto en los próximos días.
// Devuelve { team: [a, b], members: { a, b, c }, date }
function findApoyo(y, m, d, currentTeam, maxDays = 14) {
  let dt = new Date(y, m - 1, d);
  for (let i = 0; i < maxDays; i++) {
    dt.setDate(dt.getDate() + 1);
    const yy = dt.getFullYear(), mm = dt.getMonth() + 1, dd = dt.getDate();
    const slots = getDayDataAny(yy, mm, dd);
    const tRes = findTeamSlot(slots);
    if (tRes && !teamsEqual(tRes.slot, currentTeam)) {
      const members = findTeamMembers(slots);
      return { team: tRes.slot, members, date: new Date(yy, mm - 1, dd) };
    }
  }
  return null;
}

// ---------- Filtros ----------
// Lista de equipos únicos en el mes en curso
function getMonthTeams() {
  const seen = new Map();  // key "A|B" sorted -> {a, b}
  for (const day in state.data) {
    const slots = state.data[day] || [];
    for (const slot of slots) {
      const a = slot[0], b = slot[1];
      if (a && b && ROSTER.indexOf(a) >= 0 && ROSTER.indexOf(b) >= 0) {
        const pair = [a, b].sort();
        const key = pair.join('|');
        if (!seen.has(key)) seen.set(key, { a: pair[0], b: pair[1] });
      }
    }
  }
  return Array.from(seen.values()).sort((x, y) => x.a.localeCompare(y.a));
}

function dayMatchesFilters(day) {
  const slots = state.data[String(day)] || [];
  if (!state.filterPerson && !state.filterTeam) return true;
  if (slots.length === 0) return false;

  if (state.filterPerson) {
    const has = slots.some(s => s[0] === state.filterPerson || s[1] === state.filterPerson);
    if (!has) return false;
  }
  if (state.filterTeam) {
    const t = state.filterTeam;
    const has = slots.some(s =>
      (s[0] === t.a && s[1] === t.b) || (s[0] === t.b && s[1] === t.a)
    );
    if (!has) return false;
  }
  return true;
}

function filtersActive() {
  return !!(state.filterPerson || state.filterTeam);
}

// ---------- Render: VIEW MONTH ----------
function renderMonthView() {
  document.getElementById('title').textContent = `${MES_NAMES[state.month - 1]} ${state.year}`;
  const cal = document.getElementById('cal');
  cal.innerHTML = '';

  const firstDay = new Date(state.year, state.month - 1, 1);
  let weekday = firstDay.getDay();
  weekday = weekday === 0 ? 6 : weekday - 1;
  const daysInMonth = new Date(state.year, state.month, 0).getDate();

  for (let i = 0; i < weekday; i++) {
    const e = document.createElement('div');
    e.className = 'day empty';
    cal.appendChild(e);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const el = document.createElement('div');
    el.className = 'day';
    if (isWeekend(state.year, state.month, day)) el.classList.add('weekend');
    if (isToday(state.year, state.month, day)) el.classList.add('today');
    if (state.selectedDay === day) el.classList.add('selected');
    if (isFeriado(state.year, state.month, day)) el.classList.add('feriado');
    if (isFeriaJud(state.year, state.month, day)) el.classList.add('feria-jud');
    if (filtersActive()) {
      if (dayMatchesFilters(day)) el.classList.add('filter-match');
      else el.classList.add('filtered-out');
    }

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = day;
    el.appendChild(numEl);

    // Marca de feriado / feria judicial
    if (isFeriado(state.year, state.month, day)) {
      const fer = document.createElement('span');
      fer.className = 'feriado-mark';
      fer.textContent = 'F';
      fer.title = 'Feriado';
      el.appendChild(fer);
    } else if (isFeriaJud(state.year, state.month, day)) {
      const fer = document.createElement('span');
      fer.className = 'feriado-mark feria-jud';
      fer.textContent = 'FJ';
      fer.title = 'Feria judicial';
      el.appendChild(fer);
    }

    // Marca de cumpleaños
    const bdList = birthdaysOn(state.year, state.month, day);
    if (bdList.length > 0) {
      const bd = document.createElement('span');
      bd.className = 'bd-mark';
      bd.textContent = '🎂';
      bd.title = 'Cumpleaños: ' + bdList.join(', ');
      el.appendChild(bd);
    }

    // Marca de reemplazo
    const reps = getReplacementsForDay(state.year, state.month, day);
    if (reps.length > 0) {
      const r = document.createElement('span');
      r.className = 'replacement-mark';
      r.textContent = '↪';
      r.title = reps.map(x => `${x.replacement} reemplaza a ${x.original}`).join('; ');
      el.appendChild(r);
    }

    const slots = state.data[String(day)] || [];
    const visibleSlots = slots.slice(0, 4);
    visibleSlots.forEach((slot, slotIdx) => {
      const row = document.createElement('div');
      row.className = 'slot';
      // Detectar si este slot es Gestión de materiales (solo ALVARO o MARTIN).
      // EXCEPCIÓN: en feria judicial NO se muestra como gestión de materiales —
      // ahí son "extras", aparecen como pill normal con su nombre.
      const names = [slot[0], slot[1]].filter(Boolean);
      const isFeriaDay = isFeriaJud(state.year, state.month, day);
      const isGestion = !isFeriaDay && names.length > 0 && names.every(n => GESTION_MATERIALES.includes(n));
      if (isGestion) {
        // Pill especial "GESTIÓN DE MATERIALES" con el color de la persona
        const personName = names[0];
        const pill = document.createElement('span');
        pill.className = 'pill pill-wide pill-gestion';
        pill.style.background = colorFor(personName);
        pill.style.color = textColorFor(personName);
        // En desktop muestra "GESTIÓN DE MATERIALES — ALVARO", en mobile abreviado
        pill.innerHTML = `<span class="pill-gestion-tag">📦 G. MAT.</span> <span class="pill-gestion-name">${personName}</span>`;
        pill.title = `Gestión de materiales — ${personName}`;
        row.appendChild(pill);
      } else {
        // Tiles del mes NO son editables: en mobile son muy chicos y
        // se termina seleccionando un agente sin querer al elegir el día.
        // Editar el día se hace tocando el tile → panel desplegable.
        const pills = renderSlotPills(slot, {
          editable: false,
          slotIdx,
          className: 'pill',
          abbrev: true,
        });
        pills.forEach(p => row.appendChild(p));
      }
      el.appendChild(row);
    });

    el.addEventListener('click', () => {
      // Si cambiamos a otro día, cerrar el panel "Gestionar día"
      if (state.selectedDay !== day) state._manageOpen = false;
      state.selectedDay = state.selectedDay === day ? null : day;
      renderMonthView();
      renderDetail();
      if (state.selectedDay !== null) {
        setTimeout(() => {
          document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
    cal.appendChild(el);
  }
}

// ---------- Render: VIEW WEEK ----------
function getWeekDates(y, m, d) {
  // Returns array of 7 Date objects (Mon -> Sun) containing the date (y,m,d)
  const base = new Date(y, m - 1, d);
  let dow = base.getDay();
  dow = dow === 0 ? 6 : dow - 1; // Mon=0..Sun=6
  const monday = new Date(base);
  monday.setDate(base.getDate() - dow);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    out.push(dd);
  }
  return out;
}

function renderWeekView() {
  const dates = getWeekDates(state.year, state.month, state.day);
  const first = dates[0], last = dates[6];
  const sameMonth = first.getMonth() === last.getMonth();
  let title;
  if (sameMonth) {
    title = `${MES_NAMES[first.getMonth()]} ${first.getFullYear()}`;
  } else if (first.getFullYear() === last.getFullYear()) {
    title = `${MES_NAMES[first.getMonth()].slice(0,3)} – ${MES_NAMES[last.getMonth()].slice(0,3)} ${first.getFullYear()}`;
  } else {
    title = `${MES_NAMES[first.getMonth()].slice(0,3)} ${first.getFullYear()} – ${MES_NAMES[last.getMonth()].slice(0,3)} ${last.getFullYear()}`;
  }
  document.getElementById('title').textContent = title;

  const grid = document.getElementById('week-grid');
  grid.innerHTML = '';

  dates.forEach(date => {
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const card = document.createElement('div');
    card.className = 'wk-day';
    const dow = date.getDay();
    if (dow === 0 || dow === 6) card.classList.add('weekend');
    if (isToday(y, m, d)) card.classList.add('today');
    if (state.day === d && state.month === m && state.year === y) card.classList.add('selected');
    if (isFeriado(y, m, d)) card.classList.add('feriado');
    if (isFeriaJud(y, m, d)) card.classList.add('feria-jud');
    // Aplicar filtros (solo en el mes actual)
    if (filtersActive() && y === state.year && m === state.month) {
      if (!dayMatchesFilters(d)) card.classList.add('filtered-out');
    }

    const head = document.createElement('div');
    head.className = 'wk-day-head';
    const name = document.createElement('span');
    name.className = 'wk-day-name';
    name.textContent = DAY_NAMES[dow];
    const num = document.createElement('span');
    num.className = 'wk-day-num';
    num.textContent = d;
    head.appendChild(name);
    head.appendChild(num);
    if (isFeriado(y, m, d)) {
      const fer = document.createElement('span');
      fer.className = 'wk-feriado-tag';
      fer.textContent = 'Feriado';
      head.appendChild(fer);
    } else if (isFeriaJud(y, m, d)) {
      const fer = document.createElement('span');
      fer.className = 'wk-feriado-tag feria-jud';
      fer.textContent = 'Feria Jud.';
      head.appendChild(fer);
    }
    card.appendChild(head);

    const slotsEl = document.createElement('div');
    slotsEl.className = 'wk-slots';
    const slots = getDayDataAny(y, m, d) || [];
    if (slots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'wk-day-empty';
      empty.textContent = 'Sin asignar';
      slotsEl.appendChild(empty);
    } else {
      const isCurrentMonth = (y === state.year && m === state.month);
      slots.forEach((slot, slotIdx) => {
        const row = document.createElement('div');
        row.className = 'wk-slot';
        // Detectar Gestión de materiales (ALVARO o MARTIN solos)
        // EXCEPCIÓN: en feria judicial NO aplica — son extras normales.
        const names = [slot[0], slot[1]].filter(Boolean);
        const isFeriaDay = isFeriaJud(y, m, d);
        const isGestion = !isFeriaDay && names.length > 0 && names.every(n => GESTION_MATERIALES.includes(n));
        if (isGestion) {
          const personName = names[0];
          const pill = document.createElement('span');
          pill.className = 'wk-pill pill-wide pill-gestion';
          pill.style.background = colorFor(personName);
          pill.style.color = textColorFor(personName);
          pill.innerHTML = `<span class="pill-gestion-tag">📦 G. MAT.</span> <span class="pill-gestion-name">${personName}</span>`;
          pill.title = `Gestión de materiales — ${personName}`;
          row.appendChild(pill);
        } else {
          const pills = renderSlotPills(slot, {
            editable: isCurrentMonth,
            slotIdx,
            className: 'wk-pill',
            abbrev: false,
            onChange: (sIdx, sideIdx, newName) => updateSlotName(d, sIdx, sideIdx, newName),
          });
          pills.forEach(p => row.appendChild(p));
        }
        slotsEl.appendChild(row);
      });
    }
    card.appendChild(slotsEl);

    // Click en la tarjeta abre vista día (pero los selects no propagan)
    card.addEventListener('click', () => {
      state.year = y;
      state.month = m;
      state.day = d;
      state.view = 'day';
      switchView('day');
    });
    grid.appendChild(card);
  });
}

// ---------- Render: VIEW DAY ----------
function renderDayView() {
  const y = state.year, m = state.month, d = state.day;
  const date = new Date(y, m - 1, d);
  const dayName = DAY_NAMES[date.getDay()];
  document.getElementById('title').textContent = `${MES_NAMES[m-1]} ${y}`;

  const root = document.getElementById('day-view');
  root.innerHTML = '';

  const slots = getDayDataAny(y, m, d);

  // Main day card
  const card = document.createElement('div');
  card.className = 'dv-card';
  if (isToday(y, m, d)) card.classList.add('today');

  const header = document.createElement('div');
  header.className = 'dv-header';
  const dateBox = document.createElement('div');
  dateBox.innerHTML = `<p class="dv-date">${dayName} ${d}</p><p class="dv-subdate">${MES_NAMES[m-1]} ${y}</p>`;
  header.appendChild(dateBox);
  if (isToday(y, m, d)) {
    const badge = document.createElement('span');
    badge.className = 'dv-today-badge';
    badge.textContent = 'HOY';
    header.appendChild(badge);
  }
  if (isFeriado(y, m, d)) {
    const ferBadge = document.createElement('span');
    ferBadge.className = 'dv-feriado-badge';
    ferBadge.textContent = 'FERIADO';
    header.appendChild(ferBadge);
  } else if (isFeriaJud(y, m, d)) {
    const ferBadge = document.createElement('span');
    ferBadge.className = 'dv-feriado-badge feria-jud';
    ferBadge.textContent = 'FERIA JUDICIAL';
    header.appendChild(ferBadge);
  }
  card.appendChild(header);

  // Bloque "Equipo de intervención + Apoyo" (mismo helper que en panel del Mes)
  card.appendChild(buildDayInfoBlock(y, m, d));

  // Otras filas (Gestión de Materiales, oficios, etc.)
  const teamRes = findTeamSlot(slots);
  const teamSlot = teamRes ? teamRes.slot : null;

  // Detectar el slot del 3er miembro usando findTeamMembers (mismo helper que
  // usa buildDayInfoBlock) — así si la config no lo detecta, el fallback por
  // ROSTER lo encuentra igual y NO termina como "OTROS".
  let thirdMemberSlotIdx = -1;
  const _teamMembers = findTeamMembers(slots);
  if (_teamMembers && _teamMembers.thirdSlotIdx !== null) {
    thirdMemberSlotIdx = _teamMembers.thirdSlotIdx;
  }

  if (slots && slots.length > 0) {
    const isCurrentMonth = (y === state.year && m === state.month);
    // Categorizar slots restantes en: gestion-materiales / otros
    const gestionIndices = [];
    const otherIndices = [];
    slots.forEach((s, i) => {
      if (teamSlot && teamsEqual(s, teamSlot)) return;
      if (i === thirdMemberSlotIdx) return;
      // Si el slot tiene a alguien de gestión de materiales (ALVARO o MARTIN), va a esa sección
      const namesInSlot = [s[0], s[1]].filter(Boolean);
      const hasGestion = namesInSlot.some(n => GESTION_MATERIALES.includes(n));
      const onlyGestionOrEmpty = namesInSlot.every(n => GESTION_MATERIALES.includes(n));
      if (hasGestion && onlyGestionOrEmpty) {
        gestionIndices.push(i);
      } else {
        otherIndices.push(i);
      }
    });

    // Sección GESTIÓN DE MATERIALES
    if (gestionIndices.length > 0) {
      const gSec = document.createElement('div');
      gSec.className = 'dv-section dv-section-gestion';
      const lbl = document.createElement('div');
      lbl.className = 'dv-section-label';
      lbl.textContent = '📦 Gestión de materiales';
      gSec.appendChild(lbl);
      gestionIndices.forEach(slotIdx => {
        const slot = slots[slotIdx];
        const row = document.createElement('div');
        row.className = 'dv-row';
        // Para gestión usamos un pill personalizado con dropdown restringido a ALVARO/MARTIN
        [0, 1].forEach(sideIdx => {
          const name = slot[sideIdx];
          // Sólo mostramos el lado que tiene nombre (los slots de gestión suelen ser de 1 persona)
          if (!name && sideIdx === 1) return;
          if (isCurrentMonth) {
            const sel = document.createElement('select');
            sel.className = 'di-team-pill di-team-pill-select dv-row-pill';
            if (name) {
              sel.style.background = colorFor(name);
              sel.style.color = textColorFor(name);
            } else {
              sel.classList.add('empty');
            }
            const empty = document.createElement('option');
            empty.value = ''; empty.textContent = '—';
            sel.appendChild(empty);
            GESTION_MATERIALES.forEach(opt => {
              const o = document.createElement('option');
              o.value = opt; o.textContent = opt;
              if (opt === name) o.selected = true;
              sel.appendChild(o);
            });
            sel.addEventListener('change', (e) => {
              updateSlotName(d, slotIdx, sideIdx, e.target.value || null);
            });
            row.appendChild(sel);
          } else {
            const pill = document.createElement('div');
            pill.className = 'di-team-pill dv-row-pill';
            if (name) {
              pill.textContent = name;
              pill.style.background = colorFor(name);
              pill.style.color = textColorFor(name);
            } else {
              pill.classList.add('empty');
              pill.textContent = '—';
            }
            row.appendChild(pill);
          }
        });
        gSec.appendChild(row);
      });
      card.appendChild(gSec);
    }

    // Sección OTROS (oficios, etc.)
    if (otherIndices.length > 0) {
      const otherSec = document.createElement('div');
      otherSec.className = 'dv-section';
      const lbl = document.createElement('div');
      lbl.className = 'dv-section-label';
      lbl.textContent = 'Otros';
      otherSec.appendChild(lbl);
      otherIndices.forEach((slotIdx) => {
        const slot = slots[slotIdx];
        const row = document.createElement('div');
        row.className = 'dv-row';
        const pills = renderSlotPills(slot, {
          editable: isCurrentMonth,
          slotIdx,
          className: 'dv-row-pill',
          abbrev: false,
          onChange: (sIdx, sideIdx, newName) => updateSlotName(d, sIdx, sideIdx, newName),
        });
        pills.forEach(p => row.appendChild(p));
        otherSec.appendChild(row);
      });
      card.appendChild(otherSec);
    }
  }

  // Panel "⚙️ Gestionar día" — mismo helper que se usa en el panel del Mes,
  // así desde acá podemos modificar feriado, feria judicial, reemplazos y filas.
  if (y === state.year && m === state.month) {
    card.appendChild(buildManagePanel(d));
  } else {
    // Si estamos viendo un día de otro mes, ofrecemos cambiar al mes para editar
    const note = document.createElement('button');
    note.className = 'dv-edit-btn';
    note.textContent = '✎ Editar este día (cambiar de mes)';
    note.addEventListener('click', () => {
      state.year = y; state.month = m;
      state.data = loadMonthData(y, m);
      state.selectedDay = d;
      state.view = 'month';
      switchView('month');
      setTimeout(() => {
        document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    });
    card.appendChild(note);
  }
  root.appendChild(card);
}

// ---------- Helper: bloque "Equipo de intervención + Apoyo" ----------
function buildDayInfoBlock(y, m, d, opts = {}) {
  // IMPORTANTE: slots siempre es un array (nunca null). Si el día no tiene datos
  // todavía, es [] vacío. Antes el fallback era null y crasheaba al hacer slots[1]
  // en la lógica de feria judicial. Ahora es coherente con el resto del código.
  const slots = opts.useStateData
    ? (state.data[String(d)] || [])
    : (getDayDataAny(y, m, d) || []);
  const teamRes = findTeamSlot(slots);
  const teamSlot = teamRes ? teamRes.slot : null;
  // Editable solo si los datos son del mes en curso
  const editable = !!opts.useStateData;

  // Buscar 3er miembro si el equipo es de 3 personas (config tiene .c)
  // Los equipos de 3 se guardan como [[a, b], [c, null]] en slots[]
  const members = findTeamMembers(slots);
  let thirdMember = null;
  let thirdMemberConfigName = null;
  if (members && members.c) {
    thirdMemberConfigName = members.c;
    if (members.thirdSlotIdx !== null && slots && slots[members.thirdSlotIdx]) {
      const s = slots[members.thirdSlotIdx];
      const sideIdx = s[0] === members.c ? 0 : 1;
      thirdMember = { name: members.c, slotIdx: members.thirdSlotIdx, sideIdx };
    }
  }

  const block = document.createElement('div');
  block.className = 'di-block';

  // Barra superior con botones rápidos: Feriado / Feria judicial / Editar
  // Los toggles permiten marcar/quitar feriado o feria sin abrir Gestionar día
  if (editable) {
    const editBar = document.createElement('div');
    editBar.className = 'di-edit-bar';

    // Botón rápido FERIADO (☆ → ★)
    const isFer = isFeriado(y, m, d);
    const ferBtn = document.createElement('button');
    ferBtn.className = 'di-quick-btn' + (isFer ? ' active-feriado' : '');
    ferBtn.innerHTML = isFer ? '★' : '☆';
    ferBtn.title = isFer ? 'Quitar feriado' : 'Marcar como feriado';
    ferBtn.setAttribute('aria-label', ferBtn.title);
    ferBtn.addEventListener('click', () => {
      toggleFeriado(d);
      rerenderActiveView();
      if (state.view === 'month') renderDetail();
      else if (state.view === 'day') renderDayView();
    });
    editBar.appendChild(ferBtn);

    // Botón rápido FERIA JUDICIAL (⚖)
    const isFj = isFeriaJud(y, m, d);
    const fjBtn = document.createElement('button');
    fjBtn.className = 'di-quick-btn' + (isFj ? ' active-feriajud' : '');
    fjBtn.innerHTML = '⚖';
    fjBtn.title = isFj ? 'Quitar feria judicial' : 'Marcar como feria judicial';
    fjBtn.setAttribute('aria-label', fjBtn.title);
    fjBtn.addEventListener('click', () => {
      toggleFeriaJud(d);
      rerenderActiveView();
      if (state.view === 'month') renderDetail();
      else if (state.view === 'day') renderDayView();
    });
    editBar.appendChild(fjBtn);

    // Spacer para empujar Editar a la derecha
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    editBar.appendChild(spacer);

    // Botón Gestionar equipos (antes Editar) — al activarlo muestra dropdowns
    // editables + secciones Reemplazos y G.MAT debajo
    const editBtn = document.createElement('button');
    editBtn.className = 'di-edit-btn' + (state.editingDay ? ' active' : '');
    editBtn.innerHTML = state.editingDay ? '✓ Listo' : '✎ Gestionar equipos';
    editBtn.title = 'Habilitar/cerrar gestión de equipos, reemplazos y G.MAT';
    editBtn.addEventListener('click', () => {
      state.editingDay = !state.editingDay;
      if (state.view === 'month') renderDetail();
      else if (state.view === 'day') renderDayView();
      else rerenderActiveView();
    });
    editBar.appendChild(editBtn);
    block.appendChild(editBar);
  }

  // EQUIPO DE INTERVENCIÓN
  const sec1 = document.createElement('div');
  sec1.className = 'di-section';
  const lbl1 = document.createElement('div');
  lbl1.className = 'di-label';
  lbl1.textContent = 'Equipo de intervención';
  sec1.appendChild(lbl1);
  const team1 = document.createElement('div');
  team1.className = 'di-team';

  if (teamSlot) {
    [0, 1].forEach(sideIdx => {
      const n = teamSlot[sideIdx];

      if (editable) {
        // Pill editable = un <select> estilizado
        const sel = document.createElement('select');
        sel.className = 'di-team-pill di-team-pill-select';
        if (n) {
          sel.style.background = colorFor(n);
          sel.style.color = textColorFor(n);
        } else {
          sel.classList.add('empty');
        }
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        sel.appendChild(empty);
        ROSTER.forEach(name => {
          const o = document.createElement('option');
          o.value = name; o.textContent = name;
          if (name === n) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', (e) => {
          const newName = e.target.value || null;
          snapshotDayBeforeEdit(d);
          if (!state.data[String(d)]) state.data[String(d)] = [[null, null]];
          const slotIdxLocal = teamRes ? teamRes.idx : 0;
          if (!state.data[String(d)][slotIdxLocal]) state.data[String(d)][slotIdxLocal] = [null, null];
          state.data[String(d)][slotIdxLocal][sideIdx] = newName;
          cleanupDay(d);
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView();
          if (state.view === 'month' && state.selectedDay !== null) renderDetail();
        });
        team1.appendChild(sel);
      } else {
        const pill = document.createElement('div');
        pill.className = 'di-team-pill';
        if (n) {
          pill.textContent = n;
          pill.style.background = colorFor(n);
          pill.style.color = textColorFor(n);
        } else {
          pill.classList.add('empty');
          pill.textContent = '—';
        }
        team1.appendChild(pill);
      }
    });

    // TERCER MIEMBRO (equipos de 3 personas)
    if (thirdMember || thirdMemberConfigName) {
      const thirdName = thirdMember ? thirdMember.name : thirdMemberConfigName;
      // En modo edición wrappeo la pill con un container para incluir el × de borrar
      const thirdWrap = document.createElement('div');
      thirdWrap.className = 'di-team-pill-third-wrap';

      const thirdPill = document.createElement(editable ? 'select' : 'div');
      thirdPill.className = 'di-team-pill di-team-pill-third';
      thirdPill.style.background = colorFor(thirdName);
      thirdPill.style.color = textColorFor(thirdName);
      if (editable) {
        thirdPill.classList.add('di-team-pill-select');
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        thirdPill.appendChild(empty);
        ROSTER.forEach(name => {
          const o = document.createElement('option');
          o.value = name; o.textContent = name;
          if (name === thirdName) o.selected = true;
          thirdPill.appendChild(o);
        });
        thirdPill.addEventListener('change', (e) => {
          const newName = e.target.value || null;
          snapshotDayBeforeEdit(d);
          if (!state.data[String(d)]) state.data[String(d)] = [];
          if (thirdMember && thirdMember.slotIdx !== null) {
            // Actualizar el slot existente
            if (newName === null) {
              // Borrar el slot del tercero
              state.data[String(d)].splice(thirdMember.slotIdx, 1);
            } else {
              state.data[String(d)][thirdMember.slotIdx][thirdMember.sideIdx] = newName;
            }
          } else if (newName) {
            // Agregar un slot nuevo con el tercero
            state.data[String(d)].push([newName, null]);
          }
          cleanupDay(d);
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView();
          if (state.view === 'month' && state.selectedDay !== null) renderDetail();
        });
      } else {
        thirdPill.textContent = thirdName;
      }
      thirdWrap.appendChild(thirdPill);

      // Botón × para borrar al 3er miembro (solo en modo edición y si está en slots)
      if (editable && state.editingDay && thirdMember && thirdMember.slotIdx !== null) {
        const delBtn = document.createElement('button');
        delBtn.className = 'di-pill-delete';
        delBtn.textContent = '×';
        delBtn.title = `Quitar a ${thirdName} del equipo de intervención`;
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!confirm(`¿Quitar a ${thirdName} del equipo de intervención?`)) return;
          snapshotDayBeforeEdit(d);
          state.data[String(d)].splice(thirdMember.slotIdx, 1);
          cleanupDay(d);
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView();
          if (state.view === 'month') renderDetail();
          else if (state.view === 'day') renderDayView();
          showToast(`✓ ${thirdName} quitado del equipo`);
        });
        thirdWrap.appendChild(delBtn);
      }

      team1.appendChild(thirdWrap);
    }
  } else {
    // No hay equipo asignado. Si estoy en modo edit, muestro 2 dropdowns vacíos
    // así el user puede elegir directamente desde ahí. Caso clave: enero/julio (feria)
    // sin datos generados — el user quiere poder cargar a mano sin pasar por "+".
    if (editable && state.editingDay) {
      [0, 1].forEach(sideIdx => {
        const sel = document.createElement('select');
        sel.className = 'di-team-pill di-select-pill empty';
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        sel.appendChild(empty);
        ROSTER.forEach(name => {
          const o = document.createElement('option');
          o.value = name; o.textContent = name;
          sel.appendChild(o);
        });
        sel.addEventListener('change', (e) => {
          const newName = e.target.value || null;
          if (!newName) return;
          snapshotDayBeforeEdit(d);
          if (!state.data[String(d)]) state.data[String(d)] = [];
          if (!state.data[String(d)][0]) state.data[String(d)][0] = [null, null];
          state.data[String(d)][0][sideIdx] = newName;
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView();
          if (state.view === 'month') renderDetail();
          else if (state.view === 'day') renderDayView();
        });
        team1.appendChild(sel);
      });
    } else {
      const ph = document.createElement('div');
      ph.className = 'di-team-pill empty';
      ph.style.flex = '1';
      ph.textContent = 'Sin equipo asignado';
      team1.appendChild(ph);
    }
  }
  // Botón "+" para agregar otra persona al equipo de intervención (modo edición)
  if (editable && state.editingDay) {
    const addBtn = document.createElement('button');
    addBtn.className = 'di-add-person';
    addBtn.title = 'Agregar otra persona al equipo de intervención';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => {
      // Abrir un select inline para elegir la persona a agregar
      openAddPersonForm(d, 'intervention');
    });
    team1.appendChild(addBtn);
  }
  sec1.appendChild(team1);
  block.appendChild(sec1);

  // BLOQUE DE REEMPLAZOS — sólo si estamos en el mes actualmente cargado.
  // Los reemplazos que apuntan a alguien del equipo de INTERVENCIÓN se muestran
  // entre Intervención y Apoyo. Los que apuntan al APOYO se muestran después del
  // bloque de Apoyo (más abajo). Calculamos acá la categorización.
  let interventionPeople = new Set();
  let apoyoPeople = new Set();
  let interventionReps = [];
  let apoyoReps = [];
  if (y === state.year && m === state.month) {
    // Personas del slot de intervención
    if (teamSlot) {
      if (teamSlot[0]) interventionPeople.add(teamSlot[0]);
      if (teamSlot[1]) interventionPeople.add(teamSlot[1]);
    }
    // Si el equipo tiene un tercer miembro, también lo agregamos
    if (thirdMemberConfigName) interventionPeople.add(thirdMemberConfigName);
    // Personas del apoyo (calculadas antes de tiempo para clasificar)
    const apoyoPreview = findApoyo(y, m, d, teamSlot);
    if (apoyoPreview && apoyoPreview.team) {
      if (apoyoPreview.team[0]) apoyoPeople.add(apoyoPreview.team[0]);
      if (apoyoPreview.team[1]) apoyoPeople.add(apoyoPreview.team[1]);
      // 3er miembro del apoyo si lo tiene
      if (apoyoPreview.members && apoyoPreview.members.c) {
        apoyoPeople.add(apoyoPreview.members.c);
      }
    }

    const allReps = getReplacementsForDay(y, m, d);
    allReps.forEach((rep, idx) => {
      // idx es el índice global en el array original
      const item = { rep, idx };
      if (apoyoPeople.has(rep.original) && !interventionPeople.has(rep.original)) {
        apoyoReps.push(item);
      } else {
        interventionReps.push(item);
      }
    });
  }

  // Helper: crear sección de reemplazos con título y delete por item
  function makeRepsSection(repsItems, titleText) {
    const sec = document.createElement('div');
    sec.className = 'di-section di-section-replacements';
    const lblR = document.createElement('div');
    lblR.className = 'di-label';
    lblR.textContent = `${titleText} (${repsItems.length})`;
    sec.appendChild(lblR);
    repsItems.forEach(({ rep, idx }) => {
      const item = document.createElement('div');
      item.className = 'di-rep-item';
      item.innerHTML = `<b>${rep.replacement}</b> <span class="rep-arrow">↪</span> <small>reemplaza a ${rep.original}</small>`;
      const del = document.createElement('button');
      del.className = 'di-rep-delete';
      del.textContent = '×';
      del.title = 'Quitar reemplazo';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`¿Quitar el reemplazo de ${rep.replacement} a ${rep.original}?`)) return;
        removeReplacement(d, idx);
        rerenderActiveView();
        renderDetail();
      });
      item.appendChild(del);
      sec.appendChild(item);
    });
    return sec;
  }

  // Reemplazos de intervención: entre el equipo de intervención y el de apoyo
  if (interventionReps.length > 0) {
    block.appendChild(makeRepsSection(interventionReps, 'Reemplazos del día'));
  }

  // EQUIPO DE APOYO (editable cuando edit mode está activo, igual que intervención)
  const sec2 = document.createElement('div');
  sec2.className = 'di-section';
  const lbl2 = document.createElement('div');
  lbl2.className = 'di-label';
  lbl2.textContent = 'Equipo de apoyo';
  sec2.appendChild(lbl2);

  const apoyo = (() => {
    // SI el día es feria judicial: el apoyo es el slot[1] del MISMO día
    // (no del día siguiente). Esa es la lógica especial de feria — 4 personas
    // en el mismo día divididas en 2 equipos.
    if (isFeriaJud(y, m, d)) {
      const sameDaySlot1 = slots[1];
      if (sameDaySlot1 && (sameDaySlot1[0] || sameDaySlot1[1])) {
        const fakeSlots = [sameDaySlot1];
        return {
          team: sameDaySlot1,
          members: { a: sameDaySlot1[0], b: sameDaySlot1[1], c: null, mainSlotIdx: 1, thirdSlotIdx: null },
          date: new Date(y, m - 1, d),
          isFeria: true
        };
      }
      // Feria pero sin slot[1] aún → mostrar vacío para que el "+" lo agregue
      return {
        team: [null, null],
        members: { a: null, b: null, c: null, mainSlotIdx: 1, thirdSlotIdx: null },
        date: new Date(y, m - 1, d),
        isFeria: true
      };
    }
    return findApoyo(y, m, d, teamSlot);
  })();
  const team2 = document.createElement('div');
  team2.className = 'di-team';
  if (apoyo) {
    // Buscar info del slot para poder editarlo
    const apY = apoyo.date.getFullYear();
    const apM = apoyo.date.getMonth() + 1;
    const apD = apoyo.date.getDate();
    const apSlots = getDayDataAny(apY, apM, apD);
    const apTeamRes = findTeamSlot(apSlots);
    // En feria, el apoyo es el slot[1] del MISMO día — forzar índice 1.
    // Si no fuera feria, busco el primer slot con equipo (puede ser distinto al 0
    // cuando hay reemplazos o slots vacíos antes).
    const apSlotIdx = apoyo.isFeria ? 1 : (apTeamRes ? apTeamRes.idx : 0);

    [apoyo.team[0], apoyo.team[1]].forEach((n, sideIdx) => {
      if (editable) {
        const sel = document.createElement('select');
        sel.className = 'di-team-pill di-select-pill';
        if (n) {
          sel.style.background = colorFor(n);
          sel.style.color = textColorFor(n);
        } else {
          sel.classList.add('empty');
        }
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        sel.appendChild(empty);
        ROSTER.forEach(name => {
          const o = document.createElement('option');
          o.value = name; o.textContent = name;
          if (name === n) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', (e) => {
          const newName = e.target.value || null;
          // Editar el slot del día del equipo de apoyo (puede ser otro mes)
          const isCurMonth = (apY === state.year && apM === state.month);
          let data;
          if (isCurMonth) {
            snapshotDayBeforeEdit(apD);
            data = state.data;
          } else {
            data = loadMonthData(apY, apM);
          }
          if (!data[String(apD)]) data[String(apD)] = [[null, null]];
          if (!data[String(apD)][apSlotIdx]) data[String(apD)][apSlotIdx] = [null, null];
          data[String(apD)][apSlotIdx][sideIdx] = newName;
          // Limpieza inline básica (si los dos son null, sacar el slot)
          if (!data[String(apD)][apSlotIdx][0] && !data[String(apD)][apSlotIdx][1]) {
            data[String(apD)].splice(apSlotIdx, 1);
            if (data[String(apD)].length === 0) delete data[String(apD)];
          }
          if (isCurMonth) {
            state.data = data;
            saveMonthData(state.year, state.month, state.data);
          } else {
            saveMonthData(apY, apM, data);
          }
          rerenderActiveView();
          renderDetail();
        });
        team2.appendChild(sel);
      } else {
        const pill = document.createElement('div');
        pill.className = 'di-team-pill';
        if (n) {
          pill.textContent = n;
          pill.style.background = colorFor(n);
          pill.style.color = textColorFor(n);
        } else {
          pill.classList.add('empty');
          pill.textContent = '—';
        }
        team2.appendChild(pill);
      }
    });

    // 3er miembro del equipo de APOYO (si es de 3 personas)
    if (apoyo.members && apoyo.members.c) {
      const thirdName = apoyo.members.c;
      const thirdSlotIdx = apoyo.members.thirdSlotIdx;
      const thirdWrap = document.createElement('div');
      thirdWrap.className = 'di-team-pill-third-wrap';
      if (editable) {
        const sel = document.createElement('select');
        sel.className = 'di-team-pill di-select-pill di-team-pill-third';
        sel.style.background = colorFor(thirdName);
        sel.style.color = textColorFor(thirdName);
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        sel.appendChild(empty);
        ROSTER.forEach(name => {
          const o = document.createElement('option');
          o.value = name; o.textContent = name;
          if (name === thirdName) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', (e) => {
          const newName = e.target.value || null;
          const isCurMonth = (apY === state.year && apM === state.month);
          let data;
          if (isCurMonth) {
            snapshotDayBeforeEdit(apD);
            data = state.data;
          } else {
            data = loadMonthData(apY, apM);
          }
          if (!data[String(apD)]) data[String(apD)] = [];
          if (thirdSlotIdx !== null && data[String(apD)][thirdSlotIdx]) {
            if (newName === null) {
              data[String(apD)].splice(thirdSlotIdx, 1);
            } else {
              // Reemplazar manteniendo la posición existente
              const s = data[String(apD)][thirdSlotIdx];
              const sIdx = (s[0] === thirdName) ? 0 : 1;
              data[String(apD)][thirdSlotIdx][sIdx] = newName;
            }
          } else if (newName) {
            data[String(apD)].push([newName, null]);
          }
          if (isCurMonth) {
            state.data = data;
            saveMonthData(state.year, state.month, state.data);
          } else {
            saveMonthData(apY, apM, data);
          }
          rerenderActiveView();
          renderDetail();
        });
        thirdWrap.appendChild(sel);

        // × para borrar al 3er miembro del apoyo (modo edición)
        if (state.editingDay && thirdSlotIdx !== null) {
          const delBtn = document.createElement('button');
          delBtn.className = 'di-pill-delete';
          delBtn.textContent = '×';
          delBtn.title = `Quitar a ${thirdName} del equipo de apoyo`;
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!confirm(`¿Quitar a ${thirdName} del equipo de apoyo?`)) return;
            const isCurMonth = (apY === state.year && apM === state.month);
            let data;
            if (isCurMonth) {
              snapshotDayBeforeEdit(apD);
              data = state.data;
            } else {
              data = loadMonthData(apY, apM);
            }
            if (data[String(apD)] && data[String(apD)][thirdSlotIdx]) {
              data[String(apD)].splice(thirdSlotIdx, 1);
            }
            if (isCurMonth) {
              state.data = data;
              saveMonthData(state.year, state.month, state.data);
            } else {
              saveMonthData(apY, apM, data);
            }
            rerenderActiveView();
            if (state.view === 'month') renderDetail();
            else if (state.view === 'day') renderDayView();
            showToast(`✓ ${thirdName} quitado del apoyo`);
          });
          thirdWrap.appendChild(delBtn);
        }
      } else {
        const pill = document.createElement('div');
        pill.className = 'di-team-pill di-team-pill-third';
        pill.textContent = thirdName;
        pill.style.background = colorFor(thirdName);
        pill.style.color = textColorFor(thirdName);
        thirdWrap.appendChild(pill);
      }
      team2.appendChild(thirdWrap);
    }

    sec2.appendChild(team2);
    // Nota "Entra el ..." solo si NO es feria (en feria el apoyo es el mismo día)
    if (!apoyo.isFeria) {
      const note = document.createElement('div');
      note.className = 'di-note';
      const ap = apoyo.date;
      const apDayName = DAY_NAMES[ap.getDay()];
      note.textContent = `Entra el ${apDayName} ${ap.getDate()} de ${MES_NAMES[ap.getMonth()].toLowerCase()}`;
      sec2.appendChild(note);
    }
  } else {
    const ph = document.createElement('div');
    ph.className = 'di-team-pill empty';
    ph.style.flex = '1';
    ph.textContent = 'No definido aún';
    team2.appendChild(ph);
    sec2.appendChild(team2);
  }
  // Botón "+" para agregar persona al equipo de Apoyo (modo edición, solo en mes actual)
  if (editable && state.editingDay && apoyo) {
    const addBtn = document.createElement('button');
    addBtn.className = 'di-add-person';
    addBtn.title = 'Agregar otra persona al equipo de apoyo';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => {
      // Para el apoyo, el slot que editamos es el del día apoyo.date
      const apY = apoyo.date.getFullYear();
      const apM = apoyo.date.getMonth() + 1;
      const apD = apoyo.date.getDate();
      openAddPersonForm(d, 'apoyo', { y: apY, m: apM, d: apD });
    });
    team2.appendChild(addBtn);
  }
  block.appendChild(sec2);

  // Reemplazos del APOYO: van debajo del bloque de Apoyo
  if (apoyoReps.length > 0) {
    block.appendChild(makeRepsSection(apoyoReps, 'Reemplazos del apoyo'));
  }

  // ===== Cuando el botón "Gestionar equipos" está activo (state.editingDay):
  //       mostramos abajo Reemplazos + Gestión de Materiales (este último solo
  //       en sábado/domingo no-feria, ya que ahí no aplica). =====
  if (editable && state.editingDay) {
    // --- Sección REEMPLAZOS ---
    const repsSection = document.createElement('div');
    repsSection.className = 'di-edit-extra-section';
    const repsLabel = document.createElement('div');
    repsLabel.className = 'manage-section-label';
    const dayReps = getReplacementsForDay(y, m, d);
    repsLabel.textContent = `↪ Reemplazos${dayReps.length > 0 ? ` (${dayReps.length})` : ''}`;
    repsSection.appendChild(repsLabel);
    repsSection.appendChild(buildReplacementsBlock(d));
    block.appendChild(repsSection);

    // --- Sección GESTIÓN DE MATERIALES (sábado/domingo no-feria) ---
    const dow = new Date(y, m - 1, d).getDay();
    const isWeekendDay = (dow === 0 || dow === 6);
    const isFeriaDay = isFeriaJud(y, m, d);
    if (isWeekendDay && !isFeriaDay) {
      const gmatSection = document.createElement('div');
      gmatSection.className = 'di-edit-extra-section';
      const gmatLabel = document.createElement('div');
      gmatLabel.className = 'manage-section-label';
      gmatLabel.textContent = '📦 Gestión de Materiales';
      gmatSection.appendChild(gmatLabel);

      const gmat = findGmatSlot(slots);
      const gmatPickerWrap = document.createElement('div');
      gmatPickerWrap.className = 'di-gmat-picker';

      const sel = document.createElement('select');
      sel.className = 'di-team-pill di-select-pill';
      // Opción vacía + ALVARO + MARTIN
      ['', ...GESTION_MATERIALES].forEach(name => {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = name || '— sin asignar —';
        if (gmat && gmat.name === name) o.selected = true;
        sel.appendChild(o);
      });
      if (gmat) {
        sel.style.background = colorFor(gmat.name);
        sel.style.color = textColorFor(gmat.name);
        sel.style.fontWeight = '600';
      }
      sel.addEventListener('change', (e) => {
        const newName = e.target.value || null;
        snapshotDayBeforeEdit(d);
        if (!state.data[String(d)]) state.data[String(d)] = [];
        // Si ya había un G.MAT asignado, lo reemplazo o lo quito
        if (gmat) {
          if (!newName) {
            // Quitar el slot del G.MAT
            state.data[String(d)].splice(gmat.slotIdx, 1);
            if (state.data[String(d)].length === 0) delete state.data[String(d)];
          } else {
            // Reemplazar el nombre en el mismo slot/side
            state.data[String(d)][gmat.slotIdx][gmat.sideIdx] = newName;
          }
        } else if (newName) {
          // Agregar nuevo slot G.MAT
          state.data[String(d)].push([newName, null]);
        }
        saveMonthData(state.year, state.month, state.data);
        rerenderActiveView();
        if (state.view === 'month') renderDetail();
        else if (state.view === 'day') renderDayView();
        showToast(newName ? `📦 G.MAT: ${newName}` : 'G.MAT quitado');
      });
      gmatPickerWrap.appendChild(sel);
      gmatSection.appendChild(gmatPickerWrap);

      const hint = document.createElement('div');
      hint.className = 'di-gmat-hint';
      hint.textContent = 'Alterna Alvaro/Martín cada finde (asignado automáticamente al generar).';
      gmatSection.appendChild(hint);

      block.appendChild(gmatSection);
    }
  }

  return block;
}

// Estilo del select-pill: hereda el estilo de .di-team-pill pero como <select>

// ---------- Render: detalle (info + edición opcional) ----------
function renderDetail() {
  const det = document.getElementById('detail');
  const mainArea = document.querySelector('.main-area');
  if (state.selectedDay === null) {
    det.innerHTML = '';
    mainArea.classList.remove('has-detail');
    state.editingDay = false;
    return;
  }
  mainArea.classList.add('has-detail');
  const day = state.selectedDay;
  const date = new Date(state.year, state.month - 1, day);
  const dayName = DAY_NAMES[date.getDay()];
  const slots = state.data[String(day)] || [];

  const card = document.createElement('div');
  card.className = 'detail-card';

  // Cabecera con título + flechita para cerrar el panel
  const headerRow = document.createElement('div');
  headerRow.className = 'detail-header-row';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'detail-title-wrap';
  const title = document.createElement('h3');
  title.textContent = `${dayName} ${day}`;
  titleWrap.appendChild(title);
  const sub = document.createElement('p');
  sub.className = 'date-sub';
  sub.textContent = `${MES_NAMES[state.month - 1]} ${state.year}`;
  titleWrap.appendChild(sub);
  headerRow.appendChild(titleWrap);

  // Flechita ⌃ para cerrar el panel del día
  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail-close-btn';
  closeBtn.innerHTML = '⌃';
  closeBtn.title = 'Cerrar panel del día';
  closeBtn.setAttribute('aria-label', 'Cerrar panel del día');
  closeBtn.addEventListener('click', () => {
    state.selectedDay = null;
    state.editingDay = false;
    state._manageOpen = false;
    renderMonthView();
    renderDetail();
  });
  headerRow.appendChild(closeBtn);

  card.appendChild(headerRow);

  // Bloque "Equipo de intervención + Apoyo" (sólo lectura)
  card.appendChild(buildDayInfoBlock(state.year, state.month, day, { useStateData: true }));

  // Panel "Gestionar día" (mismo helper que la vista Día — comparten experiencia)
  card.appendChild(buildManagePanel(day));

  // Botón Deshacer (solo visible en modo edición y si hay historia)
  if (state.editingDay && hasHistory(state.year, state.month, day)) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'undo-btn';
    undoBtn.innerHTML = '↶ Deshacer último cambio';
    undoBtn.addEventListener('click', () => undoDay(day));
    card.appendChild(undoBtn);
  }

  det.innerHTML = '';
  det.appendChild(card);
}

// ---------- Deshacer ----------
function undoDay(day) {
  const prev = popHistory(state.year, state.month, day);
  if (prev === null) {
    showToast('No hay cambios para deshacer');
    return;
  }
  if (!prev || prev.length === 0) {
    delete state.data[String(day)];
  } else {
    state.data[String(day)] = prev;
  }
  saveMonthData(state.year, state.month, state.data);
  rerenderActiveView();
  if (state.selectedDay !== null) renderDetail();
  showToast('Cambio deshecho');
}

function createNameSelect(currentValue, onChange) {
  const sel = document.createElement('select');
  const empty = document.createElement('option');
  empty.value = ''; empty.textContent = '—';
  sel.appendChild(empty);

  const groups = [
    { label: 'Equipo', items: ROSTER },
    { label: 'Otros', items: OTROS },
  ];
  groups.forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.label;
    g.items.forEach(n => {
      const o = document.createElement('option');
      o.value = n; o.textContent = n;
      if (n === currentValue) o.selected = true;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  sel.addEventListener('change', (e) => onChange(e.target.value));
  return sel;
}

function cleanupDay(day) {
  const k = String(day);
  if (!state.data[k]) return;
  const hasContent = state.data[k].some(s => s[0] || s[1]);
  if (!hasContent) delete state.data[k];
}

// ---------- View switching ----------
function switchView(view) {
  state.view = view;
  document.querySelectorAll('.vt').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  ['month', 'week', 'day'].forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== view);
  });
  // Hide edit panel when not in month view
  if (view !== 'month') {
    state.selectedDay = null;
    renderDetail();
  }
  rerenderActiveView();
}

function rerenderActiveView() {
  if (state.view === 'month') renderMonthView();
  else if (state.view === 'week') renderWeekView();
  else renderDayView();
}

// ---------- Navegación ----------
function navPrev() {
  if (state.view === 'month') {
    state.month--;
    if (state.month < 1) { state.month = 12; state.year--; }
    state.selectedDay = null;
    reloadCurrentMonth();
    renderMonthView(); renderDetail(); renderFilters();
  } else if (state.view === 'week') {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() - 7);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    reloadCurrentMonth();
    renderWeekView(); renderFilters();
  } else {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() - 1);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    reloadCurrentMonth();
    renderDayView(); renderFilters();
  }
}
function navNext() {
  if (state.view === 'month') {
    state.month++;
    if (state.month > 12) { state.month = 1; state.year++; }
    state.selectedDay = null;
    reloadCurrentMonth();
    renderMonthView(); renderDetail(); renderFilters();
  } else if (state.view === 'week') {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() + 7);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    reloadCurrentMonth();
    renderWeekView(); renderFilters();
  } else {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() + 1);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    reloadCurrentMonth();
    renderDayView(); renderFilters();
  }
}
function goToday() {
  const now = new Date();  // siempre actual, no cacheado al inicio
  const wasToday = (state.year === now.getFullYear() &&
                    state.month === now.getMonth() + 1 &&
                    state.day === now.getDate());

  state.year = now.getFullYear();
  state.month = now.getMonth() + 1;
  state.day = now.getDate();
  state.selectedDay = state.view === 'month' ? state.day : null;
  state._manageOpen = false;  // cerrar panel "Gestionar día" si estaba abierto
  reloadCurrentMonth();
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
  renderFilters();
  document.getElementById('picker').classList.add('hidden');

  // Scroll al detalle si estamos en vista Mes (para ver de un toque quién está hoy)
  if (state.view === 'month') {
    setTimeout(() => {
      const det = document.getElementById('detail');
      if (det) det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
  showToast(wasToday ? '📅 Ya estás en hoy' : '📅 Hoy: ' + DAY_NAMES[now.getDay()] + ' ' + now.getDate());
}
function jumpTo(y, m) {
  state.year = y; state.month = m;
  state.day = Math.min(state.day, new Date(y, m, 0).getDate());
  state.selectedDay = null;
  reloadCurrentMonth();
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
  renderFilters();
}

// ---------- Picker ----------
function renderPicker() {
  const monthSel = document.getElementById('month-select');
  monthSel.innerHTML = '';
  MES_NAMES.forEach((name, i) => {
    const o = document.createElement('option');
    o.value = String(i + 1); o.textContent = name;
    if ((i + 1) === state.month) o.selected = true;
    monthSel.appendChild(o);
  });
  monthSel.onchange = (e) => jumpTo(state.year, parseInt(e.target.value));

  const yearSel = document.getElementById('year-select');
  yearSel.innerHTML = '';
  const ty = today.getFullYear();
  for (let y = ty - 5; y <= ty + 5; y++) {
    const o = document.createElement('option');
    o.value = String(y); o.textContent = y;
    if (y === state.year) o.selected = true;
    yearSel.appendChild(o);
  }
  yearSel.onchange = (e) => jumpTo(parseInt(e.target.value), state.month);
}

// ---------- Filtros (UI) ----------
function renderFilters() {
  const pSel = document.getElementById('filter-person');
  const tSel = document.getElementById('filter-team');
  const clearBtn = document.getElementById('clear-filters');

  // Persona
  pSel.innerHTML = '';
  const optAllP = document.createElement('option');
  optAllP.value = ''; optAllP.textContent = 'Todas las personas';
  pSel.appendChild(optAllP);

  const ogE = document.createElement('optgroup'); ogE.label = 'Equipo';
  ROSTER.forEach(n => {
    const o = document.createElement('option');
    o.value = n; o.textContent = n;
    if (n === state.filterPerson) o.selected = true;
    ogE.appendChild(o);
  });
  pSel.appendChild(ogE);

  const ogO = document.createElement('optgroup'); ogO.label = 'Otros';
  OTROS.forEach(n => {
    const o = document.createElement('option');
    o.value = n; o.textContent = n;
    if (n === state.filterPerson) o.selected = true;
    ogO.appendChild(o);
  });
  pSel.appendChild(ogO);

  pSel.classList.toggle('active', !!state.filterPerson);

  // Equipo (basado en el mes en curso)
  tSel.innerHTML = '';
  const optAllT = document.createElement('option');
  optAllT.value = ''; optAllT.textContent = 'Todos los equipos del mes';
  tSel.appendChild(optAllT);

  const teams = getMonthTeams();
  teams.forEach(t => {
    const o = document.createElement('option');
    o.value = `${t.a}|${t.b}`;
    o.textContent = `${t.a} + ${t.b}`;
    if (state.filterTeam && state.filterTeam.a === t.a && state.filterTeam.b === t.b) {
      o.selected = true;
    }
    tSel.appendChild(o);
  });

  tSel.classList.toggle('active', !!state.filterTeam);
  clearBtn.classList.toggle('hidden', !filtersActive());
}

function applyPersonFilter(name) {
  state.filterPerson = name || null;
  renderFilters();
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
}
function applyTeamFilter(key) {
  if (!key) {
    state.filterTeam = null;
  } else {
    const [a, b] = key.split('|');
    state.filterTeam = { a, b };
  }
  renderFilters();
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
}
function clearAllFilters() {
  state.filterPerson = null;
  state.filterTeam = null;
  renderFilters();
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
}

// ---------- Menú & toast ----------
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function exportData() {
  const all = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX) && key !== STORAGE_VERSION_KEY) {
      const mk = key.slice(STORAGE_PREFIX.length);
      try { all[mk] = JSON.parse(localStorage.getItem(key)); } catch {}
    }
  }
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `turnos-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Datos exportados');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      let count = 0;
      for (const key in data) {
        if (/^\d{4}-\d{2}$/.test(key)) {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data[key]));
          count++;
        }
      }
      showToast(`${count} meses importados`);
      reloadCurrentMonth();
      rerenderActiveView(); renderDetail();
    } catch (err) {
      showToast('Archivo inválido'); console.error(err);
    }
  };
  reader.readAsText(file);
}

function clearCurrentMonth() {
  if (!confirm(`¿Borrar todos los datos de ${MES_NAMES[state.month - 1]} ${state.year}?`)) return;
  const y = state.year, m = state.month;
  const mKey = `${y}-${String(m).padStart(2, '0')}`;
  // Limpiar localStorage completamente para todas las claves del mes
  // (así el push posterior no incluye estas claves y el otro dispositivo las borra)
  localStorage.removeItem(`turnos:${mKey}`);
  localStorage.removeItem(`turnos:feriado:${mKey}`);
  localStorage.removeItem(`turnos:feria_jud:${mKey}`);
  localStorage.removeItem(`turnos:replacements:${mKey}`);
  localStorage.removeItem(`turnos:person_colors_month:${mKey}`);
  // Estado en memoria
  state.data = {};
  state._feriados = {};
  state._feriaJud = {};
  state._replacements = {};
  state.selectedDay = null;
  state._manageOpen = false;
  state.editingDay = false;
  rerenderActiveView();
  renderDetail();
  showToast('Mes borrado');
  // Forzar push inmediato (sin esperar el debounce) si hay sync activo
  scheduleCloudPush();
}

// ---------- Modal: Configuración del generador ----------
function openGenSettings() {
  const modal = document.getElementById('gen-modal');
  modal.classList.remove('hidden');
  renderGenSettings();
}

function closeGenSettings() {
  document.getElementById('gen-modal').classList.add('hidden');
}

function updateGenDayCounter() {
  const cfg = loadGenConfig();
  const counter = document.getElementById('gen-day-counter');
  if (!counter) return;
  const totalMax = cfg.teams.reduce((sum, t) => sum + (t.maxDays || 0), 0);
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  const monthName = MES_NAMES[state.month - 1];

  let baseMsg;
  if (totalMax === daysInMonth) {
    counter.className = 'gen-day-counter green';
    baseMsg = `✓ Total cupos: <b>${totalMax}</b> = ${daysInMonth} días de ${monthName}`;
  } else if (totalMax < daysInMonth) {
    counter.className = 'gen-day-counter red';
    baseMsg = `⚠ Total cupos: <b>${totalMax}</b> &lt; ${daysInMonth} días de ${monthName} — faltan ${daysInMonth - totalMax} día(s)`;
  } else {
    counter.className = 'gen-day-counter yellow';
    baseMsg = `Total cupos: <b>${totalMax}</b> &gt; ${daysInMonth} días de ${monthName} — sobran ${totalMax - daysInMonth} día(s)`;
  }

  // Si la rotación automática está activa, mostrar preview de quién tendrá cupo alto este mes
  if (loadAutoRotate() && cfg.teams.length > 0) {
    const teamHistory = loadTeamHistory();
    const teamKeys = cfg.teams.map(t => teamKey(t));
    const effective = computeRotatedMaxes(cfg.teams, teamHistory, teamKeys);
    const userMaxes = cfg.teams.map(t => t.maxDays || 0);
    const maxVal = Math.max(...userMaxes);
    const minVal = Math.min(...userMaxes);
    if (maxVal !== minVal) {
      const highTeams = cfg.teams
        .map((t, i) => ({ name: shortTeamName(t), maxThis: effective[i] }))
        .filter(x => x.maxThis === maxVal)
        .map(x => x.name);
      baseMsg += `<br><small>🔄 Este mes con cupo alto (${maxVal}): <b>${highTeams.join(', ')}</b></small>`;
    }
  }

  counter.innerHTML = baseMsg;
}

function shortTeamName(t) {
  const parts = [t.a, t.b];
  if (t.c) parts.push(t.c);
  return parts.filter(Boolean).map(n => n.substring(0, 4)).join('+');
}

function renderGenSettings() {
  const cfg = loadGenConfig();
  const list = document.getElementById('gen-teams-list');
  list.innerHTML = '';

  // Estado del toggle de rotación automática
  const toggle = document.getElementById('gen-auto-rotate-toggle');
  if (toggle) toggle.checked = loadAutoRotate();

  // Contador inicial
  updateGenDayCounter();

  cfg.teams.forEach((team, idx) => {
    const row = document.createElement('div');
    row.className = 'gen-team-row';

    const makeSelect = (val, onChange, allowEmpty = false) => {
      const sel = document.createElement('select');
      if (allowEmpty) {
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        sel.appendChild(empty);
      } else {
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '—';
        sel.appendChild(empty);
      }
      ROSTER.forEach(n => {
        const o = document.createElement('option');
        o.value = n; o.textContent = n;
        if (n === val) o.selected = true;
        sel.appendChild(o);
      });
      if (val) {
        sel.style.background = colorFor(val);
        sel.style.color = textColorFor(val);
      }
      sel.addEventListener('change', (e) => onChange(e.target.value));
      return sel;
    };

    const selA = makeSelect(team.a, (v) => {
      cfg.teams[idx].a = v || null;
      saveGenConfig(cfg);
      renderGenSettings();
    });
    const selB = makeSelect(team.b, (v) => {
      cfg.teams[idx].b = v || null;
      saveGenConfig(cfg);
      renderGenSettings();
    });

    // Tercera persona opcional
    let thirdEl;
    if (team.c) {
      const wrap = document.createElement('div');
      wrap.className = 'gen-third-wrap';
      const selC = makeSelect(team.c, (v) => {
        cfg.teams[idx].c = v || null;
        if (!v) delete cfg.teams[idx].c;
        saveGenConfig(cfg);
        renderGenSettings();
      });
      const remC = document.createElement('button');
      remC.className = 'gen-third-rem';
      remC.textContent = '×';
      remC.title = 'Sacar 3ra persona';
      remC.addEventListener('click', () => {
        delete cfg.teams[idx].c;
        saveGenConfig(cfg);
        renderGenSettings();
      });
      wrap.appendChild(selC);
      wrap.appendChild(remC);
      thirdEl = wrap;
    } else {
      const addBtn = document.createElement('button');
      addBtn.className = 'gen-third-add';
      addBtn.textContent = '+';
      addBtn.title = 'Agregar 3ra persona';
      addBtn.addEventListener('click', () => {
        cfg.teams[idx].c = ROSTER[0];
        saveGenConfig(cfg);
        renderGenSettings();
      });
      thirdEl = addBtn;
    }

    const maxWrap = document.createElement('div');
    maxWrap.style.display = 'flex';
    maxWrap.style.flexDirection = 'column';
    maxWrap.style.alignItems = 'center';
    const maxInp = document.createElement('input');
    maxInp.type = 'number';
    maxInp.className = 'max-days';
    maxInp.min = '1'; maxInp.max = '31';
    maxInp.value = team.maxDays || 9;
    maxInp.addEventListener('change', (e) => {
      cfg.teams[idx].maxDays = parseInt(e.target.value) || 9;
      saveGenConfig(cfg);
      updateGenDayCounter();
    });
    // Live update mientras tipea
    maxInp.addEventListener('input', (e) => {
      cfg.teams[idx].maxDays = parseInt(e.target.value) || 0;
      updateGenDayCounter();
    });
    const lbl = document.createElement('span');
    lbl.className = 'max-days-label';
    lbl.textContent = 'máx/mes';
    maxWrap.appendChild(maxInp);
    maxWrap.appendChild(lbl);

    const delBtn = document.createElement('button');
    delBtn.className = 'gen-del';
    delBtn.textContent = '×';
    delBtn.title = 'Eliminar equipo';
    delBtn.addEventListener('click', () => {
      if (cfg.teams.length <= 1) { showToast('Tiene que haber al menos 1 equipo'); return; }
      cfg.teams.splice(idx, 1);
      saveGenConfig(cfg);
      renderGenSettings();
    });

    row.appendChild(selA);
    row.appendChild(selB);
    row.appendChild(thirdEl);
    row.appendChild(maxWrap);
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}

// ---------- Modal: Colores de personas ----------
function openColorsSettings() {
  document.getElementById('colors-modal').classList.remove('hidden');
  renderColorsSettings();
}
function closeColorsSettings() {
  document.getElementById('colors-modal').classList.add('hidden');
}
// Estado del modal: si está editando colores "solo este mes" o "globales"
let _colorsScope = 'global';  // 'global' | 'month'

function renderColorsSettings() {
  const list = document.getElementById('colors-list');
  list.innerHTML = '';

  const globalColors = loadPersonColors();
  const monthColors = loadPersonColorsMonth(state.year, state.month);
  const isMonthMode = _colorsScope === 'month';
  const activeColors = isMonthMode ? monthColors : globalColors;

  // Header con toggle global/mensual
  const scopeHeader = document.createElement('div');
  scopeHeader.className = 'colors-scope-header';
  const monthLabel = `${MES_NAMES[state.month-1]} ${state.year}`;
  scopeHeader.innerHTML = `
    <div class="colors-scope-toggle">
      <button class="scope-btn ${!isMonthMode ? 'active' : ''}" data-scope="global">🌐 Todos los meses</button>
      <button class="scope-btn ${isMonthMode ? 'active' : ''}" data-scope="month">📅 Solo ${monthLabel}</button>
    </div>
    <div class="colors-scope-note">
      ${isMonthMode
        ? `Los cambios afectan SOLO a <b>${monthLabel}</b>. Para volver al color general, usá la ↺ al lado del nombre.`
        : `Los cambios afectan a TODOS los meses (excepto los que tengan override mensual).`}
    </div>
  `;
  list.appendChild(scopeHeader);
  scopeHeader.querySelectorAll('.scope-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _colorsScope = btn.dataset.scope;
      renderColorsSettings();
    });
  });

  // Cuando es modo mes y hay overrides, mostrar botón "borrar todos los overrides del mes"
  if (isMonthMode && Object.keys(monthColors).length > 0) {
    const clearMonthBtn = document.createElement('button');
    clearMonthBtn.className = 'colors-clear-month-btn';
    clearMonthBtn.textContent = `🗑️ Borrar todos los colores especiales de ${monthLabel}`;
    clearMonthBtn.addEventListener('click', () => {
      if (!confirm(`¿Borrar TODOS los colores especiales de ${monthLabel}? Volverán a usar los colores generales.`)) return;
      clearPersonColorsMonth(state.year, state.month);
      rerenderActiveView();
      renderColorsSettings();
      showToast('Colores del mes borrados');
    });
    list.appendChild(clearMonthBtn);
  }

  const groups = [
    { label: 'Equipo (15 personas)', items: ROSTER },
    { label: 'Otros', items: OTROS }
  ];

  groups.forEach(g => {
    const groupLbl = document.createElement('div');
    groupLbl.className = 'colors-group-label';
    groupLbl.textContent = g.label;
    list.appendChild(groupLbl);

    g.items.forEach(name => {
      const row = document.createElement('div');
      row.className = 'colors-row';

      // En modo mes, marcar visualmente si esta persona tiene override mensual
      const hasMonthOverride = !!monthColors[name];
      if (isMonthMode && hasMonthOverride) row.classList.add('has-month-override');

      // Color actual: si modo mes, mostramos el override mensual (si hay), sino el efectivo
      // Si modo global, mostramos el global (sin tener en cuenta override mensual)
      let currentColor;
      if (isMonthMode) {
        currentColor = monthColors[name] || globalColors[name] || COLORS[name] || '#E5E5EA';
      } else {
        currentColor = globalColors[name] || COLORS[name] || '#E5E5EA';
      }

      const preview = document.createElement('div');
      preview.className = 'colors-preview';
      preview.style.background = currentColor;
      preview.style.color = (function(){
        if (WHITE_TEXT.has(name)) return '#FFFFFF';
        const c = currentColor;
        if (c.startsWith('#')) {
          const r = parseInt(c.slice(1, 3), 16);
          const g2 = parseInt(c.slice(3, 5), 16);
          const b = parseInt(c.slice(5, 7), 16);
          const lum = (0.299 * r + 0.587 * g2 + 0.114 * b);
          return lum < 130 ? '#FFFFFF' : '#1c1c1e';
        }
        return '#1c1c1e';
      })();
      preview.textContent = name;
      if (isMonthMode && hasMonthOverride) {
        const tag = document.createElement('span');
        tag.className = 'month-override-tag';
        tag.textContent = '📅';
        tag.title = 'Color especial de este mes';
        preview.appendChild(tag);
      }

      const input = document.createElement('input');
      input.type = 'color';
      input.value = currentColor;
      input.className = 'colors-input';
      input.addEventListener('change', (e) => {
        if (isMonthMode) {
          const mc = loadPersonColorsMonth(state.year, state.month);
          mc[name] = e.target.value;
          savePersonColorsMonth(state.year, state.month, mc);
        } else {
          const c = loadPersonColors();
          c[name] = e.target.value;
          savePersonColors(c);
        }
        rerenderActiveView();
        renderColorsSettings();
      });

      const resetBtn = document.createElement('button');
      resetBtn.className = 'colors-reset-one';
      resetBtn.textContent = '↺';
      resetBtn.title = isMonthMode ? 'Quitar el color especial de este mes' : 'Volver al color default';
      resetBtn.addEventListener('click', () => {
        if (isMonthMode) {
          const mc = loadPersonColorsMonth(state.year, state.month);
          delete mc[name];
          savePersonColorsMonth(state.year, state.month, mc);
        } else {
          const c = loadPersonColors();
          delete c[name];
          savePersonColors(c);
        }
        rerenderActiveView();
        renderColorsSettings();
      });

      const label = document.createElement('label');
      label.className = 'colors-label-wrap';
      label.appendChild(input);

      row.appendChild(preview);
      row.appendChild(label);
      row.appendChild(resetBtn);
      list.appendChild(row);
    });
  });
}

// ---------- Configuración del generador (storage) ----------
function loadGenConfig() {
  try {
    const raw = localStorage.getItem(GEN_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default desde data.js
  return { teams: deepCopy(DEFAULT_TEAMS) };
}
function saveGenConfig(cfg) {
  try {
    localStorage.setItem(GEN_CONFIG_KEY, JSON.stringify(cfg));
    scheduleCloudPush();
  } catch (e) { console.warn('Save gen config error', e); }
}
function loadWeekendRotation() {
  return parseInt(localStorage.getItem(WEEKEND_ROT_KEY) || '0', 10);
}
function saveWeekendRotation(idx) {
  localStorage.setItem(WEEKEND_ROT_KEY, String(idx));
  scheduleCloudPush();
}
// Historial de los team indices de los últimos N findes (el último al final).
// Cross-month: se persiste y se lee al generar cada mes, así no se resetea.
function loadRecentWeekends() {
  try {
    const v = JSON.parse(localStorage.getItem(WEEKEND_RECENT_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
function saveRecentWeekends(arr) {
  // Mantengo solo los últimos N (un poco más que MIN_GAP por seguridad)
  const trimmed = arr.slice(-(WEEKEND_RECENT_MIN_GAP + 2));
  localStorage.setItem(WEEKEND_RECENT_KEY, JSON.stringify(trimmed));
  scheduleCloudPush();
}

// ---------- Historial cross-month de equipos (para balanceo) ----------
// Cada equipo identificado por su "key" (nombres ordenados alfabéticamente).
// Si la composición del equipo cambia, queda como una entrada nueva.
function teamKey(team) {
  const parts = [team.a, team.b];
  if (team.c) parts.push(team.c);
  return parts.filter(Boolean).sort().join('|');
}

// Reconstruye el historial (recentWeekends, weekendIdx, teamHistory) escaneando TODOS
// los meses persistidos en localStorage, EXCEPTO el mes que se está regenerando.
// Esto asegura que las regeneraciones del mismo mes no se contaminen con la versión
// anterior — cada vez se parte de un estado coherente con los demás meses guardados.
function rebuildHistoryFromMonths(excludeY, excludeM) {
  const cfg = loadGenConfig();
  const teams = cfg.teams || [];
  const teamKeys = teams.map(t => teamKey(t));
  // Encontrar índice del equipo por sus dos miembros (a, b)
  const findTeamIdxByNames = (a, b) => {
    if (!a || !b) return -1;
    return teams.findIndex(t =>
      (t.a === a && t.b === b) || (t.a === b && t.b === a)
    );
  };

  // Colectar todos los meses guardados (formato turnos:YYYY-MM)
  const monthKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const match = key && key.match(/^turnos:(\d{4})-(\d{2})$/);
    if (match) {
      const yy = parseInt(match[1], 10);
      const mm = parseInt(match[2], 10);
      // Excluir el mes que se está regenerando, y enero/julio (feria judicial)
      // que tienen patrones distintos a la rotación normal.
      if (yy === excludeY && mm === excludeM) continue;
      if (mm === 1 || mm === 7) continue;
      monthKeys.push({ y: yy, m: mm, key });
    }
  }
  // Ordenar cronológicamente (los más antiguos primero)
  monthKeys.sort((a, b) => (a.y * 12 + a.m) - (b.y * 12 + b.m));

  const recentWeekends = [];
  let weekendIdx = 0;
  const teamHistory = {};
  // lastGmat: el último (más reciente) Alvaro/Martín que hizo G.MAT en un finde no-feria.
  // Sirve para alternarlo: el próximo finde, el OTRO hará G.MAT.
  let lastGmat = null;

  monthKeys.forEach(({ y, m, key }) => {
    let data;
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); }
    catch { return; }
    const dim = new Date(y, m, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const slot = data[String(d)] && data[String(d)][0];
      if (!slot || !slot[0] || !slot[1]) continue;
      const teamIdx = findTeamIdxByNames(slot[0], slot[1]);
      if (teamIdx < 0) continue;

      // Sumar al historial total
      const k = teamKeys[teamIdx];
      if (!teamHistory[k]) teamHistory[k] = { totalDays: 0 };
      teamHistory[k].totalDays++;

      // Si es sábado, agregar a recentWeekends y avanzar weekendIdx
      const dt = new Date(y, m - 1, d);
      if (dt.getDay() === 6) {
        recentWeekends.push(teamIdx);
        weekendIdx++;
      }
    }
    // Escaneo paralelo: encontrar el último ALVARO/MARTIN que hizo G.MAT en sábado.
    // (Como monthKeys está ordenado, el último que se encuentre es el más reciente.)
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(y, m - 1, d);
      if (dt.getDay() !== 6) continue;
      const daySlots = data[String(d)] || [];
      for (const s of daySlots) {
        if (!s) continue;
        const name = s[0] || s[1];
        if (name === 'ALVARO' || name === 'MARTIN') {
          lastGmat = name;
        }
      }
    }
  });

  return { recentWeekends, weekendIdx, teamHistory, lastGmat };
}
function loadTeamHistory() {
  try {
    return JSON.parse(localStorage.getItem(TEAM_HISTORY_KEY) || '{}');
  } catch { return {}; }
}
function saveTeamHistory(h) {
  try {
    localStorage.setItem(TEAM_HISTORY_KEY, JSON.stringify(h));
    scheduleCloudPush();
  } catch (e) { console.warn('Save team history error', e); }
}
function resetTeamHistory() {
  localStorage.removeItem(TEAM_HISTORY_KEY);
}

// ---------- Rotación automática de cupos altos entre meses ----------
function loadAutoRotate() {
  return localStorage.getItem(GEN_AUTO_ROTATE_KEY) === '1';
}
function saveAutoRotate(on) {
  if (on) localStorage.setItem(GEN_AUTO_ROTATE_KEY, '1');
  else localStorage.removeItem(GEN_AUTO_ROTATE_KEY);
  scheduleCloudPush();
}

// Calcula los maxDays "rotados" para este mes:
// - Toma los maxDays que definió el usuario (template de cupos)
// - Los reasigna ordenando los equipos por su historial total ascendente
//   (equipos con menos días totales reciben los maxDays más altos)
// - Así, en el largo plazo, todos los equipos van rotando entre cupos altos y bajos
function computeRotatedMaxes(teams, teamHistory, teamKeys) {
  const userMaxes = teams.map(t => t.maxDays || 0);
  // Template ordenado descendente (e.g., [5, 5, 5, 4, 4, 4, 4])
  const template = [...userMaxes].sort((a, b) => b - a);

  // Historial total de días por equipo
  const histDays = teams.map((_, i) => (teamHistory[teamKeys[i]]?.totalDays || 0));

  // Índices ordenados por historial ascendente (menos usados primero)
  // En caso de empate, los índices más bajos van primero (estable, determinista)
  const sortedIdx = histDays
    .map((d, i) => ({ i, d }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .map(x => x.i);

  const result = new Array(teams.length);
  sortedIdx.forEach((teamIdx, position) => {
    result[teamIdx] = template[position];
  });
  return result;
}

// ---------- Feriados nacionales de Argentina ----------
// Algoritmo de Pascua (Gregoriano anónimo)
function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const mm = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * mm + 114) / 31);
  const day = ((h + l - 7 * mm + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getArgentinaHolidays(year) {
  const easter = easterDate(year);
  const goodFri = new Date(easter); goodFri.setDate(easter.getDate() - 2);
  const carnLun = new Date(easter); carnLun.setDate(easter.getDate() - 48);
  const carnMar = new Date(easter); carnMar.setDate(easter.getDate() - 47);

  return [
    { month: 1,  day: 1,  name: 'Año Nuevo' },
    { month: carnLun.getMonth() + 1, day: carnLun.getDate(), name: 'Carnaval' },
    { month: carnMar.getMonth() + 1, day: carnMar.getDate(), name: 'Carnaval' },
    { month: 3,  day: 24, name: 'Día de la Memoria' },
    { month: 4,  day: 2,  name: 'Veteranos de Malvinas' },
    { month: goodFri.getMonth() + 1, day: goodFri.getDate(), name: 'Viernes Santo' },
    { month: 5,  day: 1,  name: 'Día del Trabajador' },
    { month: 5,  day: 25, name: 'Revolución de Mayo' },
    { month: 6,  day: 17, name: 'Güemes' },
    { month: 6,  day: 20, name: 'Belgrano' },
    { month: 7,  day: 9,  name: 'Día de la Independencia' },
    { month: 8,  day: 17, name: 'San Martín' },
    { month: 10, day: 12, name: 'Diversidad Cultural' },
    { month: 11, day: 20, name: 'Soberanía Nacional' },
    { month: 12, day: 8,  name: 'Inmaculada Concepción' },
    { month: 12, day: 25, name: 'Navidad' }
  ];
}

// Precarga los feriados nacionales para el año actual (todos los meses).
// Solo agrega los que no estuvieran marcados ya, no pisa los manuales.
function preloadArgentinaHolidays() {
  const y = state.year;
  if (!confirm(`Precargar todos los feriados nacionales de Argentina para ${y}?`)) return;
  const holidays = getArgentinaHolidays(y);
  let totalAdded = 0;
  const byMonth = {};
  holidays.forEach(h => {
    if (!byMonth[h.month]) byMonth[h.month] = [];
    byMonth[h.month].push(h.day);
  });
  for (const mStr in byMonth) {
    const m = parseInt(mStr);
    const existing = loadFeriados(y, m);
    let added = 0;
    byMonth[mStr].forEach(d => {
      if (!existing[String(d)]) {
        existing[String(d)] = true;
        added++;
      }
    });
    if (added > 0) {
      saveFeriados(y, m, existing);
      totalAdded += added;
    }
  }
  // Recargar el mes actual
  state._feriados = loadFeriados(state.year, state.month);
  rerenderActiveView();
  if (state.selectedDay !== null) renderDetail();
  if (totalAdded === 0) {
    showToast('Los feriados ya estaban marcados');
  } else {
    showToast(`${totalAdded} feriado(s) cargado(s) para ${y}`);
  }
}

// ---------- Generador de mes ----------
// Lógica:
// - Por semana hay 4 "slots" de turnos:
//   · Lunes + Martes (2 días, 1 equipo)
//   · Miércoles + Jueves (2 días, 1 equipo)
//   · Viernes (1 día, 1 equipo)
//   · Sábado + Domingo (2 días, 1 equipo)  ← rotación global
// - El slot de FIN DE SEMANA rota globalmente: cada nuevo fin de semana
//   le toca al siguiente equipo en la lista, ciclando todos los equipos.
// - Los slots de SEMANA se asignan al equipo menos usado del mes (balanceado)
//   sin repetir un equipo dentro de la misma semana.
// - Se respetan los topes (maxDays por equipo) y los feriados ya marcados.
function generateMonth() {
  const cfg = loadGenConfig();
  const teams = cfg.teams || [];
  if (teams.length < 4) {
    showToast('Definí al menos 4 equipos en la configuración');
    openGenSettings();
    return;
  }

  const y = state.year, m = state.month;

  // === CHECK 0: feria judicial (enero y julio) — no se genera con la lógica habitual ===
  // En estos meses los equipos rotan de forma distinta, así que la generación automática
  // queda inhabilitada. El usuario los carga manualmente o marca los días con feria judicial.
  if (m === 1 || m === 7) {
    alert(`${MES_NAMES[m-1]} es mes de feria judicial. La generación automática no se aplica porque los equipos rotan de forma diferente.\n\nPodés cargar los turnos manualmente o marcar los días con feria judicial desde el panel del día.`);
    return;
  }

  // === CHECK 1: el mes anterior tiene que tener datos (continuidad) ===
  const prevY = m === 1 ? y - 1 : y;
  const prevM = m === 1 ? 12 : m - 1;
  // Para febrero y agosto (que vienen DESPUÉS de feria judicial), saltamos el check
  // de continuidad porque enero/julio no se generan automáticamente.
  const prevIsFeriaJud = (prevM === 1 || prevM === 7);
  const prevData = loadMonthData(prevY, prevM);
  if (!prevIsFeriaJud) {
    if (Object.keys(prevData).length === 0) {
      alert(`No se puede generar ${MES_NAMES[m-1]} ${y}.\n\nPrimero generá ${MES_NAMES[prevM-1]} ${prevY} (no tiene datos) para que el generador pueda continuar la rotación.`);
      return;
    }
  }

  const msg = `Esto va a reemplazar TODOS los turnos de ${MES_NAMES[state.month - 1]} ${state.year} con una asignación generada. ¿Continuar?`;
  if (!confirm(msg)) return;

  const daysInMonth = new Date(y, m, 0).getDate();
  const newData = {};
  const usage = teams.map(() => 0);

  // RECONSTRUIR el historial desde TODOS los meses persistidos (excluyendo el actual
  // y enero/julio de feria). Esto evita que las regeneraciones del mismo mes se
  // contaminen con los datos de la generación anterior. Cada vez que regenerás, el
  // algoritmo arranca con un historial limpio y coherente.
  const rebuilt = rebuildHistoryFromMonths(y, m);
  let weekendIdx = rebuilt.weekendIdx;
  const recentWeekends = rebuilt.recentWeekends;
  const teamHistory = rebuilt.teamHistory;
  // Para alternar Alvaro/Martín en G.MAT cada finde
  let lastGmat = rebuilt.lastGmat;
  const teamKeys = teams.map(t => teamKey(t));
  const histDays = teams.map((_, i) => (teamHistory[teamKeys[i]]?.totalDays || 0));
  const unassignedDays = [];

  // Si el mes anterior es feria (enero o julio), recolectar los equipos que
  // trabajaron en su última semana. Esos equipos deben descansar en la PRIMERA
  // semana del mes actual (ej: febrero después de enero, agosto después de julio).
  const postFeriaRestTeams = new Set();
  if (prevM === 1 || prevM === 7) {
    const prevDim = new Date(prevY, prevM, 0).getDate();
    const startD = Math.max(1, prevDim - 6);
    for (let dd = startD; dd <= prevDim; dd++) {
      const daySlots = prevData[String(dd)] || [];
      daySlots.forEach(slot => {
        if (!slot || !slot[0] || !slot[1]) return;
        const tIdx = teams.findIndex(t =>
          (t.a === slot[0] && t.b === slot[1]) || (t.a === slot[1] && t.b === slot[0])
        );
        if (tIdx >= 0) postFeriaRestTeams.add(tIdx);
      });
    }
  }

  // Si la rotación automática está activa, recalcular los maxDays para este mes
  // (los equipos con menos historial reciben los cupos más altos)
  const autoRotateOn = loadAutoRotate();
  const effectiveMaxes = autoRotateOn
    ? computeRotatedMaxes(teams, teamHistory, teamKeys)
    : teams.map(t => t.maxDays || 0);

  // Helper: buscar índice del equipo que coincide con una dupla [a, b]
  function findTeamIdxBySlot(slotPair) {
    if (!slotPair) return -1;
    return teams.findIndex(t =>
      (t.a === slotPair[0] && t.b === slotPair[1]) ||
      (t.a === slotPair[1] && t.b === slotPair[0])
    );
  }

  // Helper: equipos bloqueados por cumpleaños en alguno de los días dados
  function teamsBlockedByBirthday(days) {
    const blocked = new Set();
    for (const d of days) {
      if (d === null) continue;
      const bd = birthdaysOn(y, m, d);
      if (bd.length === 0) continue;
      teams.forEach((t, i) => {
        const members = [t.a, t.b, t.c].filter(Boolean);
        if (members.some(name => bd.includes(name))) blocked.add(i);
      });
    }
    return blocked;
  }

  function canUse(idx, addDays) {
    const max = effectiveMaxes[idx] != null ? effectiveMaxes[idx] : Infinity;
    return (usage[idx] + addDays) <= max;
  }

  // Score: equipos con menos días este mes Y menos días históricos son preferidos.
  // Peso fuerte al mes actual, suave al historial.
  function effectiveScore(idx) {
    return usage[idx] * 10 + histDays[idx];
  }

  // Elige el mejor equipo disponible.
  // - excludeHard: no se pueden usar (cap hit, ya usados esta semana, restricciones)
  // - preferAvoid: preferir no usar (soft constraint, se ignora si no hay otra opción)
  function pickBest(excludeHard, addDays, preferAvoid) {
    let bestIdx = -1, bestScore = Infinity;
    for (let i = 0; i < teams.length; i++) {
      if (excludeHard.has(i)) continue;
      if (preferAvoid && preferAvoid.has(i)) continue;
      if (!canUse(i, addDays)) continue;
      const s = effectiveScore(i);
      if (s < bestScore) { bestIdx = i; bestScore = s; }
    }
    if (bestIdx >= 0) return bestIdx;
    // Fallback: ignorar preferAvoid
    for (let i = 0; i < teams.length; i++) {
      if (excludeHard.has(i)) continue;
      if (!canUse(i, addDays)) continue;
      const s = effectiveScore(i);
      if (s < bestScore) { bestIdx = i; bestScore = s; }
    }
    return bestIdx;
  }

  // Asignar slot completo (1+ días al mismo equipo). Salta feriados.
  // Devuelve el índice del equipo asignado o -1 si no se pudo.
  function assignSlot(teamIdx, days) {
    if (teamIdx < 0) return -1;
    const t = teams[teamIdx];
    const members = [t.a, t.b, t.c].filter(Boolean);
    days.forEach(d => {
      if (d === null) return;
      if (isSkipDay(y, m, d)) return;
      // Si algún miembro del equipo cumple años ese día, NO asignar
      const bd = birthdaysOn(y, m, d);
      if (members.some(name => bd.includes(name))) {
        unassignedDays.push(d);
        return;
      }
      const slots = [[t.a, t.b]];
      if (t.c) slots.push([t.c, null]);
      newData[String(d)] = slots;
      usage[teamIdx]++;
    });
    return teamIdx;
  }

  // Asignar un slot de 2 días: primero intenta un solo equipo. Si no hay,
  // PARTE el slot en 2 equipos distintos (1 día cada uno).
  function assignTwoDaySlot(days, excludeHard, preferAvoid) {
    const realDays = days.filter(d => d !== null && !isSkipDay(y, m, d));
    const addDays = realDays.length;
    if (addDays === 0) return -1;

    // Intento 1: un solo equipo para los 2 días
    const idx = pickBest(excludeHard, addDays, preferAvoid);
    if (idx >= 0) {
      assignSlot(idx, days);
      return idx;
    }

    // Intento 2: partir en 2 equipos distintos (1 día cada uno)
    // Solo si hay realmente 2 días reales y la asignación de 2 falló por cap
    if (addDays === 2) {
      const localUsed = new Set(excludeHard);
      let lastUsed = -1;
      for (const d of days) {
        if (d === null || isSkipDay(y, m, d)) continue;
        const i = pickBest(localUsed, 1, preferAvoid);
        if (i >= 0) {
          assignSlot(i, [d]);
          localUsed.add(i);
          lastUsed = i;
        } else {
          unassignedDays.push(d);
        }
      }
      return lastUsed;
    }

    // No se pudo
    days.forEach(d => {
      if (d !== null && !isSkipDay(y, m, d)) unassignedDays.push(d);
    });
    return -1;
  }

  // Agrupar días por semana (Lun=arranque)
  const weeks = [];
  let current = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(y, m - 1, d);
    let dow = dt.getDay();
    dow = dow === 0 ? 6 : dow - 1; // 0=Lun ... 6=Dom
    if (current === null || dow === 0) {
      current = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
      weeks.push(current);
    }
    current[dow] = d;
  }

  // === CONTINUIDAD CROSS-MONTH ===
  // Si el mes anterior terminó en medio de un slot (Lun, Mié o Sáb),
  // el día 1 del mes nuevo continúa ese slot con el mismo equipo.
  const prevDaysInMonth = new Date(prevY, prevM, 0).getDate();
  const lastDayOfPrev = new Date(prevY, prevM - 1, prevDaysInMonth);
  const lastDow = lastDayOfPrev.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  const lastTeamSlot = prevData[String(prevDaysInMonth)]?.[0];
  const lastTeamIdx = findTeamIdxBySlot(lastTeamSlot);

  let preAssignedDay1 = false;
  let preAssignedSlotType = null;  // 'monTue' | 'wedThu' | 'satSun'
  let preAssignedTeamIdx = -1;

  if (lastTeamIdx >= 0) {
    if (lastDow === 1)      preAssignedSlotType = 'monTue';  // Lun → Mar arranca nuevo mes
    else if (lastDow === 3) preAssignedSlotType = 'wedThu';  // Mié → Jue
    else if (lastDow === 6) preAssignedSlotType = 'satSun';  // Sáb → Dom

    if (preAssignedSlotType) {
      // Pre-asignar día 1 al mismo equipo (completa el slot que arrancó el mes pasado)
      assignSlot(lastTeamIdx, [1]);
      preAssignedDay1 = true;
      preAssignedTeamIdx = lastTeamIdx;
    }
  }

  // === INICIALIZAR lastSlotTeam Y lastWeekFridayTeam DESDE LA ÚLTIMA SEMANA COMPLETA DEL MES ANTERIOR ===
  // La "última semana completa" es la que termina antes del slot que cruza meses
  // (o la última semana del mes si no hay cruce).
  let spanStart;
  if (lastDow === 0) spanStart = null;  // Domingo: la semana cerró exactamente, sin cruce
  else spanStart = prevDaysInMonth - (lastDow - 1);  // Lun=1 → spanStart=lastDay; Sáb=6 → spanStart=lastDay-5

  const lastFullWeekEnd = spanStart !== null ? spanStart - 1 : prevDaysInMonth;
  const lastFullWeekStart = Math.max(1, lastFullWeekEnd - 6);

  // Track del último equipo en cada slot la semana anterior
  // Reglas HARD:
  //   1. Mismo equipo NO puede hacer el mismo slot 2 semanas seguidas
  //   2. Si un equipo hizo VIERNES la semana pasada, solo puede hacer
  //      el fin de semana (no Lun-Mar, Mié-Jue, Vie de esta semana)
  let lastWeekFridayTeam = -1;   // descansa esta semana excepto en finde
  const lastSlotTeam = { weekend: -1, monTue: -1, wedThu: -1, fri: -1 };

  // Tracking del equipo del finde de la SEMANA ANTERIOR (no la actual).
  // Esto evita que el equipo que hizo Sáb-Dom haga también Lun-Mar de la semana
  // siguiente (4 días consecutivos, descanso necesario). Lo agregamos a restExclude.
  let prevWeekendTeamIdx = -1;

  // Para CADA equipo, registro qué tipo de slot SEMANAL hizo la última vez.
  // Así, cuando el equipo vuelve a tocar la semana siguiente, le preferimos
  // un slot distinto al que hizo. Ej: si hizo Mié-Jue, prefiero darle Lun-Mar.
  // Valores posibles: 'monTue' | 'wedThu' | 'fri' | undefined.
  const teamLastWeekdaySlot = {};

  // Recorrer la última semana completa del mes anterior buscando los equipos por slot
  for (let d = lastFullWeekEnd; d >= lastFullWeekStart; d--) {
    if (d < 1) break;
    const dt = new Date(prevY, prevM - 1, d);
    const dow = dt.getDay();  // 0=Dom, 1=Lun, ..., 6=Sáb
    const slot = prevData[String(d)]?.[0];
    if (!slot) continue;
    const teamIdx = findTeamIdxBySlot(slot);
    if (teamIdx < 0) continue;

    if (dow === 1 || dow === 2) {
      if (lastSlotTeam.monTue < 0) lastSlotTeam.monTue = teamIdx;
    } else if (dow === 3 || dow === 4) {
      if (lastSlotTeam.wedThu < 0) lastSlotTeam.wedThu = teamIdx;
    } else if (dow === 5) {
      if (lastSlotTeam.fri < 0) lastSlotTeam.fri = teamIdx;
      if (lastWeekFridayTeam < 0) lastWeekFridayTeam = teamIdx;
    } else {
      if (lastSlotTeam.weekend < 0) lastSlotTeam.weekend = teamIdx;
    }
  }

  // Si hay pre-asignación (slot que cruza meses), actualizar lastSlotTeam para que
  // la semana siguiente no repita ese mismo equipo en el mismo slot
  if (preAssignedDay1) {
    if (preAssignedSlotType === 'monTue')      lastSlotTeam.monTue = preAssignedTeamIdx;
    else if (preAssignedSlotType === 'wedThu') lastSlotTeam.wedThu = preAssignedTeamIdx;
    else if (preAssignedSlotType === 'satSun') lastSlotTeam.weekend = preAssignedTeamIdx;
  }

  weeks.forEach((wk, weekIdx) => {
    const used = new Set();

    // Si en la primera semana ya pre-asignamos el día 1, marcamos el equipo como
    // "usado en esta semana" para que no se repita en otros slots de la misma semana
    if (weekIdx === 0 && preAssignedDay1) {
      used.add(preAssignedTeamIdx);
    }

    // === Slot Sat-Sun: rotación global + evitar últimos 6 findes ===
    const hasSat = wk[5] !== null;
    const hasSun = wk[6] !== null;
    let thisWeekendTeam = -1;
    if ((hasSat || hasSun) && !(weekIdx === 0 && preAssignedSlotType === 'satSun')) {
      const realCount = (hasSat && !isSkipDay(y, m, wk[5]) ? 1 : 0) +
                        (hasSun && !isSkipDay(y, m, wk[6]) ? 1 : 0);
      // HARD: no los últimos 6 findes + bloqueo por cumpleaños
      // (eran solo el finde anterior; ahora son hasta 6 atrás para que no se repita
      // tan rápido y la rotación sea pareja entre los 7 equipos)
      const hardExclude = new Set(used);
      recentWeekends.slice(-WEEKEND_RECENT_MIN_GAP).forEach(i => hardExclude.add(i));
      teamsBlockedByBirthday([wk[5], wk[6]]).forEach(i => hardExclude.add(i));

      // Buscar siguiente equipo en rotación que cumpla
      let attempts = 0;
      while (attempts < teams.length * 2) {
        const candidate = weekendIdx % teams.length;
        if (canUse(candidate, realCount) && !hardExclude.has(candidate)) {
          thisWeekendTeam = candidate;
          break;
        }
        weekendIdx++;
        attempts++;
      }
      // Fallback 1: relajar a últimos 3 findes (no los 6) si quedan pocos equipos
      if (thisWeekendTeam < 0) {
        const softExclude = new Set(used);
        recentWeekends.slice(-3).forEach(i => softExclude.add(i));
        teamsBlockedByBirthday([wk[5], wk[6]]).forEach(i => softExclude.add(i));
        attempts = 0;
        while (attempts < teams.length * 2) {
          const candidate = weekendIdx % teams.length;
          if (canUse(candidate, realCount) && !softExclude.has(candidate)) {
            thisWeekendTeam = candidate;
            break;
          }
          weekendIdx++;
          attempts++;
        }
      }
      // Fallback 2: ignorar restricción de findes recientes si no queda otra
      if (thisWeekendTeam < 0) {
        attempts = 0;
        while (attempts < teams.length * 2) {
          const candidate = weekendIdx % teams.length;
          if (canUse(candidate, realCount) && !used.has(candidate)) {
            thisWeekendTeam = candidate;
            break;
          }
          weekendIdx++;
          attempts++;
        }
      }
      // Último recurso: el menos usado
      if (thisWeekendTeam < 0) thisWeekendTeam = pickBest(used, realCount, null);

      // Asignar (con posible split si no hay 1 equipo para 2 días)
      if (realCount === 2 && thisWeekendTeam < 0) {
        thisWeekendTeam = assignTwoDaySlot([wk[5], wk[6]], used, null);
      } else if (thisWeekendTeam >= 0) {
        assignSlot(thisWeekendTeam, [wk[5], wk[6]]);
      }
      if (thisWeekendTeam >= 0) {
        used.add(thisWeekendTeam);
        lastSlotTeam.weekend = thisWeekendTeam;
        recentWeekends.push(thisWeekendTeam);
        weekendIdx++;

        // GESTIÓN DE MATERIALES: alternar Alvaro/Martín cada finde no-feria.
        // Si el último fue ALVARO, este finde es MARTIN, y viceversa.
        // (en feria no se asigna G.MAT — la lógica los considera "extras" ahí)
        const currentGmat = lastGmat === 'ALVARO' ? 'MARTIN' : 'ALVARO';
        if (hasSat && wk[5] !== null) {
          if (!newData[String(wk[5])]) newData[String(wk[5])] = [];
          newData[String(wk[5])].push([currentGmat, null]);
        }
        if (hasSun && wk[6] !== null) {
          if (!newData[String(wk[6])]) newData[String(wk[6])] = [];
          newData[String(wk[6])].push([currentGmat, null]);
        }
        lastGmat = currentGmat;
      }
    } else if (weekIdx === 0 && preAssignedSlotType === 'satSun') {
      // Slot Sáb-Dom ya pre-asignado (día 1 = Domingo, continúa el slot del mes anterior)
      thisWeekendTeam = preAssignedTeamIdx;
      lastSlotTeam.weekend = preAssignedTeamIdx;
    }

    // === Construir el set "hard exclude" extra para slots de semana ===
    // El equipo que hizo VIERNES la semana pasada NO puede hacer Lun-Mar/Mié-Jue/Vie
    // y tampoco el equipo que hizo el FIN DE SEMANA anterior (descanso post-finde,
    // para que no haga 4 días consecutivos: Sáb-Dom-Lun-Mar)
    const restExclude = new Set();
    if (lastWeekFridayTeam >= 0) restExclude.add(lastWeekFridayTeam);
    if (prevWeekendTeamIdx >= 0) restExclude.add(prevWeekendTeamIdx);
    // En la PRIMERA semana, si venimos de un mes de feria (enero/julio), los equipos
    // que trabajaron en su última semana descansan en la primera del mes actual.
    if (weekIdx === 0) {
      postFeriaRestTeams.forEach(t => restExclude.add(t));
    }

    // === Slot Lun-Mar ===
    const hasMon = wk[0] !== null, hasTue = wk[1] !== null;
    if ((hasMon || hasTue) && !(weekIdx === 0 && preAssignedSlotType === 'monTue')) {
      // HARD: ya usado esta semana + descanso post-viernes + slot consecutivo + cumpleaños
      const hardExclude = new Set(used);
      restExclude.forEach(i => hardExclude.add(i));
      if (lastSlotTeam.monTue >= 0) hardExclude.add(lastSlotTeam.monTue);
      teamsBlockedByBirthday([wk[0], wk[1]]).forEach(i => hardExclude.add(i));

      // SOFT (preferAvoid): equipos cuyo último slot semanal fue también Lun-Mar.
      // Así rota: si Frias hizo Lun-Mar la vez pasada, prefiero darle Mié-Jue o Vie.
      const preferAvoid = new Set();
      teams.forEach((_, i) => {
        if (teamLastWeekdaySlot[i] === 'monTue') preferAvoid.add(i);
      });

      const idx = assignTwoDaySlot([wk[0], wk[1]], hardExclude, preferAvoid);
      if (idx >= 0) {
        used.add(idx);
        lastSlotTeam.monTue = idx;
        teamLastWeekdaySlot[idx] = 'monTue';
      }
    } else if (weekIdx === 0 && preAssignedSlotType === 'monTue') {
      // Slot Lun-Mar ya pre-asignado (día 1 = Martes, continúa)
      lastSlotTeam.monTue = preAssignedTeamIdx;
      teamLastWeekdaySlot[preAssignedTeamIdx] = 'monTue';
    }

    // === Slot Mié-Jue ===
    const hasWed = wk[2] !== null, hasThu = wk[3] !== null;
    if ((hasWed || hasThu) && !(weekIdx === 0 && preAssignedSlotType === 'wedThu')) {
      const hardExclude = new Set(used);
      restExclude.forEach(i => hardExclude.add(i));
      if (lastSlotTeam.wedThu >= 0) hardExclude.add(lastSlotTeam.wedThu);
      teamsBlockedByBirthday([wk[2], wk[3]]).forEach(i => hardExclude.add(i));

      const preferAvoid = new Set();
      teams.forEach((_, i) => {
        if (teamLastWeekdaySlot[i] === 'wedThu') preferAvoid.add(i);
      });

      const idx = assignTwoDaySlot([wk[2], wk[3]], hardExclude, preferAvoid);
      if (idx >= 0) {
        used.add(idx);
        lastSlotTeam.wedThu = idx;
        teamLastWeekdaySlot[idx] = 'wedThu';
      }
    } else if (weekIdx === 0 && preAssignedSlotType === 'wedThu') {
      lastSlotTeam.wedThu = preAssignedTeamIdx;
      teamLastWeekdaySlot[preAssignedTeamIdx] = 'wedThu';
    }

    // === Slot Viernes ===
    const hasFri = wk[4] !== null;
    let thisWeekFriTeam = -1;
    if (hasFri) {
      const hardExclude = new Set(used);
      restExclude.forEach(i => hardExclude.add(i));
      if (lastSlotTeam.fri >= 0) hardExclude.add(lastSlotTeam.fri);
      teamsBlockedByBirthday([wk[4]]).forEach(i => hardExclude.add(i));

      const preferAvoid = new Set();
      teams.forEach((_, i) => {
        if (teamLastWeekdaySlot[i] === 'fri') preferAvoid.add(i);
      });

      thisWeekFriTeam = pickBest(hardExclude, 1, preferAvoid);
      if (thisWeekFriTeam >= 0) {
        assignSlot(thisWeekFriTeam, [wk[4]]);
        used.add(thisWeekFriTeam);
        lastSlotTeam.fri = thisWeekFriTeam;
        teamLastWeekdaySlot[thisWeekFriTeam] = 'fri';
      } else if (!isSkipDay(y, m, wk[4])) {
        unassignedDays.push(wk[4]);
      }
    }

    // Al final de la semana: actualizar el "descanso post-viernes"
    // (si esta semana hubo viernes asignado, ese equipo descansa la próxima
    //  semana excepto en el finde)
    lastWeekFridayTeam = thisWeekFriTeam;
    // El equipo del finde de ESTA semana se convierte en "previo" para la próxima
    // (para evitar que haga también Lun-Mar de la próxima semana → descanso post-finde)
    if (thisWeekendTeam >= 0) {
      prevWeekendTeamIdx = thisWeekendTeam;
    } else if (weekIdx === 0 && preAssignedSlotType === 'satSun') {
      prevWeekendTeamIdx = preAssignedTeamIdx;
    }
  });

  // Guardar mes
  state.data = newData;
  saveMonthData(y, m, newData);
  saveWeekendRotation(weekendIdx);
  saveRecentWeekends(recentWeekends);

  // Actualizar historial cross-month
  teams.forEach((t, idx) => {
    const k = teamKeys[idx];
    if (!teamHistory[k]) teamHistory[k] = { totalDays: 0 };
    teamHistory[k].totalDays += usage[idx];
  });
  saveTeamHistory(teamHistory);

  state.selectedDay = null;
  rerenderActiveView(); renderDetail();

  if (unassignedDays.length > 0) {
    showToast(`Turnos generados. ${unassignedDays.length} día(s) sin asignar — revisá los cupos.`);
  } else {
    showToast('Turnos generados');
  }
}

// ---------- Install prompt ----------
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  document.getElementById('install-btn').classList.remove('hidden');
});
async function triggerInstall() {
  if (!deferredInstallPrompt) {
    showToast('Para instalar, usá el menú de tu navegador');
    return;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') showToast('Instalación iniciada');
  deferredInstallPrompt = null;
  document.getElementById('install-btn').classList.add('hidden');
}

// ---------- Wire up ----------
function wireUp() {
  document.getElementById('prev').addEventListener('click', navPrev);
  document.getElementById('next').addEventListener('click', navNext);

  const titleBtn = document.getElementById('title-btn');
  const picker = document.getElementById('picker');
  titleBtn.addEventListener('click', () => {
    picker.classList.toggle('hidden');
    renderPicker();
  });
  document.getElementById('today-btn').addEventListener('click', goToday);
  document.getElementById('hoy-btn').addEventListener('click', goToday);

  // View toggle
  document.querySelectorAll('.vt').forEach(b => {
    b.addEventListener('click', () => switchView(b.dataset.view));
  });

  // Filtros
  document.getElementById('filter-person').addEventListener('change', (e) => {
    applyPersonFilter(e.target.value);
  });
  document.getElementById('filter-team').addEventListener('change', (e) => {
    applyTeamFilter(e.target.value);
  });
  document.getElementById('clear-filters').addEventListener('click', clearAllFilters);

  // Versión
  const v = document.getElementById('app-version');
  if (v) v.textContent = APP_VERSION;

  const menu = document.getElementById('menu');
  // 4 botones de categoría: cada uno abre el menú mostrando sólo su sección
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      // Ocultar todas las secciones del menú menos la elegida
      menu.querySelectorAll('.menu-section').forEach(s => {
        s.classList.toggle('hidden', s.dataset.section !== cat);
      });
      menu.classList.remove('hidden');
    });
  });
  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      menu.classList.add('hidden');
      if (a === 'export') exportData();
      else if (a === 'import') document.getElementById('import-file').click();
      else if (a === 'clear') clearCurrentMonth();
      else if (a === 'generate') generateMonth();
      else if (a === 'export-image') exportAndShareMonth();
      else if (a === 'stats') openStatsSettings();
      else if (a === 'gen-settings') openGenSettings();
      else if (a === 'colors-settings') openColorsSettings();
      else if (a === 'birthdays-settings') openBirthdaysSettings();
      else if (a === 'load-holidays') preloadArgentinaHolidays();
      else if (a === 'mark-month-feria') markWholeMonthAsFeriaJud();
      else if (a === 'mark-range-feria') markRangeAsFeriaJud();
      else if (a === 'sync-settings') openSyncSettings();
      else if (a === 'check-update') checkForUpdate();
      else if (a === 'install') triggerInstall();
    });
  });

  // Modal del generador
  document.getElementById('gen-modal-close').addEventListener('click', closeGenSettings);
  document.querySelector('#gen-modal .modal-backdrop').addEventListener('click', closeGenSettings);
  document.getElementById('gen-add-team').addEventListener('click', () => {
    const cfg = loadGenConfig();
    cfg.teams.push({ a: null, b: null, maxDays: 9 });
    saveGenConfig(cfg);
    renderGenSettings();
  });
  document.getElementById('gen-auto-rotate-toggle').addEventListener('change', (e) => {
    saveAutoRotate(e.target.checked);
    updateGenDayCounter();
    if (e.target.checked) {
      showToast('🔄 Rotación automática activada');
    } else {
      showToast('Rotación automática desactivada');
    }
  });
  document.getElementById('gen-reset').addEventListener('click', () => {
    if (!confirm('¿Restaurar los equipos por defecto?')) return;
    saveGenConfig({ teams: deepCopy(DEFAULT_TEAMS) });
    renderGenSettings();
    showToast('Equipos restaurados');
  });
  document.getElementById('gen-save').addEventListener('click', () => {
    closeGenSettings();
    setTimeout(() => generateMonth(), 200);
  });

  // Modal de colores
  document.getElementById('colors-modal-close').addEventListener('click', closeColorsSettings);
  document.getElementById('colors-close-btn').addEventListener('click', closeColorsSettings);
  document.querySelector('#colors-modal .modal-backdrop').addEventListener('click', closeColorsSettings);
  document.getElementById('colors-reset').addEventListener('click', () => {
    if (!confirm('¿Restaurar todos los colores a los defaults?')) return;
    resetPersonColors();
    renderColorsSettings();
    rerenderActiveView();
    showToast('Colores restaurados');
  });

  // Modal de cumpleaños
  document.getElementById('birthdays-modal-close').addEventListener('click', closeBirthdaysSettings);
  document.getElementById('birthdays-close-btn').addEventListener('click', closeBirthdaysSettings);
  document.querySelector('#birthdays-modal .modal-backdrop').addEventListener('click', closeBirthdaysSettings);
  document.getElementById('birthdays-reset').addEventListener('click', () => {
    if (!confirm('¿Borrar todas las fechas de cumpleaños?')) return;
    saveBirthdays({});
    renderBirthdaysSettings();
    rerenderActiveView();
    showToast('Cumpleaños borrados');
  });
  document.getElementById('birthdays-restore').addEventListener('click', () => {
    if (!confirm('¿Cargar la lista de cumpleaños precargados? Pisa los actuales.')) return;
    saveBirthdays({ ...DEFAULT_BIRTHDAYS });
    renderBirthdaysSettings();
    rerenderActiveView();
    showToast('Cumpleaños precargados restaurados');
  });

  // Modal de estadísticas
  document.getElementById('stats-modal-close').addEventListener('click', closeStatsSettings);
  document.getElementById('stats-close-btn').addEventListener('click', closeStatsSettings);
  document.querySelector('#stats-modal .modal-backdrop').addEventListener('click', closeStatsSettings);
  document.querySelectorAll('#stats-modal .scope-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _statsScope = btn.dataset.statsScope;
      renderStats();
    });
  });

  // Modal de sincronización
  document.getElementById('sync-modal-close').addEventListener('click', closeSyncSettings);
  document.querySelector('#sync-modal .modal-backdrop').addEventListener('click', closeSyncSettings);
  document.getElementById('sync-connect').addEventListener('click', async () => {
    setSyncInlineStatus('connecting', '🟡 Empezando conexión...');
    const cfg = {
      firebase: {
        apiKey: document.getElementById('fb-apikey').value.trim(),
        authDomain: document.getElementById('fb-authdomain').value.trim(),
        databaseURL: document.getElementById('fb-dburl').value.trim(),
        projectId: document.getElementById('fb-projectid').value.trim(),
      },
      email: document.getElementById('fb-email').value.trim(),
      password: document.getElementById('fb-password').value,
    };
    if (!cfg.firebase.apiKey || !cfg.firebase.databaseURL || !cfg.email || !cfg.password) {
      setSyncInlineStatus('error', '🔴 Faltan datos obligatorios.\nRevisá: API Key, Database URL, Email y Password.');
      return;
    }
    saveFirebaseConfig(cfg);
    const ok = await initFirebaseSync();
    if (ok) {
      // Empuje inicial de datos
      setSyncInlineStatus('syncing', '🔵 Subiendo datos al servidor...');
      try {
        await pushToCloud();
        setSyncInlineStatus('connected', '🟢 ¡Listo! Datos sincronizados.\nYa podés cerrar este modal.');
        showToast('🟢 Sincronización activa');
      } catch (e) {
        setSyncInlineStatus('error', `🔴 Error subiendo datos:\n${e.message}`);
      }
    }
  });

  // Botón de test del SDK
  document.getElementById('sync-test-sdk').addEventListener('click', () => {
    if (typeof firebase === 'undefined') {
      setSyncInlineStatus('error',
        '🔴 Firebase NO está cargado.\n\n' +
        'Esto pasa si:\n' +
        '• No hay internet cuando abriste la app\n' +
        '• El service worker tiene cache vieja\n\n' +
        'Solución: cerrá la app, fijate de tener internet, y abrila de nuevo. ' +
        'Si seguís con error, desinstalá y reinstalá la PWA.');
    } else {
      const ver = (firebase.SDK_VERSION || firebase.app.SDK_VERSION || 'desconocida');
      setSyncInlineStatus('connected',
        `🟢 Firebase SDK cargado OK\nVersión: ${ver}\n\nYa podés conectar.`);
    }
  });
  document.getElementById('sync-disconnect').addEventListener('click', async () => {
    if (!confirm('Desconectar sincronización? Tus datos seguirán en este dispositivo.')) return;
    await disconnectSync();
    setSyncInlineStatus('idle', '⚪ Desconectado');
  });
  document.getElementById('sync-force-pull').addEventListener('click', forcePullFromCloud);
  document.getElementById('sync-force-push').addEventListener('click', forcePushToCloud);
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !e.target.closest('.cat-btn')) menu.classList.add('hidden');
    if (!picker.contains(e.target) && !titleBtn.contains(e.target)) picker.classList.add('hidden');
  });

  // Swipe en el área principal
  let touchStartX = null, touchStartY = null;
  const area = document.querySelector('.primary');
  area.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });
  area.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) navNext(); else navPrev();
    }
    touchStartX = null;
  }, { passive: true });
}

// ---------- Boot ----------
function boot() {
  initSeed();
  reloadCurrentMonth();
  rerenderActiveView();
  renderFilters();
  wireUp();
  // Auto-conectar sync si hay config guardada
  setTimeout(() => initFirebaseSync(), 500);
}
boot();
