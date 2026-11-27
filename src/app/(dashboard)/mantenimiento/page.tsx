"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Wrench,
  Briefcase,
  FolderTree,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { CabeceraPaginaAdmin } from "@/components/layout/CabeceraPaginaAdmin";
import { servicioMantenimiento } from "@/services/mantenimiento.service";
import {
  CategoriaAdicionalResponse,
  RubroClienteResponse,
} from "@/types";

type PestanaMantenimiento = "rubros" | "categorias";

const CLASE_INPUT =
  "w-full bg-[#07090E] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors";

export default function MantenimientoPage() {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaMantenimiento>("rubros");

  // Rubros de Clientes
  const [rubros, setRubros] = useState<RubroClienteResponse[]>([]);
  const [cargandoRubros, setCargandoRubros] = useState<boolean>(true);
  const [modalRubroAbierto, setModalRubroAbierto] = useState<boolean>(false);
  const [rubroEditando, setRubroEditando] = useState<RubroClienteResponse | null>(null);
  const [guardandoRubro, setGuardandoRubro] = useState<boolean>(false);
  const [formRubro, setFormRubro] = useState({
    nombre: "",
    descripcion: "",
  });

  // Categorías de Servicios Adicionales
  const [categorias, setCategorias] = useState<CategoriaAdicionalResponse[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState<boolean>(true);
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState<boolean>(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaAdicionalResponse | null>(null);
  const [guardandoCategoria, setGuardandoCategoria] = useState<boolean>(false);
  const [formCategoria, setFormCategoria] = useState({
    clave: "",
    nombre: "",
    descripcion: "",
  });

  const ordenarAlfabeticamente = <T extends { nombre: string }>(lista: T[]): T[] =>
    [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  const cargarTodo = useCallback(async () => {
    setCargandoRubros(true);
    setCargandoCategorias(true);
    try {
      const [listaRubros, listaCategorias] = await Promise.all([
        servicioMantenimiento.obtenerRubros(false),
        servicioMantenimiento.obtenerCategoriasAdicionales(false),
      ]);
      setRubros(ordenarAlfabeticamente(listaRubros || []));
      setCategorias(ordenarAlfabeticamente(listaCategorias || []));
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : "No se pudieron cargar las tablas de mantenimiento.";
      toast.error(mensaje);
    } finally {
      setCargandoRubros(false);
      setCargandoCategorias(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  // Handlers Rubros
  const abrirCrearRubro = () => {
    setRubroEditando(null);
    setFormRubro({
      nombre: "",
      descripcion: "",
    });
    setModalRubroAbierto(true);
  };

  const abrirEditarRubro = (rubro: RubroClienteResponse) => {
    setRubroEditando(rubro);
    setFormRubro({
      nombre: rubro.nombre,
      descripcion: rubro.descripcion ?? "",
    });
    setModalRubroAbierto(true);
  };

  const guardarRubro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRubro.nombre.trim()) {
      toast.error("El nombre del rubro es obligatorio.");
      return;
    }

    setGuardandoRubro(true);
    try {
      const payload = {
        nombre: formRubro.nombre.trim(),
        descripcion: formRubro.descripcion.trim() || null,
        ordenVisualizacion: 0,
      };

      if (rubroEditando) {
        await servicioMantenimiento.actualizarRubro(rubroEditando.id, payload);
        toast.success("Rubro actualizado correctamente.");
      } else {
        await servicioMantenimiento.crearRubro(payload);
        toast.success("Rubro creado correctamente.");
      }

      setModalRubroAbierto(false);
      await cargarTodo();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el rubro.");
    } finally {
      setGuardandoRubro(false);
    }
  };

  const alternarEstadoRubro = async (rubro: RubroClienteResponse) => {
    const nuevoEstado = !rubro.activo;
    try {
      await servicioMantenimiento.cambiarEstadoRubro(rubro.id, nuevoEstado);
      setRubros((prev) => prev.map((r) => (r.id === rubro.id ? { ...r, activo: nuevoEstado } : r)));
      toast.success(nuevoEstado ? "Rubro activado." : "Rubro pausado.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al cambiar el estado del rubro.");
    }
  };

  const eliminarRubro = async (rubro: RubroClienteResponse) => {
    if (!window.confirm(`¿Eliminar definitivamente el rubro "${rubro.nombre}"?`)) {
      return;
    }

    try {
      await servicioMantenimiento.eliminarRubro(rubro.id);
      toast.success("Rubro eliminado correctamente.");
      await cargarTodo();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el rubro.");
    }
  };

  // Handlers Categorías de Servicios Adicionales
  const abrirCrearCategoria = () => {
    setCategoriaEditando(null);
    setFormCategoria({
      clave: "",
      nombre: "",
      descripcion: "",
    });
    setModalCategoriaAbierto(true);
  };

  const abrirEditarCategoria = (categoria: CategoriaAdicionalResponse) => {
    setCategoriaEditando(categoria);
    setFormCategoria({
      clave: categoria.clave,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
    });
    setModalCategoriaAbierto(true);
  };

  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoria.nombre.trim()) {
      toast.error("El nombre de la categoría es obligatorio.");
      return;
    }

    setGuardandoCategoria(true);
    try {
      if (categoriaEditando) {
        await servicioMantenimiento.actualizarCategoriaAdicional(categoriaEditando.id, {
          nombre: formCategoria.nombre.trim(),
          descripcion: formCategoria.descripcion.trim() || null,
          ordenVisualizacion: 0,
        });
        toast.success("Categoría actualizada correctamente.");
      } else {
        await servicioMantenimiento.crearCategoriaAdicional({
          clave: formCategoria.clave.trim() || null,
          nombre: formCategoria.nombre.trim(),
          descripcion: formCategoria.descripcion.trim() || null,
          ordenVisualizacion: 0,
        });
        toast.success("Categoría creada correctamente.");
      }

      setModalCategoriaAbierto(false);
      await cargarTodo();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la categoría.");
    } finally {
      setGuardandoCategoria(false);
    }
  };

  const alternarEstadoCategoria = async (categoria: CategoriaAdicionalResponse) => {
    const nuevoEstado = !categoria.activo;
    try {
      await servicioMantenimiento.cambiarEstadoCategoriaAdicional(categoria.id, nuevoEstado);
      setCategorias((prev) =>
        prev.map((c) => (c.id === categoria.id ? { ...c, activo: nuevoEstado } : c))
      );
      toast.success(nuevoEstado ? "Categoría activada." : "Categoría pausada.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al cambiar el estado de la categoría.");
    }
  };

  const eliminarCategoria = async (categoria: CategoriaAdicionalResponse) => {
    if (!window.confirm(`¿Eliminar definitivamente la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      await servicioMantenimiento.eliminarCategoriaAdicional(categoria.id);
      toast.success("Categoría eliminada correctamente.");
      await cargarTodo();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
    }
  };

  const cargando = cargandoRubros || cargandoCategorias;

  return (
    <div className="space-y-6 pb-16 w-full max-w-full min-w-0">
      <CabeceraPaginaAdmin
        titulo="Mantenimiento"
        subtitulo="Tablas maestras de rubros de clientes y categorías de servicios adicionales."
        icono={<Wrench className="w-4 h-4" />}
        acciones={
          <>
            <button
              type="button"
              onClick={cargarTodo}
              disabled={cargando}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {pestanaActiva === "rubros" ? (
              <button
                type="button"
                onClick={abrirCrearRubro}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Rubro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={abrirCrearCategoria}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Categoría</span>
              </button>
            )}
          </>
        }
      />

      {/* Pestañas */}
      <div className="flex border-b border-white/10 gap-2 w-full max-w-full overflow-x-auto min-w-0">
        <button
          type="button"
          onClick={() => setPestanaActiva("rubros")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            pestanaActiva === "rubros"
              ? "border-sky-400 text-sky-400 bg-sky-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          <span>Rubros de Clientes</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-200">
            {rubros.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("categorias")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            pestanaActiva === "categorias"
              ? "border-sky-400 text-sky-400 bg-sky-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <FolderTree className="w-4 h-4 shrink-0" />
          <span>Categorías de Adicionales</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-200">
            {categorias.length}
          </span>
        </button>
      </div>

      {/* PESTAÑA 1: RUBROS DE CLIENTES */}
      {pestanaActiva === "rubros" && (
        <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden w-full max-w-full min-w-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Rubros Comerciales de Clientes</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Estos rubros alimentan el selector del formulario de clientes y las métricas del CRM.
              </p>
            </div>
          </div>

          {cargandoRubros ? (
            <div className="p-12 text-center text-neutral-400 text-xs">Cargando rubros...</div>
          ) : rubros.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              Todavía no hay rubros cargados. Hacé clic en &quot;Nuevo Rubro&quot; para agregar el primero.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/10 text-neutral-300 font-mono">
                  <tr>
                    <th className="py-3 px-4">Rubro y Descripción</th>
                    <th className="py-3 px-4 text-center">Clientes</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rubros.map((rubro) => (
                    <tr key={rubro.id} className="hover:bg-sky-500/[0.06] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{rubro.nombre}</div>
                        {rubro.descripcion && (
                          <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                            {rubro.descripcion}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-200">
                          {rubro.cantidadClientes}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => alternarEstadoRubro(rubro)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                            rubro.activo
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-neutral-800 text-neutral-400 border border-white/10 hover:bg-neutral-700"
                          }`}
                        >
                          {rubro.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{rubro.activo ? "Activo" : "Pausado"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => abrirEditarRubro(rubro)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarRubro(rubro)}
                            disabled={rubro.cantidadClientes > 0}
                            title={
                              rubro.cantidadClientes > 0
                                ? "Tiene clientes asociados; pausalo en lugar de eliminarlo"
                                : "Eliminar rubro"
                            }
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: CATEGORÍAS DE SERVICIOS ADICIONALES */}
      {pestanaActiva === "categorias" && (
        <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden w-full max-w-full min-w-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Categorías de Servicios Adicionales</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Agrupaciones temáticas que organizan los add-ons tanto en el ERP como en el cotizador público.
              </p>
            </div>
          </div>

          {cargandoCategorias ? (
            <div className="p-12 text-center text-neutral-400 text-xs">Cargando categorías...</div>
          ) : categorias.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              Todavía no hay categorías creadas.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/10 text-neutral-300 font-mono">
                  <tr>
                    <th className="py-3 px-4">Categoría y Clave</th>
                    <th className="py-3 px-4 text-center">Adicionales</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-sky-500/[0.06] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{categoria.nombre}</span>
                          <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                            {categoria.clave}
                          </span>
                        </div>
                        {categoria.descripcion && (
                          <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                            {categoria.descripcion}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-200">
                          {categoria.cantidadAdicionales}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => alternarEstadoCategoria(categoria)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                            categoria.activo
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-neutral-800 text-neutral-400 border border-white/10 hover:bg-neutral-700"
                          }`}
                        >
                          {categoria.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{categoria.activo ? "Activa" : "Pausada"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => abrirEditarCategoria(categoria)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarCategoria(categoria)}
                            disabled={categoria.cantidadAdicionales > 0}
                            title={
                              categoria.cantidadAdicionales > 0
                                ? "Tiene adicionales asociados; pausala o reasignalos primero"
                                : "Eliminar categoría"
                            }
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL ALTA / EDICIÓN RUBRO */}
      {modalRubroAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {rubroEditando ? "Editar Rubro de Cliente" : "Nuevo Rubro de Cliente"}
              </h3>
              <button
                type="button"
                onClick={() => setModalRubroAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={guardarRubro} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formRubro.nombre}
                  onChange={(e) => setFormRubro({ ...formRubro, nombre: e.target.value })}
                  placeholder="Ej: Gastronomía, Salud, Inmobiliaria"
                  className={CLASE_INPUT}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Descripción</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formRubro.descripcion}
                  onChange={(e) => setFormRubro({ ...formRubro, descripcion: e.target.value })}
                  placeholder="Descripción breve opcional del rubro..."
                  className={`${CLASE_INPUT} resize-none`}
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalRubroAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoRubro}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{guardandoRubro ? "Guardando..." : "Guardar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ALTA / EDICIÓN CATEGORÍA DE ADICIONAL */}
      {modalCategoriaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {categoriaEditando ? "Editar Categoría de Adicionales" : "Nueva Categoría de Adicionales"}
              </h3>
              <button
                type="button"
                onClick={() => setModalCategoriaAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={guardarCategoria} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                  placeholder="Ej: Automatización & IA"
                  className={CLASE_INPUT}
                />
              </div>

              {!categoriaEditando && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Clave / Slug <span className="text-neutral-500">(opcional, se genera automático)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formCategoria.clave}
                    onChange={(e) => setFormCategoria({ ...formCategoria, clave: e.target.value.toLowerCase() })}
                    placeholder="automatizacion-ia"
                    className={`${CLASE_INPUT} font-mono`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Descripción</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formCategoria.descripcion}
                  onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                  placeholder="Qué tipo de servicios adicionales agrupa esta categoría..."
                  className={`${CLASE_INPUT} resize-none`}
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCategoriaAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCategoria}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{guardandoCategoria ? "Guardando..." : "Guardar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
