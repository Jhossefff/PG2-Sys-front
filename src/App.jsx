// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { useAuth, ROLES } from "./context/AuthContext.jsx";

import DenyAdminEmpresa from "./guards/DenyAdminEmpresa.jsx";
import DenySupervisorEmpresa from "./guards/DenySupervisorEmpresa.jsx";
import DenyAsistenteEmpresa from "./guards/DenyAsistenteEmpresa.jsx";

import LoginView from "./views/LoginView.jsx";
import EmpresasView from "./views/EmpresasView.jsx";
import ClientesView from "./views/ClientesView.jsx";
import TarifasView from "./views/TarifasView.jsx";
import LugaresView from "./views/LugaresView.jsx";
import ReservacionesView from "./views/ReservacionesView.jsx";
import FormasPagoView from "./views/FormasPagoView.jsx";
import EstadosPagoView from "./views/EstadosPagoView.jsx";
import UsuariosView from "./views/UsuariosView.jsx";
import FacturasView from "./views/FacturasView.jsx";
import OverviewView from "./views/OverviewView.jsx";
import OverviewAdminView from "./views/OverviewAdminView.jsx";

const SOLO_STAFF = [
  ROLES.ADMIN,
  ROLES.SOPORTE,
  ROLES.ADMIN_EMPRESA,
  ROLES.SUPERVISOR_EMPRESA,
  ROLES.ASISTENTES_EMPRESA,
];

function App() {
  // 👇 obtenemos el rol actual
  const { roleId } = useAuth();
  const r = Number(roleId);

  // true solo para Admin (2007) y Soporte (2009)
  const isAdminOrSoporte = r === ROLES.ADMIN || r === ROLES.SOPORTE;

  return (
    <Routes>
      {/* Público */}
      <Route path="/login" element={<LoginView />} />
      <Route
        path="/no-autorizado"
        element={<div className="p-4">No autorizado</div>}
      />

      {/* Privado */}
      <Route element={<ProtectedRoute requireAuth allowRoles={SOLO_STAFF} />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/reservaciones" replace />} />

          {/* ❌ AsistentesEmpresa NO puede entrar aquí */}
          <Route
            path="/empresas"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <DenySupervisorEmpresa redirectTo="/reservaciones">
                  <EmpresasView />
                </DenySupervisorEmpresa>
              </DenyAsistenteEmpresa>
            }
          />

          <Route
            path="/clientes"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <ClientesView />
              </DenyAsistenteEmpresa>
            }
          />
          <Route
            path="/lugares"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <LugaresView />
              </DenyAsistenteEmpresa>
            }
          />

          <Route
            path="/usuarios"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <UsuariosView />
              </DenyAsistenteEmpresa>
            }
          />

          {/* ✅ AsistentesEmpresa SÍ puede entrar */}
          <Route path="/reservaciones" element={<ReservacionesView />} />

          {/* ❌ Bloqueado para SupervisorEmpresa y AsistentesEmpresa */}
          <Route
            path="/tarifas"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <DenySupervisorEmpresa redirectTo="/reservaciones">
                  <TarifasView />
                </DenySupervisorEmpresa>
              </DenyAsistenteEmpresa>
            }
          />

          {/* ❌ Solo AdminEmpresa no puede entrar */}
          <Route
            path="/formas-pago"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <DenyAdminEmpresa redirectTo="/empresas">
                  <FormasPagoView />
                </DenyAdminEmpresa>
              </DenyAsistenteEmpresa>
            }
          />
          <Route
            path="/estados-pago"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <DenyAdminEmpresa redirectTo="/empresas">
                  <EstadosPagoView />
                </DenyAdminEmpresa>
              </DenyAsistenteEmpresa>
            }
          />

          {/* ✅ AsistentesEmpresa SÍ puede entrar */}
          <Route path="/facturas" element={<FacturasView />} />

          {/* OVERVIEW:
              - Admin / Soporte -> OverviewAdminView
              - AdminEmpresa / SupervisorEmpresa / AsistentesEmpresa -> OverviewView
          */}
          <Route
            path="/overview"
            element={isAdminOrSoporte ? <OverviewAdminView /> : <OverviewView />}
          />

          <Route
            path="/agenda"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <div className="placeholder">Agenda (próximamente)</div>
              </DenyAsistenteEmpresa>
            }
          />

          <Route
            path="/reportes"
            element={
              <DenyAsistenteEmpresa redirectTo="/reservaciones">
                <div className="placeholder">Reportes (próximamente)</div>
              </DenyAsistenteEmpresa>
            }
          />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/reservaciones" replace />} />
    </Routes>
  );
}

export default App;
