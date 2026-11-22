import api from "./api";

export interface CuponAdminDto {
  id: string;
  codigo: string;
  descripcion: string;
  tipoDescuento: number; // 0: Porcentaje, 1: MontoFijo
  valorDescuento: number;
  usosMaximos: number;
  usosActuales: number;
  fechaInicio: string;
  fechaVencimiento: string;
  activo: boolean;
  estaVigente: boolean;
  fechaCreacion: string;
}

export interface CrearCuponDto {
  codigo: string;
  descripcion: string;
  tipoDescuento: number;
  valorDescuento: number;
  usosMaximos: number;
  fechaInicio: string;
  fechaVencimiento: string;
}

export interface ActualizarCuponDto {
  descripcion: string;
  tipoDescuento: number;
  valorDescuento: number;
  usosMaximos: number;
  fechaInicio: string;
  fechaVencimiento: string;
}

export const servicioCupones = {
  obtenerTodos: async (): Promise<CuponAdminDto[]> => {
    const respuesta = await api.get<never, CuponAdminDto[]>("/admin/cupones");
    return respuesta;
  },

  obtenerPorId: async (id: string): Promise<CuponAdminDto> => {
    const respuesta = await api.get<never, CuponAdminDto>(`/admin/cupones/${id}`);
    return respuesta;
  },

  crear: async (peticion: CrearCuponDto): Promise<CuponAdminDto> => {
    const respuesta = await api.post<never, CuponAdminDto>("/admin/cupones", peticion);
    return respuesta;
  },

  actualizar: async (id: string, peticion: ActualizarCuponDto): Promise<CuponAdminDto> => {
    const respuesta = await api.put<never, CuponAdminDto>(`/admin/cupones/${id}`, peticion);
    return respuesta;
  },

  cambiarEstado: async (id: string): Promise<boolean> => {
    const respuesta = await api.patch<never, boolean>(`/admin/cupones/${id}/estado`);
    return respuesta;
  },
};
