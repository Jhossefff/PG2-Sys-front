// src/api/usuarios.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Función reutilizable para manejar respuestas de fetch
async function handleResponse(res, defaultMsg) {
  let data = null;

  // Intentar leer JSON (si no hay cuerpo, simplemente queda en null)
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // Si el status NO es 2xx, lo consideramos error
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      defaultMsg ||
      `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  // Status 2xx → devolvemos el JSON (o null si no había cuerpo)
  return data;
}

export async function getUsuarios() {
  const res = await fetch(`${BASE}/usuarios`);
  return handleResponse(res, "Error al obtener los usuarios");
}

export async function createUsuario(payload) {
  // payload debe incluir contrasena (requerida por tu backend)
  const res = await fetch(`${BASE}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Solo lanzará error si el status NO es 2xx
  return handleResponse(res, "Error al crear el usuario");
}

export async function updateUsuario(idusuario, payload) {
  const res = await fetch(`${BASE}/usuarios/${idusuario}`, {
    method: "PUT", // o PATCH si tu backend usa parches
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res, "Error al actualizar el usuario");
}

export async function deleteUsuario(idusuario) {
  const res = await fetch(`${BASE}/usuarios/${idusuario}`, {
    method: "DELETE",
  });

  // Algunos DELETE devuelven 204 sin cuerpo
  if (res.status === 204) {
    return { ok: true };
  }

  await handleResponse(res, "Error al eliminar el usuario");
  return { ok: true };
}
