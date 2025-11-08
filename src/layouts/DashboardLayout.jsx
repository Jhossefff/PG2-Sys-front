// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    try {
      await signOut();
      nav("/login", { replace: true });
    } catch {}
  };

  return (
    <div className="app-shell">
      {/* ===== Sidebar ===== */}
      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head mb-3">
          <div className="brand gap-2">
            <i className="bi bi-parking"></i>
            <span>Park</span>
          </div>
          {/* toggle solo visible en <992px */}
          <button
            className="btn btn-sm toggle-btn d-lg-none"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            title="Cerrar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/overview" className="nav-pill">
            <i className="bi bi-speedometer2" /> Overview
            <span className="badge beta ms-auto">beta</span>
          </NavLink>

          <NavLink to="/empresas" className="nav-pill">
            <i className="bi bi-building" /> Empresas
          </NavLink>

          <NavLink to="/clientes" className="nav-pill">
            <i className="bi bi-people" /> Clientes
          </NavLink>

          <NavLink to="/lugares" className="nav-pill">
            <i className="bi bi-geo-alt" /> Lugares
          </NavLink>

          <NavLink to="/reservaciones" className="nav-pill">
            <i className="bi bi-calendar-check" /> Reservaciones
          </NavLink>

          <NavLink to="/usuarios" className="nav-pill">
            <i className="bi bi-person-gear" /> Usuarios
          </NavLink>

          <NavLink to="/formas-pago" className="nav-pill">
            <i className="bi bi-credit-card" /> Formas de pago
          </NavLink>

          <NavLink to="/estados-pago" className="nav-pill">
            <i className="bi bi-ui-checks" /> Estados de pago
          </NavLink>

          <NavLink to="/facturas" className="nav-pill">
            <i className="bi bi-receipt" /> Cobros / Facturas
          </NavLink>

          <NavLink to="/tarifas" className="nav-pill">
            <i className="bi bi-tag" /> Tarifas
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <>
              <div className="user-chip mb-2">
                <div className="avatar">
                  <i className="bi bi-person-circle" />
                </div>
                <div className="info">
                  <div className="name">{user?.nombre || "Usuario"}</div>
                  <div className="email">{user?.correo}</div>
                </div>
              </div>

              {/* botón SIEMPRE visible (rojo/blanco) */}
              <button
                type="button"
                className="btn btn-logout w-100"
                onClick={doLogout}
              >
                <i className="bi bi-box-arrow-right me-2" />
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Backdrop para móvil */}
      <button
        className={`sidebar-backdrop d-lg-none ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
        aria-label="Ocultar menú"
      />

      {/* ===== Content ===== */}
      <main className="app-content">
        {/* topbar */}
        <div className="topbar sticky-top d-flex align-items-center gap-2 px-3 py-2">
          <button
            className="btn btn-outline-secondary d-lg-none"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            title="Menú"
          >
            <i className="bi bi-list"></i>
          </button>
          <div className="flex-1 fw-semibold">Panel</div>
        </div>

        <div className="content-wrap container-fluid py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
