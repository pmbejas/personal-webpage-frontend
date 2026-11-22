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

export const servicioCatalogo = {
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
};
