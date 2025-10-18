// src/components/UsuarioFormModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert, InputGroup } from "react-bootstrap";

const initialForm = {
  idrol: "",
  idempresa: "",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  NIT: "",
  codigo: "",
  contrasena: "",      // solo al crear es obligatoria
  contrasena2: "",     // confirmación
};

export default function UsuarioFormModal({
  show,
  onHide,
  onSave,          // (payload) => void
  loading = false,
  error = null,
  usuario = null,  // si viene => edición
  roles = [],
  empresas = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [validated, setValidated] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const isEdit = Boolean(usuario?.idusuario);

  useEffect(() => {
    if (show) {
      if (isEdit) {
        setForm({
          idrol: usuario.idrol ?? "",
          idempresa: usuario.idempresa ?? "",
          nombre: usuario.nombre ?? "",
          apellido: usuario.apellido ?? "",
          correo: usuario.correo ?? "",
          telefono: usuario.telefono ?? "",
          NIT: usuario.NIT ?? "",
          codigo: usuario.codigo ?? "",
          contrasena: "",
          contrasena2: "",
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
    setForm((f) => ({ ...f, [name]: value }));
  };

  const buildPayload = () => {
    const payload = {
      idrol: Number(form.idrol),
      idempresa: Number(form.idempresa),
      nombre: form.nombre?.trim(),
      apellido: form.apellido?.trim(),
      correo: form.correo?.trim(),
      telefono: form.telefono?.trim(),
      NIT: form.NIT?.trim(),
      codigo: form.codigo?.trim(),
    };
    // Solo incluir contrasena si:
    // - estamos creando, o
    // - en edición el usuario escribió algo
    if (!isEdit || form.contrasena) {
      payload.contrasena = form.contrasena;
    }
    return payload;
  };

  const validatePasswords = () => {
    // En crear: obligatoria y >=6
    if (!isEdit) {
      if (!form.contrasena) return "La contraseña es obligatoria.";
      if (form.contrasena.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
      if (form.contrasena !== form.contrasena2) return "Las contraseñas no coinciden.";
    }
    // En editar: si escribió algo, validar confirmación
    if (isEdit && form.contrasena) {
      if (form.contrasena.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
      if (form.contrasena !== form.contrasena2) return "Las contraseñas no coinciden.";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = e.currentTarget.checkValidity();
    if (!ok) { e.stopPropagation(); setValidated(true); return; }

    const pwdErr = validatePasswords();
    if (pwdErr) { alert(pwdErr); return; }

    onSave(buildPayload());
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Editar Usuario" : "Nuevo Usuario"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Rol *</Form.Label>
                <Form.Select required name="idrol" value={form.idrol} onChange={handleChange}>
                  <option value="">Seleccione rol</option>
                  {roles.map((r) => (
                    <option key={r.idrol} value={r.idrol}>{r.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona un rol.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Empresa *</Form.Label>
                <Form.Select required name="idempresa" value={form.idempresa} onChange={handleChange}>
                  <option value="">Seleccione empresa</option>
                  {empresas.map((e) => (
                    <option key={e.idempresa} value={e.idempresa}>{e.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona una empresa.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control required name="nombre" value={form.nombre} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">El nombre es obligatorio.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido *</Form.Label>
                <Form.Control required name="apellido" value={form.apellido} onChange={handleChange} />
                <Form.Control.Feedback type="invalid">El apellido es obligatorio.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Correo</Form.Label>
                <Form.Control type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="usuario@dominio.com" />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control name="telefono" value={form.telefono} onChange={handleChange} placeholder="555-0000" />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>NIT</Form.Label>
                <Form.Control name="NIT" value={form.NIT} onChange={handleChange} />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Código</Form.Label>
                <Form.Control name="codigo" value={form.codigo} onChange={handleChange} />
              </Form.Group>
            </Col>

            {/* Contraseña */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>{isEdit ? "Nueva contraseña (opcional)" : "Contraseña *"}</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPwd ? "text" : "password"}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    required={!isEdit}
                    minLength={isEdit ? undefined : 6}
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    title={showPwd ? "Ocultar" : "Mostrar"}
                  >
                    <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                  </Button>
                  {!isEdit && <Form.Control.Feedback type="invalid">La contraseña es obligatoria.</Form.Control.Feedback>}
                </InputGroup>
                {!isEdit && <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Confirmar contraseña {isEdit ? "(si cambias)" : "*"}</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPwd2 ? "text" : "password"}
                    name="contrasena2"
                    value={form.contrasena2}
                    onChange={handleChange}
                    required={!isEdit}
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowPwd2(s => !s)}
                    title={showPwd2 ? "Ocultar" : "Mostrar"}
                  >
                    <i className={`bi ${showPwd2 ? "bi-eye-slash" : "bi-eye"}`} />
                  </Button>
                  {!isEdit && <Form.Control.Feedback type="invalid">Confirma la contraseña.</Form.Control.Feedback>}
                </InputGroup>
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
