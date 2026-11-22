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

export const servicioPromociones = {
  obtenerTodas: async (): Promise<PromocionAdminDto[]> => {
    const respuesta = await api.get<never, PromocionAdminDto[]>("/admin/promociones");
    return respuesta;
  },

  crear: async (peticion: CrearPromocionDto): Promise<PromocionAdminDto> => {
    const respuesta = await api.post<never, PromocionAdminDto>("/admin/promociones", peticion);
    return respuesta;
  },
};
