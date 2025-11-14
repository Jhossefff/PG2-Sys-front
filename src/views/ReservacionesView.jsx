// src/views/ReservacionesView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Button, Table, InputGroup, Form, Spinner, Alert } from "react-bootstrap";
import { useEmpresaScope } from "../hooks/useEmpresaScope";
import { applyEmpresaScope } from "../utils/scope";

// APIs
import {
  getReservaciones,
  createReservacion,
  updateReservacion,
  deleteReservacion,
  closeReservacion, // PATCH /reservaciones/:id/cerrar (sin body)
} from "../api/reservaciones";
import { getUsuarios } from "../api/usuarios";
import { getEmpresas } from "../api/empresas";
import { getClientes } from "../api/clientes";
import { getLugares } from "../api/lugares";
import { getTarifas } from "../api/tarifas";

// Modals
import ReservacionNuevaModal from "../components/ReservacionNuevaModal";
import ReservacionEditarModal from "../components/ReservacionEditarModal";

const normalize = (v) =>
  (v ?? "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export default function ReservacionesView() {
  const scope = useEmpresaScope();

  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [tarifas, setTarifas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // crear
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // editar
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // cerrar (sin modal)
  const [closing, setClosing] = useState(false);

  // filtro
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
      const [rs, us, emps, clis, lugs, tars] = await Promise.all([
        getReservaciones(),
        getUsuarios(),
        getEmpresas(),
        getClientes(),
        getLugares(),
        getTarifas(),
      ]);

      setUsuarios(applyEmpresaScope(us, scope));
      setEmpresas(applyEmpresaScope(emps, scope));
      setClientes(clis);
      setLugares(applyEmpresaScope(lugs, scope));
      setTarifas(applyEmpresaScope(tars, scope));

      const reservasScoped = scope?.isAdminEmpresa
        ? rs.filter((r) => Number(r.idempresa) === Number(scope.empresaId))
        : rs;

      setReservas(reservasScoped);
    } catch (err) {
      setError(err?.message || "Error al cargar reservaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope?.isAdminEmpresa, scope?.empresaId]);

  const reservasFiltradas = useMemo(() => {
    if (!debouncedQuery) return reservas;
    const q = normalize(debouncedQuery);
    return reservas.filter((r) => {
      const campos = [
        getEmpresaLabel(r.idempresa),
        getClienteLabel(r.idcliente),
        getLugarLabel(r.idlugar),
        r?.vehiculo || r?.tipo_vehiculo,
        r?.estado_reservacion,
      ];
      return campos.some((c) => normalize(c).includes(q));
    });
  }, [reservas, debouncedQuery]);

  // Helpers nombres
  const findById = (arr, key, id) => arr.find((x) => Number(x[key]) === Number(id));
  const getUsuarioLabel = (idusuario) => {
    const u = findById(usuarios, "idusuario", idusuario);
    if (!u) return `#${idusuario}`;
    const nombre = [u.nombre, u.apellido].filter(Boolean).join(" ");
    return nombre || u.correo || `#${idusuario}`;
  };
  const getEmpresaLabel = (idempresa) => {
    const e = findById(empresas, "idempresa", idempresa);
    if (!e) return `#${idempresa}`;
    return e.codigo ? `${e.nombre} (${e.codigo})` : e.nombre;
  };
  const getClienteLabel = (idcliente) => {
    const c = findById(clientes, "idcliente", idcliente);
    if (!c) return `#${idcliente}`;
    const nombre = [c.nombre, c.apellido].filter(Boolean).join(" ");
    return nombre || `#${idcliente}`;
  };
  const getLugarLabel = (idlugar) => {
    const l = findById(lugares, "idlugar", idlugar);
    if (!l) return `#${idlugar}`;
    return l.nombre || `#${idlugar}`;
  };

  // Crear
  const guardarNueva = async (payload) => {
    try {
      setSaving(true);
      await createReservacion(payload);
      setShowNew(false);
      await cargar();
    } catch (err) {
      alert(err?.message || "No se pudo crear la reservación");
    } finally {
      setSaving(false);
    }
  };

  // Editar
  const openEdit = (r) => {
    setSelectedReserva(r);
    setEditError(null);
    setShowEdit(true);
  };
  const guardarEdicion = async (payload) => {
    if (!selectedReserva) return;
    try {
      setEditing(true);
      await updateReservacion(selectedReserva.idreservacion, payload);
      setShowEdit(false);
      await cargar();
    } catch (err) {
      setEditError(err?.message || "No se pudo actualizar");
    } finally {
      setEditing(false);
    }
  };

  // Eliminar
  const eliminar = async (r) => {
    if (!window.confirm(`¿Eliminar reservación #${r.idreservacion}?`)) return;
    try {
      await deleteReservacion(r.idreservacion);
      await cargar();
    } catch (err) {
      alert(err?.message || "No se pudo eliminar");
    }
  };

  // ==== Cerrar / Completar ====
  // Usa PATCH /reservaciones/:id/cerrar sin payload; el backend setea
  // estado_reservacion = 'completado' y hora_salida = SYSDATETIME()
  const openClose = async (r) => {
    if (!r) return;
    if (!window.confirm(`¿Marcar reservación #${r.idreservacion} como completada?`)) return;
    try {
      setClosing(true);
      await closeReservacion(r.idreservacion); // <-- sin body
      await cargar();
    } catch (err) {
      alert(err?.message || "No se pudo cerrar la reservación");
    } finally {
      setClosing(false);
    }
  };
  // ============================

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando reservaciones...</p>
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
              <h4 className="mb-0">Reservaciones</h4>
              <small className="text-muted">
                Fuente: {import.meta.env.VITE_API_URL || "proxy /api"}
              </small>
            </Col>

            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por empresa, cliente, lugar, vehículo o estado"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
              <small className="text-muted">
                {reservasFiltradas.length} de {reservas.length} resultados
              </small>
            </Col>

            <Col xs={12} md={2} className="text-md-end">
              <Button onClick={() => setShowNew(true)}>+ Nueva Reservación</Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Acciones</th>
                <th>ID</th>
                <th>Usuario</th>
                <th>Empresa</th>
                <th>Cliente</th>
                <th>Lugar</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Monto (Q)</th>
                <th>Creada</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map((r) => (
                <tr key={r.idreservacion}>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <button
                        className="btn btn-primary btn-sm"
                        title="Editar"
                        onClick={() => openEdit(r)}
                      >
                        <i className="bi bi-pencil-fill" />
                      </button>

                      {/* Botón Cerrar solo si está CONFIRMADO y aún no tiene salida */}
                      {String(r.estado_reservacion).toLowerCase() === "confirmado" && !r.hora_salida && (
                        <button
                          className="btn btn-success btn-sm"
                          title="Cerrar (completar) reservación"
                          onClick={() => openClose(r)}
                          disabled={closing}
                        >
                          <i className="bi bi-check2-circle" />
                        </button>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        title="Eliminar"
                        onClick={() => eliminar(r)}
                      >
                        <i className="bi bi-trash-fill" />
                      </button>
                    </div>
                  </td>
                  <td>{r.idreservacion}</td>
                  <td>{getUsuarioLabel(r.idusuario)}</td>
                  <td>{getEmpresaLabel(r.idempresa)}</td>
                  <td>{getClienteLabel(r.idcliente)}</td>
                  <td>{getLugarLabel(r.idlugar)}</td>
                  <td>{r.vehiculo || r.tipo_vehiculo || "-"}</td>
                  <td>{r.estado_reservacion || "-"}</td>
                  <td>{r.hora_entrada ? new Date(r.hora_entrada).toLocaleString() : "-"}</td>
                  <td>{r.hora_salida ? new Date(r.hora_salida).toLocaleString() : "-"}</td>
                  <td>{r.monto_total ?? r.monto ?? "-"}</td>
                  <td>{r.fecha_reservacion ? new Date(r.fecha_reservacion).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Crear */}
      <ReservacionNuevaModal
        show={showNew}
        onHide={() => setShowNew(false)}
        onSave={guardarNueva}
        loading={saving}
        empresas={empresas}
        clientes={clientes}
        lugares={lugares}
        tarifas={tarifas}
        usuarios={usuarios}
      />

      {/* Editar */}
      <ReservacionEditarModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        onSave={guardarEdicion}
        loading={editing}
        error={editError}
        reservacion={selectedReserva}
        empresas={empresas}
        clientes={clientes}
        lugares={lugares}
        tarifas={tarifas}
        usuarios={usuarios}
      />
    </>
  );
}
