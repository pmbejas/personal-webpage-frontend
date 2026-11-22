"use client";

import React, { useState, useEffect } from "react";
import {
  servicioCatalogo,
  ServicioBaseAdmin,
  ActualizarServicioBaseDto,
  AdicionalAdmin,
  CrearAdicionalDto,
  ActualizarAdicionalDto,
  GrupoAdicionalAdmin,
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
  Plus,
  Tag,
  CheckSquare,
  Square,
  Repeat,
  DollarSign,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";

export default function PaginaCatalogoAdmin() {
  const [pestanaActiva, setPestanaActiva] = useState<"servicios" | "adicionales">("servicios");

  // ==========================================
  // ESTADO: SERVICIOS BASE (PRODUCTOS)
  // ==========================================
  const [servicios, setServicios] = useState<ServicioBaseAdmin[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState<boolean>(true);
  const [servicioEnEdicion, setServicioEnEdicion] = useState<ServicioBaseAdmin | null>(null);
  const [formularioServicio, setFormularioServicio] = useState<ActualizarServicioBaseDto | null>(null);
  const [guardandoServicio, setGuardandoServicio] = useState<boolean>(false);

  // Modal Matriz de Compatibilidades por Producto
  const [servicioParaCompatibilidades, setServicioParaCompatibilidades] = useState<ServicioBaseAdmin | null>(null);
  const [compatibilidadesSeleccionadas, setCompatibilidadesSeleccionadas] = useState<string[]>([]);
  const [cargandoCompatibilidades, setCargandoCompatibilidades] = useState<boolean>(false);
  const [guardandoCompatibilidades, setGuardandoCompatibilidades] = useState<boolean>(false);

  // ==========================================
  // ESTADO: SERVICIOS ADICIONALES (ADD-ONS)
  // ==========================================
  const [adicionales, setAdicionales] = useState<AdicionalAdmin[]>([]);
  const [grupos, setGrupos] = useState<GrupoAdicionalAdmin[]>([]);
  const [cargandoAdicionales, setCargandoAdicionales] = useState<boolean>(true);

  // Modal Nuevo Adicional
  const [modalNuevoAdicionalAbierto, setModalNuevoAdicionalAbierto] = useState<boolean>(false);
  const [guardandoNuevoAdicional, setGuardandoNuevoAdicional] = useState<boolean>(false);
  const [formNuevoAdicional, setFormNuevoAdicional] = useState<CrearAdicionalDto>({
    grupoId: "",
    clave: "",
    nombre: "",
    descripcionComercial: "",
    precio: 35000,
    diasEntregaExtra: 1,
    esRecurrente: false,
    ordenVisualizacion: 1,
  });

  // Modal Editar Adicional
  const [adicionalEnEdicion, setAdicionalEnEdicion] = useState<AdicionalAdmin | null>(null);
  const [formEditarAdicional, setFormEditarAdicional] = useState<ActualizarAdicionalDto | null>(null);
  const [guardandoEdicionAdicional, setGuardandoEdicionAdicional] = useState<boolean>(false);

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const cargarServicios = async () => {
    try {
      setCargandoServicios(true);
      const datos = await servicioCatalogo.obtenerTodosLosServicios();
      setServicios(datos);
    } catch {
      toast.error("Error al cargar servicios base del catálogo.");
    } finally {
      setCargandoServicios(false);
    }
  };

  const cargarAdicionalesYGrupos = async () => {
    try {
      setCargandoAdicionales(true);
      const [datosAdicionales, datosGrupos] = await Promise.all([
        servicioCatalogo.obtenerTodosLosAdicionales(),
        servicioCatalogo.obtenerGrupos(),
      ]);
      setAdicionales(datosAdicionales || []);
      setGrupos(datosGrupos || []);

      // Preseleccionar primer grupo para nuevo adicional
      if (datosGrupos && datosGrupos.length > 0) {
        setFormNuevoAdicional((prev) => ({
          ...prev,
          grupoId: prev.grupoId || datosGrupos[0].id,
        }));
      }
    } catch {
      toast.error("Error al cargar servicios adicionales y categorías.");
    } finally {
      setCargandoAdicionales(false);
    }
  };

  useEffect(() => {
    cargarServicios();
    cargarAdicionalesYGrupos();
  }, []);

  // ==========================================
  // HANDLERS: SERVICIOS BASE
  // ==========================================
  const abrirEdicionServicio = (servicio: ServicioBaseAdmin) => {
    setServicioEnEdicion(servicio);
    setFormularioServicio({
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

  const cerrarEdicionServicio = () => {
    setServicioEnEdicion(null);
    setFormularioServicio(null);
  };

  const manejarGuardarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioEnEdicion || !formularioServicio) return;

    setGuardandoServicio(true);
    try {
      await servicioCatalogo.actualizarServicio(servicioEnEdicion.id, formularioServicio);
      toast.success("Servicio actualizado correctamente y cotizador revalidado.");
      cerrarEdicionServicio();
      await cargarServicios();
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : "Error al guardar cambios.";
      toast.error(mensaje);
    } finally {
      setGuardandoServicio(false);
    }
  };

  const conmutarEstadoServicio = async (id: string, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual;
    try {
      await servicioCatalogo.cambiarEstado(id, nuevoEstado);
      setServicios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, activo: nuevoEstado } : s))
      );
      toast.success(nuevoEstado ? "Servicio habilitado." : "Servicio pausado.");
    } catch {
      toast.error("Error al actualizar estado del servicio.");
    }
  };

  // ==========================================
  // HANDLERS: COMPATIBILIDADES POR PRODUCTO
  // ==========================================
  const abrirModalCompatibilidades = async (servicio: ServicioBaseAdmin) => {
    setServicioParaCompatibilidades(servicio);
    setCargandoCompatibilidades(true);
    try {
      const idsCompatibles = await servicioCatalogo.obtenerCompatibilidades(servicio.id);
      setCompatibilidadesSeleccionadas(idsCompatibles || []);
    } catch {
      toast.error("Error al cargar los adicionales compatibles.");
      setCompatibilidadesSeleccionadas([]);
    } finally {
      setCargandoCompatibilidades(false);
    }
  };

  const alternarAdicionalCompatible = (adicionalId: string) => {
    setCompatibilidadesSeleccionadas((prev) =>
      prev.includes(adicionalId)
        ? prev.filter((id) => id !== adicionalId)
        : [...prev, adicionalId]
    );
  };

  const seleccionarTodosLosAdicionales = () => {
    setCompatibilidadesSeleccionadas(adicionales.map((a) => a.id));
  };

  const deseleccionarTodosLosAdicionales = () => {
    setCompatibilidadesSeleccionadas([]);
  };

  const manejarGuardarCompatibilidades = async () => {
    if (!servicioParaCompatibilidades) return;

    setGuardandoCompatibilidades(true);
    try {
      await servicioCatalogo.actualizarCompatibilidades(
        servicioParaCompatibilidades.id,
        compatibilidadesSeleccionadas
      );
      toast.success(
        `Adicionales compatibles de "${servicioParaCompatibilidades.nombre}" actualizados con éxito.`
      );
      setServicioParaCompatibilidades(null);
    } catch {
      toast.error("Error al guardar la matriz de compatibilidades.");
    } finally {
      setGuardandoCompatibilidades(false);
    }
  };

  // ==========================================
  // HANDLERS: SERVICIOS ADICIONALES (ADD-ONS)
  // ==========================================
  const manejarCrearAdicional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevoAdicional.clave.trim() || !formNuevoAdicional.nombre.trim()) {
      toast.error("La clave y el nombre son obligatorios.");
      return;
    }
    if (!formNuevoAdicional.grupoId) {
      toast.error("Debes seleccionar una categoría temática.");
      return;
    }

    setGuardandoNuevoAdicional(true);
    try {
      await servicioCatalogo.crearAdicional({
        ...formNuevoAdicional,
        clave: formNuevoAdicional.clave.trim().toLowerCase(),
      });
      toast.success("¡Adicional creado exitosamente y catálogo revalidado!");
      setModalNuevoAdicionalAbierto(false);
      setFormNuevoAdicional({
        grupoId: grupos[0]?.id || "",
        clave: "",
        nombre: "",
        descripcionComercial: "",
        precio: 35000,
        diasEntregaExtra: 1,
        esRecurrente: false,
        ordenVisualizacion: 1,
      });
      await cargarAdicionalesYGrupos();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al crear adicional.";
      toast.error(msg);
    } finally {
      setGuardandoNuevoAdicional(false);
    }
  };

  const abrirEdicionAdicional = (adicional: AdicionalAdmin) => {
    setAdicionalEnEdicion(adicional);
    setFormEditarAdicional({
      grupoId: adicional.grupoId,
      nombre: adicional.nombre,
      descripcionComercial: adicional.descripcionComercial,
      precio: adicional.precio,
      diasEntregaExtra: adicional.diasEntregaExtra,
      ordenVisualizacion: adicional.ordenVisualizacion,
    });
  };

  const manejarGuardarEdicionAdicional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adicionalEnEdicion || !formEditarAdicional) return;

    setGuardandoEdicionAdicional(true);
    try {
      await servicioCatalogo.actualizarAdicional(adicionalEnEdicion.id, formEditarAdicional);
      toast.success("Adicional actualizado correctamente.");
      setAdicionalEnEdicion(null);
      setFormEditarAdicional(null);
      await cargarAdicionalesYGrupos();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar adicional.";
      toast.error(msg);
    } finally {
      setGuardandoEdicionAdicional(false);
    }
  };

  const conmutarEstadoAdicional = async (adicional: AdicionalAdmin) => {
    const nuevoEstado = !adicional.activo;
    try {
      await servicioCatalogo.cambiarEstadoAdicional(adicional.id, nuevoEstado);
      setAdicionales((prev) =>
        prev.map((a) => (a.id === adicional.id ? { ...a, activo: nuevoEstado } : a))
      );
      toast.success(nuevoEstado ? "Adicional habilitado." : "Adicional pausado.");
    } catch {
      toast.error("Error al cambiar estado del adicional.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400 mb-2">
            <Package className="w-3.5 h-3.5" />
            CATÁLOGO & SERVICIOS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Administración del Catálogo
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Gestioná los productos base, adicionales comerciales y configurá qué adicionales están asociados a cada solución web.
          </p>
        </div>

        {pestanaActiva === "adicionales" && (
          <button
            onClick={() => setModalNuevoAdicionalAbierto(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nuevo Adicional
          </button>
        )}
      </div>

      {/* 2. Selector de Pestañas */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setPestanaActiva("servicios")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            pestanaActiva === "servicios"
              ? "border-sky-400 text-sky-400 bg-sky-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Productos Web (Servicios Base)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-200">
            {servicios.length}
          </span>
        </button>

        <button
          onClick={() => setPestanaActiva("adicionales")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            pestanaActiva === "adicionales"
              ? "border-sky-400 text-sky-400 bg-sky-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Servicios Adicionales (Add-ons)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-200">
            {adicionales.length}
          </span>
        </button>
      </div>

      {/* 3. PESTAÑA 1: PRODUCTOS WEB (SERVICIOS BASE) */}
      {pestanaActiva === "servicios" && (
        <div className="space-y-6">
          {cargandoServicios ? (
            <div className="flex items-center justify-center py-20 text-neutral-400 font-mono text-sm">
              Cargando servicios base...
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {servicios.map((servicio) => {
                const esAMedida = servicio.precioBase === 0;

                return (
                  <div
                    key={servicio.id}
                    className={`rounded-2xl border bg-[#0D121F] p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                      servicio.activo
                        ? "border-white/10 hover:border-sky-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        : "border-red-500/20 opacity-75 bg-[#0D121F]/60"
                    }`}
                  >
                    <div>
                      {/* Estado y Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            servicio.activo
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              servicio.activo ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                            }`}
                          />
                          {servicio.activo ? "Activo en Cotizador" : "Pausado"}
                        </span>

                        <span className="text-[11px] font-mono text-neutral-500 uppercase">
                          Orden #{servicio.ordenVisualizacion}
                        </span>
                      </div>

                      {/* Título y Clave */}
                      <h3 className="text-xl font-bold text-white mb-1">{servicio.nombre}</h3>
                      <p className="text-xs font-mono text-sky-400/90 mb-4">{servicio.clave}</p>

                      {/* Precios y Plazos */}
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 mb-5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-neutral-400">Inversión Base:</span>
                          <span className="text-lg font-bold font-mono text-white">
                            {esAMedida
                              ? "A convenir ($0)"
                              : `$${servicio.precioBase.toLocaleString("es-AR")} ARS`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-300 pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1.5 text-neutral-400">
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                            Plazo estimado:
                          </span>
                          <span className="font-mono font-medium text-white">
                            {servicio.diasEntregaBase} días hábiles
                          </span>
                        </div>

                        {!esAMedida && (
                          <>
                            <div className="flex items-center justify-between text-xs text-neutral-300">
                              <span className="flex items-center gap-1.5 text-neutral-400">
                                <Layers className="w-3.5 h-3.5 text-sky-400" />
                                Secciones base:
                              </span>
                              <span className="font-mono font-medium text-white">
                                {servicio.seccionesIncluidas} secciones
                              </span>
                            </div>

                            {servicio.permiteSeccionesExtra && (
                              <div className="flex items-center justify-between text-xs text-neutral-300">
                                <span className="text-neutral-400">Sección extra:</span>
                                <span className="font-mono text-neutral-300">
                                  +${servicio.precioSeccionExtra.toLocaleString("es-AR")} (
                                  +{servicio.diasPorSeccionExtra} día)
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Descripción Comercial */}
                      <div className="mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                          Descripción Comercial (Web)
                        </span>
                        <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                          {servicio.descripcionComercial}
                        </p>
                      </div>

                      {/* Descripción Formal Presupuesto */}
                      <div className="mb-6 p-3 rounded-xl bg-sky-950/20 border border-sky-500/20">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-1 font-semibold">
                          <FileText className="w-3 h-3" />
                          Detalle Formal en Presupuesto & PDF
                        </span>
                        <p className="text-xs text-neutral-300 font-mono line-clamp-3 leading-relaxed">
                          {servicio.descripcionPresupuesto || (
                            <span className="text-neutral-500 italic">
                              Sin descripción contractual definida (usa comercial).
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      {/* Botón para Matriz de Adicionales Compatibles */}
                      <button
                        type="button"
                        onClick={() => abrirModalCompatibilidades(servicio)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        Gestionar Adicionales Compatibles
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicionServicio(servicio)}
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Editar Datos
                        </button>

                        <button
                          type="button"
                          onClick={() => conmutarEstadoServicio(servicio.id, servicio.activo)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            servicio.activo
                              ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {servicio.activo ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Pausar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. PESTAÑA 2: SERVICIOS ADICIONALES (ADD-ONS) */}
      {pestanaActiva === "adicionales" && (
        <div className="space-y-6">
          {/* Tarjetas KPI de Adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Total Adicionales</span>
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-2">{adicionales.length}</p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Disponibles en el sistema</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Activos</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {adicionales.filter((a) => a.activo).length}
              </p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Habilitados para cotizar</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Categorías Temáticas</span>
                <FolderTree className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-purple-400 mt-2">{grupos.length}</p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Grupos de clasificación</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Suscripciones Mensuales</span>
                <Repeat className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {adicionales.filter((a) => a.esRecurrente).length}
              </p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Mantenimiento y soporte</span>
            </div>
          </div>

          {/* Tabla de Adicionales */}
          <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Listado de Servicios Adicionales</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Módulos y add-ons que los clientes pueden sumar a su presupuesto en el Paso 2 del cotizador.
                </p>
              </div>
            </div>

            {cargandoAdicionales ? (
              <div className="p-12 text-center text-neutral-400 text-sm">Cargando adicionales...</div>
            ) : adicionales.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-sm">
                No hay adicionales creados aún. Hacé clic en "Nuevo Adicional" para comenzar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 font-mono">
                    <tr>
                      <th className="py-3 px-4">Nombre y Clave</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Descripción Comercial</th>
                      <th className="py-3 px-4">Precio</th>
                      <th className="py-3 px-4">Plazo Extra</th>
                      <th className="py-3 px-4 text-center">Modalidad</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adicionales.map((adicional) => (
                      <tr key={adicional.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{adicional.nombre}</div>
                          <div className="font-mono text-[11px] text-sky-400">{adicional.clave}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                            {adicional.nombreGrupo}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300 max-w-xs truncate">
                          {adicional.descripcionComercial}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ${adicional.precio.toLocaleString("es-AR")} ARS
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          {adicional.diasEntregaExtra > 0 ? `+${adicional.diasEntregaExtra} días` : "Inmediato"}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          {adicional.esRecurrente ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Repeat className="w-3 h-3" /> Mensual
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-neutral-300 border border-white/10">
                              Pago único
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => conmutarEstadoAdicional(adicional)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              adicional.activo
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-neutral-800 text-neutral-400 border border-white/10 hover:bg-neutral-700"
                            }`}
                          >
                            {adicional.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{adicional.activo ? "Activo" : "Pausado"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => abrirEdicionAdicional(adicional)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            title="Editar adicional"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: GESTIONAR ADICIONALES COMPATIBLES DE UN PRODUCTO */}
      {/* ========================================================================= */}
      {servicioParaCompatibilidades && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="w-5 h-5 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    Adicionales Compatibles para {servicioParaCompatibilidades.nombre}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Seleccioná qué adicionales se ofrecerán en el Paso 2 cuando el cliente elija este producto.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setServicioParaCompatibilidades(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Acciones Rápidas de Selección */}
            <div className="flex items-center justify-between py-3 border-b border-white/5 text-xs shrink-0">
              <span className="font-mono text-neutral-300">
                {compatibilidadesSeleccionadas.length} de {adicionales.length} seleccionados
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={seleccionarTodosLosAdicionales}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Seleccionar Todos
                </button>
                <button
                  type="button"
                  onClick={deseleccionarTodosLosAdicionales}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Deseleccionar Todos
                </button>
              </div>
            </div>

            {/* Listado de Adicionales agrupados por categoría */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              {cargandoCompatibilidades ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  Cargando matriz de compatibilidades...
                </div>
              ) : (
                grupos.map((grupo) => {
                  const adicionalesDelGrupo = adicionales.filter((a) => a.grupoId === grupo.id);
                  if (adicionalesDelGrupo.length === 0) return null;

                  return (
                    <div key={grupo.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider pb-1 border-b border-white/5">
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>{grupo.nombre}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {adicionalesDelGrupo.map((adicional) => {
                          const estaSeleccionado = compatibilidadesSeleccionadas.includes(adicional.id);

                          return (
                            <div
                              key={adicional.id}
                              onClick={() => alternarAdicionalCompatible(adicional.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                estaSeleccionado
                                  ? "bg-sky-500/10 border-sky-500/40 text-white"
                                  : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="shrink-0 text-sky-400">
                                  {estaSeleccionado ? (
                                    <CheckSquare className="w-5 h-5 text-sky-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-neutral-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs leading-tight text-white">
                                    {adicional.nombre}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                                    {adicional.descripcionComercial}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0 font-mono text-xs">
                                <div className="font-bold text-white">
                                  ${adicional.precio.toLocaleString("es-AR")}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  {adicional.esRecurrente ? "Mensual" : "Único"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pie de Modal */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setServicioParaCompatibilidades(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardandoCompatibilidades}
                onClick={manejarGuardarCompatibilidades}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {guardandoCompatibilidades ? "Guardando..." : "Guardar Compatibilidades"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EDITAR SERVICIO BASE (PRODUCTO) */}
      {/* ========================================================================= */}
      {servicioEnEdicion && formularioServicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">
                  Editar Servicio Base: <span className="font-mono text-sky-400">{servicioEnEdicion.nombre}</span>
                </h3>
              </div>
              <button
                onClick={cerrarEdicionServicio}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardarServicio} className="space-y-4 mt-4 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={formularioServicio.nombre}
                  onChange={(e) => setFormularioServicio({ ...formularioServicio, nombre: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Descripción Comercial (Web)</label>
                <textarea
                  rows={2}
                  required
                  value={formularioServicio.descripcionComercial}
                  onChange={(e) => setFormularioServicio({ ...formularioServicio, descripcionComercial: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  Descripción para Presupuesto Formal (QuestPDF)
                </label>
                <textarea
                  rows={3}
                  value={formularioServicio.descripcionPresupuesto || ""}
                  onChange={(e) =>
                    setFormularioServicio({ ...formularioServicio, descripcionPresupuesto: e.target.value })
                  }
                  placeholder="Detalle contractual que se imprimirá en el PDF..."
                  className="w-full bg-sky-950/20 border border-sky-500/30 focus:border-sky-400 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Precio Base ($ ARS)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formularioServicio.precioBase}
                    onChange={(e) =>
                      setFormularioServicio({ ...formularioServicio, precioBase: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Días de Entrega Base</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formularioServicio.diasEntregaBase}
                    onChange={(e) =>
                      setFormularioServicio({ ...formularioServicio, diasEntregaBase: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Secciones Base</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formularioServicio.seccionesIncluidas}
                    onChange={(e) =>
                      setFormularioServicio({ ...formularioServicio, seccionesIncluidas: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Precio Sección Extra</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formularioServicio.precioSeccionExtra}
                    onChange={(e) =>
                      setFormularioServicio({ ...formularioServicio, precioSeccionExtra: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Días por Sección Extra</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formularioServicio.diasPorSeccionExtra}
                    onChange={(e) =>
                      setFormularioServicio({ ...formularioServicio, diasPorSeccionExtra: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={cerrarEdicionServicio}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoServicio}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {guardandoServicio ? "Guardando..." : "Actualizar Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: CREAR NUEVO ADICIONAL */}
      {/* ========================================================================= */}
      {modalNuevoAdicionalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Nuevo Servicio Adicional</h3>
              </div>
              <button
                onClick={() => setModalNuevoAdicionalAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarCrearAdicional} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Clave (URL / Slug)</label>
                  <input
                    type="text"
                    required
                    value={formNuevoAdicional.clave}
                    onChange={(e) => setFormNuevoAdicional({ ...formNuevoAdicional, clave: e.target.value.toLowerCase() })}
                    placeholder="mercado-pago"
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Categoría Temática</label>
                  <select
                    value={formNuevoAdicional.grupoId}
                    onChange={(e) => setFormNuevoAdicional({ ...formNuevoAdicional, grupoId: e.target.value })}
                    className="w-full bg-[#0D121F] border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre del Adicional</label>
                <input
                  type="text"
                  required
                  value={formNuevoAdicional.nombre}
                  onChange={(e) => setFormNuevoAdicional({ ...formNuevoAdicional, nombre: e.target.value })}
                  placeholder="Pasarela de Pagos Mercado Pago"
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Descripción Comercial</label>
                <textarea
                  rows={2}
                  required
                  value={formNuevoAdicional.descripcionComercial}
                  onChange={(e) => setFormNuevoAdicional({ ...formNuevoAdicional, descripcionComercial: e.target.value })}
                  placeholder="Checkout Pro con tarjetas de crédito/débito y acreditación automática."
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Precio ($ ARS)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formNuevoAdicional.precio}
                    onChange={(e) =>
                      setFormNuevoAdicional({ ...formNuevoAdicional, precio: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Días de Entrega Extra</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formNuevoAdicional.diasEntregaExtra}
                    onChange={(e) =>
                      setFormNuevoAdicional({ ...formNuevoAdicional, diasEntregaExtra: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="esRecurrenteNuevo"
                  checked={formNuevoAdicional.esRecurrente}
                  onChange={(e) => setFormNuevoAdicional({ ...formNuevoAdicional, esRecurrente: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 bg-white/5 border-white/15 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="esRecurrenteNuevo" className="text-xs text-neutral-300 cursor-pointer select-none">
                  Es un servicio recurrente mensual (ej. Mantenimiento, Hosting, Soporte)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNuevoAdicionalAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoNuevoAdicional}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {guardandoNuevoAdicional ? "Creando..." : "Crear Adicional"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: EDITAR ADICIONAL */}
      {/* ========================================================================= */}
      {adicionalEnEdicion && formEditarAdicional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">
                  Editar Adicional: <span className="font-mono text-sky-400">{adicionalEnEdicion.nombre}</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setAdicionalEnEdicion(null);
                  setFormEditarAdicional(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardarEdicionAdicional} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Categoría Temática</label>
                <select
                  value={formEditarAdicional.grupoId}
                  onChange={(e) => setFormEditarAdicional({ ...formEditarAdicional, grupoId: e.target.value })}
                  className="w-full bg-[#0D121F] border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
                >
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={formEditarAdicional.nombre}
                  onChange={(e) => setFormEditarAdicional({ ...formEditarAdicional, nombre: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Descripción Comercial</label>
                <textarea
                  rows={2}
                  required
                  value={formEditarAdicional.descripcionComercial}
                  onChange={(e) =>
                    setFormEditarAdicional({ ...formEditarAdicional, descripcionComercial: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Precio ($ ARS)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formEditarAdicional.precio}
                    onChange={(e) =>
                      setFormEditarAdicional({ ...formEditarAdicional, precio: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Días de Entrega Extra</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formEditarAdicional.diasEntregaExtra}
                    onChange={(e) =>
                      setFormEditarAdicional({
                        ...formEditarAdicional,
                        diasEntregaExtra: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setAdicionalEnEdicion(null);
                    setFormEditarAdicional(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicionAdicional}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {guardandoEdicionAdicional ? "Guardando..." : "Actualizar Adicional"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
