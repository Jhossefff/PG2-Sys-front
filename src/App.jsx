import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EmpresasView from "./views/EmpresasView.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/empresas" replace />} />
        <Route path="/empresas" element={<EmpresasView />} />
        {/* Rutas futuras: */}
        <Route path="/overview" element={<div className="placeholder">Overview (próximamente)</div>} />
        <Route path="/clientes" element={<div className="placeholder">Clientes (próximamente)</div>} />
        <Route path="/agenda" element={<div className="placeholder">Agenda (próximamente)</div>} />
        <Route path="/reportes" element={<div className="placeholder">Reportes (próximamente)</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/empresas" replace />} />
    </Routes>
  );
}
export default App;
