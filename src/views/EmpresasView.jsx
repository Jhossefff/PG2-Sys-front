import React, { useEffect, useState } from "react";
import { Table, Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { getEmpresas, createEmpresa } from "../api/empresas";
import EmpresaFormModal from "../components/EmpresaFormModal";

const EmpresasView = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

  const handleOpen = () => {
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
      await createEmpresa(payload);
      await cargar();       // refresca la tabla
      setShowModal(false);  // cierra modal
    } catch (err) {
      setSaveError(err.message || "No se pudo crear la empresa");
    } finally {
      setSaving(false);
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
              <Button variant="primary" onClick={handleOpen}>
                + Nueva Empresa
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
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

      {/* Modal de creación */}
      <EmpresaFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
      />
    </>
  );
};

export default EmpresasView;
