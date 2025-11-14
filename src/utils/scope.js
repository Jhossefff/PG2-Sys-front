// src/utils/scope.js
// Helpers para filtrar listas según la empresa del usuario logueado

/**
 * Obtiene el id de empresa de un registro, probando varios nombres de campo.
 */
function getEmpresaFromRow(row) {
  if (!row || typeof row !== "object") return null;

  const keys = ["idempresa", "empresaId", "idEmpresa", "id_empresa"];
  for (const k of keys) {
    if (row[k] != null) return Number(row[k]);
  }
  return null;
}

/**
 * Aplica el alcance de empresa a una lista genérica.
 *
 * - Para roles de empresa (AdminEmpresa, SupervisorEmpresa, AsistentesEmpresa)
 *   y teniendo empresaId, se filtra por esa empresa.
 * - Si el registro NO tiene ningún campo de empresa, NO se filtra (se deja pasar).
 *   Esto evita que, por ejemplo, las facturas se queden en cero si el SELECT
 *   no trae idempresa.
 */
export function applyEmpresaScope(list, scope) {
  if (!Array.isArray(list)) return [];
  if (!scope) return list;

  const {
    empresaId,
    isAdminEmpresa,
    isSupervisorEmpresa,
    isAsistentesEmpresa,
  } = scope;

  // Si no es un rol de empresa o no tenemos empresaId → no filtrar nada
  const isEmpresaRole =
    isAdminEmpresa || isSupervisorEmpresa || isAsistentesEmpresa;

  if (!isEmpresaRole || !empresaId) {
    return list;
  }

  const empresaNum = Number(empresaId);

  return list.filter((row) => {
    const emp = getEmpresaFromRow(row);
    // Si el registro no tiene empresa asociada, lo dejamos pasar
    if (emp == null || Number.isNaN(emp)) return true;

    return emp === empresaNum;
  });
}
