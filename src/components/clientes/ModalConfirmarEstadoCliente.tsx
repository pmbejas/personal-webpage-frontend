"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Archive, RotateCcw, X } from "lucide-react";
import { formatearMontoArs, formatearNombreCliente } from "@/utils/formatosClientes";

export interface ClienteConfirmacionEstado {
  id: string;
  nombre?: string;
  apellido?: string;
  nombreCompleto: string;
  email: string;
  activo: boolean;
  saldoPendiente?: number;
}

interface ModalConfirmarEstadoClienteProps {
  cliente: ClienteConfirmacionEstado | null;
  procesando: boolean;
  onCerrar: () => void;
  onConfirmar: () => Promise<void>;
}

export function ModalConfirmarEstadoCliente({
  cliente,
  procesando,
  onCerrar,
  onConfirmar,
}: ModalConfirmarEstadoClienteProps) {
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

  const esArchivar = cliente.activo;
  const saldoPendiente = cliente.saldoPendiente ?? 0;
  const nombreVisible =
    cliente.nombre !== undefined && cliente.apellido !== undefined
      ? formatearNombreCliente({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          nombreCompleto: cliente.nombreCompleto,
        })
      : cliente.nombreCompleto;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-confirmar-estado-cliente"
    >
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                esArchivar
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {esArchivar ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            </div>
            <h3 id="titulo-confirmar-estado-cliente" className="text-sm font-semibold text-white truncate">
              {esArchivar ? "Confirmar archivo de cliente" : "Confirmar reactivación de cliente"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            aria-label="Cerrar confirmación de cambio de estado"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p className="break-words">
            Cliente: <strong className="text-white">{nombreVisible}</strong>{" "}
            <span className="text-neutral-400">({cliente.email})</span>
          </p>

          {esArchivar ? (
            <>
              <p className="text-neutral-400">
                El cliente dejará de mostrarse en la cartera activa, pero conservará intacto todo su
                historial de proyectos, presupuestos, citas y cuenta corriente. Podrás reactivarlo
                cuando lo necesites.
              </p>

              {saldoPendiente > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Este cliente registra un saldo pendiente de{" "}
                    <strong className="text-amber-100 font-mono tabular-nums">
                      {formatearMontoArs(saldoPendiente)}
                    </strong>
                    . Verificá que desees archivarlo igualmente.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-neutral-400">
              El cliente volverá a figurar en el listado principal de clientes activos y en los
              selectores comerciales.
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
              esArchivar
                ? "text-amber-950 bg-amber-400 hover:bg-amber-300"
                : "text-emerald-950 bg-emerald-400 hover:bg-emerald-300"
            }`}
          >
            {esArchivar ? <Archive className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>
              {procesando
                ? esArchivar
                  ? "Archivando..."
                  : "Reactivando..."
                : esArchivar
                  ? "Archivar cliente"
                  : "Reactivar cliente"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
