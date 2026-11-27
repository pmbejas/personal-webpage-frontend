"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  MessageCircle,
  Mail,
  CalendarClock,
  UserCheck,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { CabeceraPaginaAdmin } from "@/components/layout/CabeceraPaginaAdmin";
import {
  ActualizarConfiguracionSistemaRequest,
  EstadoSaludBackendDto,
  servicioConfiguracion,
} from "@/services/configuracion.service";

const CLASE_INPUT =
  "w-full bg-[#07090E] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors";

export default function ConfiguracionPage() {
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [revalidandoWeb, setRevalidandoWeb] = useState<boolean>(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null);
  const [saludBackend, setSaludBackend] = useState<EstadoSaludBackendDto | null>(null);
  const [errorSalud, setErrorSalud] = useState<boolean>(false);

  const [formulario, setFormulario] = useState<ActualizarConfiguracionSistemaRequest>({
    diasValidezPresupuesto: 7,
    numeroWhatsApp: "5493814636143",
    nombreEmisor: "Pablo Bejas",
    emailNotificaciones: "pablobejas@gmail.com",
    urlWebPublica: "https://pablobejas.vercel.app",
  });

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    setErrorSalud(false);

    const [resConfig, resSalud] = await Promise.allSettled([
      servicioConfiguracion.obtener(),
      servicioConfiguracion.verificarSaludBackend(),
    ]);

    if (resConfig.status === "fulfilled" && resConfig.value) {
      setFormulario({
        diasValidezPresupuesto: resConfig.value.diasValidezPresupuesto,
        numeroWhatsApp: resConfig.value.numeroWhatsApp,
        nombreEmisor: resConfig.value.nombreEmisor,
        emailNotificaciones: resConfig.value.emailNotificaciones,
        urlWebPublica: resConfig.value.urlWebPublica,
      });
      setUltimaActualizacion(resConfig.value.fechaActualizacion ?? null);
    } else if (resConfig.status === "rejected") {
      const msg =
        resConfig.reason instanceof Error
          ? resConfig.reason.message
          : "No se pudo cargar la configuración del sistema.";
      toast.error(msg);
    }

    if (resSalud.status === "fulfilled") {
      setSaludBackend(resSalud.value);
    } else {
      setSaludBackend(null);
      setErrorSalud(true);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formulario.diasValidezPresupuesto < 1 || formulario.diasValidezPresupuesto > 90) {
      toast.error("Los días de validez deben estar entre 1 y 90.");
      return;
    }

    setGuardando(true);
    try {
      const actualizada = await servicioConfiguracion.actualizar({
        diasValidezPresupuesto: formulario.diasValidezPresupuesto,
        numeroWhatsApp: formulario.numeroWhatsApp.trim(),
        nombreEmisor: formulario.nombreEmisor.trim(),
        emailNotificaciones: formulario.emailNotificaciones.trim(),
        urlWebPublica: formulario.urlWebPublica.trim(),
      });

      setFormulario({
        diasValidezPresupuesto: actualizada.diasValidezPresupuesto,
        numeroWhatsApp: actualizada.numeroWhatsApp,
        nombreEmisor: actualizada.nombreEmisor,
        emailNotificaciones: actualizada.emailNotificaciones,
        urlWebPublica: actualizada.urlWebPublica,
      });
      setUltimaActualizacion(actualizada.fechaActualizacion ?? null);
      toast.success("Configuración guardada correctamente.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al guardar la configuración.";
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const manejarRevalidarWeb = async () => {
    if (revalidandoWeb) return;
    setRevalidandoWeb(true);
    try {
      const resultado = await servicioConfiguracion.revalidarCatalogoWeb();
      toast.success(resultado?.mensaje || "Caché de la web pública revalidada correctamente.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo revalidar la caché de la web.";
      toast.error(msg);
    } finally {
      setRevalidandoWeb(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <CabeceraPaginaAdmin
        titulo="Configuración"
        subtitulo="Parámetros comerciales de presupuestos, contacto oficial y sincronización con la web pública."
        icono={<Settings className="w-4 h-4" />}
        acciones={
          <button
            type="button"
            onClick={cargarTodo}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-sky-400" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna principal: Parámetros editables */}
        <form
          onSubmit={manejarGuardar}
          className="lg:col-span-2 rounded-2xl bg-[#0D121F] border border-white/10 p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-white">Parámetros Comerciales & Presupuestos</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Estos valores se aplican automáticamente a los nuevos presupuestos generados y notificaciones.
              </p>
            </div>
            {ultimaActualizacion && (
              <span className="text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                Act.: {new Date(ultimaActualizacion).toLocaleDateString("es-AR")}
              </span>
            )}
          </div>

          {cargando ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Cargando configuración del sistema...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 mb-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Validez por defecto de presupuestos (días)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    required
                    value={formulario.diasValidezPresupuesto}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        diasValidezPresupuesto: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className={`${CLASE_INPUT} font-mono`}
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Define los días corridos hasta el vencimiento de cada nueva cotización (1 a 90 días).
                  </span>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 mb-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Nombre del emisor</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={formulario.nombreEmisor}
                    onChange={(e) => setFormulario({ ...formulario, nombreEmisor: e.target.value })}
                    placeholder="Pablo Bejas"
                    className={CLASE_INPUT}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 mb-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Teléfono oficial de WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={formulario.numeroWhatsApp}
                    onChange={(e) => setFormulario({ ...formulario, numeroWhatsApp: e.target.value })}
                    placeholder="5493814636143"
                    className={`${CLASE_INPUT} font-mono`}
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Formato internacional sin símbolos (ej: 5493814636143).
                  </span>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Correo de notificaciones</span>
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={180}
                    value={formulario.emailNotificaciones}
                    onChange={(e) =>
                      setFormulario({ ...formulario, emailNotificaciones: e.target.value })
                    }
                    placeholder="pablobejas@gmail.com"
                    className={CLASE_INPUT}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>URL de la Web Pública</span>
                </label>
                <input
                  type="url"
                  required
                  maxLength={300}
                  value={formulario.urlWebPublica}
                  onChange={(e) => setFormulario({ ...formulario, urlWebPublica: e.target.value })}
                  placeholder="https://pablobejas.vercel.app"
                  className={`${CLASE_INPUT} font-mono`}
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{guardando ? "Guardando..." : "Guardar Configuración"}</span>
                </button>
              </div>
            </>
          )}
        </form>

        {/* Columna lateral: Estado del Backend y Sincronización Web */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-[#0D121F] border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sincronización Web Pública</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Si actualizaste precios, categorías o campañas y querés forzar la actualización inmediata del
              sitio público, dispará la revalidación ISR manual.
            </p>
            <button
              type="button"
              onClick={manejarRevalidarWeb}
              disabled={revalidandoWeb}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${revalidandoWeb ? "animate-spin" : ""}`} />
              <span>{revalidandoWeb ? "Revalidando..." : "Revalidar Caché de la Web"}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#0D121F] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Server className="w-4 h-4 text-sky-400" />
                <span>Estado del Backend API</span>
              </div>
              {saludBackend ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Online</span>
                </span>
              ) : errorSalud ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Sin respuesta</span>
                </span>
              ) : null}
            </div>

            {saludBackend ? (
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Versión:</span>
                  <span className="text-sky-300 font-semibold">v{saludBackend.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Entorno:</span>
                  <span className="text-neutral-200">{saludBackend.entorno}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Estado:</span>
                  <span className="text-emerald-400">{saludBackend.estado}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                {cargando ? "Verificando conexión..." : "No se pudo leer el estado de /health."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
