// src/views/ClientesView.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Table, Row, Col, Button, Spinner, Alert, InputGroup, Form
} from "react-bootstrap";
import {
  getClientes, createCliente, updateCliente, deleteCliente
} from "../api/clientes";
import ClienteFormModal from "../components/ClienteFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEmpresaScope } from "../hooks/useEmpresaScope"; // lo dejamos por si lo usas en el layout

// normaliza texto para búsquedas tolerantes a mayúsculas/acentos
const normalize = (v) => (v ?? "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const matchesQuery = (c, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [c.idcliente, c.nombre, c.apellido, c.correo, c.codigo];
  return campos.some((f) => normalize(f).includes(nq));
};

export default function ClientesView() {
  // Nota: ya NO aplicamos filtros por empresa aquí
  useEmpresaScope(); // opcional, por si el layout depende del scope

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // buscar (debounce)
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // modal
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selected, setSelected] = useState(null);

  // delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [flash, setFlash] = useState(null);

  const cargar = async (texto = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes(texto); // trae TODO como admin/soporte
      setItems(data);
    } catch (e) {
      setError(e.message || "Error inesperado");
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(""); }, []);                 // primera carga
  useEffect(() => { cargar(debounced); }, [debounced]); // búsqueda

  const itemsFiltrados = useMemo(
    () => items.filter((c) => matchesQuery(c, debounced)),
    [items, debounced]
  );

  const openNew = () => { setSelected(null); setSaveError(null); setShow(true); };
  const openEdit = (it) => { setSelected(it); setSaveError(null); setShow(true); };
  const closeModal = () => { if (!saving) setShow(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      // IMPORTANTE: ya no forzamos idempresa; se envía tal cual llega del formulario
      if (selected) {
        await updateCliente(selected.idcliente, payload);
        setFlash("Cliente actualizado.");
      } else {
        await createCliente(payload);
        setFlash("Cliente creado.");
      }
      await cargar(debounced);
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
      await deleteCliente(toDelete.idcliente);
      setFlash("Cliente eliminado.");
      await cargar(debounced);
      setConfirmOpen(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (e) {
      // El backend puede responder 409 si tiene reservaciones
      alert(e.message || "No se pudo eliminar");
    } finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando clientes...</p>
      </div>
    );
  }
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <>
      <Card className="shadow-sm mt-4 mx-2 mx-md-4">
        <Card.Body className="px-1 px-md-4 py-3">
          <Row className="mb-3 align-items-center g-2">
            <Col xs={12} md={6}>
              <h4 className="mb-0">Clientes</h4>
              <small className="text-muted">Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}</small>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, apellido, correo o código"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <Button variant="outline-secondary" onClick={() => setQuery("")} title="Limpiar">
                    <i className="bi bi-x-lg" />
                  </Button>
                )}
              </InputGroup>
              <small className="text-muted">{itemsFiltrados.length} resultado(s)</small>
            </Col>
            <Col xs={12} md={2} className="text-md-end">
              <Button variant="primary" onClick={openNew}>+ Nuevo Cliente</Button>
            </Col>
          </Row>

          {flash && (
            <Alert variant="success" onClose={() => setFlash(null)} dismissible>
              {flash}
            </Alert>
          )}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 160 }}>Acciones</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Código</th>
                <th>Lat</th>
                <th>Lng</th>
                <th>Creación</th>
              </tr>
            </thead>
            <tbody>
              {itemsFiltrados.map((c) => (
                <tr key={c.idcliente}>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(c)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(c)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{c.idcliente}</td>
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td>{c.correo}</td>
                  <td>{c.telefono || "-"}</td>
                  <td>{c.codigo || "-"}</td>
                  <td>{c.latitud ?? "-"}</td>
                  <td>{c.longitud ?? "-"}</td>
                  <td>{c.fecha_creacion ? new Date(c.fecha_creacion).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <ClienteFormModal
        show={show}
        onHide={closeModal}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        cliente={selected}
      />

      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar cliente"
        body={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.nombre} {toDelete?.apellido}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
        confirmVariant="danger"
        disableActions={deleting}
      />
    </>
  );
}
