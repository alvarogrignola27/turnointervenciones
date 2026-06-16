// ============================================================
// Turnos de Intervenciones — App principal
// ============================================================

const MES_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const STORAGE_PREFIX = 'turnos:';
const STORAGE_VERSION_KEY = 'turnos:_seed_version';

// ---------- Estado ----------
const today = new Date();
const state = {
  view: 'month',                  // 'month' | 'week' | 'day'
  year: today.getFullYear(),
  month: today.getMonth() + 1,    // 1-12
  day: today.getDate(),           // 1-31, used in week/day views
  selectedDay: null,              // day selected in month view (for edit panel)
  data: {},                       // { dayStr: [[a,b], ...] }  -- current month
};

let deferredInstallPrompt = null;

// ---------- Persistencia ----------
function monthKeyOf(y, m) { return `${y}-${String(m).padStart(2, '0')}`; }
function storageKeyOf(y, m) { return STORAGE_PREFIX + monthKeyOf(y, m); }

function loadMonthData(y, m) {
  const key = storageKeyOf(y, m);
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);
  } catch (e) { console.warn('Read storage error', e); }
  const seedKey = monthKeyOf(y, m);
  return (typeof SEED_DATA !== 'undefined' && SEED_DATA[seedKey])
    ? deepCopy(SEED_DATA[seedKey]) : {};
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

