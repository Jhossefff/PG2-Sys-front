// src/guards/DenyAdminEmpresa.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, ROLES } from "../context/AuthContext.jsx";

/**
 * Niega acceso a ciertos roles:
 * - AdminEmpresa (#2008)
 * - SupervisorEmpresa (#2010)
 *
 * Uso:
 *  <DenyAdminEmpresa redirectTo="/empresas">
 *      <MiVista />
 *  </DenyAdminEmpresa>
 */
export default function DenyAdminEmpresa({ children, redirectTo = "/empresas" }) {
  const { user } = useAuth();

  // Intentar obtener el rol con diferentes posibles llaves
  const rawRole =
    user?.idrol ??
    user?.rolId ??
    user?.roleId ??
    user?.rol ??
    user?.role ??
    null;

  const roleId =
    rawRole == null
      ? null
      : typeof rawRole === "string" && /^\d+$/.test(rawRole)
      ? Number(rawRole)
      : Number(rawRole);

  // Roles que NO deben acceder
  const deniedRoles = [ROLES.ADMIN_EMPRESA, ROLES.SUPERVISOR_EMPRESA];

  if (deniedRoles.includes(roleId)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
