"use client";

import React, { createContext, useContext } from "react";
import { createPortal } from "react-dom";

interface ContextoCabeceraAdminValor {
  contenedorBarraSuperior: HTMLDivElement | null;
}

const ContextoCabeceraAdmin = createContext<ContextoCabeceraAdminValor>({
  contenedorBarraSuperior: null,
});

export function ProveedorCabeceraAdmin({
  contenedorBarraSuperior,
  children,
}: {
  contenedorBarraSuperior: HTMLDivElement | null;
  children: React.ReactNode;
}) {
  return (
    <ContextoCabeceraAdmin.Provider value={{ contenedorBarraSuperior }}>
      {children}
    </ContextoCabeceraAdmin.Provider>
  );
}

interface CabeceraPaginaAdminProps {
  titulo: string;
  subtitulo?: string;
  icono?: React.ReactNode;
  badge?: string;
  acciones?: React.ReactNode;
}

/**
 * Renderiza el título compacto y las acciones de cada módulo dentro de la barra superior fija en escritorio
 * (mediante portal) y como cabecera compacta sobre el contenido en dispositivos móviles.
 */
export function CabeceraPaginaAdmin({
  titulo,
  subtitulo,
  icono,
  badge,
  acciones,
}: CabeceraPaginaAdminProps) {
  const { contenedorBarraSuperior } = useContext(ContextoCabeceraAdmin);

  const contenidoCompacto = (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {icono && (
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            {icono}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
              {titulo}
            </h1>
            {badge && (
              <span className="hidden xl:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-neutral-400 shrink-0">
                {badge}
              </span>
            )}
          </div>
          {subtitulo && (
            <p className="text-[11px] text-neutral-400 truncate leading-tight">
              {subtitulo}
            </p>
          )}
        </div>
      </div>

      {acciones && (
        <div className="flex items-center gap-2 shrink-0 max-w-full flex-wrap">
          {acciones}
        </div>
      )}
    </div>
  );

  return (
    <>
      {contenedorBarraSuperior && createPortal(contenidoCompacto, contenedorBarraSuperior)}

      {/* Fallback visible únicamente en pantallas móviles/tablets menores a lg */}
      <div className="lg:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        {contenidoCompacto}
      </div>
    </>
  );
}
