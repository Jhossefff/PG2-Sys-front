// src/api/tarifas.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getTarifas() {
  const res = await fetch(`${BASE}/tarifas`);
  if (!res.ok) {
    let msg = "Error al obtener las tarifas";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createTarifa(payload) {
  const res = await fetch(`${BASE}/tarifas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear la tarifa";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateTarifa(idtarifa, payload) {
  const res = await fetch(`${BASE}/tarifas/${idtarifa}`, {
    method: "PUT", // cambia a PATCH si tu API lo usa
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar la tarifa";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteTarifa(idtarifa) {
  const res = await fetch(`${BASE}/tarifas/${idtarifa}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar la tarifa";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
