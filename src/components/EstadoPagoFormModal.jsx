// src/components/EstadoPagoFormModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const initialForm = { descripcion: "" };

export default function EstadoPagoFormModal({
  show, onHide, onSave, loading = false, error = null, item = null,
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(item ? { descripcion: item.descripcion ?? "" } : initialForm);
      setValidated(false);
    }
  }, [show, item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = e.currentTarget.checkValidity();
    if (!ok) { e.stopPropagation(); setValidated(true); return; }
    onSave({ descripcion: form.descripcion.trim() });
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{item ? "Editar estado de pago" : "Nuevo estado de pago"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Descripción *</Form.Label>
            <Form.Control
              required
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <Form.Control.Feedback type="invalid">La descripción es obligatoria.</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
