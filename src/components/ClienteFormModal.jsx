// src/components/ClienteFormModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import MapPicker from "./MapPicker";

const initialForm = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  codigo: "",
  latitud: "",
  longitud: "",
};

export default function ClienteFormModal({
  show,
  onHide,
  onSave,            // (payload) => void
  loading = false,
  error = null,
  cliente = null,    // si viene => edición
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);
  const isEdit = Boolean(cliente?.idcliente);

  useEffect(() => {
    if (show) {
      if (isEdit) {
        setForm({
          nombre: cliente.nombre ?? "",
          apellido: cliente.apellido ?? "",
          correo: cliente.correo ?? "",
          telefono: cliente.telefono ?? "",
          codigo: cliente.codigo ?? "",
          latitud: cliente.latitud ?? "",
          longitud: cliente.longitud ?? "",
        });
      } else {
        setForm(initialForm);
      }
      setValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "latitud" || name === "longitud") {
      // permitir números con signo y decimales
      const ok = /^-?\d{0,3}(\.\d{0,10})?$/.test(value) || value === "";
      if (!ok) return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const buildPayload = () => {
    if (isEdit) {
      // Tu PUT solo admite: nombre, apellido, correo, telefono, codigo
      const out = {};
      if (form.nombre) out.nombre = form.nombre.trim();
      if (form.apellido) out.apellido = form.apellido.trim();
      if (form.correo) out.correo = form.correo.trim();
      if (form.telefono) out.telefono = form.telefono.trim();
      if (form.codigo) out.codigo = form.codigo.trim();
      return out;
    } else {
      // POST: requeridos + opcionales (incluye lat/lng)
      return {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono ? form.telefono.trim() : null,
        codigo: form.codigo ? form.codigo.trim() : null,
        latitud: form.latitud !== "" ? Number(form.latitud) : null,
        longitud: form.longitud !== "" ? Number(form.longitud) : null,
      };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = e.currentTarget.checkValidity();
    if (!ok) { e.stopPropagation(); setValidated(true); return; }
    onSave(buildPayload());
  };

  // Valor para el MapPicker (si hay lat/lng válidos los usamos, sino Guatemala)
  const mapValue = (() => {
    const lat = Number(form.latitud);
    const lng = Number(form.longitud);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && form.latitud !== "" && form.longitud !== "") {
      return { lat, lng };
    }
    return { lat: 14.6349, lng: -90.5069 };
  })();

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control required name="nombre" value={form.nombre} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">Obligatorio.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido *</Form.Label>
                <Form.Control required name="apellido" value={form.apellido} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">Obligatorio.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Correo *</Form.Label>
                <Form.Control required type="email" name="correo" value={form.correo} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">Correo inválido.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control name="telefono" value={form.telefono} onChange={handleChange} />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Código</Form.Label>
                <Form.Control name="codigo" value={form.codigo} onChange={handleChange} />
              </Form.Group>
            </Col>

            {/* Lat/Lng visibles; se envían solo en POST */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Latitud</Form.Label>
                <Form.Control
                  inputMode="decimal"
                  name="latitud"
                  value={form.latitud}
                  onChange={handleChange}
                  placeholder="14.61"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Longitud</Form.Label>
                <Form.Control
                  inputMode="decimal"
                  name="longitud"
                  value={form.longitud}
                  onChange={handleChange}
                  placeholder="-90.52"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Label className="mb-2">Seleccionar en el mapa</Form.Label>
              <MapPicker
                value={mapValue}
                onChange={({ lat, lng }) => {
                  setForm((f) => ({
                    ...f,
                    latitud: String(lat),
                    longitud: String(lng),
                  }));
                }}
                height="300px"
              />
              <div className="mt-2 text-muted small">
                Haz click en el mapa para mover el pin y actualizar Lat/Lng.
              </div>
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
