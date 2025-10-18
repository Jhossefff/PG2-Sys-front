// src/api/clientes.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getClientes() {
  const res = await fetch(`${BASE}/clientes`);
  if (!res.ok) {
    let msg = "Error al obtener los clientes";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createCliente(payload) {
  const res = await fetch(`${BASE}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear el cliente";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateCliente(idcliente, payload) {
  const res = await fetch(`${BASE}/clientes/${idcliente}`, {
    method: "PUT", // cambia a "PATCH" si tu API usa ese método
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar el cliente";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCliente(idcliente) {
  const res = await fetch(`${BASE}/clientes/${idcliente}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar el cliente";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
