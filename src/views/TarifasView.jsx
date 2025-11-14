import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Card, Row, Col, Spinner, Alert, Button, InputGroup, Form
} from "react-bootstrap";
import {
  getTarifas, createTarifa, updateTarifa, deleteTarifa
} from "../api/tarifas";
import { getEmpresas } from "../api/empresas";
import TarifaFormModal from "../components/TarifaFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEmpresaScope } from "../hooks/useEmpresaScope";
import { applyEmpresaScope } from "../utils/scope";

const normalize = (v) =>
  (v ?? "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const matchesQuery = (t, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [
    t.idtarifa, t.tipo_vehiculo, t.empresa_nombre
  ];
  return campos.some((f) => normalize(f).includes(nq));
};

export default function TarifasView() {
  const scope = useEmpresaScope();

  const [tarifas, setTarifas] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedTarifa, setSelectedTarifa] = useState(null);
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
      const [ts, emps] = await Promise.all([getTarifas(), getEmpresas()]);
      setTarifas(applyEmpresaScope(ts, scope));
      setEmpresas(applyEmpresaScope(emps, scope));
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line */}, [scope.isAdminEmpresa, scope.empresaId]);

  const tarifasFiltradas = useMemo(
    () => tarifas.filter((t) => matchesQuery(t, debouncedQuery)),
    [tarifas, debouncedQuery]
  );

  const openNew = () => { setSelectedTarifa(null); setSaveError(null); setShowModal(true); };
  const openEdit = (t) => { setSelectedTarifa(t); setSaveError(null); setShowModal(true); };
  const handleClose = () => { if (!saving) setShowModal(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      if (selectedTarifa) {
        await updateTarifa(selectedTarifa.idtarifa, payload);
        setFlash("Tarifa actualizada correctamente.");
      } else {
        await createTarifa(payload);
        setFlash("Tarifa creada correctamente.");
      }
      await cargar();
      setShowModal(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setSaveError(err.message || "Operación fallida");
    } finally { setSaving(false); }
  };

  const askDelete = (t) => { setToDelete(t); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteTarifa(toDelete.idtarifa);
      setFlash("Tarifa eliminada.");
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
        <p className="mt-2">Cargando tarifas...</p>
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
              <h4 className="mb-0">Tarifas</h4>
              <small className="text-muted">
                Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}
              </small>
            </Col>

            {/* Buscador */}
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por vehículo o empresa"
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
                {tarifasFiltradas.length} de {tarifas.length} resultados
              </small>
            </Col>

            <Col xs={12} md={2} className="text-md-end">
              <Button variant="primary" onClick={openNew}>
                + Nueva Tarifa
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
                <th>Empresa</th>
                <th>Tipo de vehículo</th>
                <th>Tarifa/hora</th>
                <th>Tarifa/día</th>
                <th>Inicio</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              {tarifasFiltradas.map((t) => (
                <tr key={t.idtarifa}>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(t)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(t)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{t.idtarifa}</td>
                  <td>{t.empresa_nombre || "-"}</td>
                  <td>{t.tipo_vehiculo}</td>
                  <td>{t.tarifa_por_hora ?? "-"}</td>
                  <td>{t.tarifa_por_dia ?? "-"}</td>
                  <td>{t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString() : "-"}</td>
                  <td>{t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <TarifaFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        tarifa={selectedTarifa}
        empresas={empresas}
      />

      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar tarifa"
        body={
          <>
            ¿Seguro que deseas eliminar la tarifa de{" "}
            <strong>{toDelete?.tipo_vehiculo || `ID ${toDelete?.idtarifa}`}</strong>?
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
