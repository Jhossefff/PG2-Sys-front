// src/guards/DenyAdminEmpresa.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, ROLES } from "../context/AuthContext.jsx";

/**
 * Niega acceso a usuarios con rol AdminEmpresa (#2008).
 * Uso:
 *  <DenyAdminEmpresa redirectTo="/empresas"><MiVista /></DenyAdminEmpresa>
 */
export default function DenyAdminEmpresa({ children, redirectTo = "/empresas" }) {
  const { user } = useAuth?.() || {};

  // Intenta leer el rol del usuario con varias claves comunes por si cambian nombres
  const roleId =
    user?.idrol ??
    user?.rolId ??
    user?.roleId ??
    user?.rol ??
    user?.role ??
    null;

  // Si coincide con Admin Empresa, redirige
  if (Number(roleId) === Number(ROLES.ADMIN_EMPRESA)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Caso contrario, permite ver el contenido
  return <>{children}</>;
}
