"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, X, Building2, Mail, Phone, FileBadge2, Loader2, UserCheck } from "lucide-react";
import { servicioClientes } from "@/services/clientes.service";
import { ClienteSelectorResponse } from "@/types";
import { formatearNombreCliente, obtenerIniciales } from "@/utils/formatosClientes";

interface SelectorClienteProps {
  clienteSeleccionado: ClienteSelectorResponse | null;
  onSeleccionar: (cliente: ClienteSelectorResponse | null) => void;
  etiqueta?: string;
  descripcion?: string;
  placeholder?: string;
  obligatorio?: boolean;
}

const RETARDO_BUSQUEDA_MS = 250;

/**
 * Buscador y selector reutilizable de clientes activos conectado a /api/admin/clientes/selector.
 */
export function SelectorCliente({
  clienteSeleccionado,
  onSeleccionar,
  etiqueta = "Buscar cliente registrado",
  descripcion,
  placeholder = "Buscar por apellido, nombre, email, empresa, WhatsApp o CUIT/CUIL...",
  obligatorio = false,
}: SelectorClienteProps) {
  const [busqueda, setBusqueda] = useState<string>("");
  const [resultados, setResultados] = useState<ClienteSelectorResponse[]>([]);
  const [abierto, setAbierto] = useState<boolean>(false);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const manejarClickAfuera = (evento: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickAfuera);
    return () => document.removeEventListener("mousedown", manejarClickAfuera);
  }, []);

  useEffect(() => {
    if (!abierto || clienteSeleccionado) {
      return;
    }

    let activo = true;
    const temporizador = setTimeout(async () => {
      try {
        setBuscando(true);
        setErrorBusqueda(null);
        const lista = await servicioClientes.buscarParaSelector(busqueda);
        if (activo) {
          setResultados(lista);
        }
      } catch {
        if (activo) {
          setErrorBusqueda("No se pudo consultar el listado de clientes.");
          setResultados([]);
        }
      } finally {
        if (activo) {
          setBuscando(false);
        }
      }
    }, RETARDO_BUSQUEDA_MS);

    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [abierto, busqueda, clienteSeleccionado]);

  const elegirCliente = (cliente: ClienteSelectorResponse) => {
    onSeleccionar(cliente);
    setBusqueda("");
    setAbierto(false);
  };

  const limpiarSeleccion = () => {
    onSeleccionar(null);
    setBusqueda("");
    setAbierto(true);
  };

  return (
    <div ref={contenedorRef} className="space-y-1.5 relative">
      <label className="block text-xs font-medium text-neutral-300">
        {etiqueta}
        {obligatorio && <span className="text-sky-400 ml-1">*</span>}
      </label>

      {clienteSeleccionado ? (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
              {obtenerIniciales(clienteSeleccionado.nombreCompleto)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs font-semibold text-white truncate">
                  {formatearNombreCliente(clienteSeleccionado)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-neutral-300 mt-0.5">
                <span className="truncate">{clienteSeleccionado.email}</span>
                {clienteSeleccionado.empresa && (
                  <span className="text-sky-300 truncate">· {clienteSeleccionado.empresa}</span>
                )}
                {clienteSeleccionado.cuitCuil && (
                  <span className="font-mono text-neutral-400">· CUIT {clienteSeleccionado.cuitCuil}</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={limpiarSeleccion}
            aria-label="Cambiar cliente seleccionado"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cambiar</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onFocus={() => setAbierto(true)}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setAbierto(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setAbierto(false);
              }
            }}
            placeholder={placeholder}
            aria-label={etiqueta}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          {buscando && (
            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
          )}

          {abierto && (
            <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[#0B0F17] border border-white/15 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
              {buscando && resultados.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  Buscando clientes...
                </div>
              ) : errorBusqueda ? (
                <div className="p-4 text-center text-xs text-rose-300">{errorBusqueda}</div>
              ) : resultados.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No se encontraron clientes activos con ese criterio.
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {resultados.map((cliente) => (
                    <li key={cliente.id}>
                      <button
                        type="button"
                        onClick={() => elegirCliente(cliente)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-sky-500/10 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {obtenerIniciales(cliente.nombreCompleto)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-white truncate">
                              {formatearNombreCliente(cliente)}
                            </p>
                            {cliente.empresa && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-sky-300 shrink-0">
                                <Building2 className="w-3 h-3" />
                                {cliente.empresa}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-400 mt-0.5">
                            <span className="inline-flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-neutral-500" />
                              {cliente.email}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-neutral-500" />
                              {cliente.telefonoWhatsApp}
                            </span>
                            {cliente.cuitCuil && (
                              <span className="inline-flex items-center gap-1 font-mono text-neutral-500">
                                <FileBadge2 className="w-3 h-3" />
                                {cliente.cuitCuil}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {descripcion && <p className="text-[11px] text-neutral-500">{descripcion}</p>}
    </div>
  );
}
