import React from "react";
import { Form, InputGroup, Button } from "react-bootstrap";

export default function Topbar({ onToggleSidebar }) {
  return (
    <header className="topbar">
      <div className="left">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onToggleSidebar}
          className="btn-ghost"
          title="Mostrar/ocultar menú"
        >
          <i className="bi bi-list"></i>
        </Button>
        <h5 className="mb-0 d-none d-md-block">Panel</h5>
      </div>

      <div className="right">
        <InputGroup className="searchbox d-none d-md-flex">
          <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
          <Form.Control placeholder="Buscar..." />
        </InputGroup>

        <Button variant="outline-secondary" className="btn-ghost" title="Notificaciones">
          <i className="bi bi-bell"></i>
        </Button>

        <div className="avatar">
          <img src="https://i.pravatar.cc/36?img=5" alt="user" />
        </div>
      </div>
    </header>
  );
}
