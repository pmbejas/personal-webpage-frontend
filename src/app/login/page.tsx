"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PaginaLogin() {
  const [email, setEmail] = useState<string>("pablobejas@gmail.com");
  const [password, setPassword] = useState<string>("");
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  const { login, estaAutenticado, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && estaAutenticado) {
      router.replace("/dashboard");
    }
  }, [estaAutenticado, cargando, router]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Por favor ingresá tu correo y contraseña.");
      return;
    }

    setProcesando(true);
    try {
      await login(email.trim(), password);
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : "Credenciales inválidas.";
      toast.error(mensaje);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Luces ambientales de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Contenedor de la Tarjeta */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0F141F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Cabecera / Identidad */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-sky-400/5 border border-sky-500/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(56,189,248,0.25)]">
              {/* Isotipo Robot */}
              <svg
                viewBox="0 0 100 100"
                className="w-8 h-8 text-sky-400 fill-current"
              >
                <circle cx="50" cy="18" r="6" />
                <path d="M47 24h6v12h-6z" />
                <rect x="24" y="36" width="52" height="42" rx="10" />
                <circle cx="39" cy="54" r="5" fill="#07090E" />
                <circle cx="61" cy="54" r="5" fill="#07090E" />
                <path d="M40 68h20" stroke="#07090E" strokeWidth="4" strokeLinecap="round" />
                <rect x="15" y="48" width="6" height="18" rx="3" />
                <rect x="79" y="48" width="6" height="18" rx="3" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-[11px] font-mono text-sky-300 font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              ERP PRIVADO CORE
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Pablo Bejas | Control Central
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              Acceso restringido para gestión comercial, clientes, proyectos y agenda.
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={manejarEnvio} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-neutral-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pablobejas.com"
                  autoComplete="email"
                  required
                  disabled={procesando}
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/60 transition-all font-sans disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-neutral-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  disabled={procesando}
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/60 transition-all font-sans disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label="Alternar visibilidad"
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={procesando}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(14,165,233,0.3)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {procesando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pie de formulario */}
          <div className="mt-7 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>Sesión protegida por JWT</span>
            <span>Versión 2.0</span>
          </div>
        </div>

        {/* Enlace de regreso al sitio web comercial */}
        <div className="text-center mt-5">
          <a
            href="https://pablobejas.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-neutral-500 hover:text-sky-400 transition-colors"
          >
            ← Volver al Sitio Web Principal
          </a>
        </div>
      </div>
    </div>
  );
}
