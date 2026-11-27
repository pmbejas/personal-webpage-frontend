"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  FileSpreadsheet,
  FolderGit2,
  CalendarDays,
  Tag,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Video,
  Phone,
  Building,
  RefreshCw,
  Plus,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Package,
} from "lucide-react";
import {
  servicioDashboard,
  DashboardMetricasDto,
} from "@/services/dashboard.service";

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState<DashboardMetricasDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Saludo contextual según la hora
  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Cargar métricas en tiempo real
  const cargarMetricas = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const data = await servicioDashboard.obtenerMetricas();
      setMetricas(data);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al conectar con el servidor.";
      setErrorCarga(errorMsg);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  // Formateadores
  const formatearMoneda = (monto: number, moneda: string = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const formatearFechaHora = (fechaStr: string) => {
    const d = new Date(fechaStr);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearFechaRelativa = (fechaStr: string) => {
    const ahora = new Date();
    const d = new Date(fechaStr);
    const diffMs = ahora.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 2) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return "Ayer";
    return `Hace ${diffDias} días`;
  };

  return (
    <div className="space-y-8">
      {/* 1. Cabecera Ejecutiva */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CENTRO DE CONTROL EJECUTIVO</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {obtenerSaludo()}, {usuario?.nombreCompleto?.split(" ")[0] || "Pablo"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Visión global en vivo del pipeline comercial, liquidez financiera, agenda y operaciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarMetricas()}
            disabled={cargando}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-mono"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin text-sky-400" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <Link
            href="/presupuestos"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-950 bg-sky-500 hover:bg-sky-400 transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cotización</span>
          </Link>
        </div>
      </div>

      {/* Banner de Error si falló la carga */}
      {errorCarga && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorCarga}</span>
          </div>
          <button
            onClick={() => cargarMetricas()}
            className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 2. Tarjetas KPI de Alto Impacto (4 Métricas Principales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cobranzas y Liquidez */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/40 border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Cobranzas Realizadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {formatearMoneda(metricas?.montoTotalCobrado ?? 0)}
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>{metricas?.porcentajeCobradoGlobal ?? 0}% de cartera</span>
              <span className="text-emerald-400/90">
                Cartera: {formatearMoneda(metricas?.montoTotalCartera ?? 0)}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(metricas?.porcentajeCobradoGlobal ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Cobro Pendiente Total en Proyectos */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/40 border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Cobro Pendiente Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">
              {formatearMoneda(metricas?.saldoTotalPendiente ?? 0)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3 flex items-center justify-between font-mono">
            <span>
              {Math.max(0, 100 - (metricas?.porcentajeCobradoGlobal ?? 0)).toFixed(1)}% por cobrar
            </span>
            <span className="text-sky-300">
              Total: {formatearMoneda(metricas?.montoTotalCartera ?? 0)}
            </span>
          </p>
        </div>

        {/* KPI 3: Proyectos y Capacidad Técnica */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/40 border border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Proyectos en Curso
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {metricas?.proyectosEnCurso ?? 0}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              de {metricas?.totalProyectos ?? 0} totales
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{metricas?.proyectosCompletados ?? 0} proyectos entregados</span>
          </p>
        </div>

        {/* KPI 4: Agenda y Reuniones */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/40 border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Reuniones Esta Semana
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {metricas?.citasSemanaActual ?? 0}
            </span>
            <span className="text-xs font-mono text-sky-400">agendadas</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300">
              {metricas?.citasPendientesCoordinacion ?? 0} pendientes de coordinar
            </span>
          </p>
        </div>
      </div>

      {/* 3. Distribución de Demanda por Servicio del Catálogo */}
      <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              <span>Distribución de Demanda por Solución</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Participación de cada servicio en las propuestas y contratos emitidos.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Ver Catálogo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {metricas?.distribucionServicios && metricas.distribucionServicios.length > 0 ? (
          <div className="space-y-4">
            {metricas.distribucionServicios.map((s, idx) => {
              const colores = [
                "bg-sky-400",
                "bg-indigo-400",
                "bg-emerald-400",
                "bg-amber-400",
                "bg-purple-400",
              ];
              const colorClase = colores[idx % colores.length];

              return (
                <div key={s.servicioNombre} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{s.servicioNombre}</span>
                    <div className="flex items-center gap-3 font-mono text-neutral-400 text-[11px]">
                      <span>{s.cantidadPresupuestos} solicitudes</span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-white font-medium">
                        {formatearMoneda(s.montoTotalCotizado)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-sky-300 text-[10px]">
                        {s.porcentajeParticipacion}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClase} transition-all duration-700`}
                      style={{ width: `${Math.max(s.porcentajeParticipacion, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-500">
            Aún no hay suficientes cotizaciones registradas para generar el desglose.
          </div>
        )}
      </div>

      {/* 4. Centro Operativo (2 Columnas: Agenda Inmediata vs Actividad Reciente) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Próximas Citas */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm">Próximas Reuniones</h3>
              </div>
              <Link
                href="/citas"
                className="text-xs font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Ver Agenda</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {metricas?.proximasCitas && metricas.proximasCitas.length > 0 ? (
              <div className="space-y-3">
                {metricas.proximasCitas.map((cita) => (
                  <div
                    key={cita.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          {cita.clienteNombre}
                        </span>
                        {cita.clienteEmpresa && (
                          <span className="text-[10px] text-neutral-400 px-1.5 py-0.5 rounded bg-white/5 font-mono">
                            {cita.clienteEmpresa}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-1 font-mono">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>{formatearFechaHora(cita.fechaHoraCoordinada)}</span>
                        <span>•</span>
                        <span className="text-neutral-500">{cita.modalidadDescripcion}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {cita.linkReunionMeet && (
                        <a
                          href={cita.linkReunionMeet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[11px] font-medium transition-all inline-flex items-center gap-1"
                          title="Abrir Google Meet"
                        >
                          <Video className="w-3 h-3" />
                          <span>Meet</span>
                        </a>
                      )}
                      <a
                        href={`https://wa.me/${cita.clienteTelefonoWhatsApp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-all inline-flex items-center gap-1"
                        title="Contactar por WhatsApp"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
                <CalendarDays className="w-8 h-8 mx-auto text-neutral-600" />
                <p>No hay reuniones programadas para los próximos días.</p>
                <Link
                  href="/citas"
                  className="inline-block text-sky-400 hover:text-sky-300 font-mono text-[11px] mt-1"
                >
                  Abrir agenda de citas →
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>Google Meet & Citas Presenciales</span>
            <span className="text-neutral-400">{metricas?.citasPendientesCoordinacion ?? 0} pendientes</span>
          </div>
        </div>

        {/* Columna Derecha: Actividad Reciente & Accesos Rápidos */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Actividad Reciente del Sistema</h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Eventos en vivo
              </span>
            </div>

            {metricas?.actividadReciente && metricas.actividadReciente.length > 0 ? (
              <div className="space-y-2.5">
                {metricas.actividadReciente.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.badgeColor }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{item.titulo}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{item.subtitulo}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-mono">
                      {item.monto !== null && item.monto !== undefined && (
                        <div className="text-white font-semibold text-xs">
                          {formatearMoneda(item.monto, item.moneda || "ARS")}
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-500">
                        {formatearFechaRelativa(item.fecha)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500 space-y-1">
                <Activity className="w-8 h-8 mx-auto text-neutral-600" />
                <p>No se registran eventos recientes en el sistema.</p>
              </div>
            )}
          </div>

          {/* Accesos Rápidos de Navegación */}
          <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
            <Link
              href="/proyectos"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-[11px] text-neutral-300 hover:text-white transition-all flex flex-col items-center gap-1"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Proyectos</span>
            </Link>

            <Link
              href="/presupuestos"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-[11px] text-neutral-300 hover:text-white transition-all flex flex-col items-center gap-1"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span>Cotizador</span>
            </Link>

            <Link
              href="/promociones"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-[11px] text-neutral-300 hover:text-white transition-all flex flex-col items-center gap-1"
            >
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Cupones</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
