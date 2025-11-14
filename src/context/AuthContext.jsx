// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const ROLES = {
  ADMIN: 2007,
  ADMIN_EMPRESA: 2008,
  SOPORTE: 2009,
  SUPERVISOR_EMPRESA: 2010,      // <-- agregado
  ASISTENTES_EMPRESA: 2011,      // <-- agregado
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("app.user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("app.user", JSON.stringify(user));
    else localStorage.removeItem("app.user");
  }, [user]);

  async function signIn(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: email, contrasena: password }),
    });

    if (!res.ok) {
      let msg = "No se pudo iniciar sesión";
      try {
        const e = await res.json();
        msg = e?.error || e?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();
    setUser(data.user || data);
    return data;
  }

  const signin = signIn;
  const login = signIn;

  function logout() {
    setUser(null);
  }
  const signOut = logout;

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: !!user,
      roleId: user?.idrol ? Number(user.idrol) : null,
      signIn,
      signin,
      login,
      logout,
      signOut,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
