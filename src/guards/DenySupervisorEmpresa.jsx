// src/guards/DenySupervisorEmpresa.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, ROLES } from "../context/AuthContext.jsx";

/**
 * Niega acceso a usuarios con rol SupervisorEmpresa (#2010).
 * Uso:
 *  <DenySupervisorEmpresa redirectTo="/reservaciones">
 *    <MiVista />
 *  </DenySupervisorEmpresa>
 */
export default function DenySupervisorEmpresa({
  children,
  redirectTo = "/reservaciones",
}) {
  const { user } = useAuth();

  const roleId =
    user?.idrol ??
    user?.rolId ??
    user?.roleId ??
    user?.rol ??
    user?.role ??
    null;

  if (Number(roleId) === Number(ROLES.SUPERVISOR_EMPRESA)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
