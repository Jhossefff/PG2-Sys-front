import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Card, Row, Col, Spinner, Alert, Button, InputGroup, Form
} from "react-bootstrap";
import {
  getLugares, createLugar, updateLugar, deleteLugar
} from "../api/lugares";
import { getEmpresas } from "../api/empresas";
import { getEstados } from "../api/estados";
import LugarFormModal from "../components/LugarFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEmpresaScope } from "../hooks/useEmpresaScope";
import { applyEmpresaScope } from "../utils/scope";

const normalize = (v) =>
  (v ?? "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const matchesQuery = (l, q) => {
  if (!q) return true;
  const nq = normalize(q);
  const campos = [
    l.idlugar, l.nombre, l.descripcion,
    l.empresa_nombre, l.empresa_codigo,
    l.estado_nombre
  ];
  return campos.some((f) => normalize(f).includes(nq));
};

export default function LugaresView() {
  const scope = useEmpresaScope();

  const [lugares, setLugares] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [estados, setEstados] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedLugar, setSelectedLugar] = useState(null);
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
      const [lug, emp, est] = await Promise.all([
        getLugares(),
        getEmpresas(),
        getEstados()
      ]);
      setLugares(applyEmpresaScope(lug, scope));
      setEmpresas(applyEmpresaScope(emp, scope));
      setEstados(applyEmpresaScope(est, scope));
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line */}, [scope.isAdminEmpresa, scope.empresaId]);

  const fallbackEstados = useMemo(() => {
    const map = new Map();
    for (const l of lugares) {
      if (l.idestado && l.estado_nombre) {
        map.set(l.idestado, { idestado: l.idestado, nombre: l.estado_nombre });
      }
    }
    return [...map.values()];
  }, [lugares]);

  const lugaresFiltrados = useMemo(
    () => lugares.filter((l) => matchesQuery(l, debouncedQuery)),
    [lugares, debouncedQuery]
  );

  const openNew = () => { setSelectedLugar(null); setSaveError(null); setShowModal(true); };
  const openEdit = (l) => { setSelectedLugar(l); setSaveError(null); setShowModal(true); };
  const handleClose = () => { if (!saving) setShowModal(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      if (selectedLugar) {
        await updateLugar(selectedLugar.idlugar, payload);
        setFlash("Lugar actualizado correctamente.");
      } else {
        await createLugar(payload);
        setFlash("Lugar creado correctamente.");
      }
      await cargar();
      setShowModal(false);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setSaveError(err.message || "Operación fallida");
    } finally { setSaving(false); }
  };

  const askDelete = (l) => { setToDelete(l); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteLugar(toDelete.idlugar);
      setFlash("Lugar eliminado.");
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
        <p className="mt-2">Cargando lugares...</p>
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
              <h4 className="mb-0">Lugares</h4>
              <small className="text-muted">
                Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}
              </small>
            </Col>

            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, descripción, empresa o estado"
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
                {lugaresFiltrados.length} de {lugares.length} resultados
              </small>
            </Col>

            <Col xs={12} md={2} className="text-md-end">
              <Button variant="primary" onClick={openNew}>
                + Nuevo Lugar
              </Button>
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 110 }}>Acciones</th>
                <th>ID</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {lugaresFiltrados.map((l) => (
                <tr key={l.idlugar}>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(l)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(l)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{l.idlugar}</td>
                  <td>
                    {l.empresa_nombre || "-"}{" "}
                    {l.empresa_codigo ? <small className="text-muted">({l.empresa_codigo})</small> : null}
                  </td>
                  <td>{l.estado_nombre || "-"}</td>
                  <td>{l.nombre}</td>
                  <td className="text-truncate" style={{ maxWidth: "300px" }} title={l.descripcion}>
                    {l.descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <LugarFormModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        lugar={selectedLugar}
        empresas={empresas}
        estados={estados}
        fallbackEstados={fallbackEstados}
      />

      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar lugar"
        body={
          <>
            ¿Seguro que deseas eliminar{" "}
            <strong>{toDelete?.nombre || `ID ${toDelete?.idlugar}`}</strong>?
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
