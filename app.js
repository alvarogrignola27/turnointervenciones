// ============================================================
// Turnos de Intervenciones — App principal
// ============================================================

const APP_VERSION = '7';

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
const GEN_CONFIG_KEY = 'turnos:gen_config';
const WEEKEND_ROT_KEY = 'turnos:gen_weekend_idx';
const PERSON_COLORS_KEY = 'turnos:person_colors';
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
  if (name.length <= 4) return name;
  if (name.includes(' ')) {
    return name.split(' ').map(s => s[0]).join('').slice(0, 4);
  }
  return name.slice(0, 4);
}
function colorFor(name) {
  if (!name) return '#E5E5EA';
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

// ---------- Colores custom por persona ----------
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
  try { localStorage.setItem(PERSON_COLORS_KEY, JSON.stringify(colors)); }
  catch (e) { console.warn('Save colors error', e); }
}
function resetPersonColors() {
  _personColorsCache = {};
  localStorage.removeItem(PERSON_COLORS_KEY);
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

// Busca el "equipo de apoyo" = el primer equipo distinto en los próximos días
function findApoyo(y, m, d, currentTeam, maxDays = 14) {
  let dt = new Date(y, m - 1, d);
  for (let i = 0; i < maxDays; i++) {
    dt.setDate(dt.getDate() + 1);
    const yy = dt.getFullYear(), mm = dt.getMonth() + 1, dd = dt.getDate();
    const slots = getDayDataAny(yy, mm, dd);
    const tRes = findTeamSlot(slots);
    if (tRes && !teamsEqual(tRes.slot, currentTeam)) {
      return { team: tRes.slot, date: new Date(yy, mm - 1, dd) };
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
    if (filtersActive()) {
      if (dayMatchesFilters(day)) el.classList.add('filter-match');
      else el.classList.add('filtered-out');
    }

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = day;
    el.appendChild(numEl);

    // Marca de feriado
    if (isFeriado(state.year, state.month, day)) {
      const fer = document.createElement('span');
      fer.className = 'feriado-mark';
      fer.textContent = 'F';
      fer.title = 'Feriado';
      el.appendChild(fer);
    }

    const slots = state.data[String(day)] || [];
    const visibleSlots = slots.slice(0, 4);
    visibleSlots.forEach((slot, slotIdx) => {
      const row = document.createElement('div');
      row.className = 'slot';
      const pills = renderSlotPills(slot, {
        editable: true,
        slotIdx,
        className: 'pill',
        abbrev: true,
        onChange: (sIdx, sideIdx, newName) => updateSlotName(day, sIdx, sideIdx, newName),
      });
      pills.forEach(p => row.appendChild(p));
      el.appendChild(row);
    });

    el.addEventListener('click', () => {
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
        const pills = renderSlotPills(slot, {
          editable: isCurrentMonth,
          slotIdx,
          className: 'wk-pill',
          abbrev: false,
          onChange: (sIdx, sideIdx, newName) => updateSlotName(d, sIdx, sideIdx, newName),
        });
        pills.forEach(p => row.appendChild(p));
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
  }
  card.appendChild(header);

  // Bloque "Equipo de intervención + Apoyo" (mismo helper que en panel de edición)
  card.appendChild(buildDayInfoBlock(y, m, d));

  // Otras filas (oficios, abogados, etc.)
  const teamRes = findTeamSlot(slots);
  const teamSlot = teamRes ? teamRes.slot : null;
  if (slots && slots.length > 0) {
    const isCurrentMonth = (y === state.year && m === state.month);
    // Buscar índices originales de los slots "otros"
    const otherIndices = [];
    slots.forEach((s, i) => {
      if (!teamSlot || !teamsEqual(s, teamSlot)) otherIndices.push(i);
    });
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

  // Botón editar
  const editBtn = document.createElement('button');
  editBtn.className = 'dv-edit-btn';
  editBtn.textContent = '✎ Editar este día';
  editBtn.addEventListener('click', () => {
    if (state.year !== y || state.month !== m) {
      state.year = y; state.month = m;
      state.data = loadMonthData(y, m);
    }
    state.selectedDay = d;
    state.view = 'month';
    switchView('month');
    setTimeout(() => {
      document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  });
  card.appendChild(editBtn);
  root.appendChild(card);
}

// ---------- Helper: bloque "Equipo de intervención + Apoyo" ----------
function buildDayInfoBlock(y, m, d, opts = {}) {
  const slots = opts.useStateData
    ? (state.data[String(d)] || null)
    : getDayDataAny(y, m, d);
  const teamRes = findTeamSlot(slots);
  const teamSlot = teamRes ? teamRes.slot : null;
  // Editable solo si los datos son del mes en curso
  const editable = !!opts.useStateData;

  const block = document.createElement('div');
  block.className = 'di-block';

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
  } else {
    const ph = document.createElement('div');
    ph.className = 'di-team-pill empty';
    ph.style.flex = '1';
    ph.textContent = 'Sin equipo asignado';
    team1.appendChild(ph);
  }
  sec1.appendChild(team1);
  block.appendChild(sec1);

  // EQUIPO DE APOYO (read-only)
  const sec2 = document.createElement('div');
  sec2.className = 'di-section';
  const lbl2 = document.createElement('div');
  lbl2.className = 'di-label';
  lbl2.textContent = 'Equipo de apoyo';
  sec2.appendChild(lbl2);

  const apoyo = findApoyo(y, m, d, teamSlot);
  const team2 = document.createElement('div');
  team2.className = 'di-team';
  if (apoyo) {
    [apoyo.team[0], apoyo.team[1]].forEach(n => {
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
    });
    sec2.appendChild(team2);
    const note = document.createElement('div');
    note.className = 'di-note';
    const ap = apoyo.date;
    const apDayName = DAY_NAMES[ap.getDay()];
    note.textContent = `Entra el ${apDayName} ${ap.getDate()} de ${MES_NAMES[ap.getMonth()].toLowerCase()}`;
    sec2.appendChild(note);
  } else {
    const ph = document.createElement('div');
    ph.className = 'di-team-pill empty';
    ph.style.flex = '1';
    ph.textContent = 'No definido aún';
    team2.appendChild(ph);
    sec2.appendChild(team2);
  }
  block.appendChild(sec2);

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

  const title = document.createElement('h3');
  title.textContent = `${dayName} ${day}`;
  card.appendChild(title);

  const sub = document.createElement('p');
  sub.className = 'date-sub';
  sub.textContent = `${MES_NAMES[state.month - 1]} ${state.year}`;
  card.appendChild(sub);

  // Bloque "Equipo de intervención + Apoyo" (sólo lectura)
  card.appendChild(buildDayInfoBlock(state.year, state.month, day, { useStateData: true }));

  // Botón Marcar/Quitar feriado
  const feriBtn = document.createElement('button');
  const isFer = isFeriado(state.year, state.month, day);
  feriBtn.className = 'feriado-btn' + (isFer ? ' active' : '');
  feriBtn.innerHTML = isFer ? '★ Quitar feriado' : '☆ Marcar como feriado';
  feriBtn.addEventListener('click', () => {
    toggleFeriado(day);
    rerenderActiveView();
    renderDetail();
  });
  card.appendChild(feriBtn);

  // Toggle de edición avanzada
  const editToggle = document.createElement('button');
  editToggle.className = 'edit-toggle';
  editToggle.innerHTML = state.editingDay ? '✓ Cerrar edición' : '✎ Editar filas del día';
  editToggle.addEventListener('click', () => {
    state.editingDay = !state.editingDay;
    renderDetail();
  });
  card.appendChild(editToggle);

  if (state.editingDay) {
    const section = document.createElement('div');
    section.className = 'detail-section';
    const label = document.createElement('div');
    label.className = 'detail-section-label';
    label.textContent = 'Filas del día';
    section.appendChild(label);

    slots.forEach((slot, idx) => {
      const row = document.createElement('div');
      row.className = 'slot-row';

      const hasA = !!slot[0], hasB = !!slot[1];
      const onlyOne = (hasA && !hasB) || (!hasA && hasB);

      if (onlyOne) {
        // Pill ancho completo con el único nombre, + botón "+" para agregar compañero
        const name = hasA ? slot[0] : slot[1];
        const sideIdx = hasA ? 0 : 1;
        const sel = createNameSelect(name, (val) => {
          snapshotDayBeforeEdit(day);
          state.data[String(day)][idx][sideIdx] = val || null;
          cleanupDay(day);
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView(); renderDetail();
        });
        sel.style.background = colorFor(name);
        sel.style.color = textColorFor(name);
        sel.style.fontWeight = '600';
        sel.classList.add('slot-row-wide');
        row.appendChild(sel);

        // Botón "+ compañero"
        const addPartner = document.createElement('button');
        addPartner.className = 'slot-add-partner';
        addPartner.innerHTML = '+';
        addPartner.title = 'Agregar compañero';
        addPartner.addEventListener('click', () => {
          snapshotDayBeforeEdit(day);
          // Setear el otro lado al primer nombre del roster (que sea distinto)
          const other = ROSTER.find(n => n !== name) || ROSTER[0];
          state.data[String(day)][idx][1 - sideIdx] = other;
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView(); renderDetail();
        });
        row.appendChild(addPartner);
      } else {
        // Modo estándar: 2 selects lado a lado
        const selA = createNameSelect(slot[0], (val) => {
          snapshotDayBeforeEdit(day);
          state.data[String(day)][idx][0] = val || null;
          cleanupDay(day);
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView(); renderDetail();
        });
        if (slot[0]) {
          selA.style.background = colorFor(slot[0]);
          selA.style.color = textColorFor(slot[0]);
          selA.style.fontWeight = '600';
        }

        const selB = createNameSelect(slot[1], (val) => {
          snapshotDayBeforeEdit(day);
          state.data[String(day)][idx][1] = val || null;
          cleanupDay(day);
          saveMonthData(state.year, state.month, state.data);
          rerenderActiveView(); renderDetail();
        });
        if (slot[1]) {
          selB.style.background = colorFor(slot[1]);
          selB.style.color = textColorFor(slot[1]);
          selB.style.fontWeight = '600';
        }
        row.appendChild(selA);
        row.appendChild(selB);
      }

      const del = document.createElement('button');
      del.className = 'del';
      del.innerHTML = '×';
      del.setAttribute('aria-label', 'Eliminar fila');
      del.addEventListener('click', () => {
        snapshotDayBeforeEdit(day);
        state.data[String(day)].splice(idx, 1);
        cleanupDay(day);
        saveMonthData(state.year, state.month, state.data);
        rerenderActiveView(); renderDetail();
      });

      row.appendChild(del);
      section.appendChild(row);
    });

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn primary';
    addBtn.textContent = '+ Agregar fila';
    addBtn.addEventListener('click', () => {
      snapshotDayBeforeEdit(day);
      if (!state.data[String(day)]) state.data[String(day)] = [];
      state.data[String(day)].push([null, null]);
      saveMonthData(state.year, state.month, state.data);
      rerenderActiveView(); renderDetail();
    });
    addRow.appendChild(addBtn);
    section.appendChild(addRow);

    // Botón Deshacer
    if (hasHistory(state.year, state.month, day)) {
      const undoBtn = document.createElement('button');
      undoBtn.className = 'undo-btn';
      undoBtn.innerHTML = '↶ Deshacer último cambio';
      undoBtn.addEventListener('click', () => undoDay(day));
      section.appendChild(undoBtn);
    }

    card.appendChild(section);
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
  state.year = today.getFullYear();
  state.month = today.getMonth() + 1;
  state.day = today.getDate();
  state.selectedDay = state.view === 'month' ? today.getDate() : null;
  reloadCurrentMonth();
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
  renderFilters();
  document.getElementById('picker').classList.add('hidden');
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
  state.data = {};
  state._feriados = {};
  state.selectedDay = null;
  saveMonthData(state.year, state.month, state.data);
  saveFeriados(state.year, state.month, state._feriados);
  rerenderActiveView(); renderDetail();
  showToast('Mes borrado');
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

function renderGenSettings() {
  const cfg = loadGenConfig();
  const list = document.getElementById('gen-teams-list');
  list.innerHTML = '';

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
function renderColorsSettings() {
  const list = document.getElementById('colors-list');
  list.innerHTML = '';
  const colors = loadPersonColors();

  // Agrupar por categoría
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

      // Pill preview con el color actual
      const preview = document.createElement('div');
      preview.className = 'colors-preview';
      const currentColor = colors[name] || COLORS[name] || '#E5E5EA';
      preview.style.background = currentColor;
      preview.style.color = textColorFor(name);
      preview.textContent = name;

      // Input de color nativo (label para que el preview lo dispare)
      const input = document.createElement('input');
      input.type = 'color';
      input.value = currentColor;
      input.className = 'colors-input';
      input.addEventListener('change', (e) => {
        const c = loadPersonColors();
        c[name] = e.target.value;
        savePersonColors(c);
        rerenderActiveView();
        renderColorsSettings();
      });

      // Reset individual
      const resetBtn = document.createElement('button');
      resetBtn.className = 'colors-reset-one';
      resetBtn.textContent = '↺';
      resetBtn.title = 'Volver al color default';
      resetBtn.addEventListener('click', () => {
        const c = loadPersonColors();
        delete c[name];
        savePersonColors(c);
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
  try { localStorage.setItem(GEN_CONFIG_KEY, JSON.stringify(cfg)); }
  catch (e) { console.warn('Save gen config error', e); }
}
function loadWeekendRotation() {
  return parseInt(localStorage.getItem(WEEKEND_ROT_KEY) || '0', 10);
}
function saveWeekendRotation(idx) {
  localStorage.setItem(WEEKEND_ROT_KEY, String(idx));
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
  const msg = `Esto va a reemplazar TODOS los turnos de ${MES_NAMES[state.month - 1]} ${state.year} con una asignación generada. ¿Continuar?`;
  if (!confirm(msg)) return;

  const y = state.year, m = state.month;
  const daysInMonth = new Date(y, m, 0).getDate();
  const newData = {};
  const usage = teams.map(() => 0);
  let weekendIdx = loadWeekendRotation();
  const unassignedDays = [];

  // Helper: ¿se puede usar este equipo? (respeta cap estricto)
  function canUse(idx, addDays) {
    const max = teams[idx].maxDays || Infinity;
    return (usage[idx] + addDays) <= max;
  }
  // Helper: índice del equipo menos usado, excluyendo los ya usados esta semana
  // Devuelve -1 si NO HAY ninguno disponible (respetando cap)
  function pickLeastUsed(excludeIdxs, addDays) {
    let bestIdx = -1, bestUsage = Infinity;
    for (let i = 0; i < teams.length; i++) {
      if (excludeIdxs.has(i)) continue;
      if (!canUse(i, addDays)) continue;
      if (usage[i] < bestUsage) { bestIdx = i; bestUsage = usage[i]; }
    }
    return bestIdx;
  }

  // Asignar slots: aplica equipo a los días dados (saltea feriados)
  function assignSlot(teamIdx, days) {
    if (teamIdx < 0) {
      days.forEach(d => { if (d !== null && !isFeriado(y, m, d)) unassignedDays.push(d); });
      return false;
    }
    const t = teams[teamIdx];
    days.forEach(d => {
      if (d === null) return;
      if (isFeriado(y, m, d)) return;
      const slots = [[t.a, t.b]];
      // Si el equipo tiene un 3er miembro, va como slot adicional
      if (t.c) slots.push([t.c, null]);
      newData[String(d)] = slots;
      usage[teamIdx]++;
    });
    return true;
  }

  // Agrupar días por semana (Mon=arranque)
  const weeks = [];
  let current = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(y, m - 1, d);
    let dow = dt.getDay();
    dow = dow === 0 ? 6 : dow - 1; // 0=Mon ... 6=Sun
    if (current === null || dow === 0) {
      current = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
      weeks.push(current);
    }
    current[dow] = d;
  }

  // Asignar equipos a cada semana
  weeks.forEach((wk) => {
    const used = new Set();

    // Slot Sat-Sun: rotación global
    const hasSat = wk[5] !== null;
    const hasSun = wk[6] !== null;
    if (hasSat || hasSun) {
      const addDays = (hasSat ? 1 : 0) + (hasSun ? 1 : 0);
      let weekendTeam = -1, attempts = 0;
      while (attempts < teams.length) {
        const candidate = weekendIdx % teams.length;
        if (canUse(candidate, addDays) && !used.has(candidate)) {
          weekendTeam = candidate;
          break;
        }
        weekendIdx++;
        attempts++;
      }
      // Si no se pudo (todos pasaron su cap), buscar el menos usado (respetando cap)
      if (weekendTeam < 0) weekendTeam = pickLeastUsed(used, addDays);
      if (assignSlot(weekendTeam, [wk[5], wk[6]])) {
        used.add(weekendTeam);
        weekendIdx++;
      }
    }

    // Slot Mon-Tue
    const hasMon = wk[0] !== null, hasTue = wk[1] !== null;
    if (hasMon || hasTue) {
      const addDays = (hasMon ? 1 : 0) + (hasTue ? 1 : 0);
      const idx = pickLeastUsed(used, addDays);
      if (assignSlot(idx, [wk[0], wk[1]])) used.add(idx);
    }

    // Slot Wed-Thu
    const hasWed = wk[2] !== null, hasThu = wk[3] !== null;
    if (hasWed || hasThu) {
      const addDays = (hasWed ? 1 : 0) + (hasThu ? 1 : 0);
      const idx = pickLeastUsed(used, addDays);
      if (assignSlot(idx, [wk[2], wk[3]])) used.add(idx);
    }

    // Slot Fri
    const hasFri = wk[4] !== null;
    if (hasFri) {
      const idx = pickLeastUsed(used, 1);
      if (assignSlot(idx, [wk[4]])) used.add(idx);
    }
  });

  // Guardar
  state.data = newData;
  saveMonthData(y, m, newData);
  saveWeekendRotation(weekendIdx);
  state.selectedDay = null;
  rerenderActiveView(); renderDetail();

  if (unassignedDays.length > 0) {
    showToast(`Turnos generados. ${unassignedDays.length} día(s) sin asignar — subí el cupo máx/mes.`);
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

  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      menu.classList.add('hidden');
      if (a === 'export') exportData();
      else if (a === 'import') document.getElementById('import-file').click();
      else if (a === 'clear') clearCurrentMonth();
      else if (a === 'generate') generateMonth();
      else if (a === 'gen-settings') openGenSettings();
      else if (a === 'colors-settings') openColorsSettings();
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
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) menu.classList.add('hidden');
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
}
boot();
