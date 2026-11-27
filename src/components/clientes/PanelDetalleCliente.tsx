"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileBadge2,
  MessageSquare,
  Edit3,
  Archive,
  RotateCcw,
  Save,
  FileSpreadsheet,
  FolderGit2,
  FolderPlus,
  CalendarDays,
  Tag,
  Clock,
} from "lucide-react";
import { ClienteDetalleResponse } from "@/types";
import {
  formatearFechaCorta,
  formatearFechaHora,
  formatearMontoArs,
  obtenerIniciales,
} from "@/utils/formatosClientes";

type PestanaDetalleCliente = "resumen" | "presupuestos" | "proyectos" | "citas";

interface PanelDetalleClienteProps {
  cliente: ClienteDetalleResponse | null;
  cargando: boolean;
  guardandoNotas: boolean;
  procesandoEstado: boolean;
  onCerrar: () => void;
  onCrearProyecto: (id: string) => void;
  onEditar: (cliente: ClienteDetalleResponse) => void;
  onAlternarEstado: (id: string) => Promise<void>;
  onGuardarNotas: (id: string, notas: string) => Promise<void>;
}

function obtenerClaseBadgePresupuesto(estado: number): string {
  switch (estado) {
    case 4:
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    case 3:
      return "bg-sky-500/10 text-sky-300 border-sky-500/30";
    case 2:
      return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    case 5:
      return "bg-rose-500/10 text-rose-300 border-rose-500/30";
    default:
      return "bg-neutral-800 text-neutral-300 border-neutral-700";
  }
}

function obtenerClaseBadgeCita(estado: number): string {
  switch (estado) {
    case 3:
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    case 2:
      return "bg-sky-500/10 text-sky-300 border-sky-500/30";
    case 4:
      return "bg-rose-500/10 text-rose-300 border-rose-500/30";
    default:
      return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  }
}

