import api from "./api";
import {
  ActualizarClienteRequest,
  ActualizarNotasClienteRequest,
  ClienteDetalleResponse,
  ClienteListadoResponse,
  ClienteSelectorResponse,
  CrearClienteRequest,
  EstadisticasClientesResponse,
  FiltrosClientesRequest,
  PaginadoResultadoResponse,
} from "@/types";

export const servicioClientes = {
  /**
   * Obtiene el listado paginado de clientes y prospectos con filtros y ordenamiento.
   */
  listar: async (
    filtros: FiltrosClientesRequest = {}
  ): Promise<PaginadoResultadoResponse<ClienteListadoResponse>> => {
    const parametros = new URLSearchParams();

    if (filtros.terminoBusqueda) {
      parametros.append("terminoBusqueda", filtros.terminoBusqueda);
    }
    if (filtros.tipoRelacion && filtros.tipoRelacion !== "Todos") {
      parametros.append("tipoRelacion", filtros.tipoRelacion);
    }
    if (filtros.rubro) {
      parametros.append("rubro", filtros.rubro);
    }
    if (typeof filtros.activo === "boolean") {
      parametros.append("activo", String(filtros.activo));
    }
    if (filtros.soloConSaldoPendiente === true) {
      parametros.append("soloConSaldoPendiente", "true");
    }
    if (filtros.ordenarPor) {
      parametros.append("ordenarPor", filtros.ordenarPor);
    }
    if (filtros.pagina) {
      parametros.append("pagina", filtros.pagina.toString());
    }
    if (filtros.tamanioPagina) {
      parametros.append("tamanioPagina", filtros.tamanioPagina.toString());
    }

    const consulta = parametros.toString();
    const ruta = `/admin/clientes${consulta ? `?${consulta}` : ""}`;
    return api.get<never, PaginadoResultadoResponse<ClienteListadoResponse>>(ruta);
  },

  /**
   * Retorna los KPIs ejecutivos de la cartera de clientes.
   */
  obtenerEstadisticas: async (): Promise<EstadisticasClientesResponse> => {
    return api.get<never, EstadisticasClientesResponse>("/admin/clientes/estadisticas");
  },

  /**
   * Busca clientes activos de forma liviana para combos y autocompletado.
   */
  buscarParaSelector: async (busqueda?: string): Promise<ClienteSelectorResponse[]> => {
    const ruta = busqueda?.trim()
      ? `/admin/clientes/selector?busqueda=${encodeURIComponent(busqueda.trim())}`
      : "/admin/clientes/selector";
    return api.get<never, ClienteSelectorResponse[]>(ruta);
  },

  /**
   * Obtiene la ficha 360° completa de un cliente.
   */
  obtenerPorId: async (id: string): Promise<ClienteDetalleResponse> => {
    return api.get<never, ClienteDetalleResponse>(`/admin/clientes/${id}`);
  },

  /**
   * Registra un nuevo cliente manualmente desde el ERP.
   */
  crear: async (datos: CrearClienteRequest): Promise<ClienteDetalleResponse> => {
    return api.post<never, ClienteDetalleResponse>("/admin/clientes", datos);
  },

  /**
   * Actualiza la ficha completa de un cliente existente.
   */
  actualizar: async (
    id: string,
    datos: ActualizarClienteRequest
  ): Promise<ClienteDetalleResponse> => {
    return api.put<never, ClienteDetalleResponse>(`/admin/clientes/${id}`, datos);
  },

  /**
   * Actualiza únicamente las notas internas CRM de un cliente.
   */
  actualizarNotas: async (
    id: string,
    datos: ActualizarNotasClienteRequest
  ): Promise<boolean> => {
    return api.patch<never, boolean>(`/admin/clientes/${id}/notas`, datos);
  },

  /**
   * Alterna el estado activo/archivado de un cliente sin perder su historial.
   */
  alternarEstadoActivo: async (id: string): Promise<boolean> => {
    return api.patch<never, boolean>(`/admin/clientes/${id}/estado`);
  },

  /**
   * Obtiene el enlace directo wa.me para contactar al cliente por WhatsApp.
   */
  obtenerEnlaceWhatsApp: async (id: string, mensaje?: string): Promise<string> => {
    const ruta = mensaje?.trim()
      ? `/admin/clientes/${id}/whatsapp?mensaje=${encodeURIComponent(mensaje.trim())}`
      : `/admin/clientes/${id}/whatsapp`;
    return api.get<never, string>(ruta);
  },

  /**
   * Elimina físicamente un cliente si no posee registros vinculados.
   */
  eliminar: async (id: string): Promise<boolean> => {
    return api.delete<never, boolean>(`/admin/clientes/${id}`);
  },
};
