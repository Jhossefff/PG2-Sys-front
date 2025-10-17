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