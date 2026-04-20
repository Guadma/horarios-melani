// ── Template base: horarios fijos de Melani ──
// Se aplica cuando una semana no tiene datos guardados en Supabase
export const BASE_TEMPLATE = {
  1: { // Lunes
    manana: { activo: true,  escuela: "San Francisco", entrada: "08:10", salida: "09:40" },
    tarde:  { activo: false, escuela: "",              entrada: "14:00", salida: "18:00" },
    notas: "", libre: false
  },
  2: { // Martes
    manana: { activo: true,  escuela: "San Francisco", entrada: "07:30", salida: "12:40" },
    tarde:  { activo: true,  escuela: "Juan Marcos",   entrada: "14:55", salida: "18:00" },
    notas: "A la tarde tengo clases recién a las 14:55 pero ya voy a Juan Marcos desde las 13 porque ya estoy en Santa Fe.",
    libre: false
  },
  3: { // Miércoles
    manana: { activo: true,  escuela: "Juan Marcos",   entrada: "07:15", salida: "12:00" },
    tarde:  { activo: true,  escuela: "Juan Marcos",   entrada: "15:50", salida: "18:00" },
    notas: "", libre: false
  },
  4: { // Jueves
    manana: { activo: true,  escuela: "La Inmaculada", entrada: "07:00", salida: "08:35" },
    tarde:  { activo: false, escuela: "",              entrada: "14:00", salida: "18:00" },
    notas: "", libre: false
  },
  5: { // Viernes
    manana: { activo: true,  escuela: "La Inmaculada", entrada: "09:25", salida: "11:35" },
    tarde:  { activo: false, escuela: "",              entrada: "14:00", salida: "18:00" },
    notas: "", libre: false
  }
};
