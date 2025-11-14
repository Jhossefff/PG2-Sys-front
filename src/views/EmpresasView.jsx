// src/views/EmpresasView.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Card, Row, Col, Spinner, Alert, Button, InputGroup, Form
} from "react-bootstrap";
import {
  getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa,
} from "../api/empresas";
import EmpresaFormModal from "../components/EmpresaFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEmpresaScope } from "../hooks/useEmpresaScope.js";
import { applyEmpresaScope } from "../utils/scope.js";

// normaliza texto para búsquedas
const normalize = (v) =>
  (v ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const matchesQuery = (emp, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [
    emp.idempresa,
    emp.codigo,
    emp.nombre,
    emp.NIT,
    emp.telefono,
    emp.correo,
    emp.direccion_formateada || emp.direccion,
  ];
  return campos.some((f) => normalize(f).includes(nq));
};

const EmpresasView = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // crear/editar
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  // eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [flash, setFlash] = useState(null);

  // búsqueda
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const scope = useEmpresaScope(); // {isAdminEmpresa, empresaId}

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmpresas();
      const scoped = applyEmpresaScope(data, scope);
      setEmpresas(scoped);
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.isAdminEmpresa, scope.empresaId]);

  const empresasFiltradas = useMemo(
    () => empresas.filter((e) => matchesQuery(e, debouncedQuery)),
    [empresas, debouncedQuery]
  );

  const openNew = () => {
    if (scope.isAdminEmpresa) return; // AdminEmpresa NO crea
    setSelectedEmpresa(null);
    setSaveError(null);
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setSelectedEmpresa(emp);
    setSaveError(null);
    setShowModal(true);
  };

  const handleClose = () => {
    if (!saving) setShowModal(false);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (selectedEmpresa) {
        await updateEmpresa(selectedEmpresa.idempresa, payload);
        setFlash("Empresa actualizada correctamente.");
      } else {
        if (scope.isAdminEmpresa) throw new Error("No autorizado.");
        await createEmpresa(payload);
        setFlash("Empresa creada correctamente.");
      }
      await cargar();
      setShowModal(false);
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setSaveError(err.message || "Operación fallida");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (emp) => {
    if (scope.isAdminEmpresa) return; // AdminEmpresa NO elimina
    setToDelete(emp);
    setConfirmOpen(true);
  };
  const cancelDelete = () => {
    if (!deleting) setConfirmOpen(false);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEmpresa(toDelete.idempresa);
      setFlash("Empresa eliminada.");
      await cargar();
      setConfirmOpen(false);
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      alert(err.message || "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando empresas...</p>
      </div>
    );
  }
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <>
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <Row className="mb-3 align-items-center g-2">
            <Col xs={12} md={6}>
              <h4 className="mb-0">Empresas Registradas</h4>
              <small className="text-muted">
                {import.meta.env.VITE_API_URL || ""}
              </small>
            </Col>

            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por código, nombre, NIT, correo o dirección"
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
                {empresasFiltradas.length} de {empresas.length} resultados
              </small>
            </Col>

            <Col xs={12} md={2} className="text-md-end">
              {!scope.isAdminEmpresa && (
                <Button variant="primary" onClick={openNew}>
                  + Nueva Empresa
                </Button>
              )}
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 110 }}>Acciones</th>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Mapa</th>
                <th>Creación</th>
                <th>Actualización</th>
              </tr>
            </thead>
            <tbody>
              {empresasFiltradas.map((emp) => (
                <tr key={emp.idempresa}>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <Button size="sm" variant="primary" onClick={() => openEdit(emp)} title="Editar">
                        <i className="bi bi-pencil-fill"></i>
                      </Button>
                      {!scope.isAdminEmpresa && (
                        <Button size="sm" variant="danger" onClick={() => askDelete(emp)} title="Eliminar">
                          <i className="bi bi-trash-fill"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                  <td>{emp.idempresa}</td>
                  <td>{emp.codigo}</td>
                  <td>{emp.nombre}</td>
                  <td>{emp.NIT}</td>
                  <td>{emp.telefono}</td>
                  <td className="text-truncate" style={{ maxWidth: "180px" }} title={emp.correo}>
                    {emp.correo}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: "220px" }} title={emp.direccion_formateada || emp.direccion}>
                    {emp.direccion_formateada || emp.direccion}
                  </td>
                  <td>
                    <a href={emp.urlmapa} target="_blank" rel="noopener noreferrer">
                      Ver mapa
                    </a>
                  </td>
                  <td>{emp.fecha_creacion ? new Date(emp.fecha_creacion).toLocaleString() : "-"}</td>
                  <td>{emp.fecha_actualizacion ? new Date(emp.fecha_actualizacion).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <EmpresaFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        empresa={selectedEmpresa}
      />

      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar empresa"
        body={
          <>
            ¿Seguro que deseas eliminar{" "}
            <strong>{toDelete?.nombre || `ID ${toDelete?.idempresa}`}</strong>?
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
};

export default EmpresasView;
