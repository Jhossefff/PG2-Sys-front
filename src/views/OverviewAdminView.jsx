// src/views/OverviewAdminView.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { getLugares } from "../api/lugares";
import { useAuth, ROLES } from "../context/AuthContext.jsx";

export default function OverviewAdminView() {
  const { user, roleId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresasData, setEmpresasData] = useState([]);

  // Solo Admin (2007) y Soporte (2009)
  const isAllowed =
    Number(roleId) === ROLES.ADMIN || Number(roleId) === ROLES.SOPORTE;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Traemos TODOS los lugares (sin filtrar por empresa)
      const lugares = await getLugares();

      // Agrupar por empresa
      const mapa = new Map();

      for (const l of lugares) {
        const idemp = l.idempresa;
        if (!mapa.has(idemp)) {
          mapa.set(idemp, {
            idempresa: idemp,
            nombre: l.empresa_nombre || `Empresa #${idemp}`,
            codigo: l.empresa_codigo || "",
            total: 0,
            libres: 0,
            ocupados: 0,
          });
        }

        const item = mapa.get(idemp);
        item.total += 1;

        const est = (l.estado_nombre || "").toLowerCase();
        if (est === "libre") item.libres += 1;
        if (est === "ocupado") item.ocupados += 1;
      }

      setEmpresasData(Array.from(mapa.values()));
    } catch (e) {
      setError(e.message || "Error al cargar el overview global");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAllowed) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed]);

  if (!isAllowed) {
    return (
      <Alert variant="warning" className="m-4">
        No tienes permiso para ver este panel. Solo Administrador y Soporte.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando overview global...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        Error: {error}
      </Alert>
    );
  }

  const totalEmpresas = empresasData.length;
  const totalLugares = empresasData.reduce((acc, e) => acc + e.total, 0);
  const totalOcupados = empresasData.reduce((acc, e) => acc + e.ocupados, 0);
  const porcOcupacionGlobal = totalLugares
    ? Math.round((totalOcupados / totalLugares) * 100)
    : 0;

  return (
    <div className="mt-4 mx-2 mx-md-4">
      {/* ENCABEZADO GLOBAL */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm text-white"
        style={{
          background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
        }}
      >
        <h4 className="fw-bold mb-1">
          Panel global de parques 👀
          <span className="badge bg-light text-dark ms-2">Admin / Soporte</span>
        </h4>

        <small className="d-block">
          Vista general de los lugares de todas las empresas registradas.
        </small>

        <div className="d-flex justify-content-end mt-2 gap-4">
          <div className="text-end me-3">
            <div className="small">Empresas</div>
            <div className="fs-4 fw-bold">{totalEmpresas}</div>
          </div>
          <div className="text-end me-3">
            <div className="small">Lugares totales</div>
            <div className="fs-4 fw-bold">{totalLugares}</div>
          </div>
          <div className="text-end">
            <div className="small">Ocupación global</div>
            <div className="fs-4 fw-bold">{porcOcupacionGlobal}%</div>
          </div>
        </div>
      </div>

      {/* CARDS POR EMPRESA */}
      {empresasData.length === 0 ? (
        <Alert variant="info">No hay lugares registrados aún.</Alert>
      ) : (
        <Row className="g-3">
          {empresasData.map((emp) => {
            const porcOcupados = emp.total
              ? Math.round((emp.ocupados / emp.total) * 100)
              : 0;
            const porcLibres = emp.total
              ? Math.round((emp.libres / emp.total) * 100)
              : 0;

            return (
              <Col key={emp.idempresa} xs={12} md={6} lg={4}>
                <Card className="shadow-sm h-100 rounded-4">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-1 text-truncate">
                      {emp.nombre}
                    </Card.Title>
                    <Card.Subtitle className="text-muted mb-3">
                      {emp.codigo
                        ? `Código: ${emp.codigo}`
                        : `ID: ${emp.idempresa}`}
                    </Card.Subtitle>

                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <div className="small text-muted">Lugares totales</div>
                        <div className="fs-3 fw-bold">{emp.total}</div>
                      </div>

                      <div className="text-end me-2">
                        <div className="small text-muted">Ocupados</div>
                        <div className="fw-semibold text-danger">
                          {emp.ocupados} ({porcOcupados}%)
                        </div>

                        <div className="small text-muted mt-1">Libres</div>
                        <div className="fw-semibold text-success">
                          {emp.libres} ({porcLibres}%)
                        </div>
                      </div>
                    </div>

                    {/* barra de ocupación */}
                    <div className="small text-muted mt-3 mb-1">
                      Estado de ocupación
                    </div>
                    <div
                      style={{
                        height: 9,
                        borderRadius: 999,
                        backgroundColor: "#e9ecef",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${porcOcupados}%`,
                          backgroundColor: "#ff6b6b",
                          height: "100%",
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
