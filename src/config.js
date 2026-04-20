// ── Config global ──
export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
export const ESCUELAS = ["La Inmaculada", "Juan Marcos", "San Francisco", "Reemplazo"];
export const SUPA_URL = import.meta.env.VITE_SUPA_URL;
export const SUPA_KEY = import.meta.env.VITE_SUPA_KEY;
export const VERIFY_PIN_URL = `${SUPA_URL}/functions/v1/verify-pin`;
export const TOKEN_STORAGE_KEY = "melani_token";
