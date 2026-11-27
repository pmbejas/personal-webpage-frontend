"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  Home,
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
  ExternalLink,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
} from "lucide-react";
import { ClienteDetalleResponse } from "@/types";
import {
  construirUrlGoogleMaps,
  formatearDomicilioCliente,
  formatearFechaCorta,
  formatearFechaHora,
  formatearMontoArs,
  formatearNombreCliente,
  obtenerIniciales,
} from "@/utils/formatosClientes";

type PestanaDetalleCliente =
  | "datos"
  | "cuenta_corriente"
  | "proyectos"
  | "presupuestos"
  | "citas";

interface MovimientoCuentaCorriente {
  id: string;
  fecha: string;
  tipo: "CARGO" | "ABONO";
  referencia: string;
  concepto: string;
  detalle?: string | null;
  debe: number;
  haber: number;
  saldoAcumulado: number;
  proyectoId?: string;
}

interface PanelDetalleClienteProps {
  cliente: ClienteDetalleResponse | null;
  cargando: boolean;
  guardandoNotas: boolean;
  procesandoEstado: boolean;
  onCerrar: () => void;
  onCrearProyecto: (id: string) => void;
  onAbrirProyecto: (proyectoId: string) => void;
  onRegistrarPago: () => void;
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
  onAbrirProyecto,
  onRegistrarPago,
  onEditar,
  onAlternarEstado,
  onGuardarNotas,
}: PanelDetalleClienteProps) {
  const [pestana, setPestana] = useState<PestanaDetalleCliente>("datos");
  const [notasEditables, setNotasEditables] = useState<string>("");

  useEffect(() => {
    if (cliente) {
      setNotasEditables(cliente.notasInternas ?? "");
      setPestana("datos");
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

  // Libro cronológico de Cuenta Corriente (Cargos por proyectos no cancelados + Abonos por pagos)
  const movimientosCuentaCorriente = useMemo<MovimientoCuentaCorriente[]>(() => {
    if (!cliente) return [];

    const crudos: Omit<MovimientoCuentaCorriente, "saldoAcumulado">[] = [];

    for (const proyecto of cliente.proyectos || []) {
      if (proyecto.estado.toLowerCase() === "cancelado") continue;
      crudos.push({
        id: `cargo-${proyecto.id}`,
        fecha: proyecto.fechaInicio || proyecto.fechaCreacion,
        tipo: "CARGO",
        referencia: proyecto.codigo,
        concepto: `Proyecto contratado: ${proyecto.titulo}`,
        detalle: `Estado actual: ${proyecto.estado}`,
        debe: proyecto.montoTotalContratado,
        haber: 0,
        proyectoId: proyecto.id,
      });
    }

    for (const pago of cliente.pagos || []) {
      const partesDetalle = [
        pago.metodoPago,
        pago.numeroComprobante ? `Comp. ${pago.numeroComprobante}` : null,
      ].filter(Boolean);

      crudos.push({
        id: `abono-${pago.id}`,
        fecha: pago.fechaPago,
        tipo: "ABONO",
        referencia: pago.proyectoCodigo,
        concepto: pago.concepto || `Pago registrado (${pago.proyectoTitulo})`,
        detalle: partesDetalle.join(" · ") || pago.proyectoTitulo,
        debe: 0,
        haber: pago.monto,
        proyectoId: pago.proyectoId,
      });
    }

    // Orden cronológico ascendente para calcular saldo acumulado real
    crudos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    let saldo = 0;
    const conSaldo: MovimientoCuentaCorriente[] = crudos.map((mov) => {
      saldo += mov.debe - mov.haber;
      return {
        ...mov,
        saldoAcumulado: saldo,
      };
    });

    // Mostrar los movimientos más recientes primero conservando el saldo histórico de cada operación
    return conSaldo.reverse();
  }, [cliente]);

  if (!cliente && !cargando) {
    return null;
  }

  const domicilioTexto = cliente ? formatearDomicilioCliente(cliente) : "";
  const urlMaps = cliente ? construirUrlGoogleMaps(cliente.ubicacion) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm px-[5vw] py-[5vh] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Ficha completa del cliente"
    >
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl w-full h-full flex flex-col shadow-2xl overflow-hidden">
        {cargando || !cliente ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Cargando ficha del cliente...</span>
          </div>
        ) : (
          <>
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {obtenerIniciales(cliente.nombreCompleto)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {formatearNombreCliente(cliente)}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        cliente.activo
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {cliente.activo ? "Activo" : "Archivado"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {[cliente.empresa, cliente.rubro].filter(Boolean).join(" · ") || "Sin empresa asignada"}
                  </p>
                </div>
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
                  onClick={onRegistrarPago}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Registrar pago</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCrearProyecto(cliente.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Nuevo proyecto</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditar(cliente)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAlternarEstado(cliente.id)}
                  disabled={procesandoEstado}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
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

                <button
                  type="button"
                  onClick={onCerrar}
                  aria-label="Cerrar ficha del cliente"
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="px-6 border-b border-white/10 bg-[#07090E]/60 flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: "datos" as const, etiqueta: "Datos Básicos", icono: Building2 },
                {
                  id: "cuenta_corriente" as const,
                  etiqueta: `Cuenta Corriente (${movimientosCuentaCorriente.length})`,
                  icono: Wallet,
                },
                {
                  id: "proyectos" as const,
                  etiqueta: `Proyectos (${cliente.cantidadProyectos})`,
                  icono: FolderGit2,
                },
                {
                  id: "presupuestos" as const,
                  etiqueta: `Presupuestos (${cliente.cantidadPresupuestos})`,
                  icono: FileSpreadsheet,
                },
                {
                  id: "citas" as const,
                  etiqueta: `Citas (${cliente.cantidadCitas})`,
                  icono: CalendarDays,
                },
              ].map((tab) => {
                const Icono = tab.icono;
                const activa = pestana === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPestana(tab.id)}
                    className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer ${
                      activa
                        ? "border-sky-400 text-sky-300"
                        : "border-transparent text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Icono className="w-3.5 h-3.5" />
                    <span>{tab.etiqueta}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido de la pestaña activa */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* PESTAÑA 1: DATOS BÁSICOS */}
              {pestana === "datos" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5 content-start">
                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Email</p>
                        <p className="text-xs text-white truncate mt-0.5">{cliente.email}</p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">WhatsApp</p>
                        <p className="text-xs text-white font-mono truncate mt-0.5">
                          {cliente.telefonoWhatsApp}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <FileBadge2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">CUIT / CUIL</p>
                        <p className="text-xs text-white font-mono truncate mt-0.5">
                          {cliente.cuitCuil || "Sin registrar"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Empresa / Rubro</p>
                        <p className="text-xs text-white truncate mt-0.5">
                          {[cliente.empresa, cliente.rubro].filter(Boolean).join(" · ") || "Sin especificar"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-start gap-3 sm:col-span-2">
                      <Home className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">Domicilio</p>
                        {domicilioTexto ? (
                          <div className="text-xs text-white mt-0.5 space-y-0.5">
                            {cliente.domicilioCalle1 && <p>{cliente.domicilioCalle1}</p>}
                            {cliente.domicilioCalle2 && (
                              <p className="text-neutral-300">{cliente.domicilioCalle2}</p>
                            )}
                            {cliente.localidad && (
                              <p className="text-neutral-400">{cliente.localidad}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 mt-0.5">Sin domicilio registrado</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 sm:col-span-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono uppercase text-neutral-500">
                            Ubicación Geodésica (Google Maps)
                          </p>
                          {urlMaps ? (
                            <a
                              href={urlMaps}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-400 hover:text-sky-300 font-mono truncate inline-flex items-center gap-1.5 mt-0.5"
                              title="Abrir ubicación en Google Maps"
                            >
                              <span className="truncate">{cliente.ubicacion}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          ) : (
                            <p className="text-xs text-neutral-500 mt-0.5">Sin coordenadas registradas</p>
                          )}
                        </div>
                      </div>
                      {urlMaps && (
                        <a
                          href={urlMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-medium inline-flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Abrir en Maps</span>
                        </a>
                      )}
                    </div>

                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4 flex items-center gap-3 sm:col-span-2">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase text-neutral-500">
                          Alta / Última actividad
                        </p>
                        <p className="text-xs text-white mt-0.5">
                          Alta: {formatearFechaCorta(cliente.fechaCreacion)} · Última actividad:{" "}
                          {formatearFechaCorta(cliente.ultimaInteraccion)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas internas rápidas */}
                  <div className="bg-[#07090E] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white">
                        <Tag className="w-3.5 h-3.5 text-sky-400" />
                        Notas internas CRM
                      </span>
                      <button
                        type="button"
                        onClick={() => onGuardarNotas(cliente.id, notasEditables)}
                        disabled={guardandoNotas}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{guardandoNotas ? "Guardando..." : "Guardar"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={notasEditables}
                      onChange={(e) => setNotasEditables(e.target.value)}
                      maxLength={4000}
                      placeholder="Anotá acuerdos, historial relevante, horarios de contacto o datos internos..."
                      aria-label="Notas internas editables del cliente"
                      className="w-full flex-1 bg-[#0B0F17] border border-white/10 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: CUENTA CORRIENTE */}
              {pestana === "cuenta_corriente" && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Estado de Cuenta Corriente</h3>
                      <p className="text-[11px] text-neutral-400">
                        Cargos por proyectos contratados y pagos imputados ordenados cronológicamente.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onRegistrarPago}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Registrar pago</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4">
                      <p className="text-[11px] font-mono uppercase text-neutral-400">
                        Total Contratado (Debe)
                      </p>
                      <p className="text-xl font-bold text-white tabular-nums mt-1">
                        {formatearMontoArs(cliente.montoTotalContratado)}
                      </p>
                    </div>
                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4">
                      <p className="text-[11px] font-mono uppercase text-neutral-400">
                        Total Cobrado (Haber)
                      </p>
                      <p className="text-xl font-bold text-emerald-400 tabular-nums mt-1">
                        {formatearMontoArs(cliente.montoTotalCobrado)}
                      </p>
                    </div>
                    <div className="bg-[#07090E] border border-white/10 rounded-xl p-4">
                      <p className="text-[11px] font-mono uppercase text-neutral-400">
                        Saldo Pendiente
                      </p>
                      <p
                        className={`text-xl font-bold tabular-nums mt-1 ${
                          cliente.saldoPendiente > 0 ? "text-amber-300" : "text-emerald-300"
                        }`}
                      >
                        {formatearMontoArs(cliente.saldoPendiente)}
                      </p>
                    </div>
                  </div>

                  {movimientosCuentaCorriente.length === 0 ? (
                    <div className="bg-[#07090E] border border-white/10 rounded-2xl p-12 text-center text-xs text-neutral-400">
                      Este cliente todavía no registra movimientos de cuenta corriente (proyectos contratados o pagos).
                    </div>
                  ) : (
                    <div className="bg-[#07090E] border border-white/10 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/[0.03] border-b border-white/10 text-[11px] font-mono uppercase text-neutral-400">
                            <tr>
                              <th className="py-3 px-4">Fecha</th>
                              <th className="py-3 px-4">Tipo</th>
                              <th className="py-3 px-4">Proyecto / Concepto</th>
                              <th className="py-3 px-4 text-right">Debe</th>
                              <th className="py-3 px-4 text-right">Haber</th>
                              <th className="py-3 px-4 text-right">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {movimientosCuentaCorriente.map((mov) => (
                              <tr
                                key={mov.id}
                                onClick={() => mov.proyectoId && onAbrirProyecto(mov.proyectoId)}
                                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                                title="Clic para abrir el proyecto asociado"
                              >
                                <td className="py-3 px-4 font-mono text-neutral-300 whitespace-nowrap">
                                  {formatearFechaCorta(mov.fecha)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {mov.tipo === "CARGO" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                                      <ArrowUpRight className="w-3 h-3" />
                                      Cargo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                      <ArrowDownLeft className="w-3 h-3" />
                                      Pago
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-sky-400">
                                      {mov.referencia}
                                    </span>
                                    <span className="text-white font-medium">{mov.concepto}</span>
                                  </div>
                                  {mov.detalle && (
                                    <p className="text-[11px] text-neutral-500 mt-0.5">{mov.detalle}</p>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-200 whitespace-nowrap">
                                  {mov.debe > 0 ? formatearMontoArs(mov.debe) : "—"}
                                </td>
                                <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 whitespace-nowrap">
                                  {mov.haber > 0 ? formatearMontoArs(mov.haber) : "—"}
                                </td>
                                <td
                                  className={`py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                                    mov.saldoAcumulado > 0 ? "text-amber-300" : "text-emerald-300"
                                  }`}
                                >
                                  {formatearMontoArs(mov.saldoAcumulado)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: PROYECTOS (CLICABLES PARA ABRIR Y EDITAR) */}
              {pestana === "proyectos" && (
                <div className="space-y-3">
                  {cliente.proyectos.length === 0 ? (
                    <div className="bg-[#07090E] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                      <p className="text-xs text-neutral-400">
                        Este cliente todavía no tiene proyectos contratados.
                      </p>
                      <button
                        type="button"
                        onClick={() => onCrearProyecto(cliente.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Crear primer proyecto</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                      {cliente.proyectos.map((proyecto) => (
                        <button
                          key={proyecto.id}
                          type="button"
                          onClick={() => onAbrirProyecto(proyecto.id)}
                          className="text-left bg-[#07090E] hover:bg-white/[0.04] border border-white/10 hover:border-sky-500/40 rounded-2xl p-4 space-y-3 transition-all group cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FolderGit2 className="w-4 h-4 text-sky-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                                  <span className="font-mono text-sky-400 mr-1.5">{proyecto.codigo}</span>
                                  {proyecto.titulo}
                                </p>
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                  Inicio: {formatearFechaCorta(proyecto.fechaInicio)} · Estimado:{" "}
                                  {formatearFechaCorta(proyecto.fechaEstimadaFin)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                                style={{
                                  backgroundColor: `${proyecto.colorEstado || "#38bdf8"}15`,
                                  borderColor: `${proyecto.colorEstado || "#38bdf8"}40`,
                                  color: proyecto.colorEstado || "#38bdf8",
                                }}
                              >
                                {proyecto.estado}
                              </span>
                              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-sky-300 transition-colors" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-neutral-400">
                              <span>Progreso</span>
                              <span className="font-mono text-sky-300">{proyecto.progresoPorcentaje}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-sky-500 transition-all"
                                style={{
                                  width: `${Math.min(100, Math.max(0, proyecto.progresoPorcentaje))}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] tabular-nums">
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
                                className={
                                  proyecto.saldoPendiente > 0 ? "text-amber-300" : "text-neutral-300"
                                }
                              >
                                {formatearMontoArs(proyecto.saldoPendiente)}
                              </strong>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 4: PRESUPUESTOS */}
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

              {/* PESTAÑA 5: CITAS */}
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
