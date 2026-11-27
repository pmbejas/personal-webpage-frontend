"use client";

import React, { useMemo, useState } from "react";
import { Plus, X, Pencil, Check, AlertCircle } from "lucide-react";
import {
  ProyectoItemAlcanceDto,
  TipoItemAlcance,
  servicioProyectos,
} from "@/services/proyectos.service";

interface ConfiguracionColumnaAlcance {
  tipo: TipoItemAlcance;
  titulo: string;
  subtitulo: string;
  placeholder: string;
  bordeSuperior: string;
  claseContador: string;
}

const COLUMNAS_ALCANCE: ConfiguracionColumnaAlcance[] = [
  {
    tipo: "ALCANCE",
    titulo: "Alcance",
    subtitulo: "Incluido en la entrega",
    placeholder: "Agregar entregable o funcionalidad...",
    bordeSuperior: "border-t-2 border-t-blue-600",
    claseContador: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    tipo: "LIMITE",
    titulo: "Límites (No hacer)",
    subtitulo: "Restricciones acordadas",
    placeholder: "Agregar límite o restricción...",
    bordeSuperior: "border-t-2 border-t-amber-500",
    claseContador: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    tipo: "FUERA_ALCANCE",
    titulo: "Fuera de Alcance",
    subtitulo: "Excluido de esta etapa",
    placeholder: "Agregar ítem excluido...",
    bordeSuperior: "border-t-2 border-t-slate-400",
    claseContador: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
];

interface TabAlcanceProyectoProps {
  proyectoId: string;
  items: ProyectoItemAlcanceDto[];
  onItemsChange: (itemsActualizados: ProyectoItemAlcanceDto[]) => void;
}

export function TabAlcanceProyecto({
  proyectoId,
  items,
  onItemsChange,
}: TabAlcanceProyectoProps) {
  const [borradores, setBorradores] = useState<Record<TipoItemAlcance, string>>({
    ALCANCE: "",
    LIMITE: "",
    FUERA_ALCANCE: "",
  });
  const [creandoPorTipo, setCreandoPorTipo] = useState<Record<TipoItemAlcance, boolean>>({
    ALCANCE: false,
    LIMITE: false,
    FUERA_ALCANCE: false,
  });

  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState<string>("");
  const [tipoEdicion, setTipoEdicion] = useState<TipoItemAlcance>("ALCANCE");
  const [guardandoEdicion, setGuardandoEdicion] = useState<boolean>(false);
  const [errorOperacion, setErrorOperacion] = useState<string | null>(null);

  const itemsPorTipo = useMemo(() => {
    const mapa: Record<TipoItemAlcance, ProyectoItemAlcanceDto[]> = {
      ALCANCE: [],
      LIMITE: [],
      FUERA_ALCANCE: [],
    };

    for (const item of items) {
      if (mapa[item.tipo]) {
        mapa[item.tipo].push(item);
      }
    }

    return mapa;
  }, [items]);

  const manejarAgregar = async (tipo: TipoItemAlcance) => {
    const descripcionLimpia = (borradores[tipo] || "").trim();
    if (!descripcionLimpia || creandoPorTipo[tipo]) return;

    setErrorOperacion(null);
    setCreandoPorTipo((prev) => ({ ...prev, [tipo]: true }));

    try {
      const creado = await servicioProyectos.agregarItemAlcance(proyectoId, {
        tipo,
        descripcion: descripcionLimpia,
      });

      onItemsChange([...items, creado]);
      setBorradores((prev) => ({ ...prev, [tipo]: "" }));
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo agregar el ítem de alcance.";
      setErrorOperacion(mensaje);
    } finally {
      setCreandoPorTipo((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const iniciarEdicion = (item: ProyectoItemAlcanceDto) => {
    setErrorOperacion(null);
    setItemEditandoId(item.id);
    setTextoEdicion(item.descripcion);
    setTipoEdicion(item.tipo);
  };

  const cancelarEdicion = () => {
    setItemEditandoId(null);
    setTextoEdicion("");
  };

  const guardarEdicion = async (item: ProyectoItemAlcanceDto) => {
    const descripcionLimpia = textoEdicion.trim();
    if (!descripcionLimpia) {
      setErrorOperacion("La descripción del ítem no puede quedar vacía.");
      return;
    }

    if (descripcionLimpia === item.descripcion && tipoEdicion === item.tipo) {
      cancelarEdicion();
      return;
    }

    setErrorOperacion(null);
    setGuardandoEdicion(true);
    try {
      const actualizado = await servicioProyectos.actualizarItemAlcance(
        proyectoId,
        item.id,
        {
          descripcion: descripcionLimpia,
          tipo: tipoEdicion,
        }
      );

      const siguienteLista = items.map((actual) =>
        actual.id === item.id ? actualizado : actual
      );
      onItemsChange(siguienteLista);
      cancelarEdicion();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo actualizar el ítem de alcance.";
      setErrorOperacion(mensaje);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const manejarEliminarOptimista = async (item: ProyectoItemAlcanceDto) => {
    setErrorOperacion(null);
    const respaldoPrevio = items;
    const listaSinItem = items.filter((actual) => actual.id !== item.id);
    onItemsChange(listaSinItem);

    if (itemEditandoId === item.id) {
      cancelarEdicion();
    }

    try {
      await servicioProyectos.eliminarItemAlcance(proyectoId, item.id);
    } catch (err: unknown) {
      onItemsChange(respaldoPrevio);
      const mensaje =
        err instanceof Error ? err.message : "No se pudo eliminar el ítem de alcance.";
      setErrorOperacion(mensaje);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10">
        <div className="text-[11px] text-neutral-400">
          Esta sección es <span className="text-neutral-200 font-medium">100% opcional</span>.
          Los ítems cargados aquí se incluyen automáticamente al exportar la ficha del proyecto a PDF.
        </div>
        <div className="font-mono tabular-nums text-[11px] text-neutral-300">
          Total: <span className="font-semibold text-white">{items.length}</span>
        </div>
      </div>

      {errorOperacion && (
        <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorOperacion}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorOperacion(null)}
            className="text-rose-300/80 hover:text-rose-200"
            aria-label="Cerrar error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {COLUMNAS_ALCANCE.map((columna) => {
          const itemsColumna = itemsPorTipo[columna.tipo];
          const estaCreando = creandoPorTipo[columna.tipo];

          return (
            <section
              key={columna.tipo}
              className={`rounded-xl bg-neutral-950/60 border border-white/10 ${columna.bordeSuperior} flex flex-col overflow-hidden`}
            >
              {/* Encabezado de columna */}
              <div className="px-3 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate">
                    {columna.titulo}
                  </h3>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {columna.subtitulo}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded border font-mono tabular-nums text-[11px] font-semibold flex-shrink-0 ${columna.claseContador}`}
                >
                  {itemsColumna.length}
                </span>
              </div>

              {/* Input rápido h-8 + botón + */}
              <div className="p-2.5 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={borradores[columna.tipo]}
                    onChange={(e) =>
                      setBorradores((prev) => ({
                        ...prev,
                        [columna.tipo]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        manejarAgregar(columna.tipo);
                      }
                    }}
                    placeholder={columna.placeholder}
                    maxLength={500}
                    disabled={estaCreando}
                    className="flex-1 h-8 px-2.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => manejarAgregar(columna.tipo)}
                    disabled={estaCreando || !borradores[columna.tipo].trim()}
                    title={`Agregar en ${columna.titulo}`}
                    aria-label={`Agregar ítem en ${columna.titulo}`}
                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/40 text-neutral-200 hover:text-sky-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista de ítems o estado vacío */}
              <div className="flex-1">
                {itemsColumna.length === 0 ? (
                  <div className="px-3 py-8 text-center text-[11px] text-neutral-500 italic">
                    Sin ítems cargados (opcional)
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {itemsColumna.map((item) => {
                      const editando = itemEditandoId === item.id;

                      return (
                        <li
                          key={item.id}
                          className="px-3 py-2 hover:bg-white/[0.02] transition-colors group"
                        >
                          {editando ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={textoEdicion}
                                onChange={(e) => setTextoEdicion(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    guardarEdicion(item);
                                  } else if (e.key === "Escape") {
                                    cancelarEdicion();
                                  }
                                }}
                                maxLength={500}
                                autoFocus
                                className="w-full h-8 px-2 rounded-md bg-neutral-900 border border-sky-500/40 text-xs text-white focus:outline-none"
                              />
                              <div className="flex items-center justify-between gap-1.5">
                                <select
                                  value={tipoEdicion}
                                  onChange={(e) =>
                                    setTipoEdicion(e.target.value as TipoItemAlcance)
                                  }
                                  className="h-7 px-2 rounded-md bg-neutral-900 border border-white/10 text-[11px] text-neutral-200 focus:outline-none"
                                >
                                  <option value="ALCANCE">Alcance</option>
                                  <option value="LIMITE">Límites (No hacer)</option>
                                  <option value="FUERA_ALCANCE">Fuera de Alcance</option>
                                </select>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => guardarEdicion(item)}
                                    disabled={guardandoEdicion}
                                    className="h-7 px-2 rounded-md bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[11px] inline-flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Guardar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelarEdicion}
                                    className="h-7 px-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 text-[11px]"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p
                                onDoubleClick={() => iniciarEdicion(item)}
                                title="Doble clic para editar o mover de sección"
                                className="text-xs text-neutral-200 leading-snug break-words flex-1 cursor-text"
                              >
                                {item.descripcion}
                              </p>
                              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => iniciarEdicion(item)}
                                  title="Editar o mover de sección"
                                  aria-label="Editar ítem"
                                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-sky-300 transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => manejarEliminarOptimista(item)}
                                  title="Eliminar ítem"
                                  aria-label="Eliminar ítem"
                                  className="p-1 rounded hover:bg-rose-500/15 text-neutral-500 hover:text-rose-400 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
