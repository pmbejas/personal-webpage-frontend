"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Archive, Trash2, X } from "lucide-react";
import { ClienteListadoResponse } from "@/types";
import { formatearNombreCliente } from "@/utils/formatosClientes";

interface ModalConfirmarEliminacionClienteProps {
  cliente: ClienteListadoResponse | null;
  procesando: boolean;
  onCerrar: () => void;
  onConfirmarEliminar: () => Promise<void>;
  onArchivarEnSuLugar: (id: string) => Promise<void>;
}

export function ModalConfirmarEliminacionCliente({
  cliente,
  procesando,
  onCerrar,
  onConfirmarEliminar,
  onArchivarEnSuLugar,
}: ModalConfirmarEliminacionClienteProps) {
  useEffect(() => {
    if (!cliente) return;

    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !procesando) {
        onCerrar();
      }
    };

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [cliente, procesando, onCerrar]);

  if (!cliente) {
    return null;
  }

  const totalDependencias =
    cliente.cantidadPresupuestos + cliente.cantidadProyectos + cliente.cantidadCitas;
  const tieneHistorial = totalDependencias > 0;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-eliminar-cliente"
    >
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 id="titulo-eliminar-cliente" className="text-sm font-semibold text-white">
              {tieneHistorial ? "Cliente con historial asociado" : "Confirmar eliminación"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            aria-label="Cerrar confirmación de eliminación"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p className="break-words">
            Cliente: <strong className="text-white">{formatearNombreCliente(cliente)}</strong>{" "}
            <span className="text-neutral-400">({cliente.email})</span>
          </p>

          {tieneHistorial ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
              <p className="font-medium">
                No se puede eliminar físicamente porque posee registros vinculados:
              </p>
              <p className="text-[11px] text-amber-300/90">
                {cliente.cantidadPresupuestos} presupuesto(s) · {cliente.cantidadProyectos} proyecto(s) ·{" "}
                {cliente.cantidadCitas} cita(s).
              </p>
              <p className="text-[11px] text-neutral-300 pt-1">
                Podés archivarlo para ocultarlo de la cartera activa sin perder su auditoría histórica.
              </p>
            </div>
          ) : (
            <p className="text-neutral-400">
              Esta acción eliminará el registro de forma definitiva y no se puede deshacer.
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancelar
          </button>

          {tieneHistorial ? (
            <button
              type="button"
              onClick={() => onArchivarEnSuLugar(cliente.id)}
              disabled={procesando || !cliente.activo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{cliente.activo ? "Archivar cliente" : "Ya está archivado"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmarEliminar}
              disabled={procesando}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{procesando ? "Eliminando..." : "Eliminar definitivamente"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
