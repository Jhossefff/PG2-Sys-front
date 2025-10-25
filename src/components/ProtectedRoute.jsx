// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Props:
 * - requireAuth: boolean (si true, exige sesión)
 * - allowRoles: number[] (lista de idrol permitidos; si se omite, solo requiere estar logueado)
 */
export default function ProtectedRoute({ requireAuth = true, allowRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  // Si exige sesión y no hay usuario -> login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si hay restricción de roles, validar
  if (requireAuth && allowRoles && Array.isArray(allowRoles)) {
    const permitido = allowRoles.includes(Number(user?.idrol));
    if (!permitido) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // Pasa al contenido protegido
  return <Outlet />;
}
