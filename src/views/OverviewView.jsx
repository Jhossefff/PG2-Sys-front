// src/views/OverviewView.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { getLugares } from "../api/lugares";
import { getUsuarios } from "../api/usuarios";
import { useEmpresaScope } from "../hooks/useEmpresaScope";
import { applyEmpresaScope } from "../utils/scope";

export default function OverviewView() {
  const scope = useEmpresaScope();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalLugs, setTotalLugs] = useState(0);
  const [libres, setLibres] = useState(0);
  const [ocupados, setOcupados] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // --- LUGARES ---
      const lugaresRaw = await getLugares({
        empresaId: scope.empresaId || undefined,
      });
      const lugares = applyEmpresaScope(lugaresRaw, scope);

      const tot = lugares.length;
      const libresCnt = lugares.filter(
        (l) => l.estado_nombre?.toLowerCase() === "libre"
      ).length;
      const ocupadosCnt = lugares.filter(
        (l) => l.estado_nombre?.toLowerCase() === "ocupado"
      ).length;

      setTotalLugs(tot);
      setLibres(libresCnt);
      setOcupados(ocupadosCnt);

      // --- USUARIOS ---
      const usersRaw = await getUsuarios();
      const users = applyEmpresaScope(usersRaw, scope);
      setTotalUsers(users.length);
    } catch (e) {
      setError(e.message || "Error al cargar el overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scope.empresaId) {
      setError("El usuario no tiene empresa asociada.");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.empresaId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando overview...</p>
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

  const porcOcupados = totalLugs ? Math.round((ocupados / totalLugs) * 100) : 0;
  const porcLibres = totalLugs ? Math.round((libres / totalLugs) * 100) : 0;

  return (
    <div className="mt-4 mx-2 mx-md-4">

      {/* === ENCABEZADO PRINCIPAL === */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm text-white"
        style={{
          background: "linear-gradient(90deg, #7b2ff7, #f107a3)",
        }}
      >
        <h4 className="fw-bold mb-1">
          Hola, {scope.usuarioNombre || "Usuario"} 👋  
          <span className="badge bg-light text-dark ms-2">Overview</span>
        </h4>

        <small>
          Este es el resumen de tu parqueo para{" "}
          <strong>Empresa #{scope.empresaId}</strong>.
        </small>

        <div className="d-flex justify-content-end mt-2">
          <div className="text-end">
            <div className="small">Lugares totales</div>
            <div className="fs-3 fw-bold">{totalLugs}</div>
            <div className="small mt-1">
              Ocupación actual: <strong>{porcOcupados}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* === 2 TARJETAS ABAJO === */}
      <Row className="g-3">

        {/* ▬▬▬▬▬ TARJETA: LUGARES ▬▬▬▬▬ */}
        <Col xs={12} md={6}>
          <Card className="shadow-sm h-100 rounded-4">
            <Card.Body>
              <Card.Title className="fw-bold d-flex justify-content-between">
                Lugares de estacionamiento
                <span>📍</span>
              </Card.Title>

              <Card.Subtitle className="text-muted mb-3">
                Empresa #{scope.empresaId}
              </Card.Subtitle>

              <div className="d-flex justify-content-between mb-1">
                <div>
                  <div className="small text-muted">Totales</div>
                  <div className="fs-3 fw-bold">{totalLugs}</div>
                </div>

                <div className="text-end me-2">
                  <div className="small text-muted">Ocupados</div>
                  <div className="fw-semibold text-danger">
                    {ocupados} ({porcOcupados}%)
                  </div>

                  <div className="small text-muted mt-1">Libres</div>
                  <div className="fw-semibold text-success">
                    {libres} ({porcLibres}%)
                  </div>
                </div>
              </div>

              {/* barra */}
              <div className="small text-muted mt-3 mb-1">
                Estado actual de ocupación
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

        {/* ▬▬▬▬▬ TARJETA: USUARIOS ▬▬▬▬▬ */}
        <Col xs={12} md={6}>
          <Card className="shadow-sm h-100 rounded-4">
            <Card.Body>
              <Card.Title className="fw-bold d-flex justify-content-between">
                Usuarios de la empresa
                <span>👥</span>
              </Card.Title>

              <Card.Subtitle className="text-muted mb-3">
                Cuentas con acceso al sistema
              </Card.Subtitle>

              <div className="d-flex align-items-baseline">
                <span className="fs-3 fw-bold me-2">{totalUsers}</span>
                <span className="text-muted">usuarios registrados</span>
              </div>

              <div className="small text-muted mt-3">
                Incluye administradores, supervisores y asistentes.
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
