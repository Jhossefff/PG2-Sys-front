import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/overview");
    } catch {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="login-page dark">
      <div className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <i className="bi bi-parking"></i> Park System
          </div>
          <h2>Bienvenido de nuevo</h2>
          <p>Inicia sesión para continuar con la gestión del sistema.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Correo</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label>Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-login w-100">
              Iniciar sesión
            </button>
          </form>
        </div>

        <div className="login-right">
          <div className="map-logo">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <div className="circle"></div>
        </div>
      </div>
    </div>
  );
}
