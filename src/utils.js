import { BASE_TEMPLATE } from "./baseTemplate.js";
import { ESCUELAS } from "./config.js";

// ── Fechas ──
export function toDateKey(d) {
  // Formatea la fecha como YYYY-MM-DD en hora local (evita shift por UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getWeekDates(offset) {
  const now = new Date();
  const day = now.getDay(); // 0=dom, 1=lun, ..., 6=sáb
  let diff;
  if (day === 0)      diff = 1;       // domingo → mañana es lunes
  else if (day === 6) diff = 2;       // sábado → pasado mañana es lunes
  else                diff = 1 - day; // lun-vie → lunes de esta semana
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

export function weekKey(offset) {
  return toDateKey(getWeekDates(offset)[0]);
}

export function formatDate(d) {
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function isToday(d) {
  const n = new Date();
  return d.getDate() === n.getDate() &&
         d.getMonth() === n.getMonth() &&
         d.getFullYear() === n.getFullYear();
}

// ── Datos ──
export function defaultDay(diaSemana = 1) {
  // diaSemana: 1=Lunes, 2=Martes, ..., 5=Viernes
  const template = BASE_TEMPLATE[diaSemana];
  if (!template) {
    // Fallback genérico si se pide un día fuera del rango
    return {
      manana: { activo: true, entrada: "08:00", salida: "12:00", escuela: "" },
      tarde:  { activo: true, entrada: "14:00", salida: "18:00", escuela: "" },
      notas: "", libre: false
    };
  }
  // Clonar para no mutar el template original
  return JSON.parse(JSON.stringify(template));
}

export function migrateDay(dd) {
  if (!dd) return dd;
  // Formato antiguo: tenía entrada/salida en el nivel raíz
  if (dd.entrada !== undefined || dd.salida !== undefined) {
    return {
      manana: { activo: true, entrada: dd.entrada || "08:00", salida: dd.salida || "12:00", escuela: "" },
      tarde:  { activo: false, entrada: "14:00", salida: "18:00", escuela: "" },
      notas: dd.notas || "",
      libre: dd.libre || false
    };
  }
  // Asegurar campo escuela si falta (datos viejos sin ese campo)
  if (dd.manana && dd.manana.escuela === undefined) dd.manana.escuela = "";
  if (dd.tarde  && dd.tarde.escuela  === undefined) dd.tarde.escuela  = "";
  return dd;
}

export function buildSchoolOptions(selected) {
  const blank = `<option value="">— Escuela —</option>`;
  return blank + ESCUELAS.map(e =>
    `<option value="${e}" ${selected === e ? "selected" : ""}>${e}</option>`
  ).join("");
}

// ── UI helpers ──
export function autoGrowNote(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg || "✓ Guardado";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}
