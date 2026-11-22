import api from "./api";

export interface CitaProximaDashboardDto {
  id: string;
  clienteNombre: string;
  clienteEmpresa?: string | null;
  clienteTelefonoWhatsApp: string;
  fechaHoraCoordinada: string;
  modalidad: number;
  modalidadDescripcion: string;
  linkReunionMeet?: string | null;
}

export interface ServicioMetricaDashboardDto {
  servicioNombre: string;
  cantidadPresupuestos: number;
  montoTotalCotizado: number;
  porcentajeParticipacion: number;
}

export interface ActividadRecienteDto {
  tipo: string;
  titulo: string;
  subtitulo: string;
  monto?: number | null;
  moneda?: string | null;
  fecha: string;
  badgeColor: string;
}

export interface DashboardMetricasDto {
  montoTotalCartera: number;
  montoTotalCobrado: number;
  saldoTotalPendiente: number;
  porcentajeCobradoGlobal: number;
  totalPresupuestosEmitidos: number;
  presupuestosAprobados: number;
  presupuestosPendientes: number;
  tasaConversionPorcentaje: number;
  montoTotalCotizado: number;
  proyectosEnCurso: number;
  proyectosCompletados: number;
  totalProyectos: number;
  citasPendientesCoordinacion: number;
  citasSemanaActual: number;
  proximasCitas: CitaProximaDashboardDto[];
  distribucionServicios: ServicioMetricaDashboardDto[];
  actividadReciente: ActividadRecienteDto[];
}

export const servicioDashboard = {
  obtenerMetricas: async (): Promise<DashboardMetricasDto> => {
    const respuesta = await api.get<never, DashboardMetricasDto>("/admin/dashboard/metricas");
    return respuesta;
  },
};
