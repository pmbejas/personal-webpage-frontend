"use client";

import React from "react";
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
} from "lucide-react";

export default function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-8">
      {/* 1. Cabecera de Bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            PANEL DE CONTROL GENERAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Bienvenido, {usuario?.nombreCompleto || "Pablo"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Visión global del pipeline comercial, reuniones agendadas y proyectos activos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/presupuestos"
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/20"
          >
            <span>Ver Presupuestos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas Clave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Presupuestos */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Presupuestos Emitidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">12</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +3 esta semana
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Cotizaciones interactivas con PDF y validador QR
          </p>
        </div>

        {/* Proyectos Activos */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Proyectos en Curso
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">4</span>
            <span className="text-xs font-mono text-neutral-400">en Kanban</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Seguimiento de minutas, tareas y entregables
          </p>
        </div>

        {/* Citas & Agenda */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Reuniones Pendientes
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
            <span className="text-xs font-mono text-amber-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> Por coordinar
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Con confirmación automática por Resend
          </p>
        </div>

        {/* Cupones & Campañas */}
        <div className="p-5 rounded-2xl bg-[#0F141F] border border-white/10 relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Campañas Activas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Vigente
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Descuentos con límite de usos y expiración
          </p>
        </div>
      </div>

      {/* 3. Accesos Rápidos y Próximas Tareas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0F141F] border border-white/10">
          <h2 className="text-base font-bold text-white mb-1">Módulos del Sistema</h2>
          <p className="text-xs text-neutral-400 mb-5">
            Seleccioná un módulo para gestionar tu ecosistema digital.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/presupuestos"
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sky-500/30 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                    Presupuestos
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Historial, PDFs con QR y vigencia
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/proyectos"
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    Proyectos & Minutas
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Kanban, pagos y PDF historia clínica
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/citas"
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                    Agenda & Reuniones
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Reprogramación y cancelación
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/promociones"
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Cupones & Campañas
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Códigos con límite de usos
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Resumen de Seguridad / Entorno */}
        <div className="p-6 rounded-2xl bg-[#0F141F] border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Estado de Seguridad</h2>
            <p className="text-xs text-neutral-400 mb-4">
              Información de la sesión y entorno de ejecución.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <span className="text-neutral-400">Autenticación</span>
                <span className="font-mono text-emerald-400 font-semibold">JWT Bearer Activo</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <span className="text-neutral-400">Refresh Token</span>
                <span className="font-mono text-sky-400">Cookie HttpOnly</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <span className="text-neutral-400">Timeout Inactividad</span>
                <span className="font-mono text-neutral-300">30 minutos</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-neutral-400">Backend API</span>
                <span className="font-mono text-neutral-300">.NET 10 LTS (Neon)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <span className="text-[11px] font-mono text-neutral-500 block">
              Pablo Bejas Software Studio © 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
