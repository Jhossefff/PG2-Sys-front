// src/api/clientes.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Listar clientes. Si pasas texto, se envía como ?texto=<...>
 */
export async function getClientes(texto = "") {
  const url = new URL(`${BASE}/clientes`);
  if (texto && texto.trim() !== "") url.searchParams.set("texto", texto.trim());

  const res = await fetch(url);
  if (!res.ok) {
    let msg = "Error al obtener los clientes";
    try { const err = await res.json(); msg = err?.error || err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getClienteById(idcliente) {
  const res = await fetch(`${BASE}/clientes/${idcliente}`);
  if (!res.ok) {
    let msg = "Error al obtener el cliente";
    try { const err = await res.json(); msg = err?.error || err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * POST: crear cliente
 * Campos requeridos: nombre, apellido, correo
 * Opcionales: telefono, codigo, latitud, longitud
 */
export async function createCliente(payload) {
  const res = await fetch(`${BASE}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear el cliente";
    try { const err = await res.json(); msg = err?.error || err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json(); // 201 con el cliente
}

/**
 * PUT: actualizar PARCIALMENTE (solo: nombre, apellido, correo, telefono, codigo)
 * Si no quieres cambiar un campo, NO lo envíes.
 */
export async function updateCliente(idcliente, payload) {
  const res = await fetch(`${BASE}/clientes/${idcliente}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar el cliente";
    try { const err = await res.json(); msg = err?.error || err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * DELETE: puede devolver 204 sin cuerpo o 409 con mensaje de FK
 */
export async function deleteCliente(idcliente) {
  const res = await fetch(`${BASE}/clientes/${idcliente}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar el cliente";
    try { const err = await res.json(); msg = err?.error || err?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
