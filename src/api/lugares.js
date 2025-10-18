// src/api/lugares.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getLugares() {
  const res = await fetch(`${BASE}/lugares`);
  if (!res.ok) {
    let msg = "Error al obtener los lugares";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createLugar(payload) {
  const res = await fetch(`${BASE}/lugares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear el lugar";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateLugar(idlugar, payload) {
  const res = await fetch(`${BASE}/lugares/${idlugar}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar el lugar";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteLugar(idlugar) {
  const res = await fetch(`${BASE}/lugares/${idlugar}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar el lugar";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
