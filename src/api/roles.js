// src/api/roles.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getRoles() {
  const res = await fetch(`${BASE}/roles`);
  if (!res.ok) {
    let msg = "Error al obtener los roles";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  // Normalizamos a { idrol, nombre }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(r => ({
    idrol: r.idrol,
    nombre: r.nombre,          // p.ej. "merengues"
    descripcion: r.descripcion // opcional para mostrar
  }));
}
