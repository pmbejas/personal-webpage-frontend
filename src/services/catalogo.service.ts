import api from "./api";

export interface ServicioBaseAdmin {
  id: string;
  clave: string;
  nombre: string;
  descripcionComercial: string;
  descripcionPresupuesto?: string | null;
  precioBase: number;
  diasEntregaBase: number;
  seccionesIncluidas: number;
  permiteSeccionesExtra: boolean;
  precioSeccionExtra: number;
  diasPorSeccionExtra: number;
  activo: boolean;
  ordenVisualizacion: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ActualizarServicioBaseDto {
  nombre: string;
  descripcionComercial: string;
  descripcionPresupuesto?: string | null;
  precioBase: number;
  diasEntregaBase: number;
  seccionesIncluidas: number;
  permiteSeccionesExtra: boolean;
  precioSeccionExtra: number;
  diasPorSeccionExtra: number;
  ordenVisualizacion: number;
}

export interface AdicionalAdmin {
  id: string;
  grupoId: string;
  nombreGrupo: string;
  clave: string;
  nombre: string;
  descripcionComercial: string;
  precio: number;
  diasEntregaExtra: number;
  esRecurrente: boolean;
  activo: boolean;
  ordenVisualizacion: number;
}

export interface CrearAdicionalDto {
  grupoId: string;
  clave: string;
  nombre: string;
  descripcionComercial: string;
  precio: number;
  diasEntregaExtra: number;
  esRecurrente: boolean;
  ordenVisualizacion: number;
}

export interface ActualizarAdicionalDto {
  grupoId: string;
  nombre: string;
  descripcionComercial: string;
  precio: number;
  diasEntregaExtra: number;
  ordenVisualizacion: number;
}

export interface GrupoAdicionalAdmin {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
}

export const servicioCatalogo = {
  // Servicios Base (Productos)
  obtenerTodosLosServicios: async (): Promise<ServicioBaseAdmin[]> => {
    const respuesta = await api.get<never, ServicioBaseAdmin[]>("/admin/catalogo/servicios");
    return respuesta;
  },

  actualizarServicio: async (id: string, peticion: ActualizarServicioBaseDto): Promise<boolean> => {
    const respuesta = await api.put<never, boolean>(`/admin/catalogo/servicios/${id}`, peticion);
    return respuesta;
  },

  cambiarEstado: async (id: string, activo: boolean): Promise<boolean> => {
    const respuesta = await api.patch<never, boolean>(`/admin/catalogo/servicios/${id}/estado?activo=${activo}`);
    return respuesta;
  },

  // Servicios Adicionales (Add-ons)
  obtenerTodosLosAdicionales: async (): Promise<AdicionalAdmin[]> => {
    const respuesta = await api.get<never, AdicionalAdmin[]>("/admin/catalogo/adicionales");
    return respuesta;
  },

  crearAdicional: async (peticion: CrearAdicionalDto): Promise<AdicionalAdmin> => {
    const respuesta = await api.post<never, AdicionalAdmin>("/admin/catalogo/adicionales", peticion);
    return respuesta;
  },

  actualizarAdicional: async (id: string, peticion: ActualizarAdicionalDto): Promise<AdicionalAdmin> => {
    const respuesta = await api.put<never, AdicionalAdmin>(`/admin/catalogo/adicionales/${id}`, peticion);
    return respuesta;
  },

  cambiarEstadoAdicional: async (id: string, activo: boolean): Promise<boolean> => {
    const respuesta = await api.patch<never, boolean>(`/admin/catalogo/adicionales/${id}/estado?activo=${activo}`);
    return respuesta;
  },

  // Grupos y Categorías
  obtenerGrupos: async (): Promise<GrupoAdicionalAdmin[]> => {
    const respuesta = await api.get<never, GrupoAdicionalAdmin[]>("/admin/catalogo/grupos");
    return respuesta;
  },

  // Matriz de Compatibilidades por Producto
  obtenerCompatibilidades: async (servicioId: string): Promise<string[]> => {
    const respuesta = await api.get<never, string[]>(`/admin/catalogo/servicios/${servicioId}/compatibilidades`);
    return respuesta;
  },

  actualizarCompatibilidades: async (servicioId: string, adicionalesIds: string[]): Promise<boolean> => {
    const respuesta = await api.put<never, boolean>(`/admin/catalogo/servicios/${servicioId}/compatibilidades`, {
      adicionalesIds,
    });
    return respuesta;
  },
};
