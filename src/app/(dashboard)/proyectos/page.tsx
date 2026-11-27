"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FolderGit2,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Users,
  GitBranch,
  Globe,
  Layers,
  ChevronRight,
  X,
  CreditCard,
  CheckSquare,
  Square,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  Send,
  Building,
  Mail,
  Phone,
  Edit3,
  Bookmark,
  Check,
} from "lucide-react";
import {
  servicioProyectos,
  ProyectoListadoAdminDto,
  ProyectoDetalleAdminDto,
  EstadisticasProyectosDto,
  CrearProyectoRequest,
  ActualizarProyectoRequest,
  CrearMinutaRequest,
  RegistrarPagoRequest,
  CrearHitoRequest,
} from "@/services/proyectos.service";
import {
  servicioPresupuestos,
  PresupuestoListadoAdminDto,
} from "@/services/presupuestos.service";

// Configuración de Estados predefinidos
const ESTADOS_PREDEFINIDOS = [
  { nombre: "Planificación", color: "#38bdf8", badge: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  { nombre: "Desarrollo", color: "#6366f1", badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
  { nombre: "Revisión / Staging", color: "#f59e0b", badge: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  { nombre: "Entregado", color: "#10b981", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  { nombre: "Pausado", color: "#64748b", badge: "bg-slate-500/10 text-slate-300 border-slate-500/30" },
  { nombre: "Cancelado", color: "#f43f5e", badge: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
];

interface TareaMinutaItem {
  id: string;
  tarea: string;
  responsable: string;
  completada: boolean;
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<ProyectoListadoAdminDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasProyectosDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  // Filtros y Vista
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [vistaModo, setVistaModo] = useState<"tabla" | "tarjetas">("tabla");

  // Detalle e Historia Clínica Modal
  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState<string | null>(null);
  const [proyectoDetalle, setProyectoDetalle] = useState<ProyectoDetalleAdminDto | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);
  const [pestanaActiva, setPestanaActiva] = useState<"general" | "minutas" | "pagos" | "hitos">("general");

  // Submodales
  const [modalCrearAbierto, setModalCrearAbierto] = useState<boolean>(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [modalMinutaAbierto, setModalMinutaAbierto] = useState<boolean>(false);
  const [modalPagoAbierto, setModalPagoAbierto] = useState<boolean>(false);
  const [modalHitoAbierto, setModalHitoAbierto] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Lista de presupuestos para enlazar al crear
  const [presupuestosDisponibles, setPresupuestosDisponibles] = useState<PresupuestoListadoAdminDto[]>([]);

  // Formularios de Creación / Edición
  const [formCrear, setFormCrear] = useState<CrearProyectoRequest>({
    titulo: "",
    descripcion: "",
    clienteId: "",
    presupuestoId: undefined,
    montoTotalContratado: 0,
    moneda: "ARS",
    fechaInicio: new Date().toISOString().substring(0, 10),
    fechaEstimadaFin: "",
    repositorioGitUrl: "",
    urlStaging: "",
    urlProduccion: "",
    notasInternas: "",
  });

  const [formEditar, setFormEditar] = useState<ActualizarProyectoRequest>({
    titulo: "",
    descripcion: "",
    estado: "Planificación",
    colorEstado: "#38bdf8",
    progresoPorcentaje: 0,
    montoTotalContratado: 0,
    fechaInicio: "",
    fechaEstimadaFin: "",
    repositorioGitUrl: "",
    urlStaging: "",
    urlProduccion: "",
    notasInternas: "",
  });

  const [formMinuta, setFormMinuta] = useState<{
    tituloReunion: string;
    fechaHora: string;
    asistentes: string;
    temasTratados: string;
    acuerdosYCompromisos: string;
    tareas: TareaMinutaItem[];
    nuevaTareaTexto: string;
    nuevaTareaResponsable: string;
  }>({
    tituloReunion: "",
    fechaHora: new Date().toISOString().substring(0, 16),
    asistentes: "",
    temasTratados: "",
    acuerdosYCompromisos: "",
    tareas: [],
    nuevaTareaTexto: "",
    nuevaTareaResponsable: "Pablo Bejas",
  });

  const [formPago, setFormPago] = useState<RegistrarPagoRequest>({
    monto: 0,
    concepto: "Anticipo de desarrollo",
    fechaPago: new Date().toISOString().substring(0, 10),
    metodoPago: "Transferencia",
    moneda: "ARS",
    numeroComprobante: "",
    notas: "",
  });

  const [formHito, setFormHito] = useState<CrearHitoRequest>({
    titulo: "",
    descripcion: "",
    fechaEntrega: "",
    urlEntregable: "",
  });

  // Cargar Proyectos y Estadísticas
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [lista, kpis] = await Promise.all([
        servicioProyectos.obtenerTodos(
          filtroEstado !== "Todos" ? filtroEstado : undefined,
          busqueda || undefined
        ),
        servicioProyectos.obtenerEstadisticas(),
      ]);
      setProyectos(lista || []);
      setEstadisticas(kpis);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al conectar con el servidor.";
      setErrorCarga(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, busqueda]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cargar presupuestos disponibles para modal de creación
  const cargarPresupuestos = async () => {
    try {
      const res = await servicioPresupuestos.listar({ tamanioPagina: 50 });
      setPresupuestosDisponibles(res.elementos || []);
    } catch {
      // Silencioso
    }
  };

  // Abrir detalle del proyecto
  const abrirDetalle = async (id: string, pestana: "general" | "minutas" | "pagos" | "hitos" = "general") => {
    setProyectoSeleccionadoId(id);
    setPestanaActiva(pestana);
    setCargandoDetalle(true);
    try {
      const detalle = await servicioProyectos.obtenerPorId(id);
      setProyectoDetalle(detalle);
      // Prellenar form editar
      setFormEditar({
        titulo: detalle.titulo,
        descripcion: detalle.descripcion || "",
        estado: detalle.estado,
        colorEstado: detalle.colorEstado,
        progresoPorcentaje: detalle.progresoPorcentaje,
        montoTotalContratado: detalle.montoTotalContratado,
        fechaInicio: detalle.fechaInicio ? detalle.fechaInicio.substring(0, 10) : "",
        fechaEstimadaFin: detalle.fechaEstimadaFin ? detalle.fechaEstimadaFin.substring(0, 10) : "",
        repositorioGitUrl: detalle.repositorioGitUrl || "",
        urlStaging: detalle.urlStaging || "",
        urlProduccion: detalle.urlProduccion || "",
        notasInternas: detalle.notasInternas || "",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "No se pudo cargar la historia clínica.";
      alert(errorMsg);
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Refrescar detalle actual
  const refrescarDetalleActual = async () => {
    if (!proyectoSeleccionadoId) return;
    try {
      const detalle = await servicioProyectos.obtenerPorId(proyectoSeleccionadoId);
      setProyectoDetalle(detalle);
      cargarDatos();
    } catch {
      // Silencioso
    }
  };

  // Crear Proyecto
  const guardarNuevoProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCrear.titulo.trim() || !formCrear.clienteId) {
      alert("Por favor complete el título y seleccione un cliente o presupuesto.");
      return;
    }
    setGuardando(true);
    try {
      await servicioProyectos.crear(formCrear);
      setModalCrearAbierto(false);
      setMensajeFeedback("¡Proyecto creado y dado de alta exitosamente!");
      setTimeout(() => setMensajeFeedback(null), 4000);
      cargarDatos();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al crear el proyecto.";
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Actualizar Proyecto
  const guardarEdicionProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyectoSeleccionadoId) return;
    setGuardando(true);
    try {
      await servicioProyectos.actualizar(proyectoSeleccionadoId, formEditar);
      setModalEditarAbierto(false);
      setMensajeFeedback("Proyecto actualizado correctamente.");
      setTimeout(() => setMensajeFeedback(null), 4000);
      refrescarDetalleActual();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al actualizar.";
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Agregar Minuta
  const guardarMinuta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyectoSeleccionadoId || !formMinuta.tituloReunion.trim()) return;
    setGuardando(true);
    try {
      const req: CrearMinutaRequest = {
        tituloReunion: formMinuta.tituloReunion,
        fechaHora: new Date(formMinuta.fechaHora).toISOString(),
        asistentes: formMinuta.asistentes,
        temasTratados: formMinuta.temasTratados,
        acuerdosYCompromisos: formMinuta.acuerdosYCompromisos || undefined,
        tareasDerivadasJson: formMinuta.tareas.length > 0 ? JSON.stringify(formMinuta.tareas) : undefined,
      };
      await servicioProyectos.agregarMinuta(proyectoSeleccionadoId, req);
      setModalMinutaAbierto(false);
      setFormMinuta({
        tituloReunion: "",
        fechaHora: new Date().toISOString().substring(0, 16),
        asistentes: "",
        temasTratados: "",
        acuerdosYCompromisos: "",
        tareas: [],
        nuevaTareaTexto: "",
        nuevaTareaResponsable: "Pablo Bejas",
      });
      setMensajeFeedback("Minuta registrada e incorporada a la historia clínica.");
      setTimeout(() => setMensajeFeedback(null), 4000);
      refrescarDetalleActual();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al registrar minuta.";
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Agregar Pago
  const guardarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyectoSeleccionadoId || formPago.monto <= 0) {
      alert("Por favor ingrese un monto válido.");
      return;
    }
    setGuardando(true);
    try {
      await servicioProyectos.agregarPago(proyectoSeleccionadoId, {
        ...formPago,
        fechaPago: new Date(formPago.fechaPago).toISOString(),
      });
      setModalPagoAbierto(false);
      setFormPago({
        monto: 0,
        concepto: "Pago de entrega / avance",
        fechaPago: new Date().toISOString().substring(0, 10),
        metodoPago: "Transferencia",
        moneda: "ARS",
        numeroComprobante: "",
        notas: "",
      });
      setMensajeFeedback("Pago registrado. Saldo pendiente recalculado.");
      setTimeout(() => setMensajeFeedback(null), 4000);
      refrescarDetalleActual();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al registrar pago.";
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Agregar Hito
  const guardarHito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyectoSeleccionadoId || !formHito.titulo.trim()) return;
    setGuardando(true);
    try {
      await servicioProyectos.agregarHito(proyectoSeleccionadoId, {
        ...formHito,
        fechaEntrega: formHito.fechaEntrega ? new Date(formHito.fechaEntrega).toISOString() : undefined,
      });
      setModalHitoAbierto(false);
      setFormHito({
        titulo: "",
        descripcion: "",
        fechaEntrega: "",
        urlEntregable: "",
      });
      setMensajeFeedback("Hito entregable añadido con éxito.");
      setTimeout(() => setMensajeFeedback(null), 4000);
      refrescarDetalleActual();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al crear hito.";
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Conmutar Hito (Completado / Aprobado)
  const alternarHito = async (hitoId: string, completadoActual: boolean, aprobadoActual: boolean, campo: "completado" | "aprobado") => {
    if (!proyectoSeleccionadoId) return;
    try {
      if (campo === "completado") {
        await servicioProyectos.conmutarHito(proyectoSeleccionadoId, hitoId, {
          completado: !completadoActual,
        });
      } else {
        await servicioProyectos.conmutarHito(proyectoSeleccionadoId, hitoId, {
          aprobadoPorCliente: !aprobadoActual,
        });
      }
      refrescarDetalleActual();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "No se pudo actualizar el estado del hito.";
      alert(errorMsg);
    }
  };

  // Cargar Etapas Estándar de Software
  const cargarEtapasEstandar = async (proyectoId: string) => {
    try {
      setGuardando(true);
      await servicioProyectos.cargarEtapasEstandar(proyectoId);
      setMensajeFeedback("Las 5 etapas estándar de desarrollo fueron cargadas.");
      setTimeout(() => setMensajeFeedback(null), 4000);
      refrescarDetalleActual();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar etapas estándar.";
      alert(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  // Formato de moneda
  const formatearMoneda = (monto: number, moneda: string = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  // Formato de fecha
  const formatearFecha = (fechaStr?: string | null) => {
    if (!fechaStr) return "-";
    const d = new Date(fechaStr);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Formato fecha y hora
  const formatearFechaHora = (fechaStr?: string | null) => {
    if (!fechaStr) return "-";
    const d = new Date(fechaStr);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtrado de proyectos en memoria para búsqueda inmediata
  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter((p) => {
      const matchBusqueda =
        busqueda.trim() === "" ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.clienteEmpresa && p.clienteEmpresa.toLowerCase().includes(busqueda.toLowerCase()));
      const matchEstado =
        filtroEstado === "Todos" || p.estado.toLowerCase() === filtroEstado.toLowerCase();
      return matchBusqueda && matchEstado;
    });
  }, [proyectos, busqueda, filtroEstado]);

  return (
    <div className="space-y-6">
      {/* Banner de Feedback */}
      {mensajeFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{mensajeFeedback}</span>
          </div>
          <button onClick={() => setMensajeFeedback(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Seguimiento de Proyectos
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-white/5 border border-white/10 text-neutral-400">
                  Historia Clínica
                </span>
              </h1>
              <p className="text-sm text-neutral-400">
                Auditoría continua de clientes contratados, minutas de reuniones, entregables e hitos financieros.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cargarDatos()}
            disabled={cargando}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              cargarPresupuestos();
              setModalCrearAbierto(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase">Proyectos Activos</span>
            <FolderGit2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {estadisticas?.proyectosEnCurso ?? 0}
            <span className="text-xs text-neutral-500 font-normal ml-2">
              de {estadisticas?.totalProyectos ?? 0} totales
            </span>
          </div>
          <div className="text-[11px] text-sky-400/80 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{estadisticas?.proyectosCompletados ?? 0} entregados con éxito</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase">Cartera Total</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatearMoneda(estadisticas?.montoTotalCartera ?? 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Valor acumulado en contratos
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase">Cobrado Acumulado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight">
            {formatearMoneda(estadisticas?.montoCobradoTotal ?? 0)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            Ingresos reales confirmados
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase">Saldo por Cobrar</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {formatearMoneda(estadisticas?.saldoTotalPorCobrar ?? 0)}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            Flujo pendiente de liquidación
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Selector de Vista */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl bg-neutral-900/60 border border-white/5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, título, cliente o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["Todos", "Planificación", "Desarrollo", "Revisión / Staging", "Entregado", "Pausado"].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filtroEstado === est
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "bg-white/5 text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              {est}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button
            onClick={() => setVistaModo("tabla")}
            className={`p-2 rounded-xl transition-all ${
              vistaModo === "tabla"
                ? "bg-white/10 text-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
            title="Vista de Tabla"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVistaModo("tarjetas")}
            className={`p-2 rounded-xl transition-all ${
              vistaModo === "tarjetas"
                ? "bg-white/10 text-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
            title="Vista de Tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mensaje de Error */}
      {errorCarga && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorCarga}</span>
        </div>
      )}

      {/* Listado / Vista Principal */}
      {cargando && proyectos.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-xs">Cargando portafolio de proyectos...</p>
        </div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-neutral-900/40 border border-white/5 space-y-3">
          <FolderGit2 className="w-10 h-10 mx-auto text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-300">No se encontraron proyectos</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {busqueda || filtroEstado !== "Todos"
              ? "Prueba cambiando los filtros de búsqueda o el estado seleccionado."
              : "Comienza dando de alta el primer proyecto contratado desde una cotización o de forma directa."}
          </p>
          <button
            onClick={() => {
              cargarPresupuestos();
              setModalCrearAbierto(true);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Primer Proyecto</span>
          </button>
        </div>
      ) : vistaModo === "tabla" ? (
        /* Vista Tabla Zebra */
        <div className="rounded-2xl border border-white/5 bg-neutral-900/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Código</th>
                  <th className="py-3.5 px-4 font-semibold">Proyecto</th>
                  <th className="py-3.5 px-4 font-semibold">Cliente</th>
                  <th className="py-3.5 px-4 font-semibold">Estado</th>
                  <th className="py-3.5 px-4 font-semibold">Progreso</th>
                  <th className="py-3.5 px-4 font-semibold">Cobranzas</th>
                  <th className="py-3.5 px-4 font-semibold">Hitos</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {proyectosFiltrados.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      idx % 2 === 1 ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-sky-400">
                      {p.codigo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.titulo}</div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Inicio: {formatearFecha(p.fechaInicio)}</span>
                        {p.fechaEstimadaFin && (
                          <span>• Entrega: {formatearFecha(p.fechaEstimadaFin)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-neutral-200 font-medium">{p.clienteNombre}</div>
                      <div className="text-[11px] text-neutral-400">
                        {p.clienteEmpresa || p.clienteEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                        style={{
                          backgroundColor: `${p.colorEstado}15`,
                          borderColor: `${p.colorEstado}40`,
                          color: p.colorEstado,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: p.colorEstado }}
                        />
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span className="text-neutral-400">{p.progresoPorcentaje}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${p.progresoPorcentaje}%`,
                            backgroundColor: p.colorEstado || "#38bdf8",
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-medium">
                        {formatearMoneda(p.montoCobradoAcumulado, p.moneda)}
                        <span className="text-neutral-500 text-[11px] font-normal ml-1">
                          / {formatearMoneda(p.montoTotalContratado, p.moneda)}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400/90">
                        {p.saldoPendiente > 0
                          ? `Resta: ${formatearMoneda(p.saldoPendiente, p.moneda)}`
                          : "Liquidado 100%"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-neutral-300">
                        {p.cantidadHitosCompletados} / {p.cantidadHitosTotal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => abrirDetalle(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-medium text-xs transition-all inline-flex items-center gap-1.5"
                      >
                        <span>Historia Clínica</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista Tarjetas Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proyectosFiltrados.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs text-sky-400 font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
                    {p.codigo}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                    style={{
                      backgroundColor: `${p.colorEstado}15`,
                      borderColor: `${p.colorEstado}40`,
                      color: p.colorEstado,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: p.colorEstado }}
                    />
                    {p.estado}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors line-clamp-1">
                  {p.titulo}
                </h3>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{p.clienteEmpresa || p.clienteNombre}</span>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Progreso técnico</span>
                    <span className="text-white font-semibold">{p.progresoPorcentaje}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.progresoPorcentaje}%`,
                        backgroundColor: p.colorEstado || "#38bdf8",
                      }}
                    />
                  </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Cobrado</span>
                    <span className="text-emerald-400 font-semibold">
                      {formatearMoneda(p.montoCobradoAcumulado, p.moneda)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Saldo</span>
                    <span className="text-amber-400 font-semibold">
                      {p.saldoPendiente > 0
                        ? formatearMoneda(p.saldoPendiente, p.moneda)
                        : "Saldado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span>{p.cantidadMinutas} minutas</span>
                  <span className="mx-1">•</span>
                  <span>{p.cantidadHitosCompletados}/{p.cantidadHitosTotal} hitos</span>
                </div>
                <button
                  onClick={() => abrirDetalle(p.id)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-medium text-xs transition-all inline-flex items-center gap-1"
                >
                  <span>Abrir Ficha</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLE / HISTORIA CLÍNICA INTEGRAL (4 PESTAÑAS)                     */}
      {/* ========================================================================= */}
      {proyectoSeleccionadoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden">
            {/* Header del Modal */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 font-semibold">
                      {proyectoDetalle?.codigo || "Cargando..."}
                    </span>
                    {proyectoDetalle && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${proyectoDetalle.colorEstado}15`,
                          borderColor: `${proyectoDetalle.colorEstado}40`,
                          color: proyectoDetalle.colorEstado,
                        }}
                      >
                        {proyectoDetalle.estado}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {proyectoDetalle?.titulo || "Historia Clínica del Proyecto"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {proyectoDetalle && (
                  <button
                    onClick={() => setModalEditarAbierto(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                    title="Editar estado y enlaces"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setProyectoSeleccionadoId(null);
                    setProyectoDetalle(null);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex border-b border-white/10 bg-neutral-950/40 px-5 gap-2 overflow-x-auto">
              {[
                { id: "general", label: "General & Enlaces", icon: Bookmark },
                { id: "minutas", label: "Minutas de Reunión", icon: FileText, count: proyectoDetalle?.minutas.length },
                { id: "pagos", label: "Cobranzas & Pagos", icon: DollarSign, count: proyectoDetalle?.pagos.length },
                { id: "hitos", label: "Hitos & Entregables", icon: CheckSquare, count: proyectoDetalle?.hitos.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const activo = pestanaActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPestanaActiva(tab.id as typeof pestanaActiva)}
                    className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                      activo
                        ? "border-sky-400 text-sky-300"
                        : "border-transparent text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contenido de la Historia Clínica */}
            <div className="flex-1 overflow-y-auto p-5 text-neutral-300 text-xs">
              {cargandoDetalle ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
                  <p>Cargando información médica del proyecto...</p>
                </div>
              ) : !proyectoDetalle ? (
                <div className="py-10 text-center text-rose-400">
                  No se pudo cargar la información del proyecto seleccionado.
                </div>
              ) : pestanaActiva === "general" ? (
                /* PESTAÑA 1: GENERAL & ENLACES TÉCNICOS */
                <div className="space-y-5">
                  {/* Ficha Cliente & Presupuesto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-neutral-400 font-mono uppercase text-[11px]">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ficha del Cliente</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-white font-bold text-sm">
                          {proyectoDetalle.clienteNombre}
                        </div>
                        {proyectoDetalle.clienteEmpresa && (
                          <div className="text-neutral-400 flex items-center gap-1.5">
                            <Building className="w-3 h-3 text-neutral-500" />
                            <span>{proyectoDetalle.clienteEmpresa}</span>
                          </div>
                        )}
                        <div className="text-neutral-400 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-neutral-500" />
                          <span>{proyectoDetalle.clienteEmail}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-neutral-400 font-mono text-[11px]">
                            {proyectoDetalle.clienteTelefonoWhatsApp}
                          </span>
                          <a
                            href={`https://wa.me/${proyectoDetalle.clienteTelefonoWhatsApp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-all inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-neutral-400 font-mono uppercase text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Cronograma & Cotización</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Fecha de Inicio:</span>
                          <span className="text-white font-mono">{formatearFecha(proyectoDetalle.fechaInicio)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Entrega Estimada:</span>
                          <span className="text-sky-300 font-mono">{formatearFecha(proyectoDetalle.fechaEstimadaFin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Cotización Origen:</span>
                          <span className="text-white font-mono font-medium">
                            {proyectoDetalle.presupuestoCodigo || "Directo (Sin presupuesto)"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-neutral-400">Progreso Total:</span>
                          <span className="font-mono text-white font-bold">{proyectoDetalle.progresoPorcentaje}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enlaces Técnicos del Proyecto */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-400 font-mono uppercase text-[11px]">
                        <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Accesos Técnicos & Entornos de Despliegue</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-neutral-500 text-[10px] uppercase font-mono block mb-1">
                          Repositorio Git
                        </span>
                        {proyectoDetalle.repositorioGitUrl ? (
                          <a
                            href={proyectoDetalle.repositorioGitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1.5 font-medium truncate"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{proyectoDetalle.repositorioGitUrl}</span>
                          </a>
                        ) : (
                          <span className="text-neutral-600 italic">No configurado</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-neutral-500 text-[10px] uppercase font-mono block mb-1">
                          Entorno Staging (Pruebas)
                        </span>
                        {proyectoDetalle.urlStaging ? (
                          <a
                            href={proyectoDetalle.urlStaging}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium truncate"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{proyectoDetalle.urlStaging}</span>
                          </a>
                        ) : (
                          <span className="text-neutral-600 italic">No configurado</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-neutral-500 text-[10px] uppercase font-mono block mb-1">
                          Entorno Producción
                        </span>
                        {proyectoDetalle.urlProduccion ? (
                          <a
                            href={proyectoDetalle.urlProduccion}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium truncate"
                          >
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{proyectoDetalle.urlProduccion}</span>
                          </a>
                        ) : (
                          <span className="text-neutral-600 italic">No configurado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notas Internas y Bitácora */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-neutral-400 font-mono uppercase text-[11px] block">
                      Notas Internas & Alcance del Proyecto
                    </span>
                    <p className="text-neutral-300 leading-relaxed whitespace-pre-line bg-black/30 p-3 rounded-xl border border-white/5">
                      {proyectoDetalle.notasInternas || proyectoDetalle.descripcion || "Sin notas internas registradas."}
                    </p>
                  </div>
                </div>
              ) : pestanaActiva === "minutas" ? (
                /* PESTAÑA 2: MINUTAS DE REUNIÓN */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Historial de Minutas de Reunión</h4>
                      <p className="text-neutral-500 text-[11px]">
                        Registro cronológico de acuerdos, compromisos y tareas con el cliente.
                      </p>
                    </div>
                    <button
                      onClick={() => setModalMinutaAbierto(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar Minuta</span>
                    </button>
                  </div>

                  {proyectoDetalle.minutas.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-neutral-600" />
                      <p className="text-neutral-400 font-medium">Aún no se han registrado minutas</p>
                      <p className="text-neutral-600 text-[11px]">
                        Guarda los acuerdos y compromisos después de cada reunión con el cliente.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proyectoDetalle.minutas.map((minuta) => {
                        let tareasParsed: TareaMinutaItem[] = [];
                        if (minuta.tareasDerivadasJson) {
                          try {
                            tareasParsed = JSON.parse(minuta.tareasDerivadasJson);
                          } catch {
                            tareasParsed = [];
                          }
                        }

                        return (
                          <div
                            key={minuta.id}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-white/10 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                              <h5 className="font-bold text-white text-sm flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-sky-400" />
                                {minuta.tituloReunion}
                              </h5>
                              <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatearFechaHora(minuta.fechaHora)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-neutral-500 text-[10px] uppercase font-mono block">
                                  Asistentes
                                </span>
                                <p className="text-neutral-300 font-medium">{minuta.asistentes}</p>
                              </div>
                              <div>
                                <span className="text-neutral-500 text-[10px] uppercase font-mono block">
                                  Temas Tratados
                                </span>
                                <p className="text-neutral-300">{minuta.temasTratados}</p>
                              </div>
                            </div>

                            {minuta.acuerdosYCompromisos && (
                              <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-sky-200">
                                <span className="text-sky-400 text-[10px] uppercase font-mono block font-semibold mb-1">
                                  Acuerdos y Compromisos
                                </span>
                                <p className="whitespace-pre-line text-xs">{minuta.acuerdosYCompromisos}</p>
                              </div>
                            )}

                            {tareasParsed.length > 0 && (
                              <div className="space-y-1.5 pt-2">
                                <span className="text-neutral-500 text-[10px] uppercase font-mono block">
                                  Checklist de Tareas Derivadas
                                </span>
                                <div className="space-y-1">
                                  {tareasParsed.map((t) => (
                                    <div
                                      key={t.id}
                                      className="flex items-center gap-2 text-neutral-300 text-xs py-1 px-2 rounded-lg bg-black/20"
                                    >
                                      {t.completada ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-neutral-500" />
                                      )}
                                      <span className={t.completada ? "line-through text-neutral-500" : ""}>
                                        {t.tarea}
                                      </span>
                                      <span className="ml-auto text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-white/5">
                                        {t.responsable}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : pestanaActiva === "pagos" ? (
                /* PESTAÑA 3: COBRANZAS Y PAGOS */
                <div className="space-y-5">
                  {/* Resumen Financiero */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-neutral-500 text-[10px] uppercase font-mono block">Total Contratado</span>
                      <div className="text-lg font-bold text-white mt-1">
                        {formatearMoneda(proyectoDetalle.montoTotalContratado, proyectoDetalle.moneda)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-emerald-400 text-[10px] uppercase font-mono block">Cobrado Acumulado</span>
                      <div className="text-lg font-bold text-emerald-300 mt-1">
                        {formatearMoneda(proyectoDetalle.montoCobradoAcumulado, proyectoDetalle.moneda)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-amber-400 text-[10px] uppercase font-mono block">Saldo Pendiente</span>
                      <div className="text-lg font-bold text-amber-300 mt-1">
                        {formatearMoneda(proyectoDetalle.saldoPendiente, proyectoDetalle.moneda)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Historial de Cobros Registrados</h4>
                      <p className="text-neutral-500 text-[11px]">
                        Pagos de anticipos, entregables y cancelaciones finales.
                      </p>
                    </div>
                    <button
                      onClick={() => setModalPagoAbierto(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar Pago</span>
                    </button>
                  </div>

                  {proyectoDetalle.pagos.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                      <CreditCard className="w-8 h-8 mx-auto text-neutral-600" />
                      <p className="text-neutral-400 font-medium">No se han registrado pagos aún</p>
                      <p className="text-neutral-600 text-[11px]">
                        Registra la seña o el anticipo de inicio de desarrollo.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-black/20 overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">Concepto</th>
                            <th className="py-2.5 px-3">Método</th>
                            <th className="py-2.5 px-3">Comprobante</th>
                            <th className="py-2.5 px-3 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          {proyectoDetalle.pagos.map((pago) => (
                            <tr key={pago.id} className="hover:bg-white/[0.02]">
                              <td className="py-2.5 px-3 text-neutral-300">
                                {formatearFecha(pago.fechaPago)}
                              </td>
                              <td className="py-2.5 px-3 font-sans text-white font-medium">
                                {pago.concepto}
                                {pago.notas && (
                                  <span className="block text-[11px] text-neutral-500 font-normal">
                                    {pago.notas}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-neutral-400">{pago.metodoPago}</td>
                              <td className="py-2.5 px-3 text-neutral-400">
                                {pago.numeroComprobante || "-"}
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                                {formatearMoneda(pago.monto, pago.moneda)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* PESTAÑA 4: HITOS Y ENTREGABLES */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">Hitos y Etapas de Desarrollo</h4>
                      <p className="text-neutral-400 text-[11px]">
                        El progreso del proyecto se calcula automáticamente: <span className="text-sky-300 font-mono font-semibold">{proyectoDetalle.progresoPorcentaje}%</span> según los hitos completados.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cargarEtapasEstandar(proyectoDetalle.id)}
                        disabled={guardando}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Cargar las 5 etapas estándar: Relevamiento, UI/UX, Backend, Frontend, Staging/Producción"
                      >
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <span>Cargar Etapas Estándar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalHitoAbierto(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Hito</span>
                      </button>
                    </div>
                  </div>

                  {proyectoDetalle.hitos.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                      <CheckSquare className="w-8 h-8 mx-auto text-neutral-600" />
                      <p className="text-neutral-400 font-medium">Sin hitos planificados</p>
                      <p className="text-neutral-600 text-[11px]">
                        Divide el proyecto en entregables clave (ej. Diseño UI en Figma, Staging, Despliegue).
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {proyectoDetalle.hitos.map((hito) => (
                        <div
                          key={hito.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            hito.completado
                              ? "bg-white/[0.01] border-white/5 opacity-80"
                              : "bg-white/[0.03] border-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() =>
                                alternarHito(hito.id, hito.completado, hito.aprobadoPorCliente, "completado")
                              }
                              className="mt-0.5 text-neutral-400 hover:text-sky-300 transition-colors"
                              title={hito.completado ? "Marcar como pendiente" : "Marcar como completado"}
                            >
                              {hito.completado ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>

                            <div>
                              <h5
                                className={`font-bold text-sm ${
                                  hito.completado ? "line-through text-neutral-400" : "text-white"
                                }`}
                              >
                                {hito.titulo}
                              </h5>
                              {hito.descripcion && (
                                <p className="text-neutral-400 text-[11px] mt-0.5">
                                  {hito.descripcion}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-neutral-500">
                                {hito.fechaEntrega && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Límite: {formatearFecha(hito.fechaEntrega)}</span>
                                  </span>
                                )}
                                {hito.urlEntregable && (
                                  <a
                                    href={hito.urlEntregable}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-sans"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Ver Entregable</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                            <button
                              onClick={() =>
                                alternarHito(hito.id, hito.completado, hito.aprobadoPorCliente, "aprobado")
                              }
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 transition-all ${
                                hito.aprobadoPorCliente
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {hito.aprobadoPorCliente && <Check className="w-3 h-3" />}
                              <span>
                                {hito.aprobadoPorCliente ? "Aprobado por Cliente" : "Sin Aprobación"}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CREAR PROYECTO                                                      */}
      {/* ========================================================================= */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Nuevo Proyecto Contratado</h3>
              </div>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarNuevoProyecto} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Opcional: Cargar desde presupuesto existente */}
              <div>
                <label className="block text-neutral-400 mb-1">
                  Vincular desde Cotización / Presupuesto (Recomendado)
                </label>
                <select
                  onChange={async (e) => {
                    const selId = e.target.value;
                    if (!selId) {
                      setFormCrear((prev) => ({
                        ...prev,
                        presupuestoId: undefined,
                      }));
                      return;
                    }
                    const pres = presupuestosDisponibles.find((p) => p.id === selId);
                    if (pres) {
                      try {
                        const detalle = await servicioPresupuestos.obtenerPorId(pres.id);
                        setFormCrear((prev) => ({
                          ...prev,
                          presupuestoId: detalle.id,
                          clienteId: detalle.cliente.id || "",
                          titulo: `Proyecto ${pres.servicioPrincipal} - ${detalle.cliente.nombreCompleto}`,
                          montoTotalContratado: detalle.totalPresupuestado,
                          moneda: detalle.moneda,
                          notasInternas: detalle.descripcionNecesidad || "",
                        }));
                      } catch {
                        setFormCrear((prev) => ({
                          ...prev,
                          presupuestoId: pres.id,
                          titulo: `Proyecto ${pres.servicioPrincipal} - ${pres.clienteNombre}`,
                          montoTotalContratado: pres.totalPresupuestado,
                          moneda: pres.moneda,
                        }));
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Seleccionar cotización aprobada o registrada --</option>
                  {presupuestosDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.clienteNombre} ({p.servicioPrincipal}) - ${p.totalPresupuestado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Título del Proyecto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rediseño Web & Plataforma SaaS"
                  value={formCrear.titulo}
                  onChange={(e) => setFormCrear({ ...formCrear, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Cliente Vinculado */}
              <div>
                <label className="block text-neutral-400 mb-1">
                  ID del Cliente o Seleccionado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ID UUID del cliente (se auto-completa al elegir una cotización)"
                  value={formCrear.clienteId}
                  onChange={(e) => setFormCrear({ ...formCrear, clienteId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Al seleccionar una cotización de la lista superior, el identificador único del cliente se vincula automáticamente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Monto Total Contratado *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formCrear.montoTotalContratado}
                    onChange={(e) =>
                      setFormCrear({ ...formCrear, montoTotalContratado: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Moneda</label>
                  <select
                    value={formCrear.moneda}
                    onChange={(e) => setFormCrear({ ...formCrear, moneda: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                  >
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD (US$)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formCrear.fechaInicio || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Fecha Estimada de Entrega</label>
                  <input
                    type="date"
                    value={formCrear.fechaEstimadaFin || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaEstimadaFin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-neutral-400 font-mono text-[11px] uppercase">
                  Enlaces Iniciales (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formCrear.repositorioGitUrl || ""}
                  onChange={(e) => setFormCrear({ ...formCrear, repositorioGitUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notas Internas / Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Objetivos pactados, especificaciones clave..."
                  value={formCrear.notasInternas || ""}
                  onChange={(e) => setFormCrear({ ...formCrear, notasInternas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold"
                >
                  {guardando ? "Creando..." : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDITAR ESTADO / ENLACES DEL PROYECTO                                */}
      {/* ========================================================================= */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Actualizar Proyecto</h3>
              <button onClick={() => setModalEditarAbierto(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEdicionProyecto} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={formEditar.titulo}
                  onChange={(e) => setFormEditar({ ...formEditar, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Estado</label>
                  <select
                    value={formEditar.estado}
                    onChange={(e) => {
                      const est = ESTADOS_PREDEFINIDOS.find((x) => x.nombre === e.target.value);
                      setFormEditar({
                        ...formEditar,
                        estado: e.target.value,
                        colorEstado: est ? est.color : formEditar.colorEstado,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    {ESTADOS_PREDEFINIDOS.map((est) => (
                      <option key={est.nombre} value={est.nombre}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Progreso ({formEditar.progresoPorcentaje}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formEditar.progresoPorcentaje}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, progresoPorcentaje: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-sky-400 mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Repo Git</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formEditar.repositorioGitUrl || ""}
                    onChange={(e) => setFormEditar({ ...formEditar, repositorioGitUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Staging URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formEditar.urlStaging || ""}
                    onChange={(e) => setFormEditar({ ...formEditar, urlStaging: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Producción URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formEditar.urlProduccion || ""}
                    onChange={(e) => setFormEditar({ ...formEditar, urlProduccion: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notas Internas</label>
                <textarea
                  rows={2}
                  value={formEditar.notasInternas || ""}
                  onChange={(e) => setFormEditar({ ...formEditar, notasInternas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold"
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL REGISTRAR MINUTA DE REUNIÓN                                         */}
      {/* ========================================================================= */}
      {modalMinutaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border border-white/10 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Registrar Minuta de Reunión</h3>
              </div>
              <button onClick={() => setModalMinutaAbierto(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarMinuta} className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Título de la Reunión *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Kick-off inicial / Demo Sprint 1"
                    value={formMinuta.tituloReunion}
                    onChange={(e) => setFormMinuta({ ...formMinuta, tituloReunion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Fecha y Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formMinuta.fechaHora}
                    onChange={(e) => setFormMinuta({ ...formMinuta, fechaHora: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Asistentes *</label>
                <input
                  type="text"
                  required
                  placeholder="Pablo Bejas, Cliente (Juan Pérez), etc."
                  value={formMinuta.asistentes}
                  onChange={(e) => setFormMinuta({ ...formMinuta, asistentes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Temas Tratados *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Puntos principales discutidos en la llamada..."
                  value={formMinuta.temasTratados}
                  onChange={(e) => setFormMinuta({ ...formMinuta, temasTratados: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Acuerdos y Compromisos</label>
                <textarea
                  rows={2}
                  placeholder="Decisiones finales tomadas y plazos comprometidos..."
                  value={formMinuta.acuerdosYCompromisos}
                  onChange={(e) => setFormMinuta({ ...formMinuta, acuerdosYCompromisos: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Checklist dinámico de tareas */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block text-neutral-400 font-mono text-[11px] uppercase">
                  Tareas Derivadas / Acciones a Seguir
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Descripción de la tarea..."
                    value={formMinuta.nuevaTareaTexto}
                    onChange={(e) => setFormMinuta({ ...formMinuta, nuevaTareaTexto: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Responsable"
                    value={formMinuta.nuevaTareaResponsable}
                    onChange={(e) => setFormMinuta({ ...formMinuta, nuevaTareaResponsable: e.target.value })}
                    className="w-32 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!formMinuta.nuevaTareaTexto.trim()) return;
                      const nueva: TareaMinutaItem = {
                        id: Math.random().toString(36).substring(2, 9),
                        tarea: formMinuta.nuevaTareaTexto.trim(),
                        responsable: formMinuta.nuevaTareaResponsable || "Pablo Bejas",
                        completada: false,
                      };
                      setFormMinuta({
                        ...formMinuta,
                        tareas: [...formMinuta.tareas, nueva],
                        nuevaTareaTexto: "",
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                  >
                    +
                  </button>
                </div>

                {formMinuta.tareas.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formMinuta.tareas.map((t, idx) => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-[11px]">
                        <span className="text-white">{t.tarea}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 font-mono">({t.responsable})</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormMinuta({
                                ...formMinuta,
                                tareas: formMinuta.tareas.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMinutaAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold"
                >
                  {guardando ? "Registrando..." : "Guardar Minuta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL REGISTRAR PAGO                                                      */}
      {/* ========================================================================= */}
      {modalPagoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Registrar Cobro / Pago</h3>
              </div>
              <button onClick={() => setModalPagoAbierto(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarPago} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Monto Abonado *</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={formPago.monto}
                  onChange={(e) => setFormPago({ ...formPago, monto: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 text-base font-bold font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Anticipo 50%, Cuota 2, Saldo final"
                  value={formPago.concepto}
                  onChange={(e) => setFormPago({ ...formPago, concepto: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Fecha del Pago *</label>
                  <input
                    type="date"
                    required
                    value={formPago.fechaPago}
                    onChange={(e) => setFormPago({ ...formPago, fechaPago: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Método de Pago</label>
                  <select
                    value={formPago.metodoPago}
                    onChange={(e) => setFormPago({ ...formPago, metodoPago: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="MercadoPago">MercadoPago</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="USDT/Cripto">USDT / Cripto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Nº Comprobante / Transacción</label>
                <input
                  type="text"
                  placeholder="Ej. TX-98471203"
                  value={formPago.numeroComprobante || ""}
                  onChange={(e) => setFormPago({ ...formPago, numeroComprobante: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalPagoAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold"
                >
                  {guardando ? "Registrando..." : "Confirmar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CREAR HITO ENTREGABLE                                               */}
      {/* ========================================================================= */}
      {modalHitoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Nuevo Hito Entregable</h3>
              </div>
              <button onClick={() => setModalHitoAbierto(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarHito} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Título del Hito *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Maquetación UI en Figma / Despliegue Staging"
                  value={formHito.titulo}
                  onChange={(e) => setFormHito({ ...formHito, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descripción / Criterio de Aceptación</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de lo que se entregará en esta etapa..."
                  value={formHito.descripcion || ""}
                  onChange={(e) => setFormHito({ ...formHito, descripcion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Fecha Límite</label>
                  <input
                    type="date"
                    value={formHito.fechaEntrega || ""}
                    onChange={(e) => setFormHito({ ...formHito, fechaEntrega: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Enlace al Entregable</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formHito.urlEntregable || ""}
                    onChange={(e) => setFormHito({ ...formHito, urlEntregable: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalHitoAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold"
                >
                  {guardando ? "Creando..." : "Guardar Hito"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
