import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./sidebar.css";

const items = [
  { to: "/overview", icon: "bi-grid-1x2", label: "Overview", beta: true },
  { to: "/empresas", icon: "bi-buildings", label: "Empresas" },
  { to: "/clientes", icon: "bi-people", label: "Clientes" },
  { to: "/lugares", icon: "bi-geo-alt", label: "Lugares" },
  { to: "/reservaciones", icon: "bi-calendar-check", label: "Reservaciones" },
  { to: "/usuarios", icon: "bi-person-gear", label: "Usuarios" },
  { to: "/formas-pago", icon: "bi-credit-card", label: "Formas de pago" },
  { to: "/estados-pago", icon: "bi-flag", label: "Estados de pago" },
  { to: "/facturas", icon: "bi-receipt", label: "Cobros / Facturas" },
  { to: "/tarifas", icon: "bi-tags", label: "Tarifas" },
];

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(true);

  return (
    <>
      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <button
            className="btn btn-link d-lg-none p-0 toggle-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Alternar menú"
            title="Alternar menú"
          >
            <i className="bi bi-list"></i>
          </button>

          <div className="brand">
            <i className="bi bi-paragraph me-2"></i>
            <span>Park</span>
          </div>
        </div>

        <nav className="sidebar-nav mt-3">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                "nav-pill d-flex align-items-center " + (isActive ? "active" : "")
              }
            >
              <i className={`bi ${it.icon} me-3`}></i>
              <span className="flex-grow-1">{it.label}</span>
              {it.beta && <span className="badge beta">próx.</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="info">
              <div className="name">{user?.nombre || "Usuario"}</div>
              <div className="email" title={user?.correo}>{user?.correo}</div>
            </div>
          </div>

          <button className="btn btn-ghost-danger w-100 mt-2" onClick={signOut}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido claro: solo el menú queda oscuro */}
      <main className="app-content">
        {/* el DashboardLayout renderiza <Outlet /> dentro de este main */}
      </main>
    </>
  );
}
