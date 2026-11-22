"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileSpreadsheet,
  Search,
  Download,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  X,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Tag,
  Calendar,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  servicioPresupuestos,
  PresupuestoListadoAdminDto,
  PresupuestoDetalleAdminDto,
  EstadisticasPresupuestosAdminDto,
  FiltrosPresupuestosDto,
} from "@/services/presupuestos.service";

// Mapeo amigable de Estados de Presupuesto
const ESTADOS_MAPA: Record<number, { etiqueta: string; color: string; badgeClase: string }> = {
  1: {
    etiqueta: "Borrador",
    color: "neutral",
    badgeClase: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  2: {
    etiqueta: "Enviado / Pendiente",
    color: "amber",
    badgeClase: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  3: {
    etiqueta: "Señado (50%)",
    color: "sky",
    badgeClase: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  },
  4: {
    etiqueta: "Aprobado",
    color: "emerald",
    badgeClase: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  5: {
    etiqueta: "Rechazado",
    color: "rose",
    badgeClase: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
  6: {
    etiqueta: "Vencido",
    color: "neutral",
    badgeClase: "bg-neutral-800 text-neutral-400 border-neutral-700",
  },
};

export default function PresupuestosPage() {
  // Estado de listado y métricas
  const [presupuestos, setPresupuestos] = useState<PresupuestoListadoAdminDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPresupuestosAdminDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<number | undefined>(undefined);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  const tamanioPagina = 12;

  // Modal de Detalle
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<PresupuestoDetalleAdminDto | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);
  const [descargandoPdfId, setDescargandoPdfId] = useState<string | null>(null);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  // Carga de presupuestos
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const filtros: FiltrosPresupuestosDto = {
        terminoBusqueda: busqueda.trim() || undefined,
        estado: filtroEstado,
        pagina: paginaActual,
        tamanioPagina,
      };

      const [resultadoPaginado, stats] = await Promise.all([
        servicioPresupuestos.listar(filtros),
        servicioPresupuestos.obtenerEstadisticas(),
      ]);

      setPresupuestos(resultadoPaginado.elementos);
      setTotalRegistros(resultadoPaginado.totalRegistros);
      setEstadisticas(stats);
    } catch (err: unknown) {
      console.error("Error al cargar presupuestos:", err);
      setErrorCarga("No se pudieron cargar los presupuestos. Verificá la conexión con la API.");
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroEstado, paginaActual]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejo de Modal de Detalle
  const abrirDetalle = async (id: string) => {
    try {
      setCargandoDetalle(true);
      const detalle = await servicioPresupuestos.obtenerPorId(id);
      setPresupuestoSeleccionado(detalle);
    } catch (err) {
      console.error("Error al obtener detalle del presupuesto:", err);
      mostrarFeedback("Error al abrir el detalle del presupuesto.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Descarga de PDF
  const descargarPdf = async (id: string, codigo: string) => {
    try {
      setDescargandoPdfId(id);
      await servicioPresupuestos.descargarPdf(id, codigo);
      mostrarFeedback(`Presupuesto ${codigo} descargado con éxito.`);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      mostrarFeedback("No se pudo generar o descargar el PDF.");
    } finally {
      setDescargandoPdfId(null);
    }
  };

  // Apertura de WhatsApp
  const abrirWhatsApp = async (id: string) => {
    try {
      const urlWa = await servicioPresupuestos.obtenerEnlaceWhatsApp(id);
      if (urlWa) {
        window.open(urlWa, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Error al obtener enlace de WhatsApp:", err);
      mostrarFeedback("No se pudo generar el enlace de WhatsApp.");
    }
  };

  // Cambio de estado (Aprobar o Rechazar)
  const cambiarEstado = async (id: string, nuevoEstado: number) => {
    try {
      await servicioPresupuestos.actualizarEstado(id, nuevoEstado);
      mostrarFeedback("Estado del presupuesto actualizado correctamente.");

      // Si el modal está abierto, refrescarlo
      if (presupuestoSeleccionado && presupuestoSeleccionado.id === id) {
        setPresupuestoSeleccionado({
          ...presupuestoSeleccionado,
          estado: nuevoEstado,
        });
      }

      await cargarDatos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      mostrarFeedback("No se pudo actualizar el estado del presupuesto.");
    }
  };

  const mostrarFeedback = (mensaje: string) => {
    setMensajeFeedback(mensaje);
    setTimeout(() => setMensajeFeedback(null), 3500);
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
            <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            Bandeja de Presupuestos & Cotizaciones
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Auditoría, seguimiento comercial y aprobación de propuestas emitidas por el cotizador online.
          </p>
        </div>

        <button
          type="button"
          onClick={() => cargarDatos()}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-sky-400" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* 4 Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Cotizaciones */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Total Emitidos</span>
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {estadisticas ? estadisticas.totalPresupuestos : "—"}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Histórico de propuestas</div>
        </div>

        {/* KPI 2: Monto Total Cotizado */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Volumen Cotizado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono truncate">
            ${estadisticas ? estadisticas.montoTotalCotizado.toLocaleString("es-AR") : "—"}{" "}
            <span className="text-xs font-normal text-neutral-400">ARS</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Monto bruto presupuestado</div>
        </div>

        {/* KPI 3: Aprobadas / Conversión */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Aprobadas / Éxito</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono flex items-baseline gap-2">
            <span>{estadisticas ? estadisticas.presupuestosAprobados : "—"}</span>
            <span className="text-xs text-emerald-500 font-semibold">
              ({estadisticas ? estadisticas.tasaConversionAprobados : 0}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Tasa de conversión comercial</div>
        </div>

        {/* KPI 4: Pendientes / Vigentes */}
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Pendientes de Cierre</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">
            {estadisticas ? estadisticas.presupuestosPendientes : "—"}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {estadisticas ? `${estadisticas.presupuestosVencidos} vencidos` : "Propuestas en curso"}
          </div>
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
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar por código (#PB-...), cliente, email o empresa..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50 transition-colors font-sans"
          />
        </div>

        {/* Selector de Estados */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setFiltroEstado(undefined);
              setPaginaActual(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === undefined
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltroEstado(2);
              setPaginaActual(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 2
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltroEstado(4);
              setPaginaActual(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 4
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Aprobados
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltroEstado(5);
              setPaginaActual(1);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 5
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Rechazados
          </button>
        </div>
      </div>

      {/* Tabla de Presupuestos (Estilo Cebra y Alto Contraste) */}
      <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden shadow-xl">
        {cargando ? (
          <div className="p-12 text-center text-neutral-400 text-sm flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs">Cargando propuestas comerciales...</span>
          </div>
        ) : errorCarga ? (
          <div className="p-12 text-center text-rose-400 text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>{errorCarga}</span>
          </div>
        ) : presupuestos.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            No se encontraron presupuestos con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/10 text-neutral-300 font-mono">
                <tr>
                  <th className="py-3 px-4">Código & Fecha</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Servicio Cotizado</th>
                  <th className="py-3 px-4">Total ARS</th>
                  <th className="py-3 px-4 text-center">Vigencia</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {presupuestos.map((p) => {
                  const estadoInfo = ESTADOS_MAPA[p.estado] || {
                    etiqueta: "Desconocido",
                    badgeClase: "bg-neutral-800 text-neutral-400 border-neutral-700",
                  };

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-white/[0.08] odd:bg-white/[0.015] even:bg-white/[0.045] hover:bg-sky-500/[0.08] transition-colors duration-150"
                    >
                      {/* Código & Fecha */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-mono font-bold text-sky-400">#{p.codigo}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          <span>
                            {new Date(p.fechaCreacion).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Cliente / Contacto */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-semibold text-white">{p.clienteNombre}</div>
                        {p.clienteEmpresa && (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Building className="w-3 h-3 text-neutral-500" />
                            <span>{p.clienteEmpresa}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[200px]">
                          {p.clienteEmail}
                        </div>
                      </td>

                      {/* Servicio Cotizado */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-medium text-neutral-200">{p.servicioPrincipal}</div>
                        {p.promocionAplicada && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            <Tag className="w-2.5 h-2.5" />
                            {p.promocionAplicada}
                          </span>
                        )}
                      </td>

                      {/* Total Presupuestado */}
                      <td className="py-4 px-4 align-middle font-mono">
                        <div className="font-bold text-white text-sm">
                          ${p.totalPresupuestado.toLocaleString("es-AR")}
                        </div>
                        {p.montoDescuento > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            Desc. -${p.montoDescuento.toLocaleString("es-AR")}
                          </div>
                        )}
                        <div className="text-[10px] text-neutral-400">
                          Seña: ${p.montoSenaSugerida.toLocaleString("es-AR")}
                        </div>
                      </td>

                      {/* Vigencia */}
                      <td className="py-4 px-4 text-center align-middle font-mono text-xs">
                        {p.estaVencido ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]">
                            Vencido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-white/10 text-[10px]">
                            <Clock className="w-2.5 h-2.5 text-sky-400" />
                            {p.diasRestantes === 1 ? "1 día rest." : `${p.diasRestantes} días rest.`}
                          </span>
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
                          {/* Ver Ficha Detalle */}
                          <button
                            type="button"
                            onClick={() => abrirDetalle(p.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Descargar PDF */}
                          <button
                            type="button"
                            onClick={() => descargarPdf(p.id, p.codigo)}
                            disabled={descargandoPdfId === p.id}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Descargar presupuesto PDF (QuestPDF)"
                          >
                            <Download
                              className={`w-4 h-4 ${
                                descargandoPdfId === p.id ? "animate-bounce text-sky-400" : ""
                              }`}
                            />
                          </button>

                          {/* WhatsApp Directo */}
                          <button
                            type="button"
                            onClick={() => abrirWhatsApp(p.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Contactar al cliente por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalRegistros > tamanioPagina && (
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>
              Mostrando {presupuestos.length} de {totalRegistros} propuestas
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={paginaActual <= 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span>Página {paginaActual}</span>
              <button
                type="button"
                disabled={paginaActual * tamanioPagina >= totalRegistros}
                onClick={() => setPaginaActual((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: FICHA DE DETALLE INMUTABLE DEL PRESUPUESTO */}
      {/* ========================================================================= */}
      {presupuestoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">
                      #{presupuestoSeleccionado.codigo}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        (ESTADOS_MAPA[presupuestoSeleccionado.estado] || {}).badgeClase
                      }`}
                    >
                      {(ESTADOS_MAPA[presupuestoSeleccionado.estado] || {}).etiqueta}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Snapshot inmutable emitido el{" "}
                    {new Date(presupuestoSeleccionado.fechaCreacion).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPresupuestoSeleccionado(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modal Scrollable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
              {/* Bloque: Datos del Cliente */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-3">
                  Datos de Contacto del Cliente
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="font-semibold text-white">
                      {presupuestoSeleccionado.cliente.nombreCompleto}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{presupuestoSeleccionado.cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{presupuestoSeleccionado.cliente.telefonoWhatsApp}</span>
                  </div>
                  {presupuestoSeleccionado.cliente.empresa && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{presupuestoSeleccionado.cliente.empresa}</span>
                    </div>
                  )}
                </div>

                {presupuestoSeleccionado.descripcionNecesidad && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-neutral-400">
                    <span className="font-semibold text-neutral-300">Necesidad declarada:</span>{" "}
                    {presupuestoSeleccionado.descripcionNecesidad}
                  </div>
                )}
              </div>

              {/* Bloque: Desglose de Ítems */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-2">
                  Desglose de Ítems Contratados
                </span>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-neutral-400 font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Ítem / Concepto</th>
                        <th className="py-2.5 px-3 text-center">Cant.</th>
                        <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {presupuestoSeleccionado.items.map((it) => (
                        <tr key={it.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{it.concepto}</div>
                            {it.detalle && (
                              <div className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                                {it.detalle}
                              </div>
                            )}
                            {it.diasAdicionales > 0 && (
                              <span className="text-[10px] text-sky-400 font-mono">
                                +{it.diasAdicionales} días plazo
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-neutral-300">
                            {it.cantidad}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                            ${it.precioUnitario.toLocaleString("es-AR")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                            ${it.subtotal.toLocaleString("es-AR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-2 font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal Servicios & Secciones:</span>
                  <span>
                    $
                    {(
                      presupuestoSeleccionado.subtotalBase +
                      presupuestoSeleccionado.subtotalSeccionesExtra +
                      presupuestoSeleccionado.subtotalAdicionales
                    ).toLocaleString("es-AR")}{" "}
                    ARS
                  </span>
                </div>

                {presupuestoSeleccionado.montoDescuento > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Descuento Promocional ({presupuestoSeleccionado.promocionAplicada || "Cupón"}):
                    </span>
                    <span>-${presupuestoSeleccionado.montoDescuento.toLocaleString("es-AR")} ARS</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-sky-500/20">
                  <span>Total Final Presupuestado:</span>
                  <span className="text-sky-400 text-base">
                    ${presupuestoSeleccionado.totalPresupuestado.toLocaleString("es-AR")} ARS
                  </span>
                </div>

                <div className="flex justify-between text-xs text-neutral-300 pt-1">
                  <span className="text-neutral-400">Seña sugerida para inicio (50%):</span>
                  <span className="font-semibold text-emerald-400">
                    ${presupuestoSeleccionado.montoSenaSugerida.toLocaleString("es-AR")} ARS
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
                  <span>Plazo estimado de entrega:</span>
                  <span className="text-white">{presupuestoSeleccionado.tiempoEntregaDias} días hábiles</span>
                </div>
              </div>
            </div>

            {/* Acciones en el Pie del Modal */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Botón Descargar PDF */}
                <button
                  type="button"
                  onClick={() =>
                    descargarPdf(presupuestoSeleccionado.id, presupuestoSeleccionado.codigo)
                  }
                  disabled={descargandoPdfId === presupuestoSeleccionado.id}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Descargar PDF</span>
                </button>

                {/* Botón WhatsApp */}
                <button
                  type="button"
                  onClick={() => abrirWhatsApp(presupuestoSeleccionado.id)}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>

              {/* Botón para cambiar estado */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {presupuestoSeleccionado.estado !== 4 && (
                  <button
                    type="button"
                    onClick={() => cambiarEstado(presupuestoSeleccionado.id, 4)}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar Presupuesto</span>
                  </button>
                )}

                {presupuestoSeleccionado.estado !== 5 && presupuestoSeleccionado.estado !== 4 && (
                  <button
                    type="button"
                    onClick={() => cambiarEstado(presupuestoSeleccionado.id, 5)}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar</span>
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
