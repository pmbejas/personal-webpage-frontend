import api from "./api";

export interface PromocionAdminDto {
  id: string;
  clave: string;
  nombre: string;
  textoBanner: string;
  tipoDescuento: number; // 0: Porcentaje, 1: MontoFijo
  valorDescuento: number;
  servicioBaseId?: string | null;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  estaVigente: boolean;
  fechaCreacion: string;
}

export interface CrearPromocionDto {
  clave: string;
  nombre: string;
  textoBanner: string;
  tipoDescuento: number;
  valorDescuento: number;
  servicioBaseId?: string | null;
  fechaInicio: string;
  fechaFin: string;
}

export interface ActualizarPromocionDto {
  nombre: string;
  textoBanner: string;
  tipoDescuento: number;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export const servicioPromociones = {
  obtenerTodas: async (): Promise<PromocionAdminDto[]> => {
    const respuesta = await api.get<never, PromocionAdminDto[]>("/admin/promociones");
    return respuesta;
  },

  crear: async (peticion: CrearPromocionDto): Promise<PromocionAdminDto> => {
    const respuesta = await api.post<never, PromocionAdminDto>("/admin/promociones", peticion);
    return respuesta;
  },

  actualizar: async (id: string, peticion: ActualizarPromocionDto): Promise<PromocionAdminDto> => {
    const respuesta = await api.put<never, PromocionAdminDto>(`/admin/promociones/${id}`, peticion);
    return respuesta;
  },

  cambiarEstado: async (id: string, activo: boolean): Promise<boolean> => {
    const respuesta = await api.patch<never, boolean>(`/admin/promociones/${id}/estado?activo=${activo}`);
    return respuesta;
  },

  eliminar: async (id: string): Promise<boolean> => {
    const respuesta = await api.delete<never, boolean>(`/admin/promociones/${id}`);
    return respuesta;
  },
};
