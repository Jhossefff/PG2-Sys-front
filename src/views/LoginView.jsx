// src/views/LoginView.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginView() {
  const { signIn } = useAuth();               // <- EXISTE y es función
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/empresas";

  const [correo, setCorreo] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(correo.trim(), pwd);       // usa la función del contexto
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow-sm" style={{ width: 420 }}>
        <div className="card-body">
          <h5 className="card-title mb-3">Iniciar sesión</h5>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-control"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
