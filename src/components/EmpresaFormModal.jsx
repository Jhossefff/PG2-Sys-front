// src/components/EmpresaFormModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import MapPicker from "./MapPicker";

const initialForm = {
  codigo: "",
  nombre: "",
  NIT: "",
  telefono: "",
  correo: "",
  direccion: "",
  direccion_formateada: "",
  latitud: "",
  longitud: "",
  urlmapa: "",
};

export default function EmpresaFormModal({
  show,
  onHide,
  onSave,
  loading = false,
  error = null,
  empresa = null, // 👉 si viene, estamos en modo edición
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);
  const [coords, setCoords] = useState(null); // {lat, lng}

  // reset y/o precarga
  useEffect(() => {
    if (show) {
      if (empresa) {
        const pre = {
          codigo: empresa.codigo ?? "",
          nombre: empresa.nombre ?? "",
          NIT: empresa.NIT ?? "",
          telefono: empresa.telefono ?? "",
          correo: empresa.correo ?? "",
          direccion: empresa.direccion ?? "",
          direccion_formateada: empresa.direccion_formateada ?? "",
          latitud: empresa.latitud ?? "",
          longitud: empresa.longitud ?? "",
          urlmapa: empresa.urlmapa ?? "",
        };
        setForm(pre);

        // si hay lat/lng, centra el mapa
        const lat = parseFloat(empresa.latitud);
        const lng = parseFloat(empresa.longitud);
        if (!isNaN(lat) && !isNaN(lng)) setCoords({ lat, lng });
        else setCoords(null);
      } else {
        setForm(initialForm);
        setCoords(null);
      }
      setValidated(false);
    }
  }, [show, empresa]);

  // Cuando cambian coords, actualizamos lat/long y urlmap
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      const lat = String(coords.lat);
      const lng = String(coords.lng);
      setForm((f) => ({
        ...f,
        latitud: lat,
        longitud: lng,
        urlmapa: `https://www.google.com/maps?q=${lat},${lng}`,
      }));
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
      NIT: form.NIT.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
      direccion_formateada: form.direccion_formateada.trim() || form.direccion.trim(),
      latitud: form.latitud.trim(),
      longitud: form.longitud.trim(),
      urlmapa: form.urlmapa.trim(),
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{empresa ? "Editar Empresa" : "Nueva Empresa"}</Modal.Title>
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
                  placeholder="EMP001"
                />
                <Form.Control.Feedback type="invalid">
                  El código es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  required
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Estacionamiento Centro"
                />
                <Form.Control.Feedback type="invalid">
                  El nombre es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>NIT</Form.Label>
                <Form.Control name="NIT" value={form.NIT} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control name="telefono" value={form.telefono} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Correo</Form.Label>
                <Form.Control type="email" name="correo" value={form.correo} onChange={handleChange} />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control name="direccion" value={form.direccion} onChange={handleChange} />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Dirección Formateada</Form.Label>
                <Form.Control
                  name="direccion_formateada"
                  value={form.direccion_formateada}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Selector en mapa */}
            <Col md={12}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Ubicación</strong>
                <Button size="sm" variant="secondary" onClick={handleUseMyLocation}>
                  Usar mi ubicación
                </Button>
              </div>
              <MapPicker value={coords} onChange={(p) => setCoords(p)} height="320px" />
              <small className="text-muted">Haz click en el mapa para seleccionar la posición.</small>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Latitud</Form.Label>
                <Form.Control name="latitud" value={form.latitud} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Longitud</Form.Label>
                <Form.Control name="longitud" value={form.longitud} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>URL Mapa</Form.Label>
                <Form.Control name="urlmapa" value={form.urlmapa} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Guardando..." : empresa ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
