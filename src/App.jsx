// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { ROLES } from "./context/AuthContext.jsx";

import DenyAdminEmpresa from "./guards/DenyAdminEmpresa.jsx";


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

const SOLO_STAFF = [ROLES.ADMIN, ROLES.SOPORTE, ROLES.ADMIN_EMPRESA];

function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/no-autorizado" element={<div className="p-4">No autorizado</div>} />

      {/* Privado: requiere sesión y rol permitido */}
      <Route element={<ProtectedRoute requireAuth allowRoles={SOLO_STAFF} />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/empresas" replace />} />

          <Route path="/empresas" element={<EmpresasView />} />
          <Route path="/clientes" element={<ClientesView />} />
          <Route path="/lugares" element={<LugaresView />} />
          <Route path="/usuarios" element={<UsuariosView />} />
          <Route path="/reservaciones" element={<ReservacionesView />} />
          <Route path="/tarifas" element={<TarifasView />} />

          {/* 🔒 Bloqueadas para AdminEmpresa (#2008) */}
          <Route
            path="/formas-pago"
            element={
              <DenyAdminEmpresa redirectTo="/empresas">
                <FormasPagoView />
              </DenyAdminEmpresa>
            }
          />
          <Route
            path="/estados-pago"
            element={
              <DenyAdminEmpresa redirectTo="/empresas">
                <EstadosPagoView />
              </DenyAdminEmpresa>
            }
          />

          <Route path="/facturas" element={<FacturasView />} />

          {/* futuros */}
          <Route path="/overview" element={<div className="placeholder">Overview (próximamente)</div>} />
          <Route path="/agenda" element={<div className="placeholder">Agenda (próximamente)</div>} />
          <Route path="/reportes" element={<div className="placeholder">Reportes (próximamente)</div>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/empresas" replace />} />
    </Routes>
  );
}

export default App;
