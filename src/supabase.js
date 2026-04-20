import { SUPA_URL, SUPA_KEY, TOKEN_STORAGE_KEY } from "./config.js";

// Caché en memoria para no repetir fetches de la misma semana
const weekCache = {};

function authHeaderForWrite() {
  // Si hay token de Edge Function válido (PIN OK), lo usamos para cumplir RLS.
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? "Bearer " + token : "Bearer " + SUPA_KEY;
}

export async function loadData(wk) {
  if (weekCache[wk] !== undefined) return weekCache[wk];
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/horarios?week_key=eq.${encodeURIComponent(wk)}&select=data`,
      { headers: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY } }
    );
    const rows = await res.json();
    let data = rows.length > 0 ? rows[0].data : null;
    // Si no hay datos en Supabase, migrar desde localStorage (primera vez)
    if (!data) {
      try {
        const local = JSON.parse(localStorage.getItem("melani_" + wk));
        if (local && Object.keys(local).length > 0) {
          data = local;
          saveData(wk, data); // sube el dato local a la nube
        }
      } catch {}
    }
    weekCache[wk] = data || {};
  } catch {
    // Sin conexión: usar localStorage como fallback
    try { weekCache[wk] = JSON.parse(localStorage.getItem("melani_" + wk)) || {}; }
    catch { weekCache[wk] = {}; }
  }
  return weekCache[wk];
}

export async function saveData(wk, data) {
  weekCache[wk] = data;
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/horarios`, {
      method: "POST",
      headers: {
        "apikey": SUPA_KEY,
        "Authorization": authHeaderForWrite(),
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({ week_key: wk, data, updated_at: new Date().toISOString() })
    });
    // Si el token caducó o falta, limpiar para forzar re-login en el próximo edit
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Sin conexión: guardar localmente como respaldo
    localStorage.setItem("melani_" + wk, JSON.stringify(data));
  }
}
