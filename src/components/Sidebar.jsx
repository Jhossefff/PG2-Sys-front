import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/overview", icon: "bi-speedometer2", label: "Overview", disabled: true },
  { to: "/empresas", icon: "bi-buildings", label: "Empresas" },
  { to: "/clientes", icon: "bi-people", label: "Clientes"},
  { to: "/lugares", icon: "bi-geo-alt", label: "Lugares" },
  { to: "/agenda", icon: "bi-calendar-event", label: "Agenda", disabled: true },
  { to: "/reportes", icon: "bi-graph-up", label: "Reportes", disabled: true },
{ to: "/tarifas", icon: "bi-cash-coin", label: "Tarifas" }

];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className="sidebar shadow-sm">
      <div className="sidebar-brand">
        <div className="logo">
          <i className="bi bi-scissors"></i>
        </div>
        {!collapsed && <span className="brand-text">Park</span>}
      </div>

      <nav className="sidebar-nav">
        {items.map((it) =>
          it.disabled ? (
            <div key={it.label} className="nav-item disabled">
              <i className={`bi ${it.icon}`}></i>
              {!collapsed && <span>{it.label}</span>}
              {!collapsed && <small className="badge-temp">próx.</small>}
            </div>
          ) : (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              <i className={`bi ${it.icon}`}></i>
              {!collapsed && <span>{it.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-toggle" onClick={onToggle} title="Colapsar">
          <i className={`bi ${collapsed ? "bi-arrow-right-square" : "bi-arrow-left-square"}`}></i>
        </button>

        {!collapsed && (
          <div className="user-mini">
            <img src="https://i.pravatar.cc/40?img=12" alt="user" />
            <div>
              <strong>chrystian</strong>
              <small className="text-muted d-block">Administrador</small>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
