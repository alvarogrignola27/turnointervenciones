// ============================================================
// Turnos de Intervenciones — App principal
// ============================================================

const MES_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const STORAGE_PREFIX = 'turnos:';
const STORAGE_VERSION_KEY = 'turnos:_seed_version';

// ---------- Estado ----------
const today = new Date();
const state = {
  year: today.getFullYear(),
  month: today.getMonth() + 1, // 1-12
  selectedDay: null,
  data: {}, // { day: [[a,b], ...] }
};

let deferredInstallPrompt = null;

// ---------- Persistencia ----------
function monthKey(y, m) {
  return `${y}-${String(m).padStart(2, '0')}`;
}

function storageKey(y, m) {
  return STORAGE_PREFIX + monthKey(y, m);
}

function loadMonthData(y, m) {
  const key = storageKey(y, m);
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Error reading from storage', e);
  }
  // Fallback to seed if first time
  const seedKey = monthKey(y, m);
  return (typeof SEED_DATA !== 'undefined' && SEED_DATA[seedKey]) ? deepCopy(SEED_DATA[seedKey]) : {};
}

function saveMonthData(y, m, data) {
  const key = storageKey(y, m);
  try {
    if (Object.keys(data).length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    showToast('Error al guardar');
    console.error('Save failed', e);
  }
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------- Inicialización del seed ----------
function initSeed() {
  // Solo carga el seed la primera vez
  const v = localStorage.getItem(STORAGE_VERSION_KEY);
  if (v === SEED_VERSION) return;
  if (typeof SEED_DATA === 'undefined') return;
  for (const key in SEED_DATA) {
    const k = STORAGE_PREFIX + key;
    if (localStorage.getItem(k) === null) {
      try {
        localStorage.setItem(k, JSON.stringify(SEED_DATA[key]));
      } catch (e) {
        console.warn('Could not seed', key, e);
        break;
      }
    }
  }
  localStorage.setItem(STORAGE_VERSION_KEY, SEED_VERSION);
}

// ---------- Helpers visuales ----------
function abbrev(name) {
  if (!name) return '';
  if (name.length <= 4) return name;
  // Para abogados con espacios, mostrar iniciales
  if (name.includes(' ')) {
    return name.split(' ').map(s => s[0]).join('').slice(0, 4);
  }
  return name.slice(0, 4);
}

function colorFor(name) {
  return COLORS[name] || '#E5E5EA';
}

function textColorFor(name) {
  if (WHITE_TEXT.has(name)) return '#FFFFFF';
  // Determinar por luminancia
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

// ---------- Render del calendario ----------
function renderCalendar() {
  document.getElementById('title').textContent = `${MES_NAMES[state.month - 1]} ${state.year}`;

  const cal = document.getElementById('cal');
  cal.innerHTML = '';

  const firstDay = new Date(state.year, state.month - 1, 1);
  let weekday = firstDay.getDay();
  weekday = weekday === 0 ? 6 : weekday - 1; // 0=Mon ... 6=Sun
  const daysInMonth = new Date(state.year, state.month, 0).getDate();

  // Celdas vacías iniciales
  for (let i = 0; i < weekday; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    cal.appendChild(empty);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const el = document.createElement('div');
    el.className = 'day';
    const dow = new Date(state.year, state.month - 1, day).getDay();
    if (dow === 0 || dow === 6) el.classList.add('weekend');
    if (state.year === today.getFullYear() &&
        state.month === today.getMonth() + 1 &&
        day === today.getDate()) {
      el.classList.add('today');
    }
    if (state.selectedDay === day) el.classList.add('selected');

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = day;
    el.appendChild(numEl);

    const slots = state.data[String(day)] || [];
    // Mostrar hasta 4 slots para no abarrotar
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
      renderCalendar();
      renderDetail();
      if (state.selectedDay !== null) {
        // Scroll to detail
        setTimeout(() => {
          document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });

    cal.appendChild(el);
  }
}

// ---------- Render del panel de edición ----------
function renderDetail() {
  const det = document.getElementById('detail');
  if (state.selectedDay === null) {
    det.innerHTML = '';
    return;
  }
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

  // Sección Equipos
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
      renderCalendar();
      renderDetail();
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
      renderCalendar();
      renderDetail();
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
      renderCalendar();
      renderDetail();
    });

    row.appendChild(selA);
    row.appendChild(selB);
    row.appendChild(del);
    section.appendChild(row);
  });

  // Botones para agregar
  const addRow = document.createElement('div');
  addRow.className = 'add-row';
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn primary';
  addBtn.textContent = '+ Agregar fila';
  addBtn.addEventListener('click', () => {
    if (!state.data[String(day)]) state.data[String(day)] = [];
    state.data[String(day)].push([null, null]);
    saveMonthData(state.year, state.month, state.data);
    renderCalendar();
    renderDetail();
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
  empty.value = '';
  empty.textContent = '—';
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
      o.value = n;
      o.textContent = n;
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
  // Si todas las filas están vacías, eliminar el día
  const hasContent = state.data[k].some(s => s[0] || s[1]);
  if (!hasContent) delete state.data[k];
}

// ---------- Navegación ----------
function goPrevMonth() {
  state.month--;
  if (state.month < 1) { state.month = 12; state.year--; }
  state.selectedDay = null;
  reloadAndRender();
}
function goNextMonth() {
  state.month++;
  if (state.month > 12) { state.month = 1; state.year++; }
  state.selectedDay = null;
  reloadAndRender();
}
function goToday() {
  state.year = today.getFullYear();
  state.month = today.getMonth() + 1;
  state.selectedDay = today.getDate();
  reloadAndRender();
  document.getElementById('picker').classList.add('hidden');
}
function jumpTo(y, m) {
  state.year = y;
  state.month = m;
  state.selectedDay = null;
  reloadAndRender();
}

function reloadAndRender() {
  state.data = loadMonthData(state.year, state.month);
  renderCalendar();
  renderDetail();
}

// ---------- Picker (selector de mes/año) ----------
function renderPicker() {
  const monthSel = document.getElementById('month-select');
  monthSel.innerHTML = '';
  MES_NAMES.forEach((name, i) => {
    const o = document.createElement('option');
    o.value = String(i + 1);
    o.textContent = name;
    if ((i + 1) === state.month) o.selected = true;
    monthSel.appendChild(o);
  });
  monthSel.onchange = (e) => jumpTo(state.year, parseInt(e.target.value));

  const yearSel = document.getElementById('year-select');
  yearSel.innerHTML = '';
  const ty = today.getFullYear();
  for (let y = ty - 5; y <= ty + 5; y++) {
    const o = document.createElement('option');
    o.value = String(y);
    o.textContent = y;
    if (y === state.year) o.selected = true;
    yearSel.appendChild(o);
  }
  yearSel.onchange = (e) => jumpTo(parseInt(e.target.value), state.month);
}

// ---------- Menú & acciones ----------
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
      const monthKey = key.slice(STORAGE_PREFIX.length);
      try {
        all[monthKey] = JSON.parse(localStorage.getItem(key));
      } catch {}
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
      reloadAndRender();
    } catch (err) {
      showToast('Archivo inválido');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function clearCurrentMonth() {
  if (!confirm(`¿Borrar todos los datos de ${MES_NAMES[state.month - 1]} ${state.year}?`)) return;
  state.data = {};
  state.selectedDay = null;
  saveMonthData(state.year, state.month, state.data);
  renderCalendar();
  renderDetail();
  showToast('Mes borrado');
}

// ---------- Install prompt (PWA) ----------
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
  document.getElementById('prev').addEventListener('click', goPrevMonth);
  document.getElementById('next').addEventListener('click', goNextMonth);

  const titleBtn = document.getElementById('title-btn');
  const picker = document.getElementById('picker');
  titleBtn.addEventListener('click', () => {
    picker.classList.toggle('hidden');
    renderPicker();
  });

  document.getElementById('today-btn').addEventListener('click', goToday);

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

  // Cerrar menú/picker al tocar fuera
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
      menu.classList.add('hidden');
    }
    if (!picker.contains(e.target) && !titleBtn.contains(e.target)) {
      picker.classList.add('hidden');
    }
  });

  // Swipe para cambiar de mes
  let touchStartX = null, touchStartY = null;
  const cal = document.getElementById('cal');
  cal.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });
  cal.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNextMonth(); else goPrevMonth();
    }
    touchStartX = null;
  }, { passive: true });
}

// ---------- Boot ----------
function boot() {
  initSeed();
  reloadAndRender();
  wireUp();
}

boot();
