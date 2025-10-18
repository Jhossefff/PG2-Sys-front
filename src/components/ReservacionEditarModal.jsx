import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

const toBackendDateTime = (dtLocal) => dtLocal ? (dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal) : null;
const toInputLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

export default function ReservacionEditarModal({
  show, onHide, onSave, loading = false, error = null,
  reservacion = null, empresas = [], clientes = [], lugares = [], tarifas = [], usuarios = [],
}) {
  const [form, setForm] = useState({
    idusuario: "", idempresa: "", idtarifa: "", idcliente: "", idlugar: "",
    estado_reservacion: "pendiente", hora_entrada: "", hora_salida: "",
  });
  const [validated, setValidated] = useState(false);

  const lugaresDeEmpresa = useMemo(() =>
    form.idempresa ? lugares.filter(l => Number(l.idempresa) === Number(form.idempresa)) : lugares
  , [lugares, form.idempresa]);

  const tarifasDeEmpresa = useMemo(() =>
    form.idempresa ? tarifas.filter(t => Number(t.idempresa) === Number(form.idempresa)) : tarifas
  , [tarifas, form.idempresa]);

  useEffect(() => {
    if (show && reservacion) {
      setForm({
        idusuario: reservacion.idusuario ?? "",
        idempresa: reservacion.idempresa ?? "",
        idtarifa: reservacion.idtarifa ?? "",
        idcliente: reservacion.idcliente ?? "",
        idlugar: reservacion.idlugar ?? "",
        estado_reservacion: reservacion.estado_reservacion ?? "pendiente",
        hora_entrada: reservacion.hora_entrada ? toInputLocal(reservacion.hora_entrada) : "",
        hora_salida: reservacion.hora_salida ? toInputLocal(reservacion.hora_salida) : "",
      });
      setValidated(false);
    }
  }, [show, reservacion]);

  useEffect(() => { setForm((f) => ({ ...f, idtarifa: "", idlugar: "" })); }, [form.idempresa]);
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = e.currentTarget.checkValidity();
    if (!ok) { e.stopPropagation(); setValidated(true); return; }
    onSave({
      idusuario: Number(form.idusuario),
      idempresa: Number(form.idempresa),
      idtarifa: Number(form.idtarifa),
      idcliente: Number(form.idcliente),
      idlugar: Number(form.idlugar),
      estado_reservacion: form.estado_reservacion || "pendiente",
      hora_entrada: toBackendDateTime(form.hora_entrada),
      hora_salida: form.hora_salida ? toBackendDateTime(form.hora_salida) : null,
    });
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Editar Reservación #{reservacion?.idreservacion}</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Usuario *</Form.Label>
                <Form.Select required name="idusuario" value={form.idusuario} onChange={handleChange}>
                  <option value="">Seleccione usuario</option>
                  {usuarios.map(u => (
                    <option key={u.idusuario} value={u.idusuario}>
                      {u.nombre ? `${u.nombre}${u.apellido ? " " + u.apellido : ""}` : `ID ${u.idusuario}`}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona un usuario.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Empresa *</Form.Label>
                <Form.Select required name="idempresa" value={form.idempresa} onChange={handleChange}>
                  <option value="">Seleccione empresa</option>
                  {empresas.map(e => <option key={e.idempresa} value={e.idempresa}>{e.nombre} {e.codigo ? `(${e.codigo})` : ""}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona una empresa.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cliente *</Form.Label>
                <Form.Select required name="idcliente" value={form.idcliente} onChange={handleChange}>
                  <option value="">Seleccione cliente</option>
                  {clientes.map(c => <option key={c.idcliente} value={c.idcliente}>{c.nombre} {c.apellido || ""}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona un cliente.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Lugar *</Form.Label>
                <Form.Select required name="idlugar" value={form.idlugar} onChange={handleChange}>
                  <option value="">Seleccione lugar</option>
                  {lugaresDeEmpresa.map(l => <option key={l.idlugar} value={l.idlugar}>{l.nombre} {l.estado_nombre ? `- ${l.estado_nombre}` : ""}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona un lugar.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tarifa *</Form.Label>
                <Form.Select required name="idtarifa" value={form.idtarifa} onChange={handleChange}>
                  <option value="">Seleccione tarifa</option>
                  {tarifasDeEmpresa.map(t => (
                    <option key={t.idtarifa} value={t.idtarifa}>
                      {t.tipo_vehiculo} {t.tarifa_por_hora ? `• Q${t.tarifa_por_hora}/h` : ""} {t.tarifa_por_dia ? `• Q${t.tarifa_por_dia}/día` : ""}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Selecciona una tarifa.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select name="estado_reservacion" value={form.estado_reservacion} onChange={handleChange}>
                  {["pendiente", "confirmado", "cancelado", "completado"].map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Hora de entrada *</Form.Label>
                <Form.Control type="datetime-local" required name="hora_entrada" value={form.hora_entrada} onChange={handleChange} />
                <Form.Text className="text-muted">"YYYY-MM-DDTHH:mm:00"</Form.Text>
                <Form.Control.Feedback type="invalid">La hora de entrada es obligatoria.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Hora de salida</Form.Label>
                <Form.Control type="datetime-local" name="hora_salida" value={form.hora_salida} onChange={handleChange} />
                <Form.Text className="text-muted">Déjalo vacío si aún no ha salido.</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? "Guardando..." : "Actualizar"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
