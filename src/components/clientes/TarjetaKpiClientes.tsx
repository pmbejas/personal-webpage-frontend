"use client";

import React from "react";
import { Users, UserCheck, TrendingUp, Wallet, Tag } from "lucide-react";
import { EstadisticasClientesResponse } from "@/types";
import { formatearMontoArs } from "@/utils/formatosClientes";

interface TarjetaKpiClientesProps {
  estadisticas: EstadisticasClientesResponse | null;
  cargando: boolean;
}

export function TarjetaKpiClientes({ estadisticas, cargando }: TarjetaKpiClientesProps) {
  if (cargando && !estadisticas) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((indice) => (
          <div
            key={indice}
            className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 animate-pulse"
          >
            <div className="h-3 w-24 bg-white/10 rounded mb-3" />
            <div className="h-7 w-28 bg-white/10 rounded mb-2" />
            <div className="h-3 w-36 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalActivos = estadisticas?.totalActivos ?? 0;
  const totalArchivados = estadisticas?.totalArchivados ?? 0;
  const convertidos = estadisticas?.totalClientesConvertidos ?? 0;
  const tasaConversion = estadisticas?.tasaConversionPorcentaje ?? 0;
  const prospectos = estadisticas?.totalProspectos ?? 0;
  const nuevosUltimos30Dias = estadisticas?.nuevosUltimos30Dias ?? 0;
  const saldoPendiente = estadisticas?.saldoTotalPendiente ?? 0;
  const conSaldo = estadisticas?.clientesConSaldoPendiente ?? 0;
  const rubrosTop = estadisticas?.rubrosTop ?? [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 hover:border-sky-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Cartera Activa
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">{totalActivos}</p>
          <p className="text-xs text-neutral-400 mt-1">
            {totalArchivados > 0
              ? `${totalArchivados} archivado(s) fuera de cartera`
              : "Sin clientes archivados"}
          </p>
        </div>

        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Clientes Convertidos
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <p className="text-2xl font-bold text-white tabular-nums">{convertidos}</p>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 tabular-nums">
              {tasaConversion}% conv.
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Con proyecto o presupuesto aprobado
          </p>
        </div>

        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Prospectos Activos
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">{prospectos}</p>
          <p className="text-xs text-neutral-400 mt-1">
            +{nuevosUltimos30Dias} nuevos en los últimos 30 días
          </p>
        </div>

        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 hover:border-rose-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Saldo por Cobrar
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {formatearMontoArs(saldoPendiente)}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {conSaldo > 0
              ? `Distribuido en ${conSaldo} cliente(s)`
              : "Sin saldos pendientes en cartera"}
          </p>
        </div>
      </div>

      {rubrosTop.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
            <Tag className="w-3.5 h-3.5 text-sky-400" />
            Rubros principales:
          </span>
          {rubrosTop.map((item) => (
            <span
              key={item.rubro}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-neutral-300"
            >
              <span>{item.rubro}</span>
              <span className="text-sky-400 font-mono">{item.cantidadClientes}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
