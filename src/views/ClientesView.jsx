import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Card, Row, Col, Spinner, Alert, Button, InputGroup, Form
} from "react-bootstrap";
import {
  getClientes, createCliente, updateCliente, deleteCliente
} from "../api/clientes";
import ClienteFormModal from "../components/ClienteFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

// normaliza para búsqueda
const normalize = (v) =>
  (v ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const matchesQuery = (c, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [
    c.idcliente, c.codigo, c.nombre, c.apellido, c.correo, c.telefono
  ];
  return campos.some((f) => normalize(f).includes(nq));
};

export default function ClientesView() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // crear/editar
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);

  // eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [flash, setFlash] = useState(null);

  // búsqueda
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  const clientesFiltrados = useMemo(
    () => clientes.filter((c) => matchesQuery(c, debouncedQuery)),
    [clientes, debouncedQuery]
  );

  const openNew = () => { setSelectedCliente(null); setSaveError(null); setShowModal(true); };
  const openEdit = (c) => { setSelectedCliente(c); setSaveError(null); setShowModal(true); };
  const handleClose = () => { if (!saving) setShowModal(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      if (selectedCliente) {
        await updateCliente(selectedCliente.idcliente, payload);
        setFlash("Cliente actualizado correctamente.");
      } else {
        await createCliente(payload);
        setFlash("Cliente creado correctamente.");
      }
      await cargar();
      setShowModal(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setSaveError(err.message || "Operación fallida");
    } finally { setSaving(false); }
  };

  const askDelete = (c) => { setToDelete(c); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCliente(toDelete.idcliente);
      setFlash("Cliente eliminado.");
      await cargar();
      setConfirmOpen(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (err) {
      alert(err.message || "No se pudo eliminar");
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
              <small className="text-muted">
                 {import.meta.env.VITE_API_URL || ""}
              </small>
            </Col>

            {/* Buscador */}
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por código, nombre, apellido, correo o teléfono"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <Button variant="outline-secondary" onClick={() => setQuery("")} title="Limpiar">
                    <i className="bi bi-x-lg" />
                  </Button>
                )}
              </InputGroup>
              <small className="text-muted">
                {clientesFiltrados.length} de {clientes.length} resultados
              </small>
            </Col>

            <Col xs={12} md={2} className="text-md-end">
              <Button variant="primary" onClick={openNew}>
                + Nuevo Cliente
              </Button>
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
                <th style={{ width: 110 }}>Acciones</th>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Latitud</th>
                <th>Longitud</th>
                <th>Creación</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
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
                  <td>{c.codigo}</td>
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td className="text-truncate" style={{ maxWidth: "180px" }} title={c.correo}>{c.correo}</td>
                  <td>{c.telefono}</td>
                  <td>{c.latitud}</td>
                  <td>{c.longitud}</td>
                  <td>{c.fecha_creacion ? new Date(c.fecha_creacion).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal crear/editar */}
      <ClienteFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        cliente={selectedCliente}
      />

      {/* Confirmación eliminar */}
      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar cliente"
        body={
          <>
            ¿Seguro que deseas eliminar{" "}
            <strong>{toDelete?.nombre ? `${toDelete.nombre} ${toDelete.apellido}` : `ID ${toDelete?.idcliente}`}</strong>?
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
