// src/api/usuarios.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getUsuarios() {
  const res = await fetch(`${BASE}/usuarios`);
  if (!res.ok) {
    let msg = "Error al obtener los usuarios";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function createUsuario(payload) {
  // payload debe incluir contrasena (requerida por tu backend)
  const res = await fetch(`${BASE}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear el usuario";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateUsuario(idusuario, payload) {
  // Si NO quieres cambiar contraseña, NO la incluyas en payload
  const res = await fetch(`${BASE}/usuarios/${idusuario}`, {
    method: "PUT", // o PATCH si tu backend usa parches
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar el usuario";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteUsuario(idusuario) {
  const res = await fetch(`${BASE}/usuarios/${idusuario}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar el usuario";
    try { const err = await res.json(); msg = err?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
