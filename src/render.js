import { DAYS } from "./config.js";
import { state } from "./state.js";
import { loadData, saveData } from "./supabase.js";
import {
  weekKey, getWeekDates, toDateKey, formatDate, isToday,
  migrateDay, defaultDay, buildSchoolOptions, autoGrowNote, showToast
} from "./utils.js";

// ── Render de la semana ──
export async function renderWeek() {
  const wk = weekKey(state.currentWeekOffset);
  const dates = getWeekDates(state.currentWeekOffset);
  const data = await loadData(wk);
  const mon = dates[0], fri = dates[4];
  document.getElementById("weekLabel").textContent =
    formatDate(mon) + " – " + formatDate(fri) + " " + fri.getFullYear();

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  dates.forEach((d, i) => {
    const key = toDateKey(d);
    const dd = migrateDay(data[key]) || defaultDay(i + 1);
    const today = isToday(d);
    const ro = state.editMode ? "" : "readonly";
    const dis = state.editMode ? "" : "disabled";

    const card = document.createElement("div");
    card.className = "day-card" + (today ? " today" : "") + (dd.libre ? " libre" : "");

    const mananaInactive = !dd.manana.activo ? " inactive" : "";
    const tardeInactive  = !dd.tarde.activo  ? " inactive" : "";

    card.innerHTML = `
      <div class="day-header">
        <span class="day-name">${DAYS[i]}</span>
        <span class="day-date">${formatDate(d)}</span>
      </div>
      <label class="libre-toggle">
        <input type="checkbox" ${dd.libre ? "checked" : ""} ${dis}
          data-action="toggle-libre" data-date="${key}">
        Día libre
      </label>
      ${dd.libre ? `<div class="libre-badge">Sin clases</div>` : `
      <div class="schedule-blocks">
        <!-- MAÑANA -->
        <div class="block block-manana${mananaInactive}" id="block-m-${key}">
          <div class="block-header">
            <span class="block-label">Mañana</span>
            <label class="block-toggle">
              <input type="checkbox" ${dd.manana.activo ? "checked" : ""} ${dis}
                data-action="toggle-bloque" data-date="${key}" data-bloque="manana">
              Activo
            </label>
          </div>
          <select class="escuela-select" ${dis}
            data-action="save-field" data-date="${key}" data-bloque="manana" data-campo="escuela">
            ${buildSchoolOptions(dd.manana.escuela || "")}
          </select>
          <div class="time-rows">
            <div class="time-row">
              <span class="time-label">Entra</span>
              <input class="time-input" type="time" value="${dd.manana.entrada}" ${ro}
                data-action="save-field" data-date="${key}" data-bloque="manana" data-campo="entrada">
            </div>
            <div class="time-row">
              <span class="time-label">Sale</span>
              <input class="time-input" type="time" value="${dd.manana.salida}" ${ro}
                data-action="save-field" data-date="${key}" data-bloque="manana" data-campo="salida">
            </div>
          </div>
        </div>
        <!-- TARDE -->
        <div class="block block-tarde${tardeInactive}" id="block-t-${key}">
          <div class="block-header">
            <span class="block-label">Tarde</span>
            <label class="block-toggle">
              <input type="checkbox" ${dd.tarde.activo ? "checked" : ""} ${dis}
                data-action="toggle-bloque" data-date="${key}" data-bloque="tarde">
              Activo
            </label>
          </div>
          <select class="escuela-select" ${dis}
            data-action="save-field" data-date="${key}" data-bloque="tarde" data-campo="escuela">
            ${buildSchoolOptions(dd.tarde.escuela || "")}
          </select>
          <div class="time-rows">
            <div class="time-row">
              <span class="time-label">Entra</span>
              <input class="time-input" type="time" value="${dd.tarde.entrada}" ${ro}
                data-action="save-field" data-date="${key}" data-bloque="tarde" data-campo="entrada">
            </div>
            <div class="time-row">
              <span class="time-label">Sale</span>
              <input class="time-input" type="time" value="${dd.tarde.salida}" ${ro}
                data-action="save-field" data-date="${key}" data-bloque="tarde" data-campo="salida">
            </div>
          </div>
        </div>
      </div>
      <textarea class="note-input" placeholder="Notas..." ${ro}
        data-action="save-note" data-date="${key}">${dd.notas}</textarea>
      `}
    `;
    grid.appendChild(card);
  });

  attachCardListeners(grid, wk);
  grid.querySelectorAll(".note-input").forEach(autoGrowNote);
}

// Conectar handlers de los controles renderizados por data-action
function attachCardListeners(grid, wk) {
  grid.querySelectorAll('[data-action="toggle-libre"]').forEach(el => {
    el.addEventListener("change", () => toggleLibre(el.dataset.date, wk, el));
  });
  grid.querySelectorAll('[data-action="toggle-bloque"]').forEach(el => {
    el.addEventListener("change", () => toggleBloque(el.dataset.date, wk, el.dataset.bloque, el));
  });
  grid.querySelectorAll('[data-action="save-field"]').forEach(el => {
    el.addEventListener("change", () => saveField(el.dataset.date, wk, el.dataset.bloque, el.dataset.campo, el.value));
  });
  grid.querySelectorAll('[data-action="save-note"]').forEach(el => {
    el.addEventListener("input", () => autoGrowNote(el));
    el.addEventListener("change", () => saveNote(el.dataset.date, wk, el.value));
  });
}

// Devuelve el día de la semana (1=Lun..7=Dom) desde una clave YYYY-MM-DD en hora local
function dayFromDateKey(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay(); // 0=dom, 1=lun, ..., 6=sáb
  return day === 0 ? 7 : day;
}

// ── Persistencia de campos ──
async function saveField(dateKey, wk, bloque, campo, val) {
  const data = await loadData(wk);
  const dia = dayFromDateKey(dateKey);
  if (!data[dateKey]) data[dateKey] = defaultDay(dia);
  data[dateKey] = migrateDay(data[dateKey]) || defaultDay(dia);
  data[dateKey][bloque][campo] = val;
  showToast();
  saveData(wk, data);
}

async function saveNote(dateKey, wk, val) {
  const data = await loadData(wk);
  const dia = dayFromDateKey(dateKey);
  if (!data[dateKey]) data[dateKey] = defaultDay(dia);
  data[dateKey] = migrateDay(data[dateKey]) || defaultDay(dia);
  data[dateKey].notas = val;
  showToast();
  saveData(wk, data);
}

async function toggleBloque(dateKey, wk, bloque, cb) {
  const data = await loadData(wk);
  const dia = dayFromDateKey(dateKey);
  if (!data[dateKey]) data[dateKey] = defaultDay(dia);
  data[dateKey] = migrateDay(data[dateKey]) || defaultDay(dia);
  data[dateKey][bloque].activo = cb.checked;
  showToast();
  saveData(wk, data);
  const prefix = bloque === "manana" ? "m" : "t";
  const blockEl = document.getElementById("block-" + prefix + "-" + dateKey);
  if (blockEl) blockEl.classList.toggle("inactive", !cb.checked);
}

async function toggleLibre(dateKey, wk, cb) {
  const data = await loadData(wk);
  const dia = dayFromDateKey(dateKey);
  if (!data[dateKey]) data[dateKey] = defaultDay(dia);
  data[dateKey] = migrateDay(data[dateKey]) || defaultDay(dia);
  data[dateKey].libre = cb.checked;
  showToast();
  saveData(wk, data);
  renderWeek();
}

// ── Navegación de semana ──
export function changeWeek(dir) {
  state.currentWeekOffset += dir;
  renderWeek();
}
