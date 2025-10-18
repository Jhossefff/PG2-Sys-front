// src/api/estadosPago.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getEstadosPago() {
  const res = await fetch(`${BASE}/estados-pago`);
  if (!res.ok) {
    let msg = "Error al obtener los estados de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createEstadoPago(payload) {
  const res = await fetch(`${BASE}/estados-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { descripcion }
  });
  if (!res.ok) {
    let msg = "Error al crear el estado de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateEstadoPago(idestado_pago, payload) {
  const res = await fetch(`${BASE}/estados-pago/${idestado_pago}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar el estado de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteEstadoPago(idestado_pago) {
  const res = await fetch(`${BASE}/estados-pago/${idestado_pago}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar el estado de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
