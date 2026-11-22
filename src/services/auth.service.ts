import api from "./api";
import { LoginAdminRequest, LoginAdminResponse, UsuarioAdmin } from "../types";

export const servicioAutenticacion = {
  iniciarSesion: async (credenciales: LoginAdminRequest): Promise<LoginAdminResponse> => {
    const respuesta = await api.post<never, LoginAdminResponse>("/admin/auth/login", credenciales);
    return respuesta;
  },

  obtenerPerfil: async (): Promise<UsuarioAdmin> => {
    const respuesta = await api.get<never, UsuarioAdmin>("/admin/auth/perfil");
    return respuesta;
  },

  refrescarToken: async (): Promise<LoginAdminResponse> => {
    const respuesta = await api.post<never, LoginAdminResponse>("/admin/auth/refresh");
    return respuesta;
  },

  cerrarSesion: async (): Promise<void> => {
    await api.post("/admin/auth/logout");
  },
};
