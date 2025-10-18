// src/views/ReservacionesView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Table, Card, Row, Col, Spinner, Alert, Button, InputGroup, Form } from "react-bootstrap";
import { getReservaciones, createReservacion, updateReservacion, closeReservacion, deleteReservacion } from "../api/reservaciones";
import { getEmpresas } from "../api/empresas";
import { getClientes } from "../api/clientes";
import { getLugares } from "../api/lugares";
import { getTarifas } from "../api/tarifas";
import { getUsuarios } from "../api/usuarios";
import ReservacionNuevaModal from "../components/ReservacionNuevaModal";
import ReservacionEditarModal from "../components/ReservacionEditarModal";
import CerrarReservacionModal from "../components/CerrarReservacionModal";
import ConfirmDialog from "../components/ConfirmDialog";

const normalize = (v) => (v ?? "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const matchesQuery = (r, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [r.idreservacion, r.empresa_nombre, r.cliente_nombre, r.cliente_apellido, r.lugar_nombre, r.tipo_vehiculo, r.estado_reservacion];
  return campos.some((f) => normalize(f).includes(nq));
};

export default function ReservacionesView() {
  const [reservaciones, setReservaciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // crear
  const [showNew, setShowNew] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [saveNewError, setSaveNewError] = useState(null);

  // editar
  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [saveEditError, setSaveEditError] = useState(null);
  const [toEdit, setToEdit] = useState(null);

  // cerrar
  const [showClose, setShowClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [toClose, setToClose] = useState(null);

  // eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [flash, setFlash] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const cargar = async () => {
    setLoading(true); setError(null);
    try {
      const [resv, emps, clis, lugs, tars, usrs] = await Promise.all([
        getReservaciones(), getEmpresas(), getClientes(), getLugares(), getTarifas(), getUsuarios(),
      ]);
      setReservaciones(resv); setEmpresas(emps); setClientes(clis); setLugares(lugs); setTarifas(tars); setUsuarios(usrs);
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const reservacionesFiltradas = useMemo(
    () => reservaciones.filter((r) => matchesQuery(r, debouncedQuery)),
    [reservaciones, debouncedQuery]
  );

  // Crear
  const openNew = () => { setSaveNewError(null); setShowNew(true); };
  const closeNew = () => { if (!savingNew) setShowNew(false); };
  const handleCreate = async (payload) => {
    setSavingNew(true); setSaveNewError(null);
    try {
      await createReservacion(payload);
      setFlash("Reservación creada correctamente.");
      await cargar();
      setShowNew(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setSaveNewError(err.message || "No se pudo crear");
    } finally { setSavingNew(false); }
  };

  // Editar (full)
  const openEdit = (r) => { setToEdit(r); setSaveEditError(null); setShowEdit(true); };
  const closeEdit = () => { if (!savingEdit) setShowEdit(false); };
  const handleEdit = async (payload) => {
    setSavingEdit(true); setSaveEditError(null);
    try {
      await updateReservacion(toEdit.idreservacion, payload);
      setFlash("Reservación actualizada.");
      await cargar();
      setShowEdit(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setSaveEditError(err.message || "No se pudo actualizar");
    } finally { setSavingEdit(false); }
  };

  // Cerrar
  const openClose = (r) => { setToClose(r); setShowClose(true); };
  const closeClose = () => { if (!closing) setShowClose(false); };
  const handleCloseReservation = async (payload) => {
    setClosing(true);
    try {
      await closeReservacion(toClose.idreservacion, payload); // {hora_salida, estado_reservacion}
      setFlash("Reservación cerrada (monto_total calculado).");
      await cargar();
      setShowClose(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      alert(err.message || "No se pudo cerrar la reservación");
    } finally { setClosing(false); }
  };

  // Eliminar
  const askDelete = (r) => { setToDelete(r); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteReservacion(toDelete.idreservacion);
      setFlash("Reservación eliminada.");
      await cargar();
      setConfirmOpen(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (err) {
      alert(err.message || "No se pudo eliminar");
    } finally { setDeleting(false); }
  };

  if (loading) return (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando reservaciones...</p></div>);
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <>
      <Card className="shadow-sm mt-4 mx-2 mx-md-4">
        <Card.Body className="px-1 px-md-4 py-3">
          <Row className="mb-3 align-items-center g-2">
            <Col xs={12} md={6}>
              <h4 className="mb-0">Reservaciones</h4>
              <small className="text-muted">Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}</small>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control placeholder="Buscar por empresa, cliente, lugar, vehículo o estado" value={query} onChange={(e) => setQuery(e.target.value)} />
                {query && <Button variant="outline-secondary" onClick={() => setQuery("")} title="Limpiar"><i className="bi bi-x-lg" /></Button>}
              </InputGroup>
              <small className="text-muted">{reservacionesFiltradas.length} de {reservaciones.length} resultados</small>
            </Col>
            <Col xs={12} md={2} className="text-md-end">
              <Button variant="primary" onClick={openNew}>+ Nueva Reservación</Button>
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 200 }}>Acciones</th>
                <th>ID</th>
                <th>Usuario</th>
                <th>Empresa</th>
                <th>Cliente</th>
                <th>Lugar</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Monto (Q)</th>
                <th>Creada</th>
              </tr>
            </thead>
            <tbody>
              {reservacionesFiltradas.map((r) => (
                <tr key={r.idreservacion}>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(r)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      {!r.hora_salida && (
                        <button className="btn btn-success btn-sm" title="Cerrar" onClick={() => openClose(r)}>
                          <i className="bi bi-check2-circle"></i>
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(r)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{r.idreservacion}</td>
                  <td>{r.idusuario ?? "-"}</td>
                  <td>{r.empresa_nombre || "-"}</td>
                  <td>{[r.cliente_nombre, r.cliente_apellido].filter(Boolean).join(" ") || "-"}</td>
                  <td>{r.lugar_nombre || "-"}</td>
                  <td>{r.tipo_vehiculo || "-"}</td>
                  <td>{r.estado_reservacion || "-"}</td>
                  <td>{r.hora_entrada ? new Date(r.hora_entrada).toLocaleString() : "-"}</td>
                  <td>{r.hora_salida ? new Date(r.hora_salida).toLocaleString() : "-"}</td>
                  <td>{r.monto_total ?? "-"}</td>
                  <td>{r.fecha_reservacion ? new Date(r.fecha_reservacion).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Crear */}
      <ReservacionNuevaModal
        show={showNew}
        onHide={closeNew}
        onSave={handleCreate}
        loading={savingNew}
        error={saveNewError}
        empresas={empresas}
        clientes={clientes}
        lugares={lugares}
        tarifas={tarifas}
        usuarios={usuarios}
      />

      {/* Editar */}
      <ReservacionEditarModal
        show={showEdit}
        onHide={closeEdit}
        onSave={handleEdit}
        loading={savingEdit}
        error={saveEditError}
        reservacion={toEdit}
        empresas={empresas}
        clientes={clientes}
        lugares={lugares}
        tarifas={tarifas}
        usuarios={usuarios}
      />

      {/* Cerrar */}
      <CerrarReservacionModal
        show={showClose}
        onHide={closeClose}
        onCloseReservation={handleCloseReservation}
        loading={closing}
        reservacion={toClose}
      />

      {/* Confirmación eliminar */}
      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar reservación"
        body={<>¿Seguro que deseas eliminar la reservación <strong>{toDelete?.idreservacion ? `#${toDelete.idreservacion}` : ""}</strong>? Esta acción no se puede deshacer.</>}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
        confirmVariant="danger"
        disableActions={deleting}
      />
    </>
  );
}
