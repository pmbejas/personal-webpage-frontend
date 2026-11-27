import api from "./api";

export interface ProyectoListadoAdminDto {
  id: string;
  codigo: string;
  titulo: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteEmpresa?: string | null;
  estado: string;
  colorEstado: string;
  progresoPorcentaje: number;
  montoTotalContratado: number;
  montoCobradoAcumulado: number;
  saldoPendiente: number;
  moneda: string;
  fechaInicio?: string | null;
  fechaEstimadaFin?: string | null;
  cantidadMinutas: number;
  cantidadHitos: number;
  cantidadHitosCompletados: number;
  fechaCreacion: string;
}

export type TipoItemAlcance = "ALCANCE" | "LIMITE" | "FUERA_ALCANCE";

export interface ProyectoItemAlcanceDto {
  id: string;
  proyectoId: string;
  tipo: TipoItemAlcance;
  descripcion: string;
  orden: number;
  fechaCreacion: string;
}

export interface CrearItemAlcanceRequest {
  tipo: TipoItemAlcance;
  descripcion: string;
  orden?: number | null;
}

export interface ActualizarItemAlcanceRequest {
  tipo?: TipoItemAlcance;
  descripcion?: string;
  orden?: number | null;
}

export interface CambiarEstadoProyectoRequest {
  estado: string;
  colorEstado?: string | null;
}

export interface MinutaReunionDto {
  id: string;
  proyectoId: string;
  fechaHora: string;
  tituloReunion: string;
  asistentes: string;
  temasTratados: string;
  acuerdosYCompromisos?: string | null;
  tareasDerivadasJson?: string | null;
  citaId?: string | null;
  fechaCreacion: string;
}

export interface PagoProyectoDto {
  id: string;
  proyectoId: string;
  fechaPago: string;
  monto: number;
  moneda: string;
  metodoPago: string;
  numeroComprobante?: string | null;
  concepto: string;
  notas?: string | null;
  fechaCreacion: string;
}

export interface HitoEntregableDto {
  id: string;
  proyectoId: string;
  titulo: string;
  descripcion?: string | null;
  fechaEntrega?: string | null;
  completado: boolean;
  aprobadoPorCliente: boolean;
  fechaAprobacion?: string | null;
  urlEntregable?: string | null;
  fechaCreacion: string;
}

export interface ProyectoDetalleAdminDto {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string | null;
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefonoWhatsApp: string;
  clienteEmpresa?: string | null;
  presupuestoId?: string | null;
  presupuestoCodigo?: string | null;
  estado: string;
  colorEstado: string;
  progresoPorcentaje: number;
  montoTotalContratado: number;
  montoCobradoAcumulado: number;
  saldoPendiente: number;
  moneda: string;
  fechaInicio?: string | null;
  fechaEstimadaFin?: string | null;
  fechaFinalizacion?: string | null;
  repositorioGitUrl?: string | null;
  urlStaging?: string | null;
  urlProduccion?: string | null;
  notasInternas?: string | null;
  fechaCreacion: string;
  minutas: MinutaReunionDto[];
  pagos: PagoProyectoDto[];
  hitos: HitoEntregableDto[];
  itemsAlcance: ProyectoItemAlcanceDto[];
}

export interface EstadisticasProyectosDto {
  totalProyectos: number;
  proyectosEnCurso: number;
  proyectosCompletados: number;
  montoTotalCartera: number;
  montoCobradoTotal: number;
  saldoTotalPorCobrar: number;
}

export interface CrearProyectoRequest {
  titulo: string;
  descripcion?: string | null;
  clienteId?: string | null;
  presupuestoId?: string | null;
  montoTotalContratado: number;
  moneda?: string;
  fechaInicio?: string | null;
  fechaEstimadaFin?: string | null;
  repositorioGitUrl?: string | null;
  urlStaging?: string | null;
  urlProduccion?: string | null;
  notasInternas?: string | null;
}

export interface ActualizarProyectoRequest {
  titulo: string;
  descripcion?: string | null;
  estado: string;
  colorEstado: string;
  progresoPorcentaje: number;
  montoTotalContratado: number;
  fechaInicio?: string | null;
  fechaEstimadaFin?: string | null;
  repositorioGitUrl?: string | null;
  urlStaging?: string | null;
  urlProduccion?: string | null;
  notasInternas?: string | null;
}

export interface CrearMinutaRequest {
  tituloReunion: string;
  fechaHora: string;
  asistentes: string;
  temasTratados: string;
  acuerdosYCompromisos?: string | null;
  tareasDerivadasJson?: string | null;
  citaId?: string | null;
}

export interface RegistrarPagoRequest {
  monto: number;
  concepto: string;
  fechaPago: string;
  metodoPago?: string;
  moneda?: string;
  numeroComprobante?: string | null;
  notas?: string | null;
}

export interface CrearHitoRequest {
  titulo: string;
  descripcion?: string | null;
  fechaEntrega?: string | null;
  urlEntregable?: string | null;
}

