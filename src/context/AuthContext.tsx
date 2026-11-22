"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { servicioAutenticacion } from "../services/auth.service";
import { UsuarioAdmin } from "../types";

interface ContextoAutenticacionTipo {
  usuario: UsuarioAdmin | null;
  token: string | null;
  cargando: boolean;
  estaAutenticado: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refrescarPerfil: () => Promise<void>;
}

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await servicioAutenticacion.cerrarSesion();
    } catch {
      // Ignorar fallo de red al cerrar sesión
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pablo_erp_token");
        sessionStorage.removeItem("pablo_erp_usuario");
      }
      setToken(null);
      setUsuario(null);
      router.push("/login");
      toast.info("Sesión cerrada correctamente.");
    }
  }, [router]);

  // 1. Restauración de sesión desde almacenamiento local al cargar
  useEffect(() => {
    if (typeof window === "undefined") {
      setCargando(false);
      return;
    }

    const tokenAlmacenado = sessionStorage.getItem("pablo_erp_token");
    const usuarioAlmacenado = sessionStorage.getItem("pablo_erp_usuario");

    if (tokenAlmacenado && usuarioAlmacenado) {
      try {
        setToken(tokenAlmacenado);
        setUsuario(JSON.parse(usuarioAlmacenado));

        // Validación en segundo plano para verificar validez y actualizar perfil
        servicioAutenticacion
          .obtenerPerfil()
          .then((usuarioFresco) => {
            setUsuario(usuarioFresco);
            sessionStorage.setItem("pablo_erp_usuario", JSON.stringify(usuarioFresco));
          })
          .catch((error) => {
            if (error?.response?.status === 401) {
              logout();
            }
          });
      } catch {
        sessionStorage.removeItem("pablo_erp_usuario");
      }
    }

    setCargando(false);
  }, [logout]);

  // 2. Temporizador de inactividad de 30 minutos
  useEffect(() => {
    if (!usuario) return;

    let idTemporizador: NodeJS.Timeout;

    const manejarInactividad = () => {
      toast.warning("Sesión cerrada por inactividad (30 minutos sin interacción).");
      logout();
    };

    const reiniciarTemporizador = () => {
      clearTimeout(idTemporizador);
      idTemporizador = setTimeout(manejarInactividad, 30 * 60 * 1000);
    };

    const eventos = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    eventos.forEach((evento) => window.addEventListener(evento, reiniciarTemporizador));
    reiniciarTemporizador();

    return () => {
      clearTimeout(idTemporizador);
      eventos.forEach((evento) => window.removeEventListener(evento, reiniciarTemporizador));
    };
  }, [usuario, logout]);

  // 3. Inicio de sesión
  const login = async (email: string, password: string) => {
    const respuesta = await servicioAutenticacion.iniciarSesion({ email, password });

    if (!respuesta.tokenAcceso || !respuesta.usuario) {
      throw new Error("Respuesta inválida del servidor de autenticación.");
    }

    setToken(respuesta.tokenAcceso);
    setUsuario(respuesta.usuario);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pablo_erp_token", respuesta.tokenAcceso);
      sessionStorage.setItem("pablo_erp_usuario", JSON.stringify(respuesta.usuario));
    }

    toast.success(`¡Bienvenido, ${respuesta.usuario.nombreCompleto}!`);
    router.push("/dashboard");
  };

  // 4. Refresco manual de perfil
  const refrescarPerfil = async () => {
    try {
      const usuarioActualizado = await servicioAutenticacion.obtenerPerfil();
      setUsuario(usuarioActualizado);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pablo_erp_usuario", JSON.stringify(usuarioActualizado));
      }
    } catch (error) {
      console.error("Error al refrescar perfil administrativo:", error);
    }
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        cargando,
        estaAutenticado: Boolean(token && usuario),
        login,
        logout,
        refrescarPerfil,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return contexto;
}
