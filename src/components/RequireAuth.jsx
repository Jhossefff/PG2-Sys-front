// src/components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROL_ADMIN_IDS = [2007];     // ajusta a tus IDs reales
const ROL_SOPORTE_IDS = [2009];   // ajusta a tus IDs reales
const ROL_ADMIN_NOMBRES = ["Administrador"];
const ROL_SOPORTE_NOMBRES = ["Soporte"];

function hasRole(user, allowedRoles) {
  if (!user) return false;
  const { idrol, rolNombre } = user;
  const allowed =
    allowedRoles.includes("Administrador") ||
    allowedRoles.includes("Soporte");

  if (!allowed) return false;

  const isAdmin =
    ROL_ADMIN_IDS.includes(Number(idrol)) ||
    ROL_ADMIN_NOMBRES.includes(String(rolNombre || ""));
  const isSoporte =
    ROL_SOPORTE_IDS.includes(Number(idrol)) ||
    ROL_SOPORTE_NOMBRES.includes(String(rolNombre || ""));

  return (
    (allowedRoles.includes("Administrador") && isAdmin) ||
    (allowedRoles.includes("Soporte") && isSoporte)
  );
}

export default function RequireAuth({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // o un spinner

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  if (roles.length && !hasRole(user, roles)) {
    return <Navigate to="/no-autorizado" replace />;
  }
  return children;
}