export interface ConmutarHitoRequest {
  completado?: boolean | null;
  aprobadoPorCliente?: boolean | null;
}

export const servicioProyectos = {
  obtenerTodos: async (estado?: string, busqueda?: string): Promise<ProyectoListadoAdminDto[]> => {
    const params = new URLSearchParams();
    if (estado) params.append("estado", estado);
    if (busqueda) params.append("busqueda", busqueda);
    const url = `/admin/proyectos${params.toString() ? `?${params.toString()}` : ""}`;
    const respuesta = await api.get<never, ProyectoListadoAdminDto[]>(url);
    return respuesta;
  },

  obtenerEstadisticas: async (): Promise<EstadisticasProyectosDto> => {
    const respuesta = await api.get<never, EstadisticasProyectosDto>("/admin/proyectos/estadisticas");
    return respuesta;
  },

  obtenerPorId: async (id: string): Promise<ProyectoDetalleAdminDto> => {
    const respuesta = await api.get<never, ProyectoDetalleAdminDto>(`/admin/proyectos/${id}`);
    return respuesta;
  },

  crear: async (datos: CrearProyectoRequest): Promise<ProyectoDetalleAdminDto> => {
    const respuesta = await api.post<never, ProyectoDetalleAdminDto>("/admin/proyectos", datos);
    return respuesta;
  },

  actualizar: async (id: string, datos: ActualizarProyectoRequest): Promise<ProyectoDetalleAdminDto> => {
    const respuesta = await api.put<never, ProyectoDetalleAdminDto>(`/admin/proyectos/${id}`, datos);
    return respuesta;
  },

  agregarMinuta: async (proyectoId: string, datos: CrearMinutaRequest): Promise<MinutaReunionDto> => {
    const respuesta = await api.post<never, MinutaReunionDto>(`/admin/proyectos/${proyectoId}/minutas`, datos);
    return respuesta;
  },

  agregarPago: async (proyectoId: string, datos: RegistrarPagoRequest): Promise<PagoProyectoDto> => {
    const respuesta = await api.post<never, PagoProyectoDto>(`/admin/proyectos/${proyectoId}/pagos`, datos);
    return respuesta;
  },

  agregarHito: async (proyectoId: string, datos: CrearHitoRequest): Promise<HitoEntregableDto> => {
    const respuesta = await api.post<never, HitoEntregableDto>(`/admin/proyectos/${proyectoId}/hitos`, datos);
    return respuesta;
  },

  conmutarHito: async (proyectoId: string, hitoId: string, datos: ConmutarHitoRequest): Promise<boolean> => {
    const respuesta = await api.patch<never, boolean>(`/admin/proyectos/${proyectoId}/hitos/${hitoId}`, datos);
    return respuesta;
  },

  cargarEtapasEstandar: async (proyectoId: string): Promise<boolean> => {
    const respuesta = await api.post<never, boolean>(`/admin/proyectos/${proyectoId}/etapas-estandar`);
    return respuesta;
  },

  cambiarEstado: async (
    proyectoId: string,
    datos: CambiarEstadoProyectoRequest
  ): Promise<ProyectoDetalleAdminDto> => {
    const respuesta = await api.patch<never, ProyectoDetalleAdminDto>(
      `/admin/proyectos/${proyectoId}/estado`,
      datos
    );
    return respuesta;
  },

  obtenerAlcance: async (proyectoId: string): Promise<ProyectoItemAlcanceDto[]> => {
    const respuesta = await api.get<never, ProyectoItemAlcanceDto[]>(`/admin/proyectos/${proyectoId}/alcance`);
    return respuesta;
  },

  agregarItemAlcance: async (
    proyectoId: string,
    datos: CrearItemAlcanceRequest
  ): Promise<ProyectoItemAlcanceDto> => {
    const respuesta = await api.post<never, ProyectoItemAlcanceDto>(
      `/admin/proyectos/${proyectoId}/alcance`,
      datos
    );
    return respuesta;
  },

  actualizarItemAlcance: async (
    proyectoId: string,
    itemId: string,
    datos: ActualizarItemAlcanceRequest
  ): Promise<ProyectoItemAlcanceDto> => {
    const respuesta = await api.patch<never, ProyectoItemAlcanceDto>(
      `/admin/proyectos/${proyectoId}/alcance/${itemId}`,
      datos
    );
    return respuesta;
  },

  eliminarItemAlcance: async (proyectoId: string, itemId: string): Promise<boolean> => {
    const respuesta = await api.delete<never, boolean>(
      `/admin/proyectos/${proyectoId}/alcance/${itemId}`
    );
    return respuesta;
  },

  descargarFichaPdf: async (proyectoId: string, codigoProyecto: string): Promise<void> => {
    const blob = await api.get<never, Blob>(`/admin/proyectos/${proyectoId}/pdf`, {
      responseType: "blob",
    });

    const urlTemporal = window.URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = urlTemporal;
    enlace.download = `Ficha_Proyecto_${codigoProyecto || "Detalle"}.pdf`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(urlTemporal);
  },
};
