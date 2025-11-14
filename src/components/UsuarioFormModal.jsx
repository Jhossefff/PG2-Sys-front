// src/components/UsuarioFormModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { useEmpresaScope } from "../hooks/useEmpresaScope";
import { ROLES } from "../context/AuthContext.jsx";

const EMPTY_FORM = {
  idrol: "",
  idempresa: "",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  NIT: "",
  codigo: "",
  contrasena: "",
  confirmarContrasena: "",
};

export default function UsuarioFormModal({
  show,
  onHide,
  onSave,
  loading,
  error,
  usuario,
  roles,
  empresas,
}) {
  const { isSupervisorEmpresa, empresaId } = useEmpresaScope();

  const [form, setForm] = useState(EMPTY_FORM);
  const [localError, setLocalError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // Inicializar / resetear formulario cuando se abre el modal o cambia usuario
  useEffect(() => {
    if (!show) return;

    // Modo edición (usuario existente con idusuario)
    if (usuario && usuario.idusuario) {
      setForm({
        ...EMPTY_FORM,
        idrol: usuario.idrol ?? "",
        idempresa: usuario.idempresa ?? "",
        nombre: usuario.nombre ?? "",
        apellido: usuario.apellido ?? "",
        correo: usuario.correo ?? "",
        telefono: usuario.telefono ?? "",
        NIT: usuario.NIT ?? "",
        codigo: usuario.codigo ?? "",
      });
      setLocalError(null);
      return;
    }

    // Modo creación
    let base = { ...EMPTY_FORM };

    // Si es SupervisorEmpresa, preseleccionar rol AsistentesEmpresa y empresa del supervisor
    if (isSupervisorEmpresa) {
      if (ROLES.ASISTENTES_EMPRESA) {
        base.idrol = ROLES.ASISTENTES_EMPRESA;
      }
      if (empresaId) {
        base.idempresa = empresaId;
      }
    }

    setForm(base);
    setLocalError(null);
  }, [show, usuario, isSupervisorEmpresa, empresaId]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validaciones básicas
    if (!form.idrol) {
      setLocalError("Debe seleccionar un rol.");
      return;
    }
    if (!form.idempresa) {
      setLocalError("Debe seleccionar una empresa.");
      return;
    }
    if (!form.nombre?.trim()) {
      setLocalError("El nombre es obligatorio.");
      return;
    }
    if (!form.correo?.trim()) {
      setLocalError("El correo es obligatorio.");
      return;
    }
    if (!usuario || !usuario.idusuario) {
      // Solo en creación validar contraseña
      if (!form.contrasena || form.contrasena.length < 6) {
        setLocalError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (form.contrasena !== form.confirmarContrasena) {
        setLocalError("Las contraseñas no coinciden.");
        return;
      }
    }

    const payload = {
      idrol: Number(form.idrol),
      idempresa: Number(form.idempresa),
      nombre: form.nombre?.trim() || null,
      apellido: form.apellido?.trim() || null,
      correo: form.correo?.trim() || null,
      telefono: form.telefono?.trim() || null,
      NIT: form.NIT?.trim() || null,
      codigo: form.codigo?.trim() || null,
    };

    // Si es creación, incluir contraseñas
    if (!usuario || !usuario.idusuario) {
      payload.contrasena = form.contrasena;
      payload.confirmarContrasena = form.confirmarContrasena;
    }

    // Reglas extra para SupervisorEmpresa:
    if (isSupervisorEmpresa) {
      // Solo permitir crear AsistentesEmpresa
      if (payload.idrol !== Number(ROLES.ASISTENTES_EMPRESA)) {
        setLocalError(
          "Como SupervisorEmpresa solo puedes crear usuarios AsistentesEmpresa."
        );
        return;
      }
      // Forzar empresa del supervisor (por seguridad)
      if (empresaId) {
        payload.idempresa = Number(empresaId);
      }
    }

    onSave(payload);
  };

  const isEdit = !!(usuario && usuario.idusuario);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Editar Usuario" : "Nuevo Usuario"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {(error || localError) && (
            <Alert variant="danger">
              {error || localError}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="usuarioRol">
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  value={form.idrol || ""}
                  onChange={handleChange("idrol")}
                  // SupervisorEmpresa no puede cambiar el rol (queda fijo en AsistentesEmpresa)
                  disabled={isEdit || isSupervisorEmpresa}
                >
                  <option value="">Seleccione rol</option>
                  {roles.map((r) => (
                    <option key={r.idrol} value={r.idrol}>
                      {r.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="usuarioEmpresa">
                <Form.Label>Empresa *</Form.Label>
                <Form.Select
                  value={form.idempresa || ""}
                  onChange={handleChange("idempresa")}
                  // si quieres que NO pueda cambiar la empresa, descomenta:
                  // disabled={isSupervisorEmpresa}
                >
                  <option value="">Seleccione empresa</option>
                  {empresas.map((e) => (
                    <option key={e.idempresa} value={e.idempresa}>
                      {e.nombre}
                      {e.codigo ? ` (${e.codigo})` : ""}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="usuarioNombre">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  value={form.nombre}
                  onChange={handleChange("nombre")}
                  placeholder="Nombre"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="usuarioApellido">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  value={form.apellido}
                  onChange={handleChange("apellido")}
                  placeholder="Apellido"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="usuarioCorreo">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  value={form.correo}
                  onChange={handleChange("correo")}
                  placeholder="usuario@dominio.com"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="usuarioTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  value={form.telefono}
                  onChange={handleChange("telefono")}
                  placeholder="555-0000"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="usuarioNIT">
                <Form.Label>NIT</Form.Label>
                <Form.Control
                  value={form.NIT}
                  onChange={handleChange("NIT")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="usuarioCodigo">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  value={form.codigo}
                  onChange={handleChange("codigo")}
                  placeholder="Código interno"
                />
              </Form.Group>
            </Col>
          </Row>

          {!isEdit && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="usuarioPass">
                    <Form.Label>Contraseña *</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPass ? "text" : "password"}
                        value={form.contrasena}
                        onChange={handleChange("contrasena")}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                      >
                        <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Mínimo 6 caracteres.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="usuarioPass2">
                    <Form.Label>Confirmar contraseña *</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPass2 ? "text" : "password"}
                        value={form.confirmarContrasena}
                        onChange={handleChange("confirmarContrasena")}
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPass2((v) => !v)}
                      >
                        <i className={`bi ${showPass2 ? "bi-eye-slash" : "bi-eye"}`} />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
