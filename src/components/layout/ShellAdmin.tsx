"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Tag,
  CalendarDays,
  FolderGit2,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface ElementoNavegacion {
  nombre: string;
  ruta: string;
  icono: React.ElementType;
  badge?: string;
}

const ELEMENTOS_MENU: ElementoNavegacion[] = [
  { nombre: "Dashboard", ruta: "/dashboard", icono: LayoutDashboard },
  { nombre: "Presupuestos", ruta: "/presupuestos", icono: FileSpreadsheet },
  { nombre: "Proyectos & Seguimiento", ruta: "/proyectos", icono: FolderGit2 },
  { nombre: "Agenda & Citas", ruta: "/citas", icono: CalendarDays },
  { nombre: "Cupones & Campañas", ruta: "/promociones", icono: Tag },
  { nombre: "Catálogo de Servicios", ruta: "/catalogo", icono: Package },
  { nombre: "Configuración", ruta: "/configuracion", icono: Settings },
];

export function ShellAdmin({ children }: { children: React.ReactNode }) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);
  const [sidebarColapsada, setSidebarColapsada] = useState<boolean>(false);
  const { usuario, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col lg:flex-row text-neutral-100 antialiased">
      {/* 1. Barra Lateral de Navegación (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0B0F17] border-r border-white/10 transition-all duration-300 z-30 shrink-0 ${
          sidebarColapsada ? "w-20" : "w-64"
        }`}
      >
        {/* Cabecera Sidebar */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              {/* Isotipo Robot */}
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-sky-400 fill-current">
                <circle cx="50" cy="18" r="6" />
                <path d="M47 24h6v12h-6z" />
                <rect x="24" y="36" width="52" height="42" rx="10" />
                <circle cx="39" cy="54" r="5" fill="#07090E" />
                <circle cx="61" cy="54" r="5" fill="#07090E" />
                <path d="M40 68h20" stroke="#07090E" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            {!sidebarColapsada && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-white truncate">
                  Pablo Bejas
                </span>
                <span className="text-[10px] font-mono text-sky-400 tracking-wider">
                  ERP PRIVADO CORE
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarColapsada(!sidebarColapsada)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
            title={sidebarColapsada ? "Expandir menú" : "Colapsar menú"}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Enlaces de Navegación */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {ELEMENTOS_MENU.map((item) => {
            const Icono = item.icono;
            const esActivo = pathname === item.ruta || pathname.startsWith(`${item.ruta}/`);

            return (
              <Link
                key={item.ruta}
                href={item.ruta}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
        </div>

        {/* Pie de Sidebar con Perfil y Logout */}
        <div className="p-3 border-t border-white/10">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 ${
              sidebarColapsada ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
              {usuario?.nombreCompleto?.charAt(0) || "P"}
            </div>
            {!sidebarColapsada && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {usuario?.nombreCompleto || "Pablo Bejas"}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {usuario?.rol || "SuperAdmin"}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Barra Superior Móvil */}
      <header className="lg:hidden h-16 bg-[#0B0F17] border-b border-white/10 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-4 h-4 text-sky-400 fill-current">
              <circle cx="50" cy="18" r="6" />
              <path d="M47 24h6v12h-6z" />
              <rect x="24" y="36" width="52" height="42" rx="10" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">ERP Privado</span>
        </div>

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
        <div className="lg:hidden fixed inset-0 top-16 bg-black/90 backdrop-blur-xl z-40 p-4 flex flex-col justify-between">
          <div className="space-y-1">
            {ELEMENTOS_MENU.map((item) => {
              const Icono = item.icono;
              const esActivo = pathname === item.ruta || pathname.startsWith(`${item.ruta}/`);
              return (
                <Link
                  key={item.ruta}
                  href={item.ruta}
                  onClick={() => setMenuMovilAbierto(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium ${
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
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Cabecera Superior con Enlace Rápido al Sitio Web */}
        <header className="hidden lg:flex h-16 border-b border-white/10 bg-[#0B0F17]/50 backdrop-blur-md px-6 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>ERP</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-neutral-200 capitalize">
              {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://pablobejas.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span>Ver Web Pública</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Área de Contenido de la Página */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
