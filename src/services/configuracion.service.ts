import axios from "axios";
import api from "./api";

export interface ConfiguracionSistemaResponse {
  diasValidezPresupuesto: number;
  numeroWhatsApp: string;
  nombreEmisor: string;
  emailNotificaciones: string;
  urlWebPublica: string;
  fechaActualizacion?: string | null;
}

export interface ActualizarConfiguracionSistemaRequest {
  diasValidezPresupuesto: number;
  numeroWhatsApp: string;
  nombreEmisor: string;
  emailNotificaciones: string;
  urlWebPublica: string;
}

export interface ResultadoRevalidacionDto {
  exito: boolean;
  mensaje: string;
  codigoEstadoHttp?: number;
  fechaRevalidacion?: string;
}

export interface EstadoSaludBackendDto {
  estado: string;
  servicio: string;
  version: string;
  entorno: string;
  timestamp: string;
}

export const servicioConfiguracion = {
  obtener: async (): Promise<ConfiguracionSistemaResponse> => {
    return api.get<never, ConfiguracionSistemaResponse>("/admin/configuracion");
  },

  actualizar: async (
    datos: ActualizarConfiguracionSistemaRequest
  ): Promise<ConfiguracionSistemaResponse> => {
    return api.put<never, ConfiguracionSistemaResponse>("/admin/configuracion", datos);
  },

  revalidarCatalogoWeb: async (): Promise<ResultadoRevalidacionDto> => {
    return api.post<never, ResultadoRevalidacionDto>("/admin/revalidacion/catalogo");
  },

  verificarSaludBackend: async (): Promise<EstadoSaludBackendDto> => {
    const urlBaseApi = api.defaults.baseURL || "https://pablobejas-backend-api.onrender.com/api";
    const urlRaiz = urlBaseApi.replace(/\/api\/?$/i, "");
    const respuesta = await axios.get<EstadoSaludBackendDto>(`${urlRaiz}/health`, {
      timeout: 15000,
    });
    return respuesta.data;
  },
};
