"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Tag,
  CalendarDays,
  FolderGit2,
  Package,
  Wrench,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { LogoAdmin } from "@/components/ui/LogoAdmin";
import { ProveedorCabeceraAdmin } from "@/components/layout/CabeceraPaginaAdmin";

interface ElementoNavegacion {
  nombre: string;
  ruta: string;
  icono: React.ElementType;
  badge?: string;
}

const ELEMENTOS_MENU: ElementoNavegacion[] = [
  { nombre: "Dashboard", ruta: "/dashboard", icono: LayoutDashboard },
  { nombre: "Clientes", ruta: "/clientes", icono: Users },
  { nombre: "Presupuestos", ruta: "/presupuestos", icono: FileSpreadsheet },
  { nombre: "Proyectos", ruta: "/proyectos", icono: FolderGit2 },
  { nombre: "Agenda & Citas", ruta: "/citas", icono: CalendarDays },
  { nombre: "Cupones & Campañas", ruta: "/promociones", icono: Tag },
  { nombre: "Catálogo de Servicios", ruta: "/catalogo", icono: Package },
  { nombre: "Mantenimiento", ruta: "/mantenimiento", icono: Wrench },
  { nombre: "Configuración", ruta: "/configuracion", icono: Settings },
];

const URL_WEB_PUBLICA = "https://pablobejas.vercel.app";

export function ShellAdmin({ children }: { children: React.ReactNode }) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);
  const [sidebarColapsada, setSidebarColapsada] = useState<boolean>(false);
  const [contenedorBarraSuperior, setContenedorBarraSuperior] = useState<HTMLDivElement | null>(null);
  const { usuario, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#07090E] flex flex-col lg:flex-row text-neutral-100 antialiased">
      {/* 1. Barra Lateral de Navegación (Desktop: fija al 100% del alto del viewport y más angosta) */}
      <aside
        className={`hidden lg:flex lg:sticky lg:top-0 lg:h-screen flex-col bg-[#0B0F17] border-r border-white/10 transition-all duration-300 z-30 shrink-0 ${
          sidebarColapsada ? "w-16" : "w-52"
        }`}
      >
        {/* Cabecera Sidebar */}
        <div
          className={`h-14 px-2.5 flex items-center border-b border-white/10 shrink-0 ${
            sidebarColapsada ? "justify-center" : "justify-between"
          }`}
        >
          {sidebarColapsada ? (
            <button
              type="button"
              onClick={() => setSidebarColapsada(false)}
              className="p-1 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer group"
              title="Expandir menú"
            >
              <LogoAdmin colapsado={true} className="w-8 h-8 group-hover:scale-105 transition-transform" />
            </button>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="flex items-center overflow-hidden hover:opacity-90 transition-opacity"
              >
                <LogoAdmin colapsado={false} className="h-8 w-auto" />
              </Link>

              <button
                type="button"
                onClick={() => setSidebarColapsada(true)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Colapsar menú"
              >
                <Menu className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {ELEMENTOS_MENU.map((item) => {
            const Icono = item.icono;
            const esActivo = pathname === item.ruta || pathname.startsWith(`${item.ruta}/`);

            return (
              <Link
                key={item.ruta}
                href={item.ruta}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  sidebarColapsada ? "justify-center" : ""
                } ${
                  esActivo
                    ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)] font-semibold"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5 border border-transparent"
                }`}
                title={sidebarColapsada ? item.nombre : undefined}
              >
                <Icono
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    esActivo ? "text-sky-400" : "text-neutral-400 group-hover:text-neutral-200"
                  }`}
                />
                {!sidebarColapsada && (
                  <span className="truncate flex-1">{item.nombre}</span>
                )}
                {!sidebarColapsada && item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-sky-500/20 text-sky-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Acceso directo a la Web Pública ubicado debajo de Configuración */}
          <div className="pt-2 mt-2 border-t border-white/10">
            <a
              href={URL_WEB_PUBLICA}
              target="_blank"
              rel="noopener noreferrer"
              title={sidebarColapsada ? "Ver Web Pública" : undefined}
              className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-sky-300 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 transition-all ${
                sidebarColapsada ? "justify-center" : ""
              }`}
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-sky-400 transition-colors" />
              {!sidebarColapsada && <span className="truncate flex-1">Ver Web Pública</span>}
            </a>
          </div>
        </nav>

        {/* Pie de Sidebar con Perfil y Logout siempre visible */}
        <div className="p-2.5 border-t border-white/10 shrink-0">
          <div
            className={`flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 ${
              sidebarColapsada ? "justify-center" : ""
            }`}
          >
            {!sidebarColapsada && (
              <>
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {usuario?.nombreCompleto?.charAt(0) || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {usuario?.nombreCompleto || "Pablo Bejas"}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400 truncate">
                    {usuario?.rol || "SuperAdmin"}
                  </p>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Barra Superior Móvil */}
      <header className="lg:hidden sticky top-0 h-14 bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between z-30">
        <Link href="/dashboard" className="flex items-center">
          <LogoAdmin colapsado={false} className="h-7 w-auto" />
        </Link>

        <button
          type="button"
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          className="p-2 rounded-xl text-neutral-400 hover:text-white bg-white/5 border border-white/10"
          aria-label="Abrir menú móvil"
        >
          {menuMovilAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Menú Móvil Desplegable */}
      {menuMovilAbierto && (
        <div className="lg:hidden fixed inset-0 top-14 bg-black/95 backdrop-blur-xl z-40 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            {ELEMENTOS_MENU.map((item) => {
              const Icono = item.icono;
              const esActivo = pathname === item.ruta || pathname.startsWith(`${item.ruta}/`);
              return (
                <Link
                  key={item.ruta}
                  href={item.ruta}
                  onClick={() => setMenuMovilAbierto(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                    esActivo
                      ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icono className="w-4 h-4 text-sky-400" />
                  <span>{item.nombre}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-white/10">
              <a
                href={URL_WEB_PUBLICA}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuMovilAbierto(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-sky-300 hover:bg-sky-500/10"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Ver Web Pública</span>
              </a>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono text-neutral-400">{usuario?.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-rose-400 font-medium py-2 px-3 rounded-xl hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Contenido Principal */}
      <ProveedorCabeceraAdmin contenedorBarraSuperior={contenedorBarraSuperior}>
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-clip">
          {/* Barra Superior Fija (Desktop): aloja el título compacto y botones de acción de cada pantalla */}
          <header className="hidden lg:flex sticky top-0 z-20 h-14 border-b border-white/10 bg-[#0B0F17]/85 backdrop-blur-md px-5 items-center">
            <div ref={setContenedorBarraSuperior} className="w-full min-w-0" />
          </header>

          {/* Área de Contenido de la Página */}
          <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
      </ProveedorCabeceraAdmin>
    </div>
  );
}
