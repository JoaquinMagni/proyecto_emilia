"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); // Obtenemos la ruta actual

  // Definir rutas públicas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/activate"];

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token && !publicRoutes.includes(pathname)) {
      // Si no hay token y la ruta no es pública, redirigir a login
      router.push("/auth/login");
    } else if (token && publicRoutes.includes(pathname)) {
      // Si hay token y estamos en una ruta pública, redirigir al home
      router.push("/");
    } else if (token && !user) {
      // Si hay token pero no hay usuario en el estado, actualizar el usuario
      setUser({ token });
    }
  }, [router, pathname, user]);

  const login = (userData, token) => {
    localStorage.setItem("authToken", token);
    setUser({
      id: userData.id,  // Asegúrate de que se guarde el id del usuario
      username: userData.username,
      email: userData.email
    });
    router.push("/"); // Redirigir al inicio después de iniciar sesión
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    router.push("/auth/login"); // Redirigir al login después de cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
