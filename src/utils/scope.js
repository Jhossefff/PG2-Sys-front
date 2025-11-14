// src/utils/scope.js
// Utilidades de “scope” por empresa

/**
 * Filtra arreglos por empresa cuando el usuario tiene el rol AdminEmpresa.
 * @param {Array} items - arreglo de objetos con campo idempresa
 * @param {{isAdminEmpresa:boolean, empresaId:number|null}} scope
 * @returns {Array}
 */
export function applyEmpresaScope(items, scope) {
  if (!Array.isArray(items)) return [];
  if (scope?.isAdminEmpresa && scope?.empresaId != null) {
    const eid = Number(scope.empresaId);
    return items.filter((x) => Number(x?.idempresa) === eid);
  }
  return items;
}
