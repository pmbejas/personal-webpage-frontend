import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Instancia de Axios configurada para comunicación con el backend .NET Core
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5055/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Habilita el envío de cookies HttpOnly (Refresh Token)
});

// Variable en memoria para evitar llamadas concurrentes al endpoint de refresh
let promesaRefrescoEnCurso: Promise<string | null> | null = null;

// Interceptor de REQUEST: inyecta el token Bearer desde sessionStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("pablo_erp_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Si es FormData, remover Content-Type para que el navegador agregue el multipart/form-data con boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE: desenvuelve RespuestaApi<T> y gestiona refresco de token en 401
api.interceptors.response.use(
  (response) => {
    // Si la respuesta del backend sigue el patrón { exito, datos, mensaje }, desempaquetamos datos
    if (
      response.data &&
      typeof response.data === "object" &&
      "exito" in response.data &&
      "datos" in response.data
    ) {
      return response.data.datos;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const configuracionOriginal = error.config as InternalAxiosRequestConfig & { _yaReintentado?: boolean };

    // Si el error es 401 y no hemos reintentado aún, intentamos refresco silencioso
    if (error.response?.status === 401 && configuracionOriginal && !configuracionOriginal._yaReintentado) {
      // Si la URL que falló es el propio login o refresh, no reintentamos para evitar bucles
      if (
        configuracionOriginal.url?.includes("/admin/auth/login") ||
        configuracionOriginal.url?.includes("/admin/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      configuracionOriginal._yaReintentado = true;

      try {
        if (!promesaRefrescoEnCurso) {
          promesaRefrescoEnCurso = (async () => {
            try {
              const respuestaRefresh = await axios.post(
                `${api.defaults.baseURL}/admin/auth/refresh`,
                {},
                { withCredentials: true }
              );

              const datosRefresh = respuestaRefresh.data?.datos || respuestaRefresh.data;
              const nuevoToken = datosRefresh?.tokenAcceso;

              if (nuevoToken && typeof window !== "undefined") {
                sessionStorage.setItem("pablo_erp_token", nuevoToken);
                return nuevoToken;
              }
              return null;
            } catch {
              return null;
            } finally {
              promesaRefrescoEnCurso = null;
            }
          })();
        }

        const nuevoTokenObtenido = await promesaRefrescoEnCurso;

        if (nuevoTokenObtenido) {
          if (configuracionOriginal.headers) {
            configuracionOriginal.headers.Authorization = `Bearer ${nuevoTokenObtenido}`;
          }
          return api(configuracionOriginal);
        } else {
          // Si falló el refresco, limpiar sesión y redirigir al login
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pablo_erp_token");
            sessionStorage.removeItem("pablo_erp_usuario");
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
        }
      } catch (errorRefresco) {
        return Promise.reject(errorRefresco);
      }
    }

    // Normalizar mensajes descriptivos de error del backend
    if (error.response?.data) {
      const data = error.response.data as {
        mensaje?: string;
        errores?: string[] | Record<string, string[]>;
        detail?: string;
        title?: string;
      };

      if (data.errores && typeof data.errores === "object") {
        if (Array.isArray(data.errores)) {
          error.message = data.errores.join(". ");
        } else {
          const mensajes = Object.values(data.errores).flat();
          if (mensajes.length > 0) {
            error.message = mensajes.join(". ");
          }
        }
      } else if (data.mensaje) {
        error.message = data.mensaje;
      } else if (data.detail) {
        error.message = data.detail;
      } else if (data.title) {
        error.message = data.title;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
