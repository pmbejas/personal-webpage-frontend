export interface UsuarioAdmin {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  ultimoAccesoUtc?: string | null;
}

export interface LoginAdminRequest {
  email: string;
  password: string;
}

export interface LoginAdminResponse {
  tokenAcceso: string;
  expiraEnSegundos: number;
  usuario: UsuarioAdmin;
}

export interface RespuestaApi<T> {
  exito: boolean;
  datos: T;
  mensaje?: string | null;
  errores?: string[] | null;
}

export interface PaginadoResultadoResponse<T> {
  elementos: T[];
  totalRegistros: number;
  paginaActual: number;
  tamanioPagina: number;
  totalPaginas: number;
}

export type TipoRelacionClienteFiltro = "Todos" | "Cliente" | "Prospecto";
export type EstadoRegistroClienteFiltro = "activos" | "archivados" | "todos";
export type OrdenClientesFiltro = "recientes" | "nombre" | "mayor_facturacion" | "ultima_actividad";

export interface FiltrosClientesRequest {
  terminoBusqueda?: string;
  tipoRelacion?: string;
  rubro?: string;
  activo?: boolean;
  soloConSaldoPendiente?: boolean;
  ordenarPor?: OrdenClientesFiltro;
  pagina?: number;
  tamanioPagina?: number;
}

export interface ClienteListadoResponse {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  rubroId?: string | null;
  rubro?: string | null;
  cuitCuil?: string | null;
  domicilioCalle1?: string | null;
  domicilioCalle2?: string | null;
  localidad?: string | null;
  ubicacion?: string | null;
  activo: boolean;
  esClienteConvertido: boolean;
  tipoRelacion: string;
  cantidadPresupuestos: number;
  cantidadCitas: number;
  cantidadProyectos: number;
  montoTotalCotizado: number;
  montoTotalContratado: number;
  montoTotalCobrado: number;
  saldoPendiente: number;
  fechaCreacion: string;
  ultimaInteraccion: string;
}

export interface ClientePresupuestoResumenResponse {
  id: string;
  codigo: string;
  estado: number;
  estadoDescripcion: string;
  totalPresupuestado: number;
  moneda: string;
  fechaCreacion: string;
  fechaVencimiento: string;
}

export interface ClienteProyectoResumenResponse {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  colorEstado: string;
  progresoPorcentaje: number;
  montoTotalContratado: number;
  montoCobradoAcumulado: number;
  saldoPendiente: number;
  moneda: string;
  fechaInicio?: string | null;
  fechaEstimadaFin?: string | null;
  fechaCreacion: string;
}

export interface ClienteCitaResumenResponse {
  id: string;
  modalidad: number;
  modalidadDescripcion: string;
  origen: number;
  estado: number;
  estadoDescripcion: string;
  fechaSolicitud: string;
  fechaCoordinada?: string | null;
  resultadoComercial?: string | null;
}

export interface ClientePagoResumenResponse {
  id: string;
  proyectoId: string;
  proyectoCodigo: string;
  proyectoTitulo: string;
  fechaPago: string;
  monto: number;
  moneda: string;
  metodoPago: string;
  numeroComprobante?: string | null;
  concepto: string;
  notas?: string | null;
}

export interface ClienteDetalleResponse {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  rubroId?: string | null;
  rubro?: string | null;
  cuitCuil?: string | null;
  domicilioCalle1?: string | null;
  domicilioCalle2?: string | null;
  localidad?: string | null;
  ubicacion?: string | null;
  notasInternas?: string | null;
  activo: boolean;
  esClienteConvertido: boolean;
  tipoRelacion: string;
  enlaceWhatsAppDirecto: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  ultimaInteraccion: string;
  cantidadPresupuestos: number;
  cantidadCitas: number;
  cantidadProyectos: number;
  montoTotalCotizado: number;
  montoTotalContratado: number;
  montoTotalCobrado: number;
  saldoPendiente: number;
  presupuestos: ClientePresupuestoResumenResponse[];
  proyectos: ClienteProyectoResumenResponse[];
  pagos: ClientePagoResumenResponse[];
  citas: ClienteCitaResumenResponse[];
}

export interface ClienteSelectorResponse {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  cuitCuil?: string | null;
}

export interface RubroMetricaClienteResponse {
  rubro: string;
  cantidadClientes: number;
}

export interface EstadisticasClientesResponse {
  totalActivos: number;
  totalArchivados: number;
  totalClientesConvertidos: number;
  totalProspectos: number;
  tasaConversionPorcentaje: number;
  nuevosUltimos30Dias: number;
  clientesConSaldoPendiente: number;
  saldoTotalPendiente: number;
  rubrosTop: RubroMetricaClienteResponse[];
}

export interface CrearClienteRequest {
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  rubroId?: string | null;
  rubro?: string | null;
  cuitCuil?: string | null;
  domicilioCalle1?: string | null;
  domicilioCalle2?: string | null;
  localidad?: string | null;
  ubicacion?: string | null;
  notasInternas?: string | null;
}

export interface ActualizarClienteRequest {
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  email: string;
  telefonoWhatsApp: string;
  empresa?: string | null;
  rubroId?: string | null;
  rubro?: string | null;
  cuitCuil?: string | null;
  domicilioCalle1?: string | null;
  domicilioCalle2?: string | null;
  localidad?: string | null;
  ubicacion?: string | null;
  notasInternas?: string | null;
}

export interface ActualizarNotasClienteRequest {
  notasInternas?: string | null;
}

export interface RubroClienteResponse {
  id: string;
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
  activo: boolean;
  cantidadClientes: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearRubroClienteRequest {
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
}

export interface ActualizarRubroClienteRequest {
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
}

export interface CategoriaAdicionalResponse {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
  activo: boolean;
  cantidadAdicionales: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearCategoriaAdicionalRequest {
  clave?: string | null;
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
}

export interface ActualizarCategoriaAdicionalRequest {
  nombre: string;
  descripcion?: string | null;
  ordenVisualizacion: number;
}
