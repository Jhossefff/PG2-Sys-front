import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

// utilidades fecha
const toInputDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const toISOStartOfDay = (yyyyMMdd) => {
  if (!yyyyMMdd) return null;
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  if (!y || !m || !d) return null;
  // a medianoche UTC
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
};

const initialForm = {
  idempresa: "",
  tipo_vehiculo: "",
  tarifa_por_hora: "",
  tarifa_por_dia: "",
  fecha_inicio: "",
  fecha_fin: "",
};

const VEHICULOS = ["Auto", "Moto", "Pickup", "Camión", "Bicicleta"];

export default function TarifaFormModal({
  show,
  onHide,
  onSave,
  loading = false,
  error = null,
  tarifa = null,     // si viene => edición
  empresas = [],     // [{idempresa, nombre, codigo}]
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);

  const empresaOptions = useMemo(() => empresas, [empresas]);

  useEffect(() => {
    if (show) {
      if (tarifa) {
        setForm({
          idempresa: tarifa.idempresa ?? "",
          tipo_vehiculo: tarifa.tipo_vehiculo ?? "",
          tarifa_por_hora: tarifa.tarifa_por_hora ?? "",
          tarifa_por_dia: tarifa.tarifa_por_dia ?? "",
          fecha_inicio: toInputDate(tarifa.fecha_inicio) ?? "",
          fecha_fin: toInputDate(tarifa.fecha_fin) ?? "",
        });
      } else {
        setForm(initialForm);
      }
      setValidated(false);
    }
  }, [show, tarifa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // evitar caracteres no numéricos en tarifas (permitir punto)
    if (name === "tarifa_por_hora" || name === "tarifa_por_dia") {
      const ok = /^(\d+(\.\d{0,2})?)?$/.test(value);
      if (!ok) return;
    }
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
      tipo_vehiculo: form.tipo_vehiculo.trim(),
      // Si tu backend espera string, cambia a String(...). Aquí enviamos número.
      tarifa_por_hora: form.tarifa_por_hora ? parseFloat(form.tarifa_por_hora) : null,
      tarifa_por_dia: form.tarifa_por_dia ? parseFloat(form.tarifa_por_dia) : null,
      fecha_inicio: toISOStartOfDay(form.fecha_inicio),
      fecha_fin: form.fecha_fin ? toISOStartOfDay(form.fecha_fin) : null,
    };

    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{tarifa ? "Editar Tarifa" : "Nueva Tarifa"}</Modal.Title>
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
                  {empresaOptions.map((e) => (
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
                <Form.Label>Tipo de vehículo *</Form.Label>
                <Form.Select
                  required
                  name="tipo_vehiculo"
                  value={form.tipo_vehiculo}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {VEHICULOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Selecciona el tipo de vehículo.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Tarifa por hora</Form.Label>
                <Form.Control
                  inputMode="decimal"
                  name="tarifa_por_hora"
                  value={form.tarifa_por_hora}
                  onChange={handleChange}
                  placeholder="Ej. 12.50"
                />
                <Form.Text className="text-muted">Usa punto para decimales.</Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Tarifa por día</Form.Label>
                <Form.Control
                  inputMode="decimal"
                  name="tarifa_por_dia"
                  value={form.tarifa_por_dia}
                  onChange={handleChange}
                  placeholder="Ej. 70"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha inicio *</Form.Label>
                <Form.Control
                  type="date"
                  required
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  La fecha de inicio es obligatoria.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Déjalo vacío si aún está vigente.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Guardando..." : tarifa ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
