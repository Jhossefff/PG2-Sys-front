// src/api/estados.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Devuelve [{ idestado, nombre }]
 * Mapea el campo `estado` -> `nombre` para un formato estándar en el UI.
 */
export async function getEstados() {
  const res = await fetch(`${BASE}/estados-lugares`);
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((e) => ({
    idestado: e.idestado,
    nombre: e.estado, // se mapea el campo "estado" a "nombre"
  }));
}
