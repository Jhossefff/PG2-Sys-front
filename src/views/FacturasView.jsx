import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Button, Spinner, Alert, Form } from "react-bootstrap";
import { getFacturas, createFactura, updateFactura, deleteFactura, getFacturaById } from "../api/facturas";
import { getUsuarios } from "../api/usuarios";
import { getClientes } from "../api/clientes";
import { getReservaciones } from "../api/reservaciones";
import { getFormasPago } from "../api/formasPago";
import { getEstadosPago } from "../api/estadosPago";
import FacturaFormModal from "../components/FacturaFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { printFacturaHTML } from "../utils/printFactura";
import { useEmpresaScope } from "../hooks/useEmpresaScope";
import { applyEmpresaScope } from "../utils/scope";

const fmt = (n) => (n == null ? "-" : Number(n).toFixed(2));

export default function FacturasView() {
  const scope = useEmpresaScope();

  const [facturas, setFacturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [estadosPago, setEstadosPago] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [filtros, setFiltros] = useState({
    clienteId: "",
    estadoPagoId: "",
    reservacionId: "",
    desde: "",
    hasta: "",
  });

  // crear / editar
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [edit, setEdit] = useState(null);

  // delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // imprimir
  const [printing, setPrinting] = useState(false);

  const [flash, setFlash] = useState(null);

  const cargarCat = async () => {
    const [us, cl, rv, fp, ep] = await Promise.all([
      getUsuarios(), getClientes(), getReservaciones(), getFormasPago(), getEstadosPago(),
    ]);
    // Catálogos también filtrados por empresa si aplica
    setUsuarios(applyEmpresaScope(us, scope));
    setClientes(applyEmpresaScope(cl, scope));
    setReservaciones(applyEmpresaScope(rv, scope));
    setFormasPago(applyEmpresaScope(fp, scope));
    setEstadosPago(applyEmpresaScope(ep, scope));
  };

  const cargar = async () => {
    setLoading(true); setError(null);
    try {
      await cargarCat();
      const data = await getFacturas({
        clienteId: filtros.clienteId || undefined,
        estadoPagoId: filtros.estadoPagoId || undefined,
        reservacionId: filtros.reservacionId || undefined,
        desde: filtros.desde || undefined,
        hasta: filtros.hasta || undefined,
      });
      setFacturas(applyEmpresaScope(data, scope));
    } catch (e) {
      setError(e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */}, [scope.isAdminEmpresa, scope.empresaId]);
  const aplicarFiltros = () => cargar();

  const openNew = () => { setEdit(null); setSaveError(null); setShow(true); };
  const openEdit = (f) => { setEdit(f); setSaveError(null); setShow(true); };
  const closeModal = () => { if (!saving) setShow(false); };

  const handleSave = async (payload) => {
    setSaving(true); setSaveError(null);
    try {
      if (edit) {
        await updateFactura(edit.idfactura, payload);
        setFlash("Factura actualizada.");
      } else {
        await createFactura(payload);
        setFlash("Factura creada.");
      }
      await cargar();
      setShow(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (e) {
      setSaveError(e.message || "Operación fallida");
    } finally { setSaving(false); }
  };

  const askDelete = (f) => { setToDelete(f); setConfirmOpen(true); };
  const cancelDelete = () => { if (!deleting) setConfirmOpen(false); };
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteFactura(toDelete.idfactura);
      setFlash("Factura eliminada.");
      await cargar();
      setConfirmOpen(false);
      setTimeout(() => setFlash(null), 2000);
    } catch (e) {
      alert(e.message || "No se pudo eliminar");
    } finally { setDeleting(false); }
  };

  // === imprimir ===
  const handlePrint = async (row) => {
    try {
      setPrinting(true);
      const full = await getFacturaById(row.idfactura);
      printFacturaHTML(full);
    } catch (e) {
      alert(e.message || "No se pudo generar la impresión.");
    } finally {
      setPrinting(false);
    }
  };

  if (loading) return (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando facturas...</p></div>);
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <>
      <Card className="shadow-sm mt-4 mx-2 mx-md-4">
        <Card.Body className="px-1 px-md-4 py-3">
          <Row className="mb-3 g-2 align-items-end">
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  value={filtros.clienteId}
                  onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}
                >
                  <option value="">Todos</option>
                  {clientes.map(c => (
                    <option key={c.idcliente} value={c.idcliente}>
                      {c.nombre} {c.apellido}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Estado de pago</Form.Label>
                <Form.Select
                  value={filtros.estadoPagoId}
                  onChange={(e) => setFiltros({ ...filtros, estadoPagoId: e.target.value })}
                >
                  <option value="">Todos</option>
                  {estadosPago.map(ep => <option key={ep.idestado_pago} value={ep.idestado_pago}>{ep.descripcion}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Reservación</Form.Label>
                <Form.Select
                  value={filtros.reservacionId}
                  onChange={(e) => setFiltros({ ...filtros, reservacionId: e.target.value })}
                >
                  <option value="">Todas</option>
                  {reservaciones.map(r => <option key={r.idreservacion} value={r.idreservacion}>#{r.idreservacion}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={6} md={1}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.desde}
                  onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={1}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.hasta}
                  onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md="auto">
              <Button variant="outline-secondary" onClick={() => setFiltros({ clienteId:"", estadoPagoId:"", reservacionId:"", desde:"", hasta:"" })}>Limpiar</Button>
            </Col>
            <Col xs={12} md="auto" className="ms-md-auto">
              <Button variant="primary" onClick={aplicarFiltros}>Aplicar filtros</Button>
            </Col>
            <Col xs={12} md="auto">
              <Button variant="success" onClick={openNew}>+ Nueva factura</Button>
            </Col>
          </Row>

          {flash && <Alert variant="success" onClose={() => setFlash(null)} dismissible>{flash}</Alert>}

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th style={{ width: 220 }}>Acciones</th>
                <th>ID</th>
                <th>Reservación</th>
                <th>Cliente</th>
                <th>Usuario</th>
                <th>Forma pago</th>
                <th>Estado</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Emisión</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.idfactura}>
                  <td>
                    <div className="d-flex gap-1 justify-content-center flex-wrap">
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Imprimir / PDF"
                        onClick={() => handlePrint(f)}
                        disabled={printing}
                      >
                        <i className="bi bi-printer-fill"></i>
                      </button>
                      <button className="btn btn-primary btn-sm" title="Editar" onClick={() => openEdit(f)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => askDelete(f)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>{f.idfactura}</td>
                  <td>{f.idreservacion}</td>
                  <td>{[f.cliente_nombre, f.cliente_apellido].filter(Boolean).join(" ") || "-"}</td>
                  <td>{f.usuario_correo || f.idusuario}</td>
                  <td>{f.forma_pago}</td>
                  <td>{f.estado_pago}</td>
                  <td>Q{fmt(f.monto_subtotal)}</td>
                  <td>Q{fmt(f.monto_iva)}</td>
                  <td><strong>Q{fmt(f.monto_total)}</strong></td>
                  <td>{f.fecha_emision ? new Date(f.fecha_emision).toLocaleString() : "-"}</td>
                  <td>{f.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <FacturaFormModal
        show={show}
        onHide={closeModal}
        onSave={handleSave}
        loading={saving}
        error={saveError}
        factura={edit}
        usuarios={usuarios}
        reservaciones={reservaciones}
        clientes={clientes}
        formasPago={formasPago}
        estadosPago={estadosPago}
      />

      <ConfirmDialog
        show={confirmOpen}
        title="Eliminar factura"
        body={<>¿Seguro que deseas eliminar la factura <strong>#{toDelete?.idfactura}</strong>?</>}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
        confirmVariant="danger"
        disableActions={deleting}
      />
    </>
  );
}
