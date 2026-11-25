import api from "./api";

export interface CitaAdminDto {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefonoWhatsApp: string;
  clienteEmpresa?: string | null;
  modalidad: number; // 1: PresencialTucuman, 2: PresencialYerbaBuena, 3: VirtualMeet
  modalidadDescripcion: string;
  origen: number; // 1: SitioWebCotizador, 2: SitioWebContacto, 3: ManualPablo
  origenDescripcion: string;
  estado: number; // 1: Pendiente, 2: Coordinada, 3: Realizada, 4: Cancelada
  estadoDescripcion: string;
  fechaSolicitud: string;
  fechaCoordinada?: string | null;
  linkReunionMeet?: string | null;
  notasPablo?: string | null;
  recordatorioDosHorasEnviado: boolean;
  fechaEnvioRecordatorio?: string | null;
  presupuestoId?: string | null;
  presupuestoCodigo?: string | null;
  proyectoId?: string | null;
  informeReunion?: string | null;
  acuerdosCompromisos?: string | null;
  resultadoComercial?: string | null;
  enlaceWhatsAppRecordatorio?: string | null;
}

export interface CrearCitaManualDto {
  clienteId?: string | null;
  nombreCompleto: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  rubro?: string | null;
  modalidad: number; // 1: Tucuman, 2: YerbaBuena, 3: VirtualMeet
  fechaHoraCoordinada?: string | null;
  linkMeet?: string | null;
  presupuestoId?: string | null;
  proyectoId?: string | null;
  notas?: string | null;
}

export interface CoordinarCitaDto {
  fechaHoraCoordinada: string;
  linkMeet?: string | null;
  notasAdicionales?: string | null;
}

export interface RegistrarInformeCitaDto {
  informeReunion: string;
  acuerdosCompromisos?: string | null;
  resultadoComercial?: string | null;
}

export interface ConvertirCitaAProyectoDto {
  tituloProyecto?: string | null;
  montoTotalContratado?: number | null;
  fechaEstimadaFin?: string | null;
}

export interface CancelarCitaDto {
  motivo?: string | null;
}

export const servicioCitas = {
  obtenerTodas: async (estado?: number): Promise<CitaAdminDto[]> => {
    const params = new URLSearchParams();
    if (estado !== undefined && estado !== null) {
      params.append("estado", estado.toString());
    }
    const url = `/admin/citas${params.toString() ? `?${params.toString()}` : ""}`;
    const respuesta = await api.get<never, CitaAdminDto[]>(url);
    return respuesta;
  },

  obtenerPorId: async (id: string): Promise<CitaAdminDto> => {
    const respuesta = await api.get<never, CitaAdminDto>(`/admin/citas/${id}`);
    return respuesta;
  },

  crearManual: async (peticion: CrearCitaManualDto): Promise<CitaAdminDto> => {
    const respuesta = await api.post<never, CitaAdminDto>("/admin/citas", peticion);
    return respuesta;
  },

  coordinar: async (id: string, peticion: CoordinarCitaDto): Promise<CitaAdminDto> => {
    const respuesta = await api.put<never, CitaAdminDto>(`/admin/citas/${id}/coordinar`, peticion);
    return respuesta;
  },

  marcarRealizada: async (id: string): Promise<CitaAdminDto> => {
    const respuesta = await api.put<never, CitaAdminDto>(`/admin/citas/${id}/realizada`);
    return respuesta;
  },

  registrarInforme: async (id: string, peticion: RegistrarInformeCitaDto): Promise<CitaAdminDto> => {
    const respuesta = await api.post<never, CitaAdminDto>(`/admin/citas/${id}/informe`, peticion);
    return respuesta;
  },

  convertirAProyecto: async (id: string, peticion: ConvertirCitaAProyectoDto): Promise<string> => {
    const respuesta = await api.post<never, string>(`/admin/citas/${id}/convertir-a-proyecto`, peticion);
    return respuesta;
  },

  cancelar: async (id: string, motivo?: string): Promise<CitaAdminDto> => {
    const peticion: CancelarCitaDto = { motivo: motivo || "Cancelada desde el panel ERP." };
    const respuesta = await api.put<never, CitaAdminDto>(`/admin/citas/${id}/cancelar`, peticion);
    return respuesta;
  },
};
