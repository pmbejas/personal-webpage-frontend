"use client";

import React, { useState, useEffect } from "react";
import { CabeceraPaginaAdmin } from "@/components/layout/CabeceraPaginaAdmin";
import {
  servicioCupones,
  CuponAdminDto,
  CrearCuponDto,
  ActualizarCuponDto,
} from "@/services/cupones.service";
import {
  servicioPromociones,
  PromocionAdminDto,
  CrearPromocionDto,
} from "@/services/promociones.service";
import {
  Tag,
  Percent,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Hash,
  AlertCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function PaginaPromocionesAdmin() {
  const [pestanaActiva, setPestanaActiva] = useState<"cupones" | "campanas">("cupones");

  // Estado Cupones
  const [cupones, setCupones] = useState<CuponAdminDto[]>([]);
  const [cargandoCupones, setCargandoCupones] = useState<boolean>(true);
  const [modalNuevoCuponAbierto, setModalNuevoCuponAbierto] = useState<boolean>(false);
  const [cuponEnEdicion, setCuponEnEdicion] = useState<CuponAdminDto | null>(null);
  const [guardandoCupon, setGuardandoCupon] = useState<boolean>(false);
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

  // Formulario Nuevo Cupón
  const [formNuevoCupon, setFormNuevoCupon] = useState<CrearCuponDto>({
    codigo: "",
    descripcion: "",
    tipoDescuento: 0, // 0: Porcentaje, 1: MontoFijo
    valorDescuento: 10,
    usosMaximos: 20,
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Formulario Edición Cupón
  const [formEditarCupon, setFormEditarCupon] = useState<ActualizarCuponDto | null>(null);

  // Estado Campañas
  const [campanas, setCampanas] = useState<PromocionAdminDto[]>([]);
  const [cargandoCampanas, setCargandoCampanas] = useState<boolean>(true);
  const [modalNuevaCampanaAbierto, setModalNuevaCampanaAbierto] = useState<boolean>(false);
  const [guardandoCampana, setGuardandoCampana] = useState<boolean>(false);

  // Formulario Nueva Campaña
  const [formNuevaCampana, setFormNuevaCampana] = useState<CrearPromocionDto>({
    clave: "",
    nombre: "",
    textoBanner: "",
    tipoDescuento: 0,
    valorDescuento: 15,
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const cargarCupones = async () => {
    try {
      setCargandoCupones(true);
      const datos = await servicioCupones.obtenerTodos();
      setCupones(datos || []);
    } catch {
      toast.error("Error al cargar los cupones de descuento.");
    } finally {
      setCargandoCupones(false);
    }
  };

  const cargarCampanas = async () => {
    try {
      setCargandoCampanas(true);
      const datos = await servicioPromociones.obtenerTodas();
      setCampanas(datos || []);
    } catch {
      toast.error("Error al cargar las campañas promocionales.");
    } finally {
      setCargandoCampanas(false);
    }
  };

  useEffect(() => {
    cargarCupones();
    cargarCampanas();
  }, []);

  const copiarAlPortapapeles = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCodigoCopiado(codigo);
    toast.success(`Código "${codigo}" copiado al portapapeles.`);
    setTimeout(() => setCodigoCopiado(null), 2500);
  };

  const manejarCrearCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevoCupon.codigo.trim()) {
      toast.error("El código es obligatorio.");
      return;
    }
    if (!formNuevoCupon.descripcion.trim()) {
      toast.error("La descripción es obligatoria.");
      return;
    }
    if (formNuevoCupon.valorDescuento <= 0) {
      toast.error("El valor del descuento debe ser mayor a 0.");
      return;
    }

    setGuardandoCupon(true);
    try {
      await servicioCupones.crear({
        ...formNuevoCupon,
        codigo: formNuevoCupon.codigo.trim().toUpperCase(),
        fechaInicio: new Date(formNuevoCupon.fechaInicio).toISOString(),
        fechaVencimiento: new Date(formNuevoCupon.fechaVencimiento).toISOString(),
      });
      toast.success("¡Cupón creado exitosamente!");
      setModalNuevoCuponAbierto(false);
      setFormNuevoCupon({
        codigo: "",
        descripcion: "",
        tipoDescuento: 0,
        valorDescuento: 10,
        usosMaximos: 20,
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
      await cargarCupones();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al crear el cupón.";
      toast.error(msg);
    } finally {
      setGuardandoCupon(false);
    }
  };

  const abrirEdicionCupon = (cupon: CuponAdminDto) => {
    setCuponEnEdicion(cupon);
    setFormEditarCupon({
      descripcion: cupon.descripcion,
      tipoDescuento: cupon.tipoDescuento,
      valorDescuento: cupon.valorDescuento,
      usosMaximos: cupon.usosMaximos,
      fechaInicio: cupon.fechaInicio ? cupon.fechaInicio.split("T")[0] : "",
      fechaVencimiento: cupon.fechaVencimiento ? cupon.fechaVencimiento.split("T")[0] : "",
    });
  };

  const manejarGuardarEdicionCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuponEnEdicion || !formEditarCupon) return;

    setGuardandoCupon(true);
    try {
      await servicioCupones.actualizar(cuponEnEdicion.id, {
        ...formEditarCupon,
        fechaInicio: new Date(formEditarCupon.fechaInicio).toISOString(),
        fechaVencimiento: new Date(formEditarCupon.fechaVencimiento).toISOString(),
      });
      toast.success("Cupón actualizado correctamente.");
      setCuponEnEdicion(null);
      setFormEditarCupon(null);
      await cargarCupones();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar el cupón.";
      toast.error(msg);
    } finally {
      setGuardandoCupon(false);
    }
  };

  const manejarAlternarEstadoCupon = async (cupon: CuponAdminDto) => {
    try {
      await servicioCupones.cambiarEstado(cupon.id);
      toast.success(`Cupón ${cupon.codigo} ${cupon.activo ? "pausado" : "activado"}.`);
      await cargarCupones();
    } catch {
      toast.error("Error al cambiar el estado del cupón.");
    }
  };

  const manejarCrearCampana = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevaCampana.clave.trim() || !formNuevaCampana.nombre.trim()) {
      toast.error("Completá todos los campos obligatorios.");
      return;
    }

    setGuardandoCampana(true);
    try {
      await servicioPromociones.crear({
        ...formNuevaCampana,
        clave: formNuevaCampana.clave.trim().toLowerCase(),
        fechaInicio: new Date(formNuevaCampana.fechaInicio).toISOString(),
        fechaFin: new Date(formNuevaCampana.fechaFin).toISOString(),
      });
      toast.success("¡Campaña comercial creada y revalidada!");
      setModalNuevaCampanaAbierto(false);
      setFormNuevaCampana({
        clave: "",
        nombre: "",
        textoBanner: "",
        tipoDescuento: 0,
        valorDescuento: 15,
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
      await cargarCampanas();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al crear la campaña.";
      toast.error(msg);
    } finally {
      setGuardandoCampana(false);
    }
  };

  // Métricas calculadas
  const totalCupones = cupones.length;
  const cuponesActivos = cupones.filter((c) => c.activo && c.estaVigente).length;
  const canjesTotales = cupones.reduce((acc, c) => acc + c.usosActuales, 0);
  const usosMaximosTotales = cupones.reduce((acc, c) => acc + c.usosMaximos, 0);
  const tasaUsoGeneral = usosMaximosTotales > 0 ? Math.round((canjesTotales / usosMaximosTotales) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Cabecera compacta en barra superior */}
      <CabeceraPaginaAdmin
        titulo="Promociones & Descuentos"
        subtitulo="Códigos de descuento canjeables en el cotizador y campañas comerciales."
        icono={<Tag className="w-4 h-4" />}
        acciones={
          pestanaActiva === "cupones" ? (
            <button
              onClick={() => setModalNuevoCuponAbierto(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black shadow-[0_0_16px_rgba(56,189,248,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cupón</span>
            </button>
          ) : (
            <button
              onClick={() => setModalNuevaCampanaAbierto(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_16px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Campaña</span>
            </button>
          )
        }
      />

      {/* 2. Selector de Pestañas */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setPestanaActiva("cupones")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            pestanaActiva === "cupones"
              ? "border-sky-400 text-sky-400 bg-sky-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Códigos de Descuento (Cupones)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-200">
            {cupones.length}
          </span>
        </button>

        <button
          onClick={() => setPestanaActiva("campanas")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            pestanaActiva === "campanas"
              ? "border-amber-400 text-amber-400 bg-amber-500/5"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Campañas Comerciales (Banners)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-200">
            {campanas.length}
          </span>
        </button>
      </div>

      {/* 3. PESTAÑA 1: CUPONES DE DESCUENTO */}
      {pestanaActiva === "cupones" && (
        <div className="space-y-6">
          {/* Tarjetas KPI de Cupones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Total Cupones</span>
                <Hash className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-2">{totalCupones}</p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Registrados en la base de datos</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Activos & Vigentes</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">{cuponesActivos}</p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Listos para canjear en la web</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Canjes Registrados</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-2">{canjesTotales}</p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">Presupuestos con cupón aplicado</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Tasa de Uso</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-purple-400 mt-2">{tasaUsoGeneral}%</p>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">{canjesTotales} de {usosMaximosTotales} usos permitidos</span>
            </div>
          </div>

          {/* Listado de Cupones */}
          <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Listado de Códigos Promocionales</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Los clientes pueden escribir estos códigos en el cotizador antes de generar su presupuesto.
                </p>
              </div>
            </div>

            {cargandoCupones ? (
              <div className="p-12 text-center text-neutral-400 text-sm">Cargando cupones...</div>
            ) : cupones.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-sm">
                No hay cupones comerciales creados aún. Hacé clic en "Nuevo Cupón" para comenzar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 font-mono">
                    <tr>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Descripción</th>
                      <th className="py-3 px-4">Descuento</th>
                      <th className="py-3 px-4">Usos (Progreso)</th>
                      <th className="py-3 px-4">Vigencia</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cupones.map((cupon) => {
                      const porcentajeUso =
                        cupon.usosMaximos > 0
                          ? Math.round((cupon.usosActuales / cupon.usosMaximos) * 100)
                          : 0;

                      return (
                        <tr key={cupon.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Código con botón copiar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-lg text-xs">
                                {cupon.codigo}
                              </span>
                              <button
                                onClick={() => copiarAlPortapapeles(cupon.codigo)}
                                title="Copiar código"
                                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                {codigoCopiado === cupon.codigo ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Descripción */}
                          <td className="py-3.5 px-4 text-neutral-200 font-medium max-w-xs truncate">
                            {cupon.descripcion}
                          </td>

                          {/* Tipo y Valor de Descuento */}
                          <td className="py-3.5 px-4 font-mono">
                            {cupon.tipoDescuento === 0 ? (
                              <span className="text-emerald-400 font-bold">{cupon.valorDescuento}% OFF</span>
                            ) : (
                              <span className="text-emerald-400 font-bold">
                                -${cupon.valorDescuento.toLocaleString("es-AR")} ARS
                              </span>
                            )}
                          </td>

                          {/* Barra de progreso de usos */}
                          <td className="py-3.5 px-4 min-w-[140px]">
                            <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 mb-1">
                              <span>
                                {cupon.usosActuales} / {cupon.usosMaximos}
                              </span>
                              <span>{porcentajeUso}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  porcentajeUso >= 100
                                    ? "bg-red-500"
                                    : porcentajeUso > 70
                                    ? "bg-amber-400"
                                    : "bg-emerald-400"
                                }`}
                                style={{ width: `${Math.min(100, porcentajeUso)}%` }}
                              />
                            </div>
                          </td>

                          {/* Fechas de Vigencia */}
                          <td className="py-3.5 px-4 text-neutral-300 font-mono text-[11px]">
                            <div>
                              Hasta:{" "}
                              {new Date(cupon.fechaVencimiento).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </div>
                            <div className="mt-0.5">
                              {cupon.estaVigente ? (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Vigente
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/30">
                                  Caducado
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Switch Activo / Pausado */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => manejarAlternarEstadoCupon(cupon)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                cupon.activo
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-neutral-800 text-neutral-400 border border-white/10 hover:bg-neutral-700"
                              }`}
                            >
                              {cupon.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{cupon.activo ? "Activo" : "Pausado"}</span>
                            </button>
                          </td>

                          {/* Acciones */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => abrirEdicionCupon(cupon)}
                              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                              title="Editar cupón"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PESTAÑA 2: CAMPAÑAS COMERCIALES (BANNERS) */}
      {pestanaActiva === "campanas" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Banners y Campañas Estacionales</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Promociones globales que impactan automáticamente con un banner destacado en la web.
                </p>
              </div>
            </div>

            {cargandoCampanas ? (
              <div className="p-12 text-center text-neutral-400 text-sm">Cargando campañas...</div>
            ) : campanas.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-sm">
                No hay campañas comerciales registradas.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 font-mono">
                    <tr>
                      <th className="py-3 px-4">Clave</th>
                      <th className="py-3 px-4">Nombre Comercial</th>
                      <th className="py-3 px-4">Texto del Banner</th>
                      <th className="py-3 px-4">Descuento</th>
                      <th className="py-3 px-4">Vigencia</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campanas.map((campana) => (
                      <tr key={campana.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {campana.clave}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {campana.nombre}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-300 max-w-xs truncate font-mono text-[11px]">
                          {campana.textoBanner}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {campana.tipoDescuento === 0 ? (
                            <span className="text-emerald-400 font-bold">{campana.valorDescuento}% OFF</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">
                              -${campana.valorDescuento.toLocaleString("es-AR")} ARS
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                          Hasta {new Date(campana.fechaFin).toLocaleDateString("es-AR")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {campana.estaVigente ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Activa
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-white/10">
                              Finalizada
                            </span>
                          )}
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

      {/* 5. MODAL: CREAR NUEVO CUPÓN */}
      {modalNuevoCuponAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Nuevo Código de Descuento</h3>
              </div>
              <button
                onClick={() => setModalNuevoCuponAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarCrearCupon} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Código del Cupón (ej. BIENVENIDA20, CLIENTEPRO)
                </label>
                <input
                  type="text"
                  required
                  value={formNuevoCupon.codigo}
                  onChange={(e) => setFormNuevoCupon({ ...formNuevoCupon, codigo: e.target.value.toUpperCase() })}
                  placeholder="PROMO2026"
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Descripción Comercial (saldrá en el resumen del presupuesto)
                </label>
                <input
                  type="text"
                  required
                  value={formNuevoCupon.descripcion}
                  onChange={(e) => setFormNuevoCupon({ ...formNuevoCupon, descripcion: e.target.value })}
                  placeholder="10% de descuento de lanzamiento en desarrollo web"
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Tipo de Descuento</label>
                  <select
                    value={formNuevoCupon.tipoDescuento}
                    onChange={(e) =>
                      setFormNuevoCupon({ ...formNuevoCupon, tipoDescuento: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-[#0D121F] border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value={0}>Porcentaje (%)</option>
                    <option value={1}>Monto Fijo ($ ARS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Valor {formNuevoCupon.tipoDescuento === 0 ? "(%)" : "($ ARS)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={formNuevoCupon.tipoDescuento === 0 ? 100 : 10000000}
                    required
                    value={formNuevoCupon.valorDescuento}
                    onChange={(e) =>
                      setFormNuevoCupon({ ...formNuevoCupon, valorDescuento: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Cantidad Máxima de Usos Permitidos
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formNuevoCupon.usosMaximos}
                  onChange={(e) =>
                    setFormNuevoCupon({ ...formNuevoCupon, usosMaximos: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  El cupón se deshabilitará automáticamente tras alcanzar este número de canjes.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={formNuevoCupon.fechaInicio}
                    onChange={(e) => setFormNuevoCupon({ ...formNuevoCupon, fechaInicio: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={formNuevoCupon.fechaVencimiento}
                    onChange={(e) => setFormNuevoCupon({ ...formNuevoCupon, fechaVencimiento: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNuevoCuponAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCupon}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {guardandoCupon ? "Guardando..." : "Crear Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: EDITAR CUPÓN */}
      {cuponEnEdicion && formEditarCupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">
                  Editar Cupón: <span className="font-mono text-sky-400">{cuponEnEdicion.codigo}</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setCuponEnEdicion(null);
                  setFormEditarCupon(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardarEdicionCupon} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Descripción Comercial</label>
                <input
                  type="text"
                  required
                  value={formEditarCupon.descripcion}
                  onChange={(e) => setFormEditarCupon({ ...formEditarCupon, descripcion: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Tipo de Descuento</label>
                  <select
                    value={formEditarCupon.tipoDescuento}
                    onChange={(e) =>
                      setFormEditarCupon({ ...formEditarCupon, tipoDescuento: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-[#0D121F] border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value={0}>Porcentaje (%)</option>
                    <option value={1}>Monto Fijo ($ ARS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Valor {formEditarCupon.tipoDescuento === 0 ? "(%)" : "($ ARS)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={formEditarCupon.tipoDescuento === 0 ? 100 : 10000000}
                    required
                    value={formEditarCupon.valorDescuento}
                    onChange={(e) =>
                      setFormEditarCupon({ ...formEditarCupon, valorDescuento: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Cantidad Máxima de Usos Permitidos
                </label>
                <input
                  type="number"
                  min={cuponEnEdicion.usosActuales}
                  required
                  value={formEditarCupon.usosMaximos}
                  onChange={(e) =>
                    setFormEditarCupon({ ...formEditarCupon, usosMaximos: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Actualmente consumidos: {cuponEnEdicion.usosActuales} usos.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={formEditarCupon.fechaInicio}
                    onChange={(e) => setFormEditarCupon({ ...formEditarCupon, fechaInicio: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={formEditarCupon.fechaVencimiento}
                    onChange={(e) => setFormEditarCupon({ ...formEditarCupon, fechaVencimiento: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setCuponEnEdicion(null);
                    setFormEditarCupon(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCupon}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {guardandoCupon ? "Guardando..." : "Actualizar Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: NUEVA CAMPAÑA COMERCIAL */}
      {modalNuevaCampanaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Nueva Campaña Comercial</h3>
              </div>
              <button
                onClick={() => setModalNuevaCampanaAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarCrearCampana} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Clave (URL / Identificador)</label>
                  <input
                    type="text"
                    required
                    value={formNuevaCampana.clave}
                    onChange={(e) => setFormNuevaCampana({ ...formNuevaCampana, clave: e.target.value.toLowerCase() })}
                    placeholder="lanzamiento-2026"
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre de la Campaña</label>
                  <input
                    type="text"
                    required
                    value={formNuevaCampana.nombre}
                    onChange={(e) => setFormNuevaCampana({ ...formNuevaCampana, nombre: e.target.value })}
                    placeholder="Descuento de Lanzamiento"
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Texto del Banner Web (se mostrará en la cabecera de la página)
                </label>
                <input
                  type="text"
                  required
                  value={formNuevaCampana.textoBanner}
                  onChange={(e) => setFormNuevaCampana({ ...formNuevaCampana, textoBanner: e.target.value })}
                  placeholder="🚀 15% OFF en desarrollo web contratando antes de fin de mes"
                  className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Tipo de Descuento</label>
                  <select
                    value={formNuevaCampana.tipoDescuento}
                    onChange={(e) =>
                      setFormNuevaCampana({ ...formNuevaCampana, tipoDescuento: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-[#0D121F] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value={0}>Porcentaje (%)</option>
                    <option value={1}>Monto Fijo ($ ARS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Valor</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formNuevaCampana.valorDescuento}
                    onChange={(e) =>
                      setFormNuevaCampana({ ...formNuevaCampana, valorDescuento: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={formNuevaCampana.fechaInicio}
                    onChange={(e) => setFormNuevaCampana({ ...formNuevaCampana, fechaInicio: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    required
                    value={formNuevaCampana.fechaFin}
                    onChange={(e) => setFormNuevaCampana({ ...formNuevaCampana, fechaFin: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNuevaCampanaAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCampana}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {guardandoCampana ? "Guardando..." : "Crear Campaña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
