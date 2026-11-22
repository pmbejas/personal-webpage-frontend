"use client";

import React, { useState, useEffect } from "react";
import {
  servicioCatalogo,
  ServicioBaseAdmin,
  ActualizarServicioBaseDto,
} from "@/services/catalogo.service";
import {
  Package,
  FileText,
  Clock,
  Layers,
  Edit2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function PaginaCatalogoAdmin() {
  const [servicios, setServicios] = useState<ServicioBaseAdmin[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [servicioEnEdicion, setServicioEnEdicion] = useState<ServicioBaseAdmin | null>(null);
  const [formulario, setFormulario] = useState<ActualizarServicioBaseDto | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const cargarServicios = async () => {
    try {
      setCargando(true);
      const datos = await servicioCatalogo.obtenerTodosLosServicios();
      setServicios(datos);
    } catch {
      toast.error("Error al cargar servicios del catálogo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const abrirEdicion = (servicio: ServicioBaseAdmin) => {
    setServicioEnEdicion(servicio);
    setFormulario({
      nombre: servicio.nombre,
      descripcionComercial: servicio.descripcionComercial,
      descripcionPresupuesto: servicio.descripcionPresupuesto || "",
      precioBase: servicio.precioBase,
      diasEntregaBase: servicio.diasEntregaBase,
      seccionesIncluidas: servicio.seccionesIncluidas,
      permiteSeccionesExtra: servicio.permiteSeccionesExtra,
      precioSeccionExtra: servicio.precioSeccionExtra,
      diasPorSeccionExtra: servicio.diasPorSeccionExtra,
      ordenVisualizacion: servicio.ordenVisualizacion,
    });
  };

  const cerrarEdicion = () => {
    setServicioEnEdicion(null);
    setFormulario(null);
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioEnEdicion || !formulario) return;

    setGuardando(true);
    try {
      await servicioCatalogo.actualizarServicio(servicioEnEdicion.id, formulario);
      toast.success("Servicio actualizado correctamente y caché revalidada.");
      cerrarEdicion();
      await cargarServicios();
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : "Error al guardar cambios.";
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const conmutarEstado = async (id: string, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual;
    try {
      await servicioCatalogo.cambiarEstado(id, nuevoEstado);
      setServicios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, activo: nuevoEstado } : s))
      );
      toast.success(
        nuevoEstado
          ? "Servicio habilitado comercialmente."
          : "Servicio pausado comercialmente."
      );
    } catch {
      toast.error("Error al actualizar estado del servicio.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400 mb-2">
            <Package className="w-3.5 h-3.5" />
            CATÁLOGO COMERCIAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Servicios Web Base
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Gestioná tarifas, plazos y el atributo exclusivo{" "}
            <span className="text-sky-300 font-mono font-medium">
              descripcion_presupuesto
            </span>{" "}
            que se imprime formalmente en las cotizaciones y PDFs.
          </p>
        </div>
      </div>

      {/* Lista de Servicios */}
      {cargando ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-neutral-400">
            Cargando catálogo comercial...
          </span>
        </div>
      ) : servicios.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#0F141F] border border-white/10 p-8">
          <Package className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
          <p className="text-sm text-neutral-300 font-medium">
            No se encontraron servicios base registrados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className={`p-6 rounded-2xl bg-[#0F141F] border transition-all ${
                servicio.activo
                  ? "border-white/10 hover:border-sky-500/30"
                  : "border-white/5 opacity-75 bg-[#0a0d14]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/5 text-neutral-400 border border-white/10">
                      {servicio.clave}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {servicio.nombre}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                        servicio.activo
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {servicio.activo ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Pausado
                        </>
                      )}
                    </span>
                  </div>

                  {/* Precios y Plazos */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-neutral-300">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <span className="text-neutral-500">Base:</span>
                      <span className="text-white font-bold">
                        {servicio.precioBase === 0
                          ? "A convenir ($0)"
                          : `$${servicio.precioBase.toLocaleString("es-AR")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{servicio.diasEntregaBase} días hábiles</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{servicio.seccionesIncluidas} secciones</span>
                    </div>

                    {servicio.permiteSeccionesExtra && (
                      <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-300 px-2.5 py-1 rounded-lg border border-sky-500/20">
                        <span>
                          +${servicio.precioSeccionExtra.toLocaleString("es-AR")}{" "}
                          / sección extra
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Comparación de Descripciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    {/* Descripción Comercial */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mb-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Descripción Comercial (Web)</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {servicio.descripcionComercial}
                      </p>
                    </div>

                    {/* Descripción para Presupuesto */}
                    <div className="p-3.5 rounded-xl bg-sky-500/[0.03] border border-sky-500/15">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-400 mb-1">
                        <FileText className="w-3 h-3 text-sky-400" />
                        <span className="font-semibold">
                          Descripción para Presupuesto (PDF Formal)
                        </span>
                      </div>
                      <p className="text-xs text-sky-100/90 leading-relaxed font-sans">
                        {servicio.descripcionPresupuesto || (
                          <span className="text-neutral-500 italic">
                            No configurada (usará la descripción comercial)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <button
                    type="button"
                    onClick={() => abrirEdicion(servicio)}
                    className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => conmutarEstado(servicio.id, servicio.activo)}
                    className={`flex-1 lg:flex-none px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-colors border cursor-pointer ${
                      servicio.activo
                        ? "text-rose-300 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20"
                        : "text-emerald-300 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    {servicio.activo ? "Pausar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición Integral */}
      {servicioEnEdicion && formulario && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F141F] border border-white/10 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Editar Servicio Base
                </h2>
                <span className="text-xs font-mono text-sky-400">
                  {servicioEnEdicion.clave}
                </span>
              </div>
              <button
                type="button"
                onClick={cerrarEdicion}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={manejarGuardar} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) =>
                    setFormulario({ ...formulario, nombre: e.target.value })
                  }
                  required
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500/60"
                />
              </div>

              {/* Descripción Comercial */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-neutral-300">
                    Descripción Comercial (Web)
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Visible en el cotizador interactivo
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formulario.descripcionComercial}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      descripcionComercial: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500/60 font-sans leading-relaxed"
                />
              </div>

              {/* Descripción para Presupuesto */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-sky-300 font-semibold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Descripción para Presupuesto (PDF Formal)
                  </label>
                  <span className="text-[10px] text-sky-400 font-mono">
                    Detalle contractual
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formulario.descripcionPresupuesto || ""}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      descripcionPresupuesto: e.target.value,
                    })
                  }
                  placeholder="Detalle formal y contractual que se imprimirá en el PDF..."
                  className="w-full bg-[#161D2B] border border-sky-500/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500/60 font-sans leading-relaxed"
                />
              </div>

              {/* Tarifas y Tiempos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Precio Base ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formulario.precioBase}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        precioBase: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Días Entrega
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formulario.diasEntregaBase}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        diasEntregaBase: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Secciones Base
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formulario.seccionesIncluidas}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        seccionesIncluidas: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formulario.ordenVisualizacion}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        ordenVisualizacion: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Secciones Extra */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formulario.permiteSeccionesExtra}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        permiteSeccionesExtra: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-mono text-neutral-200">
                    Permite agregar secciones adicionales
                  </span>
                </label>

                {formulario.permiteSeccionesExtra && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        Precio Secc. Extra ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formulario.precioSeccionExtra}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            precioSeccionExtra: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        Días por Secc. Extra
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formulario.diasPorSeccionExtra}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            diasPorSeccionExtra: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={cerrarEdicion}
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-medium text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/25 disabled:opacity-50"
                >
                  {guardando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar y Revalidar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
