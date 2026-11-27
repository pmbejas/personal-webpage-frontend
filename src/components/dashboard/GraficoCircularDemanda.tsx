"use client";

import React, { useMemo, useState } from "react";
import { ServicioMetricaDashboardDto } from "@/services/dashboard.service";

const PALETA_PORCIONES = [
  "#38bdf8", // sky-400
  "#818cf8", // indigo-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#c084fc", // purple-400
  "#fb7185", // rose-400
  "#2dd4bf", // teal-400
  "#fb923c", // orange-400
];

interface GraficoCircularDemandaProps {
  datos: ServicioMetricaDashboardDto[];
  formatearMoneda: (monto: number, moneda?: string) => string;
}

interface SegmentoCalculado {
  servicio: ServicioMetricaDashboardDto;
  color: string;
  longitudArco: number;
  desplazamiento: number;
  porcentajeVisual: number;
}

export function GraficoCircularDemanda({
  datos,
  formatearMoneda,
}: GraficoCircularDemandaProps) {
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);

  const radio = 68;
  const grosorTrazo = 22;
  const circunferencia = 2 * Math.PI * radio;

  const { segmentos, totalSolicitudes } = useMemo(() => {
    const total = datos.reduce((acc, item) => acc + item.cantidadPresupuestos, 0);
    if (total <= 0) {
      return { segmentos: [] as SegmentoCalculado[], totalSolicitudes: 0 };
    }

    let acumulado = 0;
    const calculados: SegmentoCalculado[] = datos.map((servicio, indice) => {
      const fraccion = servicio.cantidadPresupuestos / total;
      const longitud = fraccion * circunferencia;
      const desplazamiento = -acumulado;
      acumulado += longitud;

      return {
        servicio,
        color: PALETA_PORCIONES[indice % PALETA_PORCIONES.length],
        longitudArco: longitud,
        desplazamiento,
        porcentajeVisual: Math.round(fraccion * 1000) / 10,
      };
    });

    return { segmentos: calculados, totalSolicitudes: total };
  }, [datos, circunferencia]);

  if (!datos || datos.length === 0 || totalSolicitudes === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
        <div className="w-32 h-32 rounded-full border-[14px] border-white/5 flex items-center justify-center">
          <span className="font-mono text-xs text-neutral-500">0%</span>
        </div>
        <p className="text-xs text-neutral-500 mt-4">
          Aún no hay cotizaciones registradas para mostrar la distribución.
        </p>
      </div>
    );
  }

  const segmentoEnfocado = indiceActivo !== null ? segmentos[indiceActivo] : null;

  return (
    <div className="flex-1 flex flex-col justify-between gap-4 min-h-0">
      {/* Gráfico circular tipo dona en SVG */}
      <div className="relative flex items-center justify-center my-auto">
        <svg
          viewBox="-8 -8 196 196"
          className="w-44 h-44 sm:w-48 sm:h-48 max-w-full -rotate-90 overflow-hidden"
          role="img"
          aria-label="Gráfico circular de distribución de demanda por producto principal"
        >
          {/* Pista base */}
          <circle
            cx="90"
            cy="90"
            r={radio}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={grosorTrazo}
          />

          {/* Porciones por servicio base */}
          {segmentos.map((seg, idx) => {
            const estaEnfocado = indiceActivo === idx;
            const hayOtroEnfocado = indiceActivo !== null && !estaEnfocado;
            // Pequeña separación visual solo cuando hay más de 1 porción
            const separacion = segmentos.length > 1 ? 2 : 0;
            const arcoVisible = Math.max(0.5, seg.longitudArco - separacion);

            return (
              <circle
                key={seg.servicio.servicioNombre}
                cx="90"
                cy="90"
                r={radio}
                fill="none"
                stroke={seg.color}
                strokeWidth={estaEnfocado ? grosorTrazo + 4 : grosorTrazo}
                strokeDasharray={`${arcoVisible} ${circunferencia}`}
                strokeDashoffset={seg.desplazamiento}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                style={{ opacity: hayOtroEnfocado ? 0.35 : 1 }}
                onMouseEnter={() => setIndiceActivo(idx)}
                onMouseLeave={() => setIndiceActivo(null)}
              />
            );
          })}
        </svg>

        {/* Lectura central interactiva */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8 text-center">
          {segmentoEnfocado ? (
            <>
              <span
                className="text-xl font-bold font-mono tabular-nums"
                style={{ color: segmentoEnfocado.color }}
              >
                {segmentoEnfocado.porcentajeVisual}%
              </span>
              <span className="text-[11px] font-medium text-white line-clamp-2 leading-tight mt-0.5 max-w-[104px]">
                {segmentoEnfocado.servicio.servicioNombre}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 mt-0.5">
                {segmentoEnfocado.servicio.cantidadPresupuestos}{" "}
                {segmentoEnfocado.servicio.cantidadPresupuestos === 1 ? "solicitud" : "solicitudes"}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {totalSolicitudes}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-0.5">
                {totalSolicitudes === 1 ? "Solicitud" : "Solicitudes"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Leyenda compacta interactiva */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {segmentos.map((seg, idx) => {
          const estaEnfocado = indiceActivo === idx;
          return (
            <div
              key={seg.servicio.servicioNombre}
              onMouseEnter={() => setIndiceActivo(idx)}
              onMouseLeave={() => setIndiceActivo(null)}
              className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-[11px] transition-colors cursor-default ${
                estaEnfocado ? "bg-white/10" : "hover:bg-white/[0.04]"
              }`}
              title={`${seg.servicio.servicioNombre}: ${seg.servicio.cantidadPresupuestos} solicitudes (${formatearMoneda(seg.servicio.montoTotalCotizado)})`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-neutral-200 font-medium truncate">
                  {seg.servicio.servicioNombre}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums flex-shrink-0">
                <span className="text-neutral-500 text-[10px]">
                  {seg.servicio.cantidadPresupuestos}
                </span>
                <span className="text-sky-300 font-semibold w-11 text-right">
                  {seg.porcentajeVisual}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