// Read any day's data (from current state or storage / seed)
function getDayDataAny(y, m, d) {
  if (y === state.year && m === state.month) {
    return state.data[String(d)] || null;
  }
  return loadMonthData(y, m)[String(d)] || null;
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
function colorFor(name) { return COLORS[name] || '#E5E5EA'; }
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
function isToday(y, m, d) {
  return y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate();
}
function isWeekend(y, m, d) {
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}

// ---------- Lógica de Equipo a cargo / Equipo de apoyo ----------
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

// Encuentra el primer slot que sea un equipo del roster
function findTeamSlot(slots) {
  if (!slots) return null;
  for (const s of slots) {
    if (isRosterTeam(s)) return s;
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
    const team = findTeamSlot(slots);
    if (team && !teamsEqual(team, currentTeam)) {
      return { team, date: new Date(yy, mm - 1, dd) };
    }
  }
  return null;
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

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = day;
    el.appendChild(numEl);

    const slots = state.data[String(day)] || [];
    const visibleSlots = slots.slice(0, 4);
    visibleSlots.forEach(([a, b]) => {
      const row = document.createElement('div');
      row.className = 'slot';
      [a, b].forEach(name => {
        const pill = document.createElement('span');
        pill.className = 'pill';
        if (name) {
          pill.textContent = abbrev(name);
          pill.style.background = colorFor(name);
          pill.style.color = textColorFor(name);
        } else {
          pill.classList.add('empty');
        }
        row.appendChild(pill);
      });
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
      slots.forEach(([a, b]) => {
        const row = document.createElement('div');
        row.className = 'wk-slot';
        [a, b].forEach(n => {
          const p = document.createElement('div');
          p.className = 'wk-pill';
          if (n) {
            p.textContent = n;
            p.style.background = colorFor(n);
            p.style.color = textColorFor(n);
          } else {
            p.classList.add('empty');
            p.textContent = '—';
          }
          row.appendChild(p);
        });
        slotsEl.appendChild(row);
      });
    }
    card.appendChild(slotsEl);

    card.addEventListener('click', () => {
      // Jump to day view for this date
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
  const teamSlot = findTeamSlot(slots);

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
  card.appendChild(header);

  // Equipo a cargo
  const cargoSec = document.createElement('div');
  cargoSec.className = 'dv-section';
  const cargoLbl = document.createElement('div');
  cargoLbl.className = 'dv-section-label';
  cargoLbl.textContent = 'Equipo a cargo';
  cargoSec.appendChild(cargoLbl);
  const cargoTeam = document.createElement('div');
  cargoTeam.className = 'dv-team';
  if (teamSlot) {
    [teamSlot[0], teamSlot[1]].forEach(n => {
      const pill = document.createElement('div');
      pill.className = 'dv-team-pill';
      if (n) {
        pill.textContent = n;
        pill.style.background = colorFor(n);
        pill.style.color = textColorFor(n);
      } else {
        pill.classList.add('empty');
        pill.textContent = '—';
      }
      cargoTeam.appendChild(pill);
    });
  } else {
    const ph = document.createElement('div');
    ph.className = 'dv-team-pill empty';
    ph.style.flex = '1';
    ph.textContent = 'Sin equipo asignado';
    cargoTeam.appendChild(ph);
  }
  cargoSec.appendChild(cargoTeam);
  card.appendChild(cargoSec);

  // Equipo de apoyo (próximo día con equipo distinto)
  const apoyoSec = document.createElement('div');
  apoyoSec.className = 'dv-section';
  const apoyoLbl = document.createElement('div');
  apoyoLbl.className = 'dv-section-label';
  apoyoLbl.textContent = 'Equipo de apoyo';
  apoyoSec.appendChild(apoyoLbl);

  const apoyo = findApoyo(y, m, d, teamSlot);
  const apoyoTeam = document.createElement('div');
  apoyoTeam.className = 'dv-team';
  if (apoyo) {
    [apoyo.team[0], apoyo.team[1]].forEach(n => {
      const pill = document.createElement('div');
      pill.className = 'dv-team-pill';
      if (n) {
        pill.textContent = n;
        pill.style.background = colorFor(n);
        pill.style.color = textColorFor(n);
      } else {
        pill.classList.add('empty');
        pill.textContent = '—';
      }
      apoyoTeam.appendChild(pill);
    });
    apoyoSec.appendChild(apoyoTeam);
    const note = document.createElement('div');
    note.className = 'dv-apoyo-note';
    const ap = apoyo.date;
    const apDayName = DAY_NAMES[ap.getDay()];
    note.textContent = `Entra el ${apDayName} ${ap.getDate()} de ${MES_NAMES[ap.getMonth()].toLowerCase()}`;
    apoyoSec.appendChild(note);
  } else {
    const ph = document.createElement('div');
    ph.className = 'dv-team-pill empty';
    ph.style.flex = '1';
    ph.textContent = 'No definido aún';
    apoyoTeam.appendChild(ph);
    apoyoSec.appendChild(apoyoTeam);
  }
  card.appendChild(apoyoSec);

  // Otras filas (oficios, abogados, etc.)
  if (slots && slots.length > 0) {
    const otherSlots = slots.filter(s => !teamSlot || !teamsEqual(s, teamSlot));
    if (otherSlots.length > 0) {
      const otherSec = document.createElement('div');
      otherSec.className = 'dv-section';
      const lbl = document.createElement('div');
      lbl.className = 'dv-section-label';
      lbl.textContent = 'Otros';
      otherSec.appendChild(lbl);
      otherSlots.forEach(([a, b]) => {
        const row = document.createElement('div');
        row.className = 'dv-row';
        [a, b].forEach(n => {
          const p = document.createElement('div');
          p.className = 'dv-row-pill';
          if (n) {
            p.textContent = n;
            p.style.background = colorFor(n);
            p.style.color = textColorFor(n);
          } else {
            p.classList.add('empty');
            p.textContent = '—';
          }
          row.appendChild(p);
        });
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
    // Ensure we're on the right month in state
    if (state.year !== y || state.month !== m) {
      state.year = y; state.month = m;
      state.data = loadMonthData(y, m);
    }
    state.selectedDay = d;
    renderDetail();
    setTimeout(() => {
      document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  });
  card.appendChild(editBtn);
  root.appendChild(card);
}

// ---------- Render: detalle edición (modal-ish below) ----------
function renderDetail() {
  const det = document.getElementById('detail');
  const mainArea = document.querySelector('.main-area');
  if (state.selectedDay === null) {
    det.innerHTML = '';
    mainArea.classList.remove('has-detail');
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

  const section = document.createElement('div');
  section.className = 'detail-section';
  const label = document.createElement('div');
  label.className = 'detail-section-label';
  label.textContent = 'Filas del día';
  section.appendChild(label);

  slots.forEach((slot, idx) => {
    const row = document.createElement('div');
    row.className = 'slot-row';

    const selA = createNameSelect(slot[0], (val) => {
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

    const del = document.createElement('button');
    del.className = 'del';
    del.innerHTML = '×';
    del.setAttribute('aria-label', 'Eliminar fila');
    del.addEventListener('click', () => {
      state.data[String(day)].splice(idx, 1);
      cleanupDay(day);
      saveMonthData(state.year, state.month, state.data);
      rerenderActiveView(); renderDetail();
    });

    row.appendChild(selA);
    row.appendChild(selB);
    row.appendChild(del);
    section.appendChild(row);
  });

  const addRow = document.createElement('div');
  addRow.className = 'add-row';
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn primary';
  addBtn.textContent = '+ Agregar fila';
  addBtn.addEventListener('click', () => {
    if (!state.data[String(day)]) state.data[String(day)] = [];
    state.data[String(day)].push([null, null]);
    saveMonthData(state.year, state.month, state.data);
    rerenderActiveView(); renderDetail();
  });
  addRow.appendChild(addBtn);
  section.appendChild(addRow);

  card.appendChild(section);
  det.innerHTML = '';
  det.appendChild(card);
}

function createNameSelect(currentValue, onChange) {
  const sel = document.createElement('select');
  const empty = document.createElement('option');
  empty.value = ''; empty.textContent = '—';
  sel.appendChild(empty);

  const groups = [
    { label: 'Equipo', items: ROSTER },
    { label: 'Abogados', items: ABOGADOS },
    { label: 'Oficios', items: OFICIOS },
    { label: 'Otros', items: SPECIAL },
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
    state.data = loadMonthData(state.year, state.month);
    renderMonthView(); renderDetail();
  } else if (state.view === 'week') {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() - 7);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    state.data = loadMonthData(state.year, state.month);
    renderWeekView();
  } else {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() - 1);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    state.data = loadMonthData(state.year, state.month);
    renderDayView();
  }
}
function navNext() {
  if (state.view === 'month') {
    state.month++;
    if (state.month > 12) { state.month = 1; state.year++; }
    state.selectedDay = null;
    state.data = loadMonthData(state.year, state.month);
    renderMonthView(); renderDetail();
  } else if (state.view === 'week') {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() + 7);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    state.data = loadMonthData(state.year, state.month);
    renderWeekView();
  } else {
    const dt = new Date(state.year, state.month - 1, state.day);
    dt.setDate(dt.getDate() + 1);
    state.year = dt.getFullYear(); state.month = dt.getMonth() + 1; state.day = dt.getDate();
    state.data = loadMonthData(state.year, state.month);
    renderDayView();
  }
}
function goToday() {
  state.year = today.getFullYear();
  state.month = today.getMonth() + 1;
  state.day = today.getDate();
  state.selectedDay = state.view === 'month' ? today.getDate() : null;
  state.data = loadMonthData(state.year, state.month);
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
  document.getElementById('picker').classList.add('hidden');
}
function jumpTo(y, m) {
  state.year = y; state.month = m;
  state.day = Math.min(state.day, new Date(y, m, 0).getDate());
  state.selectedDay = null;
  state.data = loadMonthData(state.year, state.month);
  rerenderActiveView();
  if (state.view === 'month') renderDetail();
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
      state.data = loadMonthData(state.year, state.month);
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
  state.selectedDay = null;
  saveMonthData(state.year, state.month, state.data);
  rerenderActiveView(); renderDetail();
  showToast('Mes borrado');
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
      else if (a === 'install') triggerInstall();
    });
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
  state.data = loadMonthData(state.year, state.month);
  rerenderActiveView();
  wireUp();
}
boot();
