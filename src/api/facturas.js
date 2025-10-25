// src/api/facturas.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/** Listar con filtros (opcionales) */
export async function getFacturas(params = {}) {
  const url = new URL(`${BASE}/facturas`);
  const { clienteId, estadoPagoId, reservacionId, desde, hasta } = params;
  if (clienteId) url.searchParams.set("clienteId", clienteId);
  if (estadoPagoId) url.searchParams.set("estadoPagoId", estadoPagoId);
  if (reservacionId) url.searchParams.set("reservacionId", reservacionId);
  if (desde) url.searchParams.set("desde", desde);
  if (hasta) url.searchParams.set("hasta", hasta);

  const res = await fetch(url);
  if (!res.ok) {
    let msg = "Error al obtener facturas";
    try { const e = await res.json(); msg = e?.error || e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getFacturaById(id) {
  const res = await fetch(`${BASE}/facturas/${id}`);
  if (!res.ok) {
    let msg = "Error al obtener la factura";
    try { const err = await res.json(); msg = err?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/** Crear factura.
 *  Requeridos: idusuario, idforma_pago, idestado_pago
 *  Además: (idreservacion)  ó  (monto_subtotal)
 *  Opcionales: idcliente, observaciones, fecha_emision
 */
export async function createFactura(payload) {
  const res = await fetch(`${BASE}/facturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al crear factura";
    try { const e = await res.json(); msg = e?.error || e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/** Actualizar parcial (el trigger recalcula IVA/Total si cambian idreservacion o monto_subtotal) */
export async function updateFactura(id, payload) {
  const res = await fetch(`${BASE}/facturas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Error al actualizar factura";
    try { const e = await res.json(); msg = e?.error || e?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteFactura(id) {
  const res = await fetch(`${BASE}/facturas/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Error al eliminar factura";
    try { const e = await res.json(); msg = e?.error || e?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return { ok: true }; }
}
