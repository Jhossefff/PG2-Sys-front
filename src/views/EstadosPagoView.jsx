// src/views/EstadosPagoView.jsx
import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { getEstadosPago, createEstadoPago, updateEstadoPago, deleteEstadoPago } from "../api/estadosPago";
import EstadoPagoFormModal from "../components/EstadoPagoFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function EstadosPagoView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selected, setSelected] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [flash, setFlash] = useState(null);

  const cargar = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getEstadosPago();
      setItems(data);
    } catch (e) {
      setError(e.message || "Error inesperado");
    } finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const openNew = () => { setSelected(null); setSaveError(null); setShow(true); };
  const openEdit = (it) => { setSelected(it); setSaveError(null); setShow(true); };
  const closeModal = () => { if (!saving) setShow(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      if (selected) {
        await updateEstadoPago(selected.idestado_pago, payload);
        setFlash("Estado de pago actualizado.");
      } else {
        await createEstadoPago(payload);
        setFlash("Estado de pago creado.");
      }
      await cargar();
      setShow(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (e) {
      setSaveError(e.message || "Operación fallida");
    } finally { setSaving(false); }
  };

  const askDelete = (it) => { setToDelete(it); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEstadoPago(toDelete.idestado_pago);
      setFlash("Eliminado correctamente.");
      await cargar();
      setConfirmOpen(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (e) {
      alert(e.message || "No se pudo eliminar");
    } finally { setDeleting(false); }
  };

  if (loading) return (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando...</p></div>);
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <>
      <Card className="shadow-sm mt-4 mx-2 mx-md-4">
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col>
              <h4>Estados de pago</h4>
              <small className="text-muted">Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}</small>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={openNew}>+ Nuevo estado</Button>
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 140 }}>Acciones</th>
                <th>ID</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.idestado_pago}>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(it)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(it)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{it.idestado_pago}</td>
                  <td>{it.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <EstadoPagoFormModal
        show={show}
        onHide={closeModal}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        item={selected}
      />

      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar estado de pago"
        body={<>¿Seguro que deseas eliminar <strong>{toDelete?.descripcion}</strong>?</>}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
        confirmVariant="danger"
        disableActions={deleting}
      />
    </>
  );
}
