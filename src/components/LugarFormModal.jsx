import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

const initialForm = {
  idempresa: "",
  idestado: "",
  nombre: "",
  descripcion: "",
};

export default function LugarFormModal({
  show,
  onHide,
  onSave,
  loading = false,
  error = null,
  lugar = null,
  empresas = [],
  estados = [],
  fallbackEstados = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);

  const estadoOptions = useMemo(() => {
    if (estados && estados.length) return estados;
    return fallbackEstados;
  }, [estados, fallbackEstados]);

  useEffect(() => {
    if (show) {
      if (lugar) {
        setForm({
          idempresa: lugar.idempresa ?? "",
          idestado: lugar.idestado ?? "",
          nombre: lugar.nombre ?? "",
          descripcion: lugar.descripcion ?? "",
        });
      } else {
        setForm(initialForm);
      }
      setValidated(false);
    }
  }, [show, lugar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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
      idempresa: Number(form.idempresa),
      idestado: Number(form.idestado),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
    };
    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{lugar ? "Editar Lugar" : "Nuevo Lugar"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Empresa *</Form.Label>
                <Form.Select
                  required
                  name="idempresa"
                  value={form.idempresa}
                  onChange={handleChange}
                >
                  <option value="">Seleccione empresa</option>
                  {empresas.map((e) => (
                    <option key={e.idempresa} value={e.idempresa}>
                      {e.nombre} {e.codigo ? `(${e.codigo})` : ""}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Selecciona una empresa.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado *</Form.Label>
                <Form.Select
                  required
                  name="idestado"
                  value={form.idestado}
                  onChange={handleChange}
                >
                  <option value="">Seleccione estado</option>
                  {estadoOptions.map((es) => (
                    <option key={es.idestado} value={es.idestado}>
                      {es.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Selecciona un estado.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  required
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="C-12"
                />
                <Form.Control.Feedback type="invalid">
                  El nombre es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Bajo techo, cerca de salida"
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
            {loading ? "Guardando..." : lugar ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
