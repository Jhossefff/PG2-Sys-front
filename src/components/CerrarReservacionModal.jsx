import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

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

export default function CerrarReservacionModal({
  show, onHide, onCloseReservation, loading = false, reservacion = null,
}) {
  const [estado, setEstado] = useState("confirmado");
  const [horaSalida, setHoraSalida] = useState("");

  useEffect(() => {
    if (show) {
      setEstado(reservacion?.estado_reservacion || "confirmado");
      setHoraSalida(reservacion?.hora_salida ? toInputLocal(reservacion.hora_salida) : "");
    }
  }, [show, reservacion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!horaSalida) { alert("Ingresa la hora de salida"); return; }
    onCloseReservation({
      hora_salida: toBackendDateTime(horaSalida),
      estado_reservacion: estado || "confirmado",
    });
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title>Cerrar reservación #{reservacion?.idreservacion}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label>Hora de salida *</Form.Label>
            <Form.Control type="datetime-local" required value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} />
            <Form.Text className="text-muted">"YYYY-MM-DDTHH:mm:00" (sin Z).</Form.Text>
          </div>
          <div>
            <Form.Label>Estado</Form.Label>
            <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
              {["confirmado","completado","cancelado","pendiente"].map(s => <option key={s} value={s}>{s}</option>)}
            </Form.Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? "Cerrando..." : "Cerrar reservación"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
