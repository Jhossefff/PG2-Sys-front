// src/guards/DenyAsistenteEmpresa.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLES } from "../context/AuthContext.jsx";

export default function DenyAsistenteEmpresa({ children, redirectTo }) {
  const { user } = useAuth();

  if (user?.idrol === ROLES.ASISTENTES_EMPRESA) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
