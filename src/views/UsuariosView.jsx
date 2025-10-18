import React, { useEffect, useMemo, useState } from "react";
import { Table, Card, Row, Col, Spinner, Alert, Button, InputGroup, Form } from "react-bootstrap";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../api/usuarios";
import { getEmpresas } from "../api/empresas";
import { getRoles } from "../api/roles";
import UsuarioFormModal from "../components/UsuarioFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

const normalize = (v) => (v ?? "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const matchesQuery = (u, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [u.idusuario, u.nombre, u.apellido, u.correo, u.telefono, u.codigo];
  return campos.some((f) => normalize(f).includes(nq));
};

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // crear/editar
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

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
    setLoading(true);
    setError(null);
    try {
      const [us, emps, rols] = await Promise.all([getUsuarios(), getEmpresas(), getRoles()]);
      setUsuarios(us);
      setEmpresas(emps);
      setRoles(rols);
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  const usuariosFiltrados = useMemo(
    () => usuarios.filter((u) => matchesQuery(u, debouncedQuery)),
    [usuarios, debouncedQuery]
  );

  const openNew = () => { setSelectedUsuario(null); setSaveError(null); setShowModal(true); };
  const openEdit = (u) => { setSelectedUsuario(u); setSaveError(null); setShowModal(true); };
  const handleClose = () => { if (!saving) setShowModal(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      if (selectedUsuario) {
        await updateUsuario(selectedUsuario.idusuario, payload);
        setFlash("Usuario actualizado correctamente.");
      } else {
        await createUsuario(payload);
        setFlash("Usuario creado correctamente.");
      }
      await cargar();
      setShowModal(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setSaveError(err.message || "Operación fallida");
    } finally { setSaving(false); }
  };

  // eliminar
  const askDelete = (u) => { setToDelete(u); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteUsuario(toDelete.idusuario);
      setFlash("Usuario eliminado.");
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
        <p className="mt-2">Cargando usuarios...</p>
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
              <h4 className="mb-0">Usuarios</h4>
              <small className="text-muted">Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}</small>
            </Col>

            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, correo, teléfono o código"
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
                {usuariosFiltrados.length} de {usuarios.length} resultados
              </small>
            </Col>

            <Col xs={12} md={2} className="text-md-end">
              <Button variant="primary" onClick={openNew}>+ Nuevo Usuario</Button>
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 110 }}>Acciones</th>
                <th>ID</th>
                <th>Rol</th>
                <th>Empresa</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Código</th>
                <th>Creación</th>
                <th>Actualización</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => (
                <tr key={u.idusuario}>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(u)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(u)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{u.idusuario}</td>
                  <td>
                    {/* Muestra el id y tratamos de mapear el nombre del rol si coincide */}
                    {(() => {
                      const r = roles.find(x => Number(x.idrol) === Number(u.idrol));
                      return r ? `${r.nombre} (#${u.idrol})` : `#${u.idrol}`;
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const e = empresas.find(x => Number(x.idempresa) === Number(u.idempresa));
                      return e ? `${e.nombre}${e.codigo ? ` (${e.codigo})` : ""}` : `#${u.idempresa}`;
                    })()}
                  </td>
                  <td>{[u.nombre, u.apellido].filter(Boolean).join(" ")}</td>
                  <td className="text-truncate" style={{ maxWidth: "220px" }} title={u.correo}>{u.correo}</td>
                  <td>{u.NIT}</td>
                  <td>{u.telefono}</td>
                  <td>{u.codigo}</td>
                  <td>{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleString() : "-"}</td>
                  <td>{u.fecha_actualizacion ? new Date(u.fecha_actualizacion).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal crear/editar */}
      <UsuarioFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        usuario={selectedUsuario}
        roles={roles}
        empresas={empresas}
      />

      {/* Confirmación eliminar */}
      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar usuario"
        body={
          <>
            ¿Seguro que deseas eliminar a{" "}
            <strong>{selectedUsuario ? `${selectedUsuario?.nombre} ${selectedUsuario?.apellido}` : `ID ${toDelete?.idusuario}`}</strong>?
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
