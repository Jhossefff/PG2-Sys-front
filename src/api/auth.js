// src/api/auth.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * POST /auth/login  { correo, contrasena }
 * Respuesta esperada:
 *  { user: { idusuario, idrol, idempresa, nombre, apellido, correo, ... }, token?: string }
 */
export async function login(correo, contrasena) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });

  if (!res.ok) {
    let msg = "No se pudo iniciar sesión";
    try {
      const e = await res.json();
      msg = e?.error || e?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function logout() {
  // Solo front: limpiar storage. (Si usas tokens, invalidar en backend según tu diseño)
  localStorage.removeItem("auth:user");
  localStorage.removeItem("auth:token");
}

export function getStoredAuth() {
  try {
    const user = JSON.parse(localStorage.getItem("auth:user") || "null");
    const token = localStorage.getItem("auth:token") || null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}
