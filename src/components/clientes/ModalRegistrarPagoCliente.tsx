"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, DollarSign, Save, FolderGit2, FolderPlus, AlertCircle } from "lucide-react";
import { ClienteDetalleResponse } from "@/types";
import { RegistrarPagoRequest } from "@/services/proyectos.service";
import { formatearMontoArs, formatearNombreCliente } from "@/utils/formatosClientes";

interface ModalRegistrarPagoClienteProps {
  abierto: boolean;
  cliente: ClienteDetalleResponse | null;
  guardando: boolean;
  onCerrar: () => void;
  onCrearProyecto: (clienteId: string) => void;
  onGuardarPago: (proyectoId: string, datos: RegistrarPagoRequest) => Promise<void>;
}

const METODOS_PAGO = [
  "Transferencia Bancaria",
  "Mercado Pago",
  "Efectivo",
  "Tarjeta de Débito / Crédito",
  "Cheque",
  "Cripto / USDT",
  "Otro",
];

const CLASE_INPUT =
  "w-full bg-[#07090E] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors";

function obtenerFechaHoyIso(): string {
  return new Date().toISOString().substring(0, 10);
}

export function ModalRegistrarPagoCliente({
  abierto,
  cliente,
  guardando,
  onCerrar,
  onCrearProyecto,
  onGuardarPago,
}: ModalRegistrarPagoClienteProps) {
  const [proyectoId, setProyectoId] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [fechaPago, setFechaPago] = useState<string>(obtenerFechaHoyIso());
  const [metodoPago, setMetodoPago] = useState<string>(METODOS_PAGO[0]);
  const [concepto, setConcepto] = useState<string>("");
  const [numeroComprobante, setNumeroComprobante] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const proyectosElegibles = useMemo(() => {
    if (!cliente) return [];
    return (cliente.proyectos || [])
      .filter((p) => p.estado.toLowerCase() !== "cancelado")
      .sort((a, b) => b.saldoPendiente - a.saldoPendiente);
  }, [cliente]);

  const proyectosConSaldo = useMemo(
    () => proyectosElegibles.filter((p) => p.saldoPendiente > 0),
    [proyectosElegibles]
  );

  const proyectoSeleccionado = useMemo(
    () => proyectosElegibles.find((p) => p.id === proyectoId) ?? null,
    [proyectosElegibles, proyectoId]
  );

  useEffect(() => {
    if (!abierto || !cliente) {
      return;
    }

    setErrorLocal(null);
    setFechaPago(obtenerFechaHoyIso());
    setMetodoPago(METODOS_PAGO[0]);
    setConcepto("");
    setNumeroComprobante("");
    setNotas("");
    setMonto("");

    if (proyectosConSaldo.length === 1) {
      setProyectoId(proyectosConSaldo[0].id);
    } else if (proyectosConSaldo.length > 1) {
      setProyectoId(proyectosConSaldo[0].id);
    } else {
      setProyectoId("");
    }
  }, [abierto, cliente, proyectosConSaldo]);

  useEffect(() => {
    if (!abierto) return;
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !guardando) {
        onCerrar();
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, guardando, onCerrar]);

  if (!abierto || !cliente) {
    return null;
  }

  const cargarSaldoRestante = () => {
    if (!proyectoSeleccionado) return;
    setMonto(String(proyectoSeleccionado.saldoPendiente));
    if (!concepto.trim()) {
      setConcepto(
        proyectoSeleccionado.montoCobradoAcumulado === 0
          ? "Pago total de proyecto"
          : "Cancelación de saldo restante"
      );
    }
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!proyectoSeleccionado) {
      setErrorLocal("Seleccioná a qué proyecto querés imputar el pago.");
      return;
    }

    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      setErrorLocal("Ingresá un monto válido mayor a 0.");
      return;
    }

    if (montoNumerico > proyectoSeleccionado.saldoPendiente) {
      setErrorLocal(
        `El monto supera el saldo pendiente del proyecto (${formatearMontoArs(proyectoSeleccionado.saldoPendiente)}).`
      );
      return;
    }

    if (!concepto.trim()) {
      setErrorLocal("El concepto del pago es obligatorio.");
      return;
    }

    const fechaIso =
      fechaPago.length === 10
        ? `${fechaPago}T12:00:00.000Z`
        : new Date(fechaPago).toISOString();

    await onGuardarPago(proyectoSeleccionado.id, {
      monto: montoNumerico,
      concepto: concepto.trim(),
      fechaPago: fechaIso,
      metodoPago: metodoPago.trim() || "Transferencia Bancaria",
      moneda: proyectoSeleccionado.moneda || "ARS",
      numeroComprobante: numeroComprobante.trim() || null,
      notas: notas.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-pago-cliente"
    >
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="titulo-modal-pago-cliente" className="text-base font-semibold text-white truncate">
                Registrar pago del cliente
              </h2>
              <p className="text-xs text-neutral-400 truncate">
                {formatearNombreCliente(cliente)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar modal de pago"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        {proyectosConSaldo.length === 0 ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                No hay proyectos con saldo pendiente para imputar
              </p>
              <p className="text-xs text-neutral-400">
                {proyectosElegibles.length === 0
                  ? "Este cliente todavía no tiene proyectos contratados."
                  : "Todos los proyectos vigentes de este cliente ya se encuentran saldados al 100%."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onCerrar}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  onCerrar();
                  onCrearProyecto(cliente.id);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Crear proyecto</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="p-6 space-y-4 overflow-y-auto">
            {errorLocal && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorLocal}</span>
              </div>
            )}

            {/* Selector de proyecto a imputar */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 mb-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Proyecto a imputar *</span>
              </label>
              <select
                value={proyectoId}
                onChange={(e) => {
                  setProyectoId(e.target.value);
                  setErrorLocal(null);
                }}
                required
                aria-label="Proyecto al que se imputa el pago"
                className={CLASE_INPUT}
              >
                <option value="">-- Seleccionar proyecto --</option>
                {proyectosConSaldo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} — {p.titulo} (Saldo: {formatearMontoArs(p.saldoPendiente)})
                  </option>
                ))}
              </select>
            </div>

            {/* Resumen del proyecto seleccionado */}
            {proyectoSeleccionado && (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                      Contratado
                    </span>
                    <span className="text-white font-semibold">
                      {formatearMontoArs(proyectoSeleccionado.montoTotalContratado)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                      Cobrado
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {formatearMontoArs(proyectoSeleccionado.montoCobradoAcumulado)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                      Saldo Pend.
                    </span>
                    <span className="text-amber-300 font-semibold">
                      {formatearMontoArs(proyectoSeleccionado.saldoPendiente)}
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-white/5 flex justify-end">
                  <button
                    type="button"
                    onClick={cargarSaldoRestante}
                    className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Cargar saldo restante ({formatearMontoArs(proyectoSeleccionado.saldoPendiente)})
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Monto ({proyectoSeleccionado?.moneda || "ARS"}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={proyectoSeleccionado?.saldoPendiente}
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej: 150000"
                  className={`${CLASE_INPUT} font-mono`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Fecha de pago *
                </label>
                <input
                  type="date"
                  required
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className={`${CLASE_INPUT} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Concepto *
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Seña 50%, Cuota 2, Saldo final..."
                className={CLASE_INPUT}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Método de pago *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className={CLASE_INPUT}
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {metodo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  N.° Comprobante
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  placeholder="Opcional"
                  className={`${CLASE_INPUT} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Notas
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Observaciones adicionales opcionales..."
                className={`${CLASE_INPUT} resize-none`}
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCerrar}
                disabled={guardando}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || !proyectoSeleccionado}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{guardando ? "Registrando..." : "Registrar pago"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
