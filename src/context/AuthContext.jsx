// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const ROLES = {
  ADMIN: 2007,    // Ajusta a tus ids reales
  SOPORTE: 2009,
  // agrega más si tienes
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { idusuario, idrol, correo, ... }
  const [loading, setLoading] = useState(true);

  // Cargar sesión persistida
  useEffect(() => {
    try {
      const raw = localStorage.getItem("app.user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  // Guardar cambios de sesión
  useEffect(() => {
    if (user) localStorage.setItem("app.user", JSON.stringify(user));
    else localStorage.removeItem("app.user");
  }, [user]);

  // ---- API auth ----
  async function signIn(email, password) {
    // Llama a tu endpoint de login del backend
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

    const data = await res.json(); // { user, token? }
    setUser(data.user || data);     // soporta ambas formas
    return data;
  }

  // alias por si alguna vista usa otros nombres
  const signin = signIn;
  const login = signIn;

  function logout() {
    setUser(null);
    // si usas tokens, aquí podrías limpiar storage/cookies
  }
  const signOut = logout;

  const value = useMemo(
    () => ({
      user,
      loading,
      // helpers
      isLoggedIn: !!user,
      roleId: user?.idrol ? Number(user.idrol) : null,
      // acciones (exponemos TODOS los alias)
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
