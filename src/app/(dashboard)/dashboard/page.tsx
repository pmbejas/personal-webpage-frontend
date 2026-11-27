"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  FolderGit2,
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Video,
  Phone,
  RefreshCw,
  Plus,
  ChevronRight,
  AlertCircle,
  PieChart,
} from "lucide-react";
import {
  servicioDashboard,
  DashboardMetricasDto,
} from "@/services/dashboard.service";
import { CabeceraPaginaAdmin } from "@/components/layout/CabeceraPaginaAdmin";
import { GraficoCircularDemanda } from "@/components/dashboard/GraficoCircularDemanda";

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

  return (
    <div className="space-y-6">
      {/* 1. Cabecera Ejecutiva Compacta en Barra Superior */}
      <CabeceraPaginaAdmin
        titulo={`${obtenerSaludo()}, ${usuario?.nombreCompleto?.split(" ")[0] || "Pablo"}`}
        subtitulo="Visión global en vivo del pipeline comercial, liquidez financiera, agenda y operaciones."
        icono={<Sparkles className="w-4 h-4" />}
        acciones={
          <>
            <button
              onClick={() => cargarMetricas()}
              disabled={cargando}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <Link
              href="/presupuestos"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-950 bg-sky-500 hover:bg-sky-400 transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Cotización</span>
            </Link>
          </>
        }
      />

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

      {/* 3. Fila Principal: Próximas Reuniones (Izquierda) + Distribución de Demanda Circular (Derecha, Card Cuadrado) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-stretch">
        {/* Columna Izquierda: Listado de Próximas Reuniones */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                <h2 className="font-bold text-white text-sm">Próximas Reuniones</h2>
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
              <div className="py-16 text-center text-xs text-neutral-500 space-y-2">
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

        {/* Columna Derecha: Card Cuadrado de Distribución de Demanda por Solución (Servicios Base) */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 shadow-2xl flex flex-col lg:aspect-square">
          <div className="flex items-start justify-between gap-2 mb-4 pb-3 border-b border-white/5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-400" />
                <span>Distribución de Demanda por Solución</span>
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Productos principales (servicios base).
              </p>
            </div>
            <Link
              href="/catalogo"
              className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-0.5 transition-colors flex-shrink-0"
              title="Ver Catálogo de Servicios"
            >
              <span>Catálogo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <GraficoCircularDemanda
            datos={metricas?.distribucionServicios ?? []}
            formatearMoneda={formatearMoneda}
          />
        </div>
      </div>
    </div>
  );
}
