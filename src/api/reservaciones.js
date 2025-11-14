// src/api/reservaciones.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/* Utilidad para leer mensajes de error del backend sin romper si no viene JSON */
async function readError(res, fallback) {
  try {
    const data = await res.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getReservaciones() {
  const res = await fetch(`${BASE}/reservaciones`);
  if (!res.ok) {
    throw new Error(await readError(res, "Error al obtener las reservaciones"));
  }
  return res.json();
}

export async function getReservacionById(id) {
  const res = await fetch(`${BASE}/reservaciones/${id}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Error al obtener la reservación"));
  }
  return res.json();
}

/**
 * Crea una reservación.
 * payload esperado por tu backend:
 * { idusuario, idempresa, idtarifa, idcliente, idlugar, estado_reservacion, hora_entrada, hora_salida (nullable) }
 */
export async function createReservacion(payload) {
  const res = await fetch(`${BASE}/reservaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Error al crear la reservación"));
  }
  return res.json();
}

/**
 * Cierra/completa una reservación.
 * No envía body: el backend setea estado='completado' y hora_salida=SYSDATETIME().
 */
export async function closeReservacion(idreservacion) {
  const res = await fetch(`${BASE}/reservaciones/${idreservacion}/cerrar`, {
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Error al cerrar la reservación"));
  }
  return res.json();
}

/** Actualiza campos de una reservación (PUT total o parcial según tu backend). */
export async function updateReservacion(idreservacion, payload) {
  const res = await fetch(`${BASE}/reservaciones/${idreservacion}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Error al actualizar la reservación"));
  }
  return res.json();
}

/** Elimina una reservación. */
export async function deleteReservacion(idreservacion) {
  const res = await fetch(`${BASE}/reservaciones/${idreservacion}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Error al eliminar la reservación"));
  }
  // algunos backends devuelven 204 sin body
  try {
    return await res.json();
  } catch {
    return { ok: true };
  }
}
