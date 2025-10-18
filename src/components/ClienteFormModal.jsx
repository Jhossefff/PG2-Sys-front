import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import MapPicker from "./MapPicker";

const initialForm = {
  codigo: "",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  contrasena: "",
  latitud: "",
  longitud: "",
};

export default function ClienteFormModal({
  show,
  onHide,
  onSave,
  loading = false,
  error = null,
  cliente = null, // si viene => edición
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);
  const [coords, setCoords] = useState(null); // {lat, lng}

  useEffect(() => {
    if (show) {
      if (cliente) {
        const pre = {
          codigo: cliente.codigo ?? "",
          nombre: cliente.nombre ?? "",
          apellido: cliente.apellido ?? "",
          correo: cliente.correo ?? "",
          telefono: cliente.telefono ?? "",
          contrasena: "", // por seguridad normalmente no se precarga
          latitud: cliente.latitud ?? "",
          longitud: cliente.longitud ?? "",
        };
        setForm(pre);
        const lat = parseFloat(cliente.latitud);
        const lng = parseFloat(cliente.longitud);
        if (!isNaN(lat) && !isNaN(lng)) setCoords({ lat, lng });
        else setCoords(null);
      } else {
        setForm(initialForm);
        setCoords(null);
      }
      setValidated(false);
    }
  }, [show, cliente]);

  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      const lat = String(coords.lat);
      const lng = String(coords.lng);
      setForm((f) => ({ ...f, latitud: lat, longitud: lng }));
    }
  }, [coords]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocalización no soportada.");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => setCoords({ lat: c.latitude, lng: c.longitude }),
      () => alert("No se pudo obtener la ubicación."),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono.trim(),
      contrasena: form.contrasena.trim() || undefined, // si está vacío, no enviar
      latitud: form.latitud.trim(),
      longitud: form.longitud.trim(),
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{cliente ? "Editar Cliente" : "Nuevo Cliente"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Código *</Form.Label>
                <Form.Control
                  required
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  placeholder="CLI-001"
                />
                <Form.Control.Feedback type="invalid">
                  El código es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  required
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Pedro"
                />
                <Form.Control.Feedback type="invalid">
                  El nombre es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  required
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Santos"
                />
                <Form.Control.Feedback type="invalid">
                  El apellido es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="cliente@dominio.com"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="502 5555 9999"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Contraseña (solo al crear o cambiar)</Form.Label>
                <Form.Control
                  type="password"
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="Clave#2025"
                />
                <Form.Text className="text-muted">
                  Deja en blanco si no deseas cambiarla.
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Ubicación */}
            <Col md={12}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Ubicación</strong>
                <Button size="sm" variant="secondary" onClick={handleUseMyLocation}>
                  Usar mi ubicación
                </Button>
              </div>
              <MapPicker value={coords} onChange={(p) => setCoords(p)} height="300px" />
              <small className="text-muted">Haz click en el mapa para seleccionar la posición.</small>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Latitud</Form.Label>
                <Form.Control
                  name="latitud"
                  value={form.latitud}
                  onChange={handleChange}
                  placeholder="14.61"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Longitud</Form.Label>
                <Form.Control
                  name="longitud"
                  value={form.longitud}
                  onChange={handleChange}
                  placeholder="-90.52"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Guardando..." : cliente ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
