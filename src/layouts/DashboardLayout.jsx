import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

/**
 * Layout de panel: sidebar + contenido
 * - El contenido hace scroll; el sidebar queda fijo
 */
export default function DashboardLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-content">
        {/* Puedes colocar aquí un topbar si más adelante quieres */}
        <Outlet />
      </main>
    </div>
  );
}
