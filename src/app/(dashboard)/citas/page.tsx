"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  Plus,
  RefreshCw,
  Video,
  MapPin,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  User,
  Mail,
  Phone,
  Tag,
  ExternalLink,
  Calendar,
  X,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  FolderGit2,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  servicioCitas,
  CitaAdminDto,
  CrearCitaManualDto,
  CoordinarCitaDto,
  RegistrarInformeCitaDto,
} from "@/services/citas.service";
import {
  servicioPresupuestos,
  PresupuestoListadoAdminDto,
} from "@/services/presupuestos.service";
import {
  servicioProyectos,
  ProyectoListadoAdminDto,
} from "@/services/proyectos.service";

// Configuración de Estados de Reunión
const ESTADOS_CITAS: Record<number, { etiqueta: string; badgeClase: string }> = {
  1: {
    etiqueta: "Pendiente Coordinación",
    badgeClase: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  2: {
    etiqueta: "Coordinada",
    badgeClase: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  },
  3: {
    etiqueta: "Realizada",
    badgeClase: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  4: {
    etiqueta: "Cancelada",
    badgeClase: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
};

export default function CitasPage() {
  const router = useRouter();
  const [citas, setCitas] = useState<CitaAdminDto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<number | undefined>(undefined);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  // Modales
  const [citaParaCoordinar, setCitaParaCoordinar] = useState<CitaAdminDto | null>(null);
  const [formCoordinar, setFormCoordinar] = useState<CoordinarCitaDto>({
    fechaHoraCoordinada: "",
    linkMeet: "",
    notasAdicionales: "",
  });

  const [modalCrearAbierto, setModalCrearAbierto] = useState<boolean>(false);
  const [origenSeleccionado, setOrigenSeleccionado] = useState<"prospecto" | "presupuesto" | "proyecto">("prospecto");
  const [presupuestosDisponibles, setPresupuestosDisponibles] = useState<PresupuestoListadoAdminDto[]>([]);
  const [proyectosDisponibles, setProyectosDisponibles] = useState<ProyectoListadoAdminDto[]>([]);

  const [formCrear, setFormCrear] = useState<CrearCitaManualDto>({
    nombreCompleto: "",
    email: "",
    telefonoWhatsApp: "",
    empresa: "",
    rubro: "",
    modalidad: 3, // 3: VirtualMeet
    fechaHoraCoordinada: "",
    linkMeet: "",
    notas: "",
  });

  // Modal Informe de Cita
  const [citaParaInforme, setCitaParaInforme] = useState<CitaAdminDto | null>(null);
  const [formInforme, setFormInforme] = useState<RegistrarInformeCitaDto>({
    informeReunion: "",
    acuerdosCompromisos: "",
    resultadoComercial: "Presupuesto Aprobado",
  });
  const [guardandoInforme, setGuardandoInforme] = useState<boolean>(false);

  const [citaParaCancelar, setCitaParaCancelar] = useState<CitaAdminDto | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState<string>("");

  const [guardando, setGuardando] = useState<boolean>(false);

  // Cargar Citas
  const cargarCitas = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      const datos = await servicioCitas.obtenerTodas(filtroEstado);
      setCitas(datos);
    } catch (err: unknown) {
      console.error("Error al cargar citas:", err);
      setErrorCarga("No se pudieron cargar las citas. Verificá la conexión con la API.");
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  // Métricas KPI
  const estadisticas = useMemo(() => {
    const total = citas.length;
    const pendientes = citas.filter((c) => c.estado === 1).length;
    const coordinadas = citas.filter((c) => c.estado === 2).length;
    const realizadas = citas.filter((c) => c.estado === 3).length;
    return { total, pendientes, coordinadas, realizadas };
  }, [citas]);

  // Citas filtradas por texto
  const citasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return citas;
    const q = busqueda.trim().toLowerCase();
    return citas.filter(
      (c) =>
        c.clienteNombre.toLowerCase().includes(q) ||
        c.clienteEmail.toLowerCase().includes(q) ||
        (c.clienteEmpresa && c.clienteEmpresa.toLowerCase().includes(q)) ||
        (c.presupuestoCodigo && c.presupuestoCodigo.toLowerCase().includes(q))
    );
  }, [citas, busqueda]);

  const mostrarFeedback = (mensaje: string) => {
    setMensajeFeedback(mensaje);
    setTimeout(() => setMensajeFeedback(null), 3500);
  };

  // Abrir Modal de Coordinación
  const abrirModalCoordinar = (cita: CitaAdminDto) => {
    setCitaParaCoordinar(cita);
    // Formatear fecha para datetime-local si ya tiene
    let fechaLocal = "";
    if (cita.fechaCoordinada) {
      const d = new Date(cita.fechaCoordinada);
      const pad = (n: number) => n.toString().padStart(2, "0");
      fechaLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    setFormCoordinar({
      fechaHoraCoordinada: fechaLocal,
      linkMeet: cita.linkReunionMeet || "",
      notasAdicionales: cita.notasPablo || "",
    });
  };

  // Guardar Coordinación
  const guardarCoordinacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaParaCoordinar) return;

    if (!formCoordinar.fechaHoraCoordinada) {
      mostrarFeedback("Por favor seleccioná la fecha y hora de la reunión.");
      return;
    }

    try {
      setGuardando(true);
      await servicioCitas.coordinar(citaParaCoordinar.id, {
        fechaHoraCoordinada: new Date(formCoordinar.fechaHoraCoordinada).toISOString(),
        linkMeet: formCoordinar.linkMeet?.trim() || null,
        notasAdicionales: formCoordinar.notasAdicionales?.trim() || null,
      });

      mostrarFeedback(`Reunión con ${citaParaCoordinar.clienteNombre} coordinada con éxito.`);
      setCitaParaCoordinar(null);
      await cargarCitas();
    } catch (err) {
      console.error("Error al coordinar cita:", err);
      mostrarFeedback("No se pudo coordinar la reunión.");
    } finally {
      setGuardando(false);
    }
  };

  // Marcar como Realizada
  const marcarRealizada = async (cita: CitaAdminDto) => {
    try {
      await servicioCitas.marcarRealizada(cita.id);
      mostrarFeedback(`Reunión con ${cita.clienteNombre} marcada como Realizada.`);
      await cargarCitas();
    } catch (err) {
      console.error("Error al marcar como realizada:", err);
      mostrarFeedback("No se pudo marcar la reunión como realizada.");
    }
  };

  // Confirmar Cancelación
  const confirmarCancelacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaParaCancelar) return;

    try {
      setGuardando(true);
      await servicioCitas.cancelar(citaParaCancelar.id, motivoCancelacion.trim());
      mostrarFeedback(`Reunión con ${citaParaCancelar.clienteNombre} cancelada.`);
      setCitaParaCancelar(null);
      setMotivoCancelacion("");
      await cargarCitas();
    } catch (err) {
      console.error("Error al cancelar cita:", err);
      mostrarFeedback("No se pudo cancelar la reunión.");
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Crear Cita con carga previa de opciones vinculables
  const abrirModalCrearCita = async () => {
    setModalCrearAbierto(true);
    setOrigenSeleccionado("prospecto");
    try {
      if (presupuestosDisponibles.length === 0) {
        const resPres = await servicioPresupuestos.listar({ tamanioPagina: 50 });
        setPresupuestosDisponibles(resPres.elementos);
      }
      if (proyectosDisponibles.length === 0) {
        const resProy = await servicioProyectos.obtenerTodos();
        setProyectosDisponibles(resProy);
      }
    } catch (e) {
      console.error("Error al cargar presupuestos o proyectos vinculables:", e);
    }
  };

  // Guardar Cita Manual
  const guardarCitaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCrear.nombreCompleto.trim() || !formCrear.email.trim() || !formCrear.telefonoWhatsApp.trim()) {
      mostrarFeedback("Nombre, email y teléfono son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      await servicioCitas.crearManual({
        clienteId: formCrear.clienteId || null,
        nombreCompleto: formCrear.nombreCompleto.trim(),
        email: formCrear.email.trim(),
        telefonoWhatsApp: formCrear.telefonoWhatsApp.trim(),
        empresa: formCrear.empresa?.trim() || null,
        rubro: formCrear.rubro?.trim() || null,
        modalidad: formCrear.modalidad,
        fechaHoraCoordinada: formCrear.fechaHoraCoordinada
          ? new Date(formCrear.fechaHoraCoordinada).toISOString()
          : null,
        linkMeet: formCrear.linkMeet?.trim() || null,
        presupuestoId: formCrear.presupuestoId || null,
        proyectoId: formCrear.proyectoId || null,
        notas: formCrear.notas?.trim() || null,
      });

      mostrarFeedback("Cita agendada manualmente con éxito.");
      setModalCrearAbierto(false);
      setFormCrear({
        nombreCompleto: "",
        email: "",
        telefonoWhatsApp: "",
        empresa: "",
        rubro: "",
        modalidad: 3,
        fechaHoraCoordinada: "",
        linkMeet: "",
        notas: "",
      });
      await cargarCitas();
    } catch (err) {
      console.error("Error al agendar cita manual:", err);
      mostrarFeedback("No se pudo agendar la cita manual.");
    } finally {
      setGuardando(false);
    }
  };

  // Manejo de Modal de Informe de Cita
  const abrirModalInforme = (cita: CitaAdminDto) => {
    setCitaParaInforme(cita);
    setFormInforme({
      informeReunion: cita.informeReunion || "",
      acuerdosCompromisos: cita.acuerdosCompromisos || "",
      resultadoComercial:
        cita.resultadoComercial ||
        (cita.presupuestoId ? "Presupuesto Aprobado" : "Presupuesto Nuevo Necesario"),
    });
  };

  const guardarSoloInforme = async () => {
    if (!citaParaInforme) return;
    if (!formInforme.informeReunion.trim()) {
      mostrarFeedback("Por favor completá los apuntes o informe de la reunión.");
      return;
    }
    try {
      setGuardandoInforme(true);
      await servicioCitas.registrarInforme(citaParaInforme.id, formInforme);
      mostrarFeedback("Informe y acuerdos de la reunión guardados con éxito.");
      setCitaParaInforme(null);
      await cargarCitas();
    } catch (err) {
      console.error("Error al registrar informe:", err);
      mostrarFeedback("No se pudo guardar el informe.");
    } finally {
      setGuardandoInforme(false);
    }
  };

  const aprobarYCrearProyecto = async () => {
    if (!citaParaInforme) return;
    try {
      setGuardandoInforme(true);
      await servicioCitas.registrarInforme(citaParaInforme.id, {
        ...formInforme,
        resultadoComercial: "Presupuesto Aprobado",
      });
      await servicioCitas.convertirAProyecto(citaParaInforme.id, {
        tituloProyecto: `Proyecto ${citaParaInforme.clienteNombre}`,
      });
      mostrarFeedback("¡Presupuesto Aprobado y Proyecto creado exitosamente!");
      setCitaParaInforme(null);
      router.push("/proyectos");
    } catch (err) {
      console.error("Error al convertir a proyecto:", err);
      mostrarFeedback("No se pudo crear el proyecto desde la cita.");
    } finally {
      setGuardandoInforme(false);
    }
  };

  const reajustarPresupuestoDesdeCita = async () => {
    if (!citaParaInforme || !citaParaInforme.presupuestoId) return;
    try {
      setGuardandoInforme(true);
      await servicioCitas.registrarInforme(citaParaInforme.id, {
        ...formInforme,
        resultadoComercial: "Reajustar Presupuesto",
      });
      setCitaParaInforme(null);
      router.push(`/presupuestos?reajustar=${citaParaInforme.presupuestoId}&citaId=${citaParaInforme.id}`);
    } catch (err) {
      console.error("Error al guardar informe previo al reajuste:", err);
      mostrarFeedback("No se pudo procesar la solicitud.");
    } finally {
      setGuardandoInforme(false);
    }
  };

  const generarPresupuestoDesdeCita = async () => {
    if (!citaParaInforme) return;
    try {
      setGuardandoInforme(true);
      await servicioCitas.registrarInforme(citaParaInforme.id, {
        ...formInforme,
        resultadoComercial: "Presupuesto Nuevo Necesario",
      });
      const citaTemp = citaParaInforme;
      setCitaParaInforme(null);
      const params = new URLSearchParams({
        nuevaCitaId: citaTemp.id,
        clienteNombre: citaTemp.clienteNombre,
        clienteEmail: citaTemp.clienteEmail,
        clienteTelefono: citaTemp.clienteTelefonoWhatsApp,
        empresa: citaTemp.clienteEmpresa || "",
        necesidad: formInforme.informeReunion || "",
      });
      router.push(`/presupuestos?${params.toString()}`);
    } catch (err) {
      console.error("Error al guardar informe previo:", err);
      mostrarFeedback("No se pudo procesar la solicitud.");
    } finally {
      setGuardandoInforme(false);
    }
  };

  // Abrir WhatsApp con cliente
  const contactarWhatsApp = (cita: CitaAdminDto) => {
    if (cita.enlaceWhatsAppRecordatorio) {
      window.open(cita.enlaceWhatsAppRecordatorio, "_blank", "noopener,noreferrer");
      return;
    }
    const telLimpio = cita.clienteTelefonoWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hola ${cita.clienteNombre}, te contacto de parte de Pablo Bejas sobre tu solicitud de reunión.`
    );
    window.open(`https://wa.me/${telLimpio}?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Notificación Feedback flotante */}
      {mensajeFeedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-sky-950/95 border border-sky-500/40 text-sky-200 text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{mensajeFeedback}</span>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-sky-400" />
            Agenda de Turnos & Solicitudes de Reunión
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Gestión de citas solicitadas por la web, coordinación de salas Google Meet y seguimiento comercial.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={abrirModalCrearCita}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita Manual</span>
          </button>

          <button
            type="button"
            onClick={() => cargarCitas()}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-sky-400" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 4 Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Total Solicitudes</span>
            <CalendarDays className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">{estadisticas.total}</div>
          <div className="mt-1 text-[11px] text-neutral-500">Histórico de reuniones</div>
        </div>

        {/* KPI 2: Pendientes */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Pendientes de Coordinar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">
            {estadisticas.pendientes}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Requieren fijar fecha/hora</div>
        </div>

        {/* KPI 3: Coordinadas */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Próximas Coordinadas</span>
            <Video className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-400 font-mono">
            {estadisticas.coordinadas}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Con enlace y fecha asignada</div>
        </div>

        {/* KPI 4: Realizadas */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Reuniones Cumplidas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {estadisticas.realizadas}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Asesoramiento realizado</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Pestañas de Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0D121F] border border-white/10">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, empresa, email o código #PB-..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50 transition-colors font-sans"
          />
        </div>

        {/* Selector de Estados */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFiltroEstado(undefined)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === undefined
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todas ({citas.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(1)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 1
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(2)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 2
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Coordinadas
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(3)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 3
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Realizadas
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(4)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 4
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* Tabla de Citas (Estilo Cebra y Alto Contraste) */}
      <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden shadow-xl">
        {cargando ? (
          <div className="p-12 text-center text-neutral-400 text-sm flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs">Cargando agenda de reuniones...</span>
          </div>
        ) : errorCarga ? (
          <div className="p-12 text-center text-rose-400 text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>{errorCarga}</span>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            No se encontraron reuniones registradas con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/10 text-neutral-300 font-mono">
                <tr>
                  <th className="py-3 px-4">Fecha & Horario</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Modalidad</th>
                  <th className="py-3 px-4">Origen / Presupuesto</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {citasFiltradas.map((c) => {
                  const estadoInfo = ESTADOS_CITAS[c.estado] || {
                    etiqueta: c.estadoDescripcion || "Desconocido",
                    badgeClase: "bg-neutral-800 text-neutral-400 border-neutral-700",
                  };

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-white/[0.08] odd:bg-white/[0.015] even:bg-white/[0.045] hover:bg-sky-500/[0.08] transition-colors duration-150"
                    >
                      {/* Fecha & Horario */}
                      <td className="py-4 px-4 align-middle">
                        {c.fechaCoordinada ? (
                          <div>
                            <div className="font-mono font-bold text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-sky-400" />
                              <span>
                                {new Date(c.fechaCoordinada).toLocaleDateString("es-AR", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-sky-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-sky-400" />
                              <span>
                                {new Date(c.fechaCoordinada).toLocaleTimeString("es-AR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                hs
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Pendiente de fecha
                          </span>
                        )}
                      </td>

                      {/* Cliente / Contacto */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-semibold text-white">{c.clienteNombre}</div>
                        {c.clienteEmpresa && (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-neutral-500" />
                            <span>{c.clienteEmpresa}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[200px]">
                          {c.clienteEmail}
                        </div>
                      </td>

                      {/* Modalidad */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          {c.modalidad === 3 ? (
                            <Video className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="font-medium text-neutral-200">
                            {c.modalidadDescripcion || (c.modalidad === 3 ? "Google Meet" : "Presencial")}
                          </span>
                        </div>

                        {c.linkReunionMeet && (
                          <a
                            href={c.linkReunionMeet}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 hover:underline"
                          >
                            <span>Abrir sala Meet</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      {/* Origen / Presupuesto / Proyecto */}
                      <td className="py-4 px-4 align-middle">
                        <div className="text-neutral-300 font-medium">
                          {c.origenDescripcion || "Contacto Web"}
                        </div>
                        {c.presupuestoCodigo && (
                          <Link
                            href="/presupuestos"
                            className="text-[11px] text-sky-400 hover:text-sky-300 font-mono mt-0.5 flex items-center gap-1 hover:underline"
                            title="Ver presupuesto en el sistema"
                          >
                            <FileSpreadsheet className="w-3 h-3 shrink-0" />
                            <span>#{c.presupuestoCodigo}</span>
                          </Link>
                        )}
                        {c.proyectoId && (
                          <Link
                            href="/proyectos"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono mt-0.5 flex items-center gap-1 hover:underline"
                            title="Ver proyecto en el sistema"
                          >
                            <FolderGit2 className="w-3 h-3 shrink-0" />
                            <span>Proyecto Vinculado</span>
                          </Link>
                        )}
                        {c.informeReunion && (
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5 shrink-0" />
                            <span>Informe: {c.resultadoComercial || "Registrado"}</span>
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4 text-center align-middle">
                        <span
                          className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold border ${estadoInfo.badgeClase}`}
                        >
                          {estadoInfo.etiqueta}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          {/* Registrar / Ver Informe */}
                          <button
                            type="button"
                            onClick={() => abrirModalInforme(c)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              c.informeReunion
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-neutral-400 hover:text-sky-300 hover:bg-white/10"
                            }`}
                            title={c.informeReunion ? "Ver / Editar informe de reunión" : "Registrar informe de reunión"}
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Coordinar / Reprogramar */}
                          {c.estado !== 3 && c.estado !== 4 && (
                            <button
                              type="button"
                              onClick={() => abrirModalCoordinar(c)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                              title={c.fechaCoordinada ? "Reprogramar cita" : "Coordinar fecha y Meet"}
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}

                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => contactarWhatsApp(c)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Contactar al cliente por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Marcar Realizada */}
                          {c.estado === 2 && (
                            <button
                              type="button"
                              onClick={() => marcarRealizada(c)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Marcar reunión como Realizada"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Cancelar */}
                          {c.estado !== 3 && c.estado !== 4 && (
                            <button
                              type="button"
                              onClick={() => {
                                setCitaParaCancelar(c);
                                setMotivoCancelacion("");
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Cancelar reunión"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: COORDINAR / REPROGRAMAR CITA */}
      {/* ========================================================================= */}
      {citaParaCoordinar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Coordinar Cita con {citaParaCoordinar.clienteNombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCitaParaCoordinar(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarCoordinacion} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-mono">
                  Fecha y Hora de la Reunión *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formCoordinar.fechaHoraCoordinada}
                  onChange={(e) =>
                    setFormCoordinar({ ...formCoordinar, fechaHoraCoordinada: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-400 font-mono">Enlace Google Meet</label>
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Crear Meet nuevo</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={formCoordinar.linkMeet || ""}
                  onChange={(e) =>
                    setFormCoordinar({ ...formCoordinar, linkMeet: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono">Notas o Temas a Tratar</label>
                <textarea
                  rows={3}
                  placeholder="Temario de la reunión, requerimientos previos..."
                  value={formCoordinar.notasAdicionales || ""}
                  onChange={(e) =>
                    setFormCoordinar({ ...formCoordinar, notasAdicionales: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCitaParaCoordinar(null)}
                  className="px-3 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold flex items-center gap-2"
                >
                  {guardando ? "Guardando..." : "Confirmar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AGENDAR CITA MANUAL */}
      {/* ========================================================================= */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Agendar Nueva Cita Manual</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalCrearAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarCitaManual} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Origen Inteligente del Cliente */}
              <div>
                <label className="block text-neutral-400 mb-1.5 font-medium">Origen del Cliente / Vínculo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrigenSeleccionado("prospecto");
                      setFormCrear((prev) => ({
                        ...prev,
                        clienteId: null,
                        presupuestoId: null,
                        proyectoId: null,
                      }));
                    }}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      origenSeleccionado === "prospecto"
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-200"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Prospecto Nuevo
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrigenSeleccionado("presupuesto")}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      origenSeleccionado === "presupuesto"
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-200"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Desde Presupuesto
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrigenSeleccionado("proyecto")}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      origenSeleccionado === "proyecto"
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-200"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Desde Proyecto
                  </button>
                </div>
              </div>

              {origenSeleccionado === "presupuesto" && (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1.5">
                  <label className="block text-sky-300 font-medium">Vincular con Presupuesto Emitido</label>
                  <select
                    value={formCrear.presupuestoId || ""}
                    onChange={(e) => {
                      const pres = presupuestosDisponibles.find((p) => p.id === e.target.value);
                      if (pres) {
                        setFormCrear((prev) => ({
                          ...prev,
                          presupuestoId: pres.id,
                          proyectoId: null,
                          nombreCompleto: pres.clienteNombre,
                          email: pres.clienteEmail,
                          telefonoWhatsApp: pres.clienteTelefono || prev.telefonoWhatsApp,
                          empresa: pres.clienteEmpresa || prev.empresa,
                          notas: prev.notas || `Reunión para revisión del presupuesto #${pres.codigo} (${pres.servicioPrincipal}).`,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Seleccionar Presupuesto --</option>
                    {presupuestosDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.codigo} - {p.clienteNombre} ({p.servicioPrincipal})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-sky-400/80">
                    Los datos del cliente se completan de forma automática a partir del presupuesto seleccionado.
                  </p>
                </div>
              )}

              {origenSeleccionado === "proyecto" && (
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
                  <label className="block text-indigo-300 font-medium">Vincular con Proyecto Activo</label>
                  <select
                    value={formCrear.proyectoId || ""}
                    onChange={(e) => {
                      const proy = proyectosDisponibles.find((p) => p.id === e.target.value);
                      if (proy) {
                        setFormCrear((prev) => ({
                          ...prev,
                          proyectoId: proy.id,
                          presupuestoId: null,
                          nombreCompleto: proy.clienteNombre,
                          email: proy.clienteEmail,
                          empresa: proy.clienteEmpresa || prev.empresa,
                          notas: prev.notas || `Reunión de avance para el proyecto ${proy.codigo} - ${proy.titulo}.`,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Seleccionar Proyecto --</option>
                    {proyectosDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.titulo} ({p.clienteNombre})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-indigo-400/80">
                    Los datos del cliente se completan de forma automática a partir del proyecto seleccionado.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={formCrear.nombreCompleto}
                    onChange={(e) => setFormCrear({ ...formCrear, nombreCompleto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="juan@empresa.com"
                    value={formCrear.email}
                    onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+54 9 381 ..."
                    value={formCrear.telefonoWhatsApp}
                    onChange={(e) =>
                      setFormCrear({ ...formCrear, telefonoWhatsApp: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Empresa / Negocio</label>
                  <input
                    type="text"
                    placeholder="Nombre de la empresa"
                    value={formCrear.empresa || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, empresa: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Modalidad de Reunión</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 3, label: "Google Meet", icon: Video },
                    { id: 1, label: "Tucumán Centro", icon: MapPin },
                    { id: 2, label: "Yerba Buena", icon: MapPin },
                  ].map((m) => {
                    const Icon = m.icon;
                    const sel = formCrear.modalidad === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormCrear({ ...formCrear, modalidad: m.id })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-center ${
                          sel
                            ? "bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">
                    Fecha y Hora (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formCrear.fechaHoraCoordinada || ""}
                    onChange={(e) =>
                      setFormCrear({ ...formCrear, fechaHoraCoordinada: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-mono">Enlace Meet</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={formCrear.linkMeet || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, linkMeet: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono">Notas de la Cita</label>
                <textarea
                  rows={2}
                  placeholder="Detalles acordados, objetivos del cliente..."
                  value={formCrear.notas || ""}
                  onChange={(e) => setFormCrear({ ...formCrear, notas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-3 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold flex items-center gap-2"
                >
                  {guardando ? "Agendando..." : "Guardar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CANCELAR CITA */}
      {/* ========================================================================= */}
      {citaParaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Cancelar Reunión</h3>
              </div>
              <button
                type="button"
                onClick={() => setCitaParaCancelar(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={confirmarCancelacion} className="mt-4 space-y-4 text-xs">
              <p className="text-neutral-300">
                ¿Estás seguro de cancelar la reunión con{" "}
                <span className="font-bold text-white">{citaParaCancelar.clienteNombre}</span>?
              </p>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono">Motivo de Cancelación</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej. El cliente reprogramó por mensaje, superposición de agenda..."
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCitaParaCancelar(null)}
                  className="px-3 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2"
                >
                  {guardando ? "Cancelando..." : "Confirmar Cancelación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 4: INFORME DE REUNIÓN Y ACCIONES COMERCIALES */}
      {/* ========================================================================= */}
      {citaParaInforme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Informe de Cita con {citaParaInforme.clienteNombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCitaParaInforme(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Resumen del Vínculo */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-neutral-300">
                <div>
                  <div className="font-semibold text-white">{citaParaInforme.clienteNombre}</div>
                  {citaParaInforme.clienteEmpresa && (
                    <div className="text-[11px] text-neutral-400">{citaParaInforme.clienteEmpresa}</div>
                  )}
                  <div className="text-[11px] text-neutral-500 font-mono">{citaParaInforme.clienteEmail}</div>
                </div>
                <div>
                  {citaParaInforme.presupuestoCodigo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      <FileSpreadsheet className="w-3 h-3" />
                      <span>Presupuesto #{citaParaInforme.presupuestoCodigo}</span>
                    </span>
                  ) : citaParaInforme.proyectoId ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      <FolderGit2 className="w-3 h-3" />
                      <span>Proyecto Activo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <span>Contacto / Lead Inicial</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Notas de la Conversación / Requerimientos Técnicos *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalles hablados en la reunión, necesidades de software, módulos solicitados..."
                  value={formInforme.informeReunion}
                  onChange={(e) => setFormInforme({ ...formInforme, informeReunion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Acuerdos y Compromisos Pactados
                </label>
                <textarea
                  rows={2}
                  placeholder="Próximos pasos a seguir, material o credenciales que enviará el cliente..."
                  value={formInforme.acuerdosCompromisos || ""}
                  onChange={(e) => setFormInforme({ ...formInforme, acuerdosCompromisos: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Resultado Comercial
                </label>
                <select
                  value={formInforme.resultadoComercial || "Presupuesto Aprobado"}
                  onChange={(e) => setFormInforme({ ...formInforme, resultadoComercial: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Presupuesto Aprobado">Presupuesto Aprobado (Listo para Crear Proyecto)</option>
                  <option value="Reajuste de Presupuesto Solicitado">Reajuste de Presupuesto Solicitado por el Cliente</option>
                  <option value="Presupuesto Nuevo Necesario">Generar Nuevo Presupuesto tras la reunión</option>
                  <option value="Reunión de Avance Proyecto">Reunión de Avance / Seguimiento de Proyecto</option>
                  <option value="Sin Acuerdo">Sin Acuerdo / En Evaluación</option>
                </select>
              </div>
            </div>

            {/* Acciones 1-Click del Informe */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={guardarSoloInforme}
                disabled={guardandoInforme}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{guardandoInforme ? "Guardando..." : "Guardar Informe"}</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {citaParaInforme.presupuestoId ? (
                  <>
                    <button
                      type="button"
                      onClick={reajustarPresupuestoDesdeCita}
                      disabled={guardandoInforme}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Reajustar Presupuesto</span>
                    </button>
                    <button
                      type="button"
                      onClick={aprobarYCrearProyecto}
                      disabled={guardandoInforme}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Aprobar y Crear Proyecto</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={generarPresupuestoDesdeCita}
                    disabled={guardandoInforme}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Generar Presupuesto</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
