const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function getEmpresas() {
  const res = await fetch(`${BASE}/empresas`);
  if (!res.ok) {
    let msg = "Error al obtener las empresas";
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
//  NUEVO: crear empresa
export async function createEmpresa(payload) {
  const res = await fetch(`${BASE}/empresas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "Error al crear la empresa";
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

//  actualizar empresa
// Asumo endpoint REST: PUT /api/empresas/:id
export async function updateEmpresa(idempresa, payload) {
  const res = await fetch(`${BASE}/empresas/${idempresa}`, {
    method: "PUT", // si tu API usa PATCH, cambia aquí a "PATCH"
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar la empresa";
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// eliminar empresa
export async function deleteEmpresa(idempresa) {
  const res = await fetch(`${BASE}/empresas/${idempresa}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let msg = "Error al eliminar la empresa";
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  // algunas APIs devuelven 204 sin cuerpo
  try { return await res.json(); } catch { return { ok: true }; }
}