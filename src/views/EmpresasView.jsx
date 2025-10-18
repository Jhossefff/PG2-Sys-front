// src/views/EmpresasView.jsx
import React, { useEffect, useState } from "react";
import {
  Table, Card, Row, Col, Spinner, Alert, Button, ButtonGroup,
} from "react-bootstrap";
import {
  getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa,
} from "../api/empresas";
import EmpresaFormModal from "../components/EmpresaFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

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
  const [flash, setFlash] = useState(null); // mensaje de éxito

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // crear
  const openNew = () => {
    setSelectedEmpresa(null);
    setSaveError(null);
    setShowModal(true);
  };

  // editar
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

  // eliminar
  const askDelete = (emp) => {
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
          <Row className="mb-3 align-items-center">
            <Col>
              <h4>Empresas Registradas</h4>
              <small className="text-muted">
                Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}
              </small>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={openNew}>
                + Nueva Empresa
              </Button>
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 140 }}>Acciones</th>
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
              {empresas.map((emp) => (
                <tr key={emp.idempresa}>
                  <td>
              
                <div className="d-flex flex-wrap gap-1 justify-content-center">
                 <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openEdit(emp)}
                      title="Editar"
                    >
                     <i className="bi bi-pencil-fill"></i>
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => askDelete(emp)}
                        title="Eliminar"
                       >
                         <i className="bi bi-trash-fill"></i>
                        </Button>
                        </div>



                  </td>
                  <td>{emp.idempresa}</td>
                  <td>{emp.codigo}</td>
                  <td>{emp.nombre}</td>
                  <td>{emp.NIT}</td>
                  <td>{emp.telefono}</td>
                  <td>{emp.correo}</td>
                  <td>{emp.direccion_formateada || emp.direccion}</td>
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

      {/* Modal de crear / editar */}
      <EmpresaFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        empresa={selectedEmpresa}
      />

      {/* Confirmación de eliminación */}
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
