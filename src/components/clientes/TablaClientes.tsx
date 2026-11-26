"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  MessageSquare,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  MapPin,
  FileBadge2,
  Building2,
  UserPlus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ClienteListadoResponse } from "@/types";
import {
  formatearFechaCorta,
  formatearMontoArs,
  obtenerIniciales,
} from "@/utils/formatosClientes";

interface TablaClientesProps {
  clientes: ClienteListadoResponse[];
  cargando: boolean;
  errorCarga: string | null;
  procesandoAccionId: string | null;
  onVerDetalle: (id: string) => void;
  onWhatsApp: (id: string) => void;
  onEditar: (id: string) => void;
  onAlternarEstado: (id: string) => void;
  onSolicitarEliminar: (cliente: ClienteListadoResponse) => void;
  onCrearPrimero: () => void;
  onReintentar: () => void;
}

export function TablaClientes({
  clientes,
  cargando,
  errorCarga,
  procesandoAccionId,
  onVerDetalle,
  onWhatsApp,
  onEditar,
  onAlternarEstado,
  onSolicitarEliminar,
  onCrearPrimero,
  onReintentar,
}: TablaClientesProps) {
  if (cargando) {
    return (
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((fila) => (
          <div
            key={fila}
            className="h-16 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="bg-[#0B0F17] border border-rose-500/30 rounded-2xl p-10 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-200 font-medium">{errorCarga}</p>
        <button
          type="button"
          onClick={onReintentar}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reintentar carga</span>
        </button>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-12 text-center space-y-3">
        <p className="text-sm text-neutral-300 font-medium">
          No se encontraron clientes o prospectos con los filtros aplicados.
        </p>
        <p className="text-xs text-neutral-500">
          Probá ajustando la búsqueda o registrá un cliente nuevo manualmente.
        </p>
        <button
          type="button"
          onClick={onCrearPrimero}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors mt-1"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar cliente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Vista tabla escritorio */}
      <div className="hidden lg:block bg-[#0B0F17] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-4">Cliente / Empresa</th>
                <th className="py-3.5 px-4">Contacto y Fiscal</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Actividad</th>
                <th className="py-3.5 px-4 text-right">Contratado / Saldo</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {clientes.map((cliente, indice) => {
                const ocupado = procesandoAccionId === cliente.id;
                return (
                  <motion.tr
                    key={cliente.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: indice * 0.025, duration: 0.18 }}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onVerDetalle(cliente.id)}
                        className="flex items-center gap-3 text-left group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {obtenerIniciales(cliente.nombreCompleto)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white group-hover:text-sky-300 transition-colors truncate max-w-[220px]">
                            {cliente.nombreCompleto}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                            {cliente.empresa && (
                              <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                                <Building2 className="w-3 h-3 text-neutral-500 shrink-0" />
                                {cliente.empresa}
                              </span>
                            )}
                            {cliente.ubicacion && (
                              <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                                <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                                {cliente.ubicacion}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-neutral-200 truncate max-w-[200px]">{cliente.email}</p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 font-mono">
                        <span>{cliente.telefonoWhatsApp}</span>
                        {cliente.cuitCuil && (
                          <span className="inline-flex items-center gap-1 text-neutral-500">
                            <FileBadge2 className="w-3 h-3" />
                            {cliente.cuitCuil}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                            Archivado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        Act.: {formatearFechaCorta(cliente.ultimaInteraccion)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-300">
                        <span title="Presupuestos" className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                          {cliente.cantidadPresupuestos} pres.
                        </span>
                        <span title="Proyectos" className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                          {cliente.cantidadProyectos} proy.
                        </span>
                        <span title="Citas" className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                          {cliente.cantidadCitas} citas
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <p className="font-semibold text-white">
                        {formatearMontoArs(cliente.montoTotalContratado)}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          cliente.saldoPendiente > 0 ? "text-rose-400 font-medium" : "text-neutral-500"
                        }`}
                      >
                        Saldo: {formatearMontoArs(cliente.saldoPendiente)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onVerDetalle(cliente.id)}
                          aria-label={`Ver ficha de ${cliente.nombreCompleto}`}
                          title="Ver ficha 360°"
                          className="p-2 rounded-lg text-neutral-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onWhatsApp(cliente.id)}
                          disabled={ocupado}
                          aria-label={`Contactar por WhatsApp a ${cliente.nombreCompleto}`}
                          title="WhatsApp directo"
                          className="p-2 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditar(cliente.id)}
                          disabled={ocupado}
                          aria-label={`Editar ficha de ${cliente.nombreCompleto}`}
                          title="Editar cliente"
                          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAlternarEstado(cliente.id)}
                          disabled={ocupado}
                          aria-label={
                            cliente.activo
                              ? `Archivar a ${cliente.nombreCompleto}`
                              : `Reactivar a ${cliente.nombreCompleto}`
                          }
                          title={cliente.activo ? "Archivar cliente" : "Reactivar cliente"}
                          className="p-2 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                        >
                          {cliente.activo ? (
                            <Archive className="w-4 h-4" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSolicitarEliminar(cliente)}
                          disabled={ocupado}
                          aria-label={`Eliminar a ${cliente.nombreCompleto}`}
                          title="Eliminar cliente"
                          className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista tarjetas móvil y tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
        {clientes.map((cliente) => {
          const ocupado = procesandoAccionId === cliente.id;
          return (
            <div
              key={cliente.id}
              className="bg-[#0B0F17] border border-white/10 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {obtenerIniciales(cliente.nombreCompleto)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {cliente.nombreCompleto}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{cliente.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
                    cliente.esClienteConvertido
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {cliente.tipoRelacion}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
                <span>{cliente.telefonoWhatsApp}</span>
                {cliente.empresa && <span>· {cliente.empresa}</span>}
                {cliente.cuitCuil && <span>· CUIT {cliente.cuitCuil}</span>}
                {cliente.ubicacion && <span>· {cliente.ubicacion}</span>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs tabular-nums">
                <div>
                  <span className="text-neutral-400">Contratado: </span>
                  <strong className="text-white">{formatearMontoArs(cliente.montoTotalContratado)}</strong>
                </div>
                <span className={cliente.saldoPendiente > 0 ? "text-rose-400 font-medium" : "text-neutral-500"}>
                  Saldo: {formatearMontoArs(cliente.saldoPendiente)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => onVerDetalle(cliente.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver ficha 360°</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onWhatsApp(cliente.id)}
                    disabled={ocupado}
                    aria-label={`WhatsApp a ${cliente.nombreCompleto}`}
                    className="p-2 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditar(cliente.id)}
                    disabled={ocupado}
                    aria-label={`Editar ${cliente.nombreCompleto}`}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSolicitarEliminar(cliente)}
                    disabled={ocupado}
                    aria-label={`Eliminar ${cliente.nombreCompleto}`}
                    className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