export function PanelDetalleCliente({
  cliente,
  cargando,
  guardandoNotas,
  procesandoEstado,
  onCerrar,
  onCrearProyecto,
  onEditar,
  onAlternarEstado,
  onGuardarNotas,
}: PanelDetalleClienteProps) {
  const [pestana, setPestana] = useState<PestanaDetalleCliente>("resumen");
  const [notasEditables, setNotasEditables] = useState<string>("");

  useEffect(() => {
    if (cliente) {
      setNotasEditables(cliente.notasInternas ?? "");
      setPestana("resumen");
    }
  }, [cliente]);

  useEffect(() => {
    if (!cliente && !cargando) {
      return;
    }

    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        onCerrar();
      }
    };

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [cliente, cargando, onCerrar]);

  if (!cliente && !cargando) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Ficha completa del cliente"
    >
      <div className="bg-[#0B0F17] border-l border-white/10 w-full max-w-2xl h-full flex flex-col shadow-2xl">
        {cargando || !cliente ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Cargando ficha 360° del cliente...</span>
          </div>
        ) : (
          <>
            {/* Cabecera de la ficha */}
            <div className="p-6 border-b border-white/10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {obtenerIniciales(cliente.nombreCompleto)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-white truncate">
                        {cliente.nombreCompleto}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          cliente.esClienteConvertido
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {cliente.tipoRelacion}
                      </span>
                      {!cliente.activo && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Archivado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                      {[cliente.empresa, cliente.rubro].filter(Boolean).join(" · ") || "Sin empresa asignada"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCerrar}
                  aria-label="Cerrar ficha del cliente"
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Barra de acciones rápidas */}
              <div className="flex flex-wrap items-center gap-2">
                {cliente.enlaceWhatsAppDirecto && (
                  <a
                    href={cliente.enlaceWhatsAppDirecto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onCrearProyecto(cliente.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Nuevo proyecto</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditar(cliente)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAlternarEstado(cliente.id)}
                  disabled={procesandoEstado}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors disabled:opacity-50"
                >
                  {cliente.activo ? (
                    <>
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>Archivar</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reactivar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resumen financiero */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#07090E] border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Cotizado</p>
                  <p className="text-sm font-semibold text-white tabular-nums mt-0.5">
                    {formatearMontoArs(cliente.montoTotalCotizado)}
                  </p>
                </div>
                <div className="bg-[#07090E] border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Contratado</p>
                  <p className="text-sm font-semibold text-sky-300 tabular-nums mt-0.5">
                    {formatearMontoArs(cliente.montoTotalContratado)}
                  </p>
                </div>
                <div className="bg-[#07090E] border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Cobrado</p>
                  <p className="text-sm font-semibold text-emerald-300 tabular-nums mt-0.5">
                    {formatearMontoArs(cliente.montoTotalCobrado)}
                  </p>
                </div>
                <div className="bg-[#07090E] border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">Saldo Pend.</p>
                  <p
                    className={`text-sm font-semibold tabular-nums mt-0.5 ${
                      cliente.saldoPendiente > 0 ? "text-rose-300" : "text-neutral-300"
                    }`}
                  >
                    {formatearMontoArs(cliente.saldoPendiente)}
                  </p>
                </div>
              </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="px-6 pt-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
              {[
                { id: "resumen" as const, etiqueta: "Resumen y Notas" },
                { id: "presupuestos" as const, etiqueta: `Presupuestos (${cliente.cantidadPresupuestos})` },
                { id: "proyectos" as const, etiqueta: `Proyectos (${cliente.cantidadProyectos})` },
                { id: "citas" as const, etiqueta: `Citas (${cliente.cantidadCitas})` },
              ].map((tab) => {
                const activa = pestana === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPestana(tab.id)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activa
                        ? "border-sky-400 text-sky-300"
                        : "border-transparent text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {tab.etiqueta}
                  </button>
                );
              })}
            </div>

            {/* Contenido de la pestaña activa */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {pestana === "resumen" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Email</p>
                        <p className="text-xs text-white truncate">{cliente.email}</p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">WhatsApp</p>
                        <p className="text-xs text-white truncate">{cliente.telefonoWhatsApp}</p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <FileBadge2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">CUIT / CUIL</p>
                        <p className="text-xs text-white truncate">
                          {cliente.cuitCuil || "Sin registrar"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Ubicación</p>
                        <p className="text-xs text-white truncate">
                          {cliente.ubicacion || "Sin registrar"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Empresa / Rubro</p>
                        <p className="text-xs text-white truncate">
                          {[cliente.empresa, cliente.rubro].filter(Boolean).join(" · ") || "Sin especificar"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Alta / Última actividad</p>
                        <p className="text-xs text-white truncate">
                          {formatearFechaCorta(cliente.fechaCreacion)} · {formatearFechaCorta(cliente.ultimaInteraccion)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas internas rápidas */}
                  <div className="bg-[#07090E] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white">
                        <Tag className="w-3.5 h-3.5 text-sky-400" />
                        Notas internas CRM
                      </span>
                      <button
                        type="button"
                        onClick={() => onGuardarNotas(cliente.id, notasEditables)}
                        disabled={guardandoNotas}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{guardandoNotas ? "Guardando..." : "Guardar notas"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={notasEditables}
                      onChange={(e) => setNotasEditables(e.target.value)}
                      maxLength={4000}
                      placeholder="Anotá acuerdos, historial relevante, horarios de contacto o datos internos..."
                      aria-label="Notas internas editables del cliente"
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>
                </>
              )}

              {pestana === "presupuestos" && (
                <div className="space-y-3">
                  {cliente.presupuestos.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-8">
                      Este cliente todavía no tiene presupuestos emitidos.
                    </p>
                  ) : (
                    cliente.presupuestos.map((presupuesto) => (
                      <div
                        key={presupuesto.id}
                        className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileSpreadsheet className="w-4 h-4 text-sky-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-white">
                                {presupuesto.codigo}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] border ${obtenerClaseBadgePresupuesto(
                                  presupuesto.estado
                                )}`}
                              >
                                {presupuesto.estadoDescripcion}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1">
                              Emitido: {formatearFechaCorta(presupuesto.fechaCreacion)} · Vence:{" "}
                              {formatearFechaCorta(presupuesto.fechaVencimiento)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-white tabular-nums shrink-0">
                          {formatearMontoArs(presupuesto.totalPresupuestado)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {pestana === "proyectos" && (
                <div className="space-y-3">
                  {cliente.proyectos.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-8">
                      Este cliente todavía no tiene proyectos contratados.
                    </p>
                  ) : (
                    cliente.proyectos.map((proyecto) => (
                      <div
                        key={proyecto.id}
                        className="bg-[#07090E] border border-white/10 rounded-xl p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FolderGit2 className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                <span className="font-mono text-sky-400 mr-1.5">{proyecto.codigo}</span>
                                {proyecto.titulo}
                              </p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                Inicio: {formatearFechaCorta(proyecto.fechaInicio)} · Estimado:{" "}
                                {formatearFechaCorta(proyecto.fechaEstimadaFin)}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-neutral-200 shrink-0">
                            {proyecto.estado}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-neutral-400">
                            <span>Progreso</span>
                            <span className="font-mono text-sky-300">{proyecto.progresoPorcentaje}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, proyecto.progresoPorcentaje))}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] tabular-nums">
                          <span className="text-neutral-400">
                            Contratado:{" "}
                            <strong className="text-white">
                              {formatearMontoArs(proyecto.montoTotalContratado)}
                            </strong>
                          </span>
                          <span className="text-neutral-400">
                            Cobrado:{" "}
                            <strong className="text-emerald-300">
                              {formatearMontoArs(proyecto.montoCobradoAcumulado)}
                            </strong>
                          </span>
                          <span className="text-neutral-400">
                            Saldo:{" "}
                            <strong
                              className={proyecto.saldoPendiente > 0 ? "text-rose-300" : "text-neutral-300"}
                            >
                              {formatearMontoArs(proyecto.saldoPendiente)}
                            </strong>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {pestana === "citas" && (
                <div className="space-y-3">
                  {cliente.citas.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-8">
                      No se registran reuniones ni solicitudes de contacto para este cliente.
                    </p>
                  ) : (
                    cliente.citas.map((cita) => (
                      <div
                        key={cita.id}
                        className="bg-[#07090E] border border-white/10 rounded-xl p-4 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-sky-400 shrink-0" />
                            <span className="text-xs font-medium text-white">
                              {cita.modalidadDescripcion}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] border ${obtenerClaseBadgeCita(
                              cita.estado
                            )}`}
                          >
                            {cita.estadoDescripcion}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Solicitada: {formatearFechaCorta(cita.fechaSolicitud)} · Coordinada:{" "}
                          {formatearFechaHora(cita.fechaCoordinada)}
                        </p>
                        {cita.resultadoComercial && (
                          <p className="text-[11px] text-sky-300">
                            Resultado: {cita.resultadoComercial}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
