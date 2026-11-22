import api from "./api";

export interface PresupuestoListadoAdminDto {
  id: string;
  codigo: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string | null;
  clienteEmpresa?: string | null;
  servicioPrincipal: string;
  estado: number; // 1: Borrador, 2: Enviado, 3: Senado, 4: Aprobado, 5: Rechazado, 6: Vencido
  subtotal: number;
  montoDescuento: number;
  totalPresupuestado: number;
  montoSenaSugerida: number;
  moneda: string;
  promocionAplicada?: string | null;
  fechaCreacion: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estaVencido: boolean;
}

export interface ClienteDetalleDto {
  id: string;
  nombreCompleto: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  rubro?: string | null;
}

export interface PresupuestoItemDetalleDto {
  id: string;
  tipoItem: number; // 1: ServicioBase, 2: SeccionExtra, 3: Adicional
  concepto: string;
  detalle?: string | null;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  diasAdicionales: number;
}

export interface PresupuestoDetalleAdminDto {
  id: string;
  codigo: string;
  estado: number;
  fechaCreacion: string;
  fechaVencimiento: string;
  diasValidez: number;
  diasRestantes: number;
  estaVencido: boolean;
  tiempoEntregaDias: number;
  descripcionNecesidad?: string | null;
  promocionAplicada?: string | null;
  subtotalBase: number;
  subtotalSeccionesExtra: number;
  subtotalAdicionales: number;
  montoDescuento: number;
  totalPresupuestado: number;
  montoSenaSugerida: number;
  moneda: string;
  hashFirmaPdf?: string | null;
  cliente: ClienteDetalleDto;
  items: PresupuestoItemDetalleDto[];
}

export interface EstadisticasPresupuestosAdminDto {
  totalPresupuestos: number;
  montoTotalCotizado: number;
  presupuestosAprobados: number;
  presupuestosPendientes: number;
  presupuestosVencidos: number;
  tasaConversionAprobados: number;
}

export interface PaginadoResultadoDto<T> {
  elementos: T[];
  totalRegistros: number;
  paginaActual: number;
  tamanioPagina: number;
  totalPaginas: number;
}

export interface FiltrosPresupuestosDto {
  terminoBusqueda?: string;
  estado?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  tamanioPagina?: number;
}

export const servicioPresupuestos = {
  listar: async (
    filtros: FiltrosPresupuestosDto = {}
  ): Promise<PaginadoResultadoDto<PresupuestoListadoAdminDto>> => {
    const params = new URLSearchParams();
    if (filtros.terminoBusqueda) params.append("terminoBusqueda", filtros.terminoBusqueda);
    if (filtros.estado !== undefined && filtros.estado !== null) {
      params.append("estado", filtros.estado.toString());
    }
    if (filtros.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
    if (filtros.pagina) params.append("pagina", filtros.pagina.toString());
    if (filtros.tamanioPagina) params.append("tamanioPagina", filtros.tamanioPagina.toString());

    const url = `/admin/presupuestos${params.toString() ? `?${params.toString()}` : ""}`;
    const respuesta = await api.get<never, PaginadoResultadoDto<PresupuestoListadoAdminDto>>(url);
    return respuesta;
  },

  obtenerEstadisticas: async (): Promise<EstadisticasPresupuestosAdminDto> => {
    const respuesta = await api.get<never, EstadisticasPresupuestosAdminDto>("/admin/presupuestos/estadisticas");
    return respuesta;
  },

  obtenerPorId: async (id: string): Promise<PresupuestoDetalleAdminDto> => {
    const respuesta = await api.get<never, PresupuestoDetalleAdminDto>(`/admin/presupuestos/${id}`);
    return respuesta;
  },

  actualizarEstado: async (id: string, nuevoEstado: number, motivo?: string): Promise<boolean> => {
    const respuesta = await api.put<never, boolean>(`/admin/presupuestos/${id}/estado`, {
      nuevoEstado,
      motivo,
    });
    return respuesta;
  },

  descargarPdf: async (id: string, codigo: string): Promise<void> => {
    const respuesta = await api.get(`/admin/presupuestos/${id}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([respuesta as unknown as BlobPart], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Presupuesto_${codigo}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  obtenerEnlaceWhatsApp: async (id: string): Promise<string> => {
    const respuesta = await api.get<never, string>(`/admin/presupuestos/${id}/whatsapp`);
    return respuesta;
  },
};
