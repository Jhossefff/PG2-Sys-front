// src/utils/printFactura.js
export function printFacturaHTML(f) {
  const fecha = f.fecha_emision ? new Date(f.fecha_emision).toLocaleString() : "";
  const money = (v) => (v == null || isNaN(Number(v))) ? "Q0.00" : `Q${Number(v).toFixed(2)}`;
  const cliente = f.cliente_nombre
    ? `${f.cliente_nombre ?? ""} ${f.cliente_apellido ?? ""}`.trim()
    : (f.idcliente ? `#${f.idcliente}` : "-");

  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Factura #${f.idfactura}</title>
<style>
  * { box-sizing:border-box; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; margin:24px; color:#111; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
  .brand { font-size:20px; font-weight:700; }
  .muted { color:#666; }
  .box { border:1px solid #ddd; border-radius:8px; padding:16px; }
  .row { display:flex; gap:16px; margin-bottom:12px; flex-wrap:wrap; }
  .col { flex:1; min-width:220px; }
  table { width:100%; border-collapse: collapse; margin-top:12px; }
  th, td { border:1px solid #ddd; padding:8px; text-align:left; vertical-align:top; }
  th { background:#f6f7f9; }
  .right { text-align:right; white-space:nowrap; }
  .totals { margin-top:12px; width:100%; }
  .totals td { padding:6px 8px; }
  .totals .label { text-align:right; color:#555; }
  .totals .value { width:140px; text-align:right; }
  @media print { body { margin: 0.5cm; } .no-print { display:none !important; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Park — Factura</div>
    <div class="muted">Factura #${f.idfactura}</div>
  </div>

  <div class="box">
    <div class="row">
      <div class="col">
        <div><strong>Cliente:</strong> ${cliente}</div>
        <div class="muted">Usuario: ${f.usuario_correo ?? "-"}</div>
      </div>
      <div class="col">
        <div><strong>Estado de pago:</strong> ${f.estado_pago ?? "-"}</div>
        <div><strong>Forma de pago:</strong> ${f.forma_pago ?? "-"}</div>
      </div>
      <div class="col right">
        <div><strong>Emisión:</strong> ${fecha}</div>
        <div class="muted">Reservación: ${f.idreservacion ?? "-"}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th class="right" style="width:140px">Subtotal</th>
          <th class="right" style="width:120px">IVA</th>
          <th class="right" style="width:140px">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Cobro por reservación #${f.idreservacion ?? "-"}
            ${f.observaciones ? `<div class="muted">Obs: ${f.observaciones}</div>` : ""}
          </td>
          <td class="right">${money(f.monto_subtotal)}</td>
          <td class="right">${money(f.monto_iva)}</td>
          <td class="right"><strong>${money(f.monto_total)}</strong></td>
        </tr>
      </tbody>
    </table>

    <table class="totals">
      <tr><td class="label">Subtotal:</td><td class="value">${money(f.monto_subtotal)}</td></tr>
      <tr><td class="label">IVA:</td><td class="value">${money(f.monto_iva)}</td></tr>
      <tr><td class="label"><strong>Total:</strong></td><td class="value"><strong>${money(f.monto_total)}</strong></td></tr>
    </table>
  </div>

  <div class="muted" style="margin-top:12px">Gracias por su preferencia.</div>
  <div class="no-print" style="margin-top:16px"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>
</body>
</html>
  `;

  try {
    // 👉 Creamos un archivo HTML temporal y lo abrimos:
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const w = window.open(url, "_blank"); // sin noreferrer/noopener
    if (!w) {
      alert("El navegador bloqueó la ventana. Permite popups para imprimir.");
      URL.revokeObjectURL(url);
      return;
    }

    // Al cargar el documento, disparamos la impresión
    w.onload = () => {
      try { w.focus(); w.print(); } catch {}
      // Limpieza del objeto URL
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    };
  } catch (err) {
    console.error("print error:", err);
    alert("No se pudo generar el PDF/impresión.");
  }
}
