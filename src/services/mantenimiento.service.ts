import api from "./api";
import {
  ActualizarCategoriaAdicionalRequest,
  ActualizarRubroClienteRequest,
  CategoriaAdicionalResponse,
  CrearCategoriaAdicionalRequest,
  CrearRubroClienteRequest,
  RubroClienteResponse,
} from "@/types";

export const servicioMantenimiento = {
  // Rubros de Clientes
  obtenerRubros: async (soloActivos: boolean = false): Promise<RubroClienteResponse[]> => {
    const consulta = soloActivos ? "?soloActivos=true" : "";
    return api.get<never, RubroClienteResponse[]>(`/admin/mantenimiento/rubros${consulta}`);
  },

  crearRubro: async (datos: CrearRubroClienteRequest): Promise<RubroClienteResponse> => {
    return api.post<never, RubroClienteResponse>("/admin/mantenimiento/rubros", datos);
  },

  actualizarRubro: async (id: string, datos: ActualizarRubroClienteRequest): Promise<RubroClienteResponse> => {
    return api.put<never, RubroClienteResponse>(`/admin/mantenimiento/rubros/${id}`, datos);
  },

  cambiarEstadoRubro: async (id: string, activo: boolean): Promise<boolean> => {
    return api.patch<never, boolean>(`/admin/mantenimiento/rubros/${id}/estado?activo=${activo}`);
  },

  eliminarRubro: async (id: string): Promise<boolean> => {
    return api.delete<never, boolean>(`/admin/mantenimiento/rubros/${id}`);
  },

  // Categorías de Servicios Adicionales
  obtenerCategoriasAdicionales: async (soloActivos: boolean = false): Promise<CategoriaAdicionalResponse[]> => {
    const consulta = soloActivos ? "?soloActivos=true" : "";
    return api.get<never, CategoriaAdicionalResponse[]>(
      `/admin/mantenimiento/categorias-adicionales${consulta}`
    );
  },

  crearCategoriaAdicional: async (
    datos: CrearCategoriaAdicionalRequest
  ): Promise<CategoriaAdicionalResponse> => {
    return api.post<never, CategoriaAdicionalResponse>(
      "/admin/mantenimiento/categorias-adicionales",
      datos
    );
  },

  actualizarCategoriaAdicional: async (
    id: string,
    datos: ActualizarCategoriaAdicionalRequest
  ): Promise<CategoriaAdicionalResponse> => {
    return api.put<never, CategoriaAdicionalResponse>(
      `/admin/mantenimiento/categorias-adicionales/${id}`,
      datos
    );
  },

  cambiarEstadoCategoriaAdicional: async (id: string, activo: boolean): Promise<boolean> => {
    return api.patch<never, boolean>(
      `/admin/mantenimiento/categorias-adicionales/${id}/estado?activo=${activo}`
    );
  },

  eliminarCategoriaAdicional: async (id: string): Promise<boolean> => {
    return api.delete<never, boolean>(`/admin/mantenimiento/categorias-adicionales/${id}`);
  },
};
