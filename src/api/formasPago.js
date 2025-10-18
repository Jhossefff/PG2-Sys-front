// src/api/formasPago.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getFormasPago() {
  const res = await fetch(`${BASE}/formas-pago`);
  if (!res.ok) {
    let msg = "Error al obtener las formas de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createFormaPago(payload) {
  const res = await fetch(`${BASE}/formas-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { descripcion }
  });
  if (!res.ok) {
    let msg = "Error al crear la forma de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateFormaPago(idforma_pago, payload) {
  const res = await fetch(`${BASE}/formas-pago/${idforma_pago}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { descripcion }
  });
  if (!res.ok) {
    let msg = "Error al actualizar la forma de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteFormaPago(idforma_pago) {
  const res = await fetch(`${BASE}/formas-pago/${idforma_pago}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar la forma de pago";
    try { const e = await res.json(); msg = e?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
