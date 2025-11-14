// src/hooks/useEmpresaScope.js
import { useAuth, ROLES } from "../context/AuthContext.jsx";

/**
 * Hook central para saber si el usuario es AdminEmpresa y su empresa.
 * - Tolera distintas formas/nombres de campos que pueda traer `user`.
 * - isAdminEmpresa será true si:
 *    • roleId === ROLES.ADMIN_EMPRESA (2008)
 *    • o user.isAdminEmpresa === true
 *    • o el nombre del rol coincide con "adminempresa"/"admin_empresa"
 */
export function useEmpresaScope() {
  const { user } = useAuth();

  // Resolver roleId desde diferentes llaves posibles
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
      : // Soporta número o string numérica
        (typeof rawRole === "string" && /^\d+$/.test(rawRole)
          ? Number(rawRole)
          : Number(rawRole));

  // Resolver nombre del rol (por si viene así)
  const roleName = String(
    user?.rolNombre ?? user?.roleName ?? user?.rol_desc ?? user?.role_desc ?? ""
  )
    .trim()
    .toLowerCase();

  // Resolver empresaId desde diferentes llaves posibles
  const empresaIdRaw =
    user?.idempresa ?? user?.empresaId ?? user?.idEmpresa ?? null;

  const empresaId =
    empresaIdRaw == null
      ? null
      : (typeof empresaIdRaw === "string" && /^\d+$/.test(empresaIdRaw)
          ? Number(empresaIdRaw)
          : Number(empresaIdRaw));

  const isAdminEmpresa =
    roleId === ROLES.ADMIN_EMPRESA ||
    user?.isAdminEmpresa === true ||
    roleName === "adminempresa" ||
    roleName === "admin_empresa";

  return {
    isAdminEmpresa,
    empresaId,
    user,
    roleId,
  };
}
