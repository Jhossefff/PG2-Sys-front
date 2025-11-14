// src/components/FacturaFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

const initialForm = {
  idusuario: "",
  usarReservacion: true,        // controla qué sección mostrar
  idreservacion: "",
  idcliente: "",
  idforma_pago: "",
  idestado_pago: "",
  monto_subtotal: "",           // solo si usarReservacion = false
  observaciones: "",
  fecha_emision: "",            // datetime-local (opcional)
};

const toISOFromLocal = (yyyyMMddThhmm) => {
  if (!yyyyMMddThhmm) return null;
  const d = new Date(yyyyMMddThhmm);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

export default function FacturaFormModal({
  show,
  onHide,
  onSave,                // (payload) => void
  loading = false,
  error = null,
  factura = null,        // si viene => edición
  usuarios = [],
  reservaciones = [],
  clientes = [],
  formasPago = [],
  estadosPago = [],
}) {
  const isEdit = Boolean(factura?.idfactura);
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (isEdit) {
      // Si la factura existente tiene idreservacion => usamos ese modo
      const usarReservacion = !!factura.idreservacion;
      setForm({
        idusuario: factura.idusuario ?? "",
        usarReservacion,
        idreservacion: factura.idreservacion ?? "",
        idcliente: factura.idcliente ?? "",
        idforma_pago: factura.idforma_pago ?? "",
        idestado_pago: factura.idestado_pago ?? "",
        monto_subtotal: usarReservacion ? "" : (factura.monto_subtotal ?? ""),
        observaciones: factura.observaciones ?? "",
        fecha_emision: factura.fecha_emision
          ? new Date(factura.fecha_emision).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setForm({ ...initialForm });
    }
    setValidated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const selectedReservacion = useMemo(
    () => reservaciones.find((r) => String(r.idreservacion) === String(form.idreservacion)),
    [reservaciones, form.idreservacion]
  );

  // Sugerir cliente desde la reservación (si existe)
  useEffect(() => {
    if (!form.usarReservacion || !selectedReservacion) return;
    if (selectedReservacion.idcliente) {
      setForm((f) => ({ ...f, idcliente: String(selectedReservacion.idcliente) }));
    }
  }, [form.usarReservacion, selectedReservacion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = e.currentTarget.checkValidity();
    if (!ok) { e.stopPropagation(); setValidated(true); return; }

    // Validación principal del nuevo backend:
    // Debe venir idreservacion O monto_subtotal (no ambos vacíos)
    if (form.usarReservacion) {
      if (!form.idreservacion) {
        alert("Selecciona una reservación o cambia a 'Factura libre'.");
        return;
      }
    } else {
      if (form.monto_subtotal === "" || Number.isNaN(Number(form.monto_subtotal))) {
        alert("Ingresa el subtotal para la factura libre.");
        return;
      }
    }

    const payload = {
      idusuario: Number(form.idusuario),
      idforma_pago: Number(form.idforma_pago),
      idestado_pago: Number(form.idestado_pago),
      idcliente: form.idcliente ? Number(form.idcliente) : null,
      idreservacion: form.usarReservacion ? Number(form.idreservacion) : null,
      monto_subtotal: form.usarReservacion ? null : Number(form.monto_subtotal),
      observaciones: form.observaciones?.trim() || null,
      fecha_emision: form.fecha_emision ? toISOFromLocal(form.fecha_emision) : null,
    };

    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Editar Factura" : "Nueva Factura"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Usuario *</Form.Label>
                <Form.Select required name="idusuario" value={form.idusuario} onChange={handleChange}>
                  <option value="">Seleccione usuario</option>
                  {usuarios.map(u => (
                    <option key={u.idusuario} value={u.idusuario}>
                      {u.correo || `${u.nombre} ${u.apellido}`}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona un usuario.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Forma de pago *</Form.Label>
                <Form.Select required name="idforma_pago" value={form.idforma_pago} onChange={handleChange}>
                  <option value="">Seleccione forma</option>
                  {formasPago.map(fp => <option key={fp.idforma_pago} value={fp.idforma_pago}>{fp.descripcion}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona la forma de pago.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado de pago *</Form.Label>
                <Form.Select required name="idestado_pago" value={form.idestado_pago} onChange={handleChange}>
                  <option value="">Seleccione estado</option>
                  {estadosPago.map(ep => <option key={ep.idestado_pago} value={ep.idestado_pago}>{ep.descripcion}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona el estado.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de emisión</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="fecha_emision"
                  value={form.fecha_emision}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Check
                type="switch"
                id="switch-usar-reservacion"
                name="usarReservacion"
                checked={form.usarReservacion}
                onChange={handleChange}
                label="Usar reservación para calcular el total (recomendado)"
              />
            </Col>

            {form.usarReservacion ? (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Reservación *</Form.Label>
                    <Form.Select required name="idreservacion" value={form.idreservacion} onChange={handleChange}>
                      <option value="">Seleccione reservación</option>
                      {reservaciones
                        .filter(r => String(r.estado_reservacion).toLowerCase() === "completado")
                        .map(r => (
                          <option key={r.idreservacion} value={r.idreservacion}>
                            #{r.idreservacion}
                            {r.empresa_nombre ? ` • ${r.empresa_nombre}` : ""}
                            {r.lugar_nombre ? ` • Lugar ${r.lugar_nombre}` : ""}
                            {r.estado_reservacion ? ` • ${r.estado_reservacion}` : ""}
                          </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">Selecciona una reservación.</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Cliente (opcional)</Form.Label>
                    <Form.Select name="idcliente" value={form.idcliente} onChange={handleChange}>
                      <option value="">— Sin cliente vinculado —</option>
                      {clientes.map(c => (
                        <option key={c.idcliente} value={c.idcliente}>
                          {c.nombre} {c.apellido} {c.codigo ? `(${c.codigo})` : ""}
                        </option>
                      ))}
                    </Form.Select>
                    {selectedReservacion?.idcliente && (
                      <Form.Text className="text-muted">
                        Sugerido desde la reservación: #{selectedReservacion.idcliente}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </>
            ) : (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Subtotal (Q) *</Form.Label>
                    <Form.Control
                      required
                      inputMode="decimal"
                      name="monto_subtotal"
                      value={form.monto_subtotal}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    <Form.Control.Feedback type="invalid">Ingresa el subtotal.</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      El IVA y el total serán calculados automáticamente en la base de datos.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Cliente (opcional)</Form.Label>
                    <Form.Select name="idcliente" value={form.idcliente} onChange={handleChange}>
                      <option value="">— Sin cliente vinculado —</option>
                      {clientes.map(c => (
                        <option key={c.idcliente} value={c.idcliente}>
                          {c.nombre} {c.apellido} {c.codigo ? `(${c.codigo})` : ""}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}

            <Col md={12}>
              <Form.Group>
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  placeholder="Notas del cobro…"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
