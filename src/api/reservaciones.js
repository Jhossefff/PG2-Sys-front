// src/api/reservaciones.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getReservaciones() {
  const res = await fetch(`${BASE}/reservaciones`);
  if (!res.ok) {
    let msg = "Error al obtener las reservaciones";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getReservacionById(id) {
  const res = await fetch(`${BASE}/reservaciones/${id}`);
  if (!res.ok) {
    let msg = "Error al obtener la reservación";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// POST: crea reservación “abierta”
export async function createReservacion(payload) {
  // payload esperado por tu backend:
  // { idusuario, idempresa, idtarifa, idcliente, idlugar, estado_reservacion, hora_entrada, hora_salida: null }
  const res = await fetch(`${BASE}/reservaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear la reservación";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// PUT: cerrar (enviar solo hora_salida y estado_reservacion)
export async function closeReservacion(idreservacion, payload) {
  const res = await fetch(`${BASE}/reservaciones/${idreservacion}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { hora_salida, estado_reservacion }
  });
  if (!res.ok) {
    let msg = "Error al cerrar la reservación";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// PUT: editar completa (enviar objeto completo)
export async function updateReservacion(idreservacion, payload) {
  const res = await fetch(`${BASE}/reservaciones/${idreservacion}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // objeto completo
  });
  if (!res.ok) {
    let msg = "Error al actualizar la reservación";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteReservacion(idreservacion) {
  const res = await fetch(`${BASE}/reservaciones/${idreservacion}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar la reservación";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
