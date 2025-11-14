// src/hooks/useEmpresaScope.js
import { useAuth, ROLES } from "../context/AuthContext.jsx";

/**
 * Hook central para saber el rol/empresa del usuario y si es
 * AdminEmpresa, SupervisorEmpresa o AsistentesEmpresa.
 */
export function useEmpresaScope() {
  const { user, roleId: ctxRoleId } = useAuth();

  // Resolver roleId desde diferentes llaves posibles
  const rawRole =
    user?.idrol ??
    user?.rolId ??
    user?.roleId ??
    user?.rol ??
    user?.role ??
    ctxRoleId ??
    null;

  const roleId =
    rawRole == null
      ? null
      : Number(
          typeof rawRole === "string" && /^\d+$/.test(rawRole)
            ? Number(rawRole)
            : rawRole
        );

  // Nombre del rol (por si lo necesitas en algún momento)
  const roleName = String(
    user?.rolNombre ??
      user?.roleName ??
      user?.rol_desc ??
      user?.role_desc ??
      ""
  )
    .trim()
    .toLowerCase();

  // Resolver empresaId
  const empresaRaw =
    user?.idempresa ?? user?.empresaId ?? user?.idEmpresa ?? null;

  const empresaId =
    empresaRaw == null
      ? null
      : Number(
          typeof empresaRaw === "string" && /^\d+$/.test(empresaRaw)
            ? Number(empresaRaw)
            : empresaRaw
        );

  const isAdminEmpresa =
    roleId === ROLES.ADMIN_EMPRESA ||
    user?.isAdminEmpresa === true ||
    roleName === "adminempresa" ||
    roleName === "admin_empresa";

  const isSupervisorEmpresa =
    roleId === ROLES.SUPERVISOR_EMPRESA ||
    user?.isSupervisorEmpresa === true ||
    roleName === "supervisorempresa" ||
    roleName === "supervisor_empresa";

  // ✅ NUEVO: AsistentesEmpresa (#2011)
  const isAsistentesEmpresa =
    roleId === ROLES.ASISTENTES_EMPRESA ||
    user?.isAsistentesEmpresa === true ||
    roleName === "asistenteseempresa" ||
    roleName === "asistentes_empresa" ||
    roleName === "asistentesempresa" ||
    (roleName.includes("asistente") && roleName.includes("empresa"));

  // ✅ NUEVO: cualquier rol ligado a empresa
  const isAnyEmpresaRole =
    isAdminEmpresa || isSupervisorEmpresa || isAsistentesEmpresa;

  return {
    user,
    roleId,
    empresaId,
    isAdminEmpresa,
    isSupervisorEmpresa,
    isAsistentesEmpresa, // 👈 lo puedes usar en las vistas
    isAnyEmpresaRole,    // 👈 útil para filtros genéricos por empresa
  };
}
