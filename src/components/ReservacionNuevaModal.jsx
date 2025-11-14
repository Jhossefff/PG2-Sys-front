import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useEmpresaScope } from "../hooks/useEmpresaScope";

const getEmpresaId = (x) =>
  x?.idempresa ?? x?.empresa_id ?? x?.empresaId ?? x?.empresa?.idempresa ?? null;

const toBackendDateTime = (dtLocal) =>
  dtLocal ? (dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal) : null;

export default function ReservacionNuevaModal({
  show,
  onHide,
  onSave,
  loading = false,
  error = null,
  empresas = [],
  clientes = [],
  lugares = [],
  tarifas = [],
  usuarios = [],
}) {
  const scope = useEmpresaScope();

  const [form, setForm] = useState({
    idusuario: "",
    idempresa: "",
    idcliente: "",
    idlugar: "",
    idtarifa: "",
    // 👉 solo confirmado
    estado_reservacion: "confirmado",
    hora_entrada: "",
  });

  useEffect(() => {
    if (show) {
      setForm((f) => ({
        ...f,
        idempresa: scope?.isAdminEmpresa ? String(scope.empresaId ?? "") : (f.idempresa || ""),
        estado_reservacion: "confirmado",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, scope?.isAdminEmpresa, scope?.empresaId]);

  const selectedEmpresaId = form.idempresa ? Number(form.idempresa) : null;

  const clientesMostrables = useMemo(() => {
    if (!clientes?.length) return [];
    const empresaRef =
      selectedEmpresaId ??
      (scope?.isAdminEmpresa && scope?.empresaId ? Number(scope.empresaId) : null);

    if (!empresaRef) return clientes;

    const filtrados = clientes.filter((c) => {
      const ce = getEmpresaId(c);
      if (ce == null) return false;
      return Number(ce) === Number(empresaRef);
    });

    return filtrados.length ? filtrados : clientes;
  }, [clientes, selectedEmpresaId, scope?.isAdminEmpresa, scope?.empresaId]);

  const lugaresMostrables = useMemo(() => {
    if (!lugares?.length) return [];
    const empresaRef =
      selectedEmpresaId ??
      (scope?.isAdminEmpresa && scope?.empresaId ? Number(scope.empresaId) : null);
    if (!empresaRef) return lugares;
    const f = lugares.filter((l) => Number(getEmpresaId(l)) === Number(empresaRef));
    return f.length ? f : lugares;
  }, [lugares, selectedEmpresaId, scope?.isAdminEmpresa, scope?.empresaId]);

  const tarifasMostrables = useMemo(() => {
    if (!tarifas?.length) return [];
    const empresaRef =
      selectedEmpresaId ??
      (scope?.isAdminEmpresa && scope?.empresaId ? Number(scope.empresaId) : null);
    if (!empresaRef) return tarifas;
    const f = tarifas.filter((t) => Number(getEmpresaId(t)) === Number(empresaRef));
    return f.length ? f : tarifas;
  }, [tarifas, selectedEmpresaId, scope?.isAdminEmpresa, scope?.empresaId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = (e) => {
    e?.preventDefault?.();
    onSave?.({
      idusuario: form.idusuario ? Number(form.idusuario) : null,
      idempresa: form.idempresa ? Number(form.idempresa) : (scope?.empresaId ?? null),
      idcliente: form.idcliente ? Number(form.idcliente) : null,
      idlugar: form.idlugar ? Number(form.idlugar) : null,
      idtarifa: form.idtarifa ? Number(form.idtarifa) : null,
      estado_reservacion: "confirmado", // fijo
      hora_entrada: toBackendDateTime(form.hora_entrada), // con segundos
      // hora_salida siempre va null al crear
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Nueva Reservación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{String(error)}</Alert>}
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Usuario *</Form.Label>
              <Form.Select
                name="idusuario"
                value={form.idusuario}
                onChange={onChange}
                required
              >
                <option value="">Seleccione usuario</option>
                {usuarios.map((u) => (
                  <option key={u.idusuario} value={u.idusuario}>
                    {u.nombre ? `${u.nombre} ${u.apellido ?? ""}`.trim() : u.correo || `#${u.idusuario}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Empresa *</Form.Label>
              <Form.Select
                name="idempresa"
                value={
                  scope?.isAdminEmpresa
                    ? String(scope.empresaId ?? "")
                    : (form.idempresa || "")
                }
                onChange={onChange}
                disabled={!!scope?.isAdminEmpresa}
                required
              >
                <option value="">Seleccione empresa</option>
                {empresas.map((e) => (
                  <option key={e.idempresa} value={e.idempresa}>
                    {e.nombre}{e.codigo ? ` (${e.codigo})` : ""}
                  </option>
                ))}
              </Form.Select>
              {scope?.isAdminEmpresa && (
                <small className="text-muted">Fijada por su rol (AdminEmpresa).</small>
              )}
            </Col>

            <Col md={4}>
              <Form.Label>Cliente *</Form.Label>
              <Form.Select
                name="idcliente"
                value={form.idcliente}
                onChange={onChange}
                required
              >
                <option value="">Seleccione cliente</option>
                {clientesMostrables.map((c) => (
                  <option key={c.idcliente} value={c.idcliente}>
                    {[c.nombre, c.apellido].filter(Boolean).join(" ") || `#${c.idcliente}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Lugar *</Form.Label>
              <Form.Select
                name="idlugar"
                value={form.idlugar}
                onChange={onChange}
                required
              >
                <option value="">Seleccione lugar</option>
                {lugaresMostrables.map((l) => (
                  <option key={l.idlugar} value={l.idlugar}>
                    {l.nombre || `#${l.idlugar}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Tarifa *</Form.Label>
              <Form.Select
                name="idtarifa"
                value={form.idtarifa}
                onChange={onChange}
                required
              >
                <option value="">Seleccione tarifa</option>
                {tarifasMostrables.map((t) => (
                  <option key={t.idtarifa} value={t.idtarifa}>
                    {t.tipo_vehiculo || `#${t.idtarifa}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Estado</Form.Label>
              <Form.Select name="estado_reservacion" value="confirmado" disabled>
                <option value="confirmado">confirmado</option>
              </Form.Select>
            </Col>

            <Col md={8}>
              <Form.Label>Hora de entrada *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="hora_entrada"
                value={form.hora_entrada}
                onChange={onChange}
                required
              />
              <small className="text-muted">Se enviará como “YYYY-MM-DDTHH:mm:ss”.</small>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={submit} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
