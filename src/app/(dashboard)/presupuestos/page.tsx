"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileSpreadsheet,
  Search,
  Download,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  X,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Tag,
  Calendar,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Percent,
  Calculator,
  Edit3,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  servicioPresupuestos,
  PresupuestoListadoAdminDto,
  PresupuestoDetalleAdminDto,
  EstadisticasPresupuestosAdminDto,
  FiltrosPresupuestosDto,
  CrearPresupuestoManualDto,
  PresupuestoItemManualDto,
} from "@/services/presupuestos.service";
import {
  servicioCatalogo,
  ServicioBaseAdmin,
  AdicionalAdmin,
} from "@/services/catalogo.service";

// Mapeo amigable de Estados de Presupuesto
const ESTADOS_MAPA: Record<number, { etiqueta: string; color: string; badgeClase: string }> = {
  1: {
    etiqueta: "Borrador",
    color: "neutral",
    badgeClase: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  2: {
    etiqueta: "Enviado / Pendiente",
    color: "amber",
    badgeClase: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  3: {
    etiqueta: "Señado (50%)",
    color: "sky",
    badgeClase: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  },
  4: {
    etiqueta: "Aprobado",
    color: "emerald",
    badgeClase: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  5: {
    etiqueta: "Rechazado",
    color: "rose",
    badgeClase: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
  6: {
    etiqueta: "Vencido",
    color: "neutral",
    badgeClase: "bg-neutral-800 text-neutral-400 border-neutral-700",
  },
};

export default function PresupuestosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Cargando bandeja de presupuestos y cotizaciones...</span>
        </div>
      }
    >
      <PresupuestosContenido />
    </Suspense>
  );
}

function PresupuestosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado de listado y métricas
  const [presupuestos, setPresupuestos] = useState<PresupuestoListadoAdminDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPresupuestosAdminDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<number | undefined>(undefined);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  const tamanioPagina = 12;

  // Modal de Detalle
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<PresupuestoDetalleAdminDto | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);
  const [descargandoPdfId, setDescargandoPdfId] = useState<string | null>(null);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  // Modal Constructor & Reajuste
  const [modalConstructorAbierto, setModalConstructorAbierto] = useState<boolean>(false);
  const [esReajuste, setEsReajuste] = useState<boolean>(false);
  const [presupuestoOriginalId, setPresupuestoOriginalId] = useState<string | null>(null);
  const [presupuestoOriginalCodigo, setPresupuestoOriginalCodigo] = useState<string | null>(null);
  const [citaIdVinculada, setCitaIdVinculada] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Catálogo de Productos y Agregados
  const [catalogoServicios, setCatalogoServicios] = useState<ServicioBaseAdmin[]>([]);
  const [catalogoAdicionales, setCatalogoAdicionales] = useState<AdicionalAdmin[]>([]);
  const [servicioBaseSeleccionadoId, setServicioBaseSeleccionadoId] = useState<string>("");
  const [idsCompatiblesSeleccionados, setIdsCompatiblesSeleccionados] = useState<string[]>([]);
  const [cargandoCompatibles, setCargandoCompatibles] = useState<boolean>(false);
  const [mostrarTodosLosAdicionales, setMostrarTodosLosAdicionales] = useState<boolean>(false);
  const [adicionalSeleccionadoId, setAdicionalSeleccionadoId] = useState<string>("");
  const [cantidadSeccionesExtra, setCantidadSeccionesExtra] = useState<number>(1);
  const [modoDescuento, setModoDescuento] = useState<"porcentaje" | "montoFijo">("porcentaje");

  const [formConstructor, setFormConstructor] = useState<CrearPresupuestoManualDto>({
    clienteId: null,
    clienteNombre: "",
    clienteEmail: "",
    clienteTelefonoWhatsApp: "",
    clienteEmpresa: "",
    clienteRubro: "",
    servicioPrincipal: "",
    tiempoEntregaDias: 15,
    descripcionNecesidad: "",
    porcentajeDescuento: 0,
    montoDescuentoFijo: 0,
    items: [],
  });

  // Carga del Catálogo de Productos y Agregados
  const cargarCatalogo = useCallback(async () => {
    try {
      const [servicios, adicionales] = await Promise.all([
        servicioCatalogo.obtenerTodosLosServicios(),
        servicioCatalogo.obtenerTodosLosAdicionales(),
      ]);
      setCatalogoServicios(servicios.filter((s) => s.activo));
      setCatalogoAdicionales(adicionales.filter((a) => a.activo));
    } catch (err) {
      console.error("Error al cargar catálogo para presupuesto:", err);
    }
  }, []);

  // Carga de presupuestos
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const filtros: FiltrosPresupuestosDto = {
        terminoBusqueda: busqueda.trim() || undefined,
        estado: filtroEstado,
        pagina: paginaActual,
        tamanioPagina,
      };

      const [resultadoPaginado, stats] = await Promise.all([
        servicioPresupuestos.listar(filtros),
        servicioPresupuestos.obtenerEstadisticas(),
      ]);

      setPresupuestos(resultadoPaginado.elementos);
      setTotalRegistros(resultadoPaginado.totalRegistros);
      setEstadisticas(stats);
    } catch (err: unknown) {
      console.error("Error al cargar presupuestos:", err);
      setErrorCarga("No se pudieron cargar los presupuestos. Verificá la conexión con la API.");
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroEstado, paginaActual]);

  useEffect(() => {
    cargarDatos();
    cargarCatalogo();
  }, [cargarDatos, cargarCatalogo]);

  // Manejo de Modal de Detalle
  const abrirDetalle = async (id: string) => {
    try {
      setCargandoDetalle(true);
      const detalle = await servicioPresupuestos.obtenerPorId(id);
      setPresupuestoSeleccionado(detalle);
    } catch (err) {
      console.error("Error al obtener detalle del presupuesto:", err);
      mostrarFeedback("Error al abrir el detalle del presupuesto.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Descarga de PDF
  const descargarPdf = async (id: string, codigo: string) => {
    try {
      setDescargandoPdfId(id);
      await servicioPresupuestos.descargarPdf(id, codigo);
      mostrarFeedback(`Presupuesto ${codigo} descargado con éxito.`);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      mostrarFeedback("No se pudo generar o descargar el PDF.");
    } finally {
      setDescargandoPdfId(null);
    }
  };

  // Apertura de WhatsApp
  const abrirWhatsApp = async (id: string) => {
    try {
      const urlWa = await servicioPresupuestos.obtenerEnlaceWhatsApp(id);
      if (urlWa) {
        window.open(urlWa, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Error al obtener enlace de WhatsApp:", err);
      mostrarFeedback("No se pudo generar el enlace de WhatsApp.");
    }
  };

  // Cambio de estado (Aprobar o Rechazar)
  const cambiarEstado = async (id: string, nuevoEstado: number) => {
    try {
      await servicioPresupuestos.actualizarEstado(id, nuevoEstado);
      mostrarFeedback("Estado del presupuesto actualizado correctamente.");

      if (presupuestoSeleccionado && presupuestoSeleccionado.id === id) {
        setPresupuestoSeleccionado({
          ...presupuestoSeleccionado,
          estado: nuevoEstado,
        });
      }

      await cargarDatos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      mostrarFeedback("No se pudo actualizar el estado del presupuesto.");
    }
  };

  const mostrarFeedback = (mensaje: string) => {
    setMensajeFeedback(mensaje);
    setTimeout(() => setMensajeFeedback(null), 4000);
  };

  // Abrir Constructor en Modo Nuevo Presupuesto
  const abrirModalConstructorNuevo = () => {
    setEsReajuste(false);
    setPresupuestoOriginalId(null);
    setPresupuestoOriginalCodigo(null);
    setCitaIdVinculada(null);
    setServicioBaseSeleccionadoId("");
    setIdsCompatiblesSeleccionados([]);
    setAdicionalSeleccionadoId("");
    setCantidadSeccionesExtra(1);
    setModoDescuento("porcentaje");
    cargarCatalogo();
    setFormConstructor({
      clienteId: null,
      clienteNombre: "",
      clienteEmail: "",
      clienteTelefonoWhatsApp: "",
      clienteEmpresa: "",
      clienteRubro: "",
      servicioPrincipal: "",
      tiempoEntregaDias: 15,
      descripcionNecesidad: "",
      porcentajeDescuento: 0,
      montoDescuentoFijo: 0,
      items: [],
    });
    setModalConstructorAbierto(true);
  };

  // Selección de Producto del Catálogo (carga compatibilidades)
  const seleccionarProductoCatalogo = async (servicioId: string) => {
    setServicioBaseSeleccionadoId(servicioId);
    if (!servicioId) {
      setIdsCompatiblesSeleccionados([]);
      return;
    }
    try {
      setCargandoCompatibles(true);
      const ids = await servicioCatalogo.obtenerCompatibilidades(servicioId);
      setIdsCompatiblesSeleccionados(ids || []);
    } catch (err) {
      console.error("Error al cargar compatibilidades:", err);
      setIdsCompatiblesSeleccionados([]);
    } finally {
      setCargandoCompatibles(false);
    }
  };

  // Producto Base Actual Seleccionado en el Dropdown
  const servicioBaseActual = useMemo(() => {
    return catalogoServicios.find((s) => s.id === servicioBaseSeleccionadoId);
  }, [catalogoServicios, servicioBaseSeleccionadoId]);

  // Producto Base que ya está presente en la lista de ítems cotizados
  const productoBaseEnPresupuesto = useMemo(() => {
    const itemBase = formConstructor.items.find((i) => i.tipoItem === 1);
    if (!itemBase) return null;
    return catalogoServicios.find((s) => s.nombre === itemBase.concepto) || null;
  }, [formConstructor.items, catalogoServicios]);

  // Servicio Base Activo (prioriza el que está cotizado en la grilla o el seleccionado en el dropdown)
  const servicioBaseActivo = useMemo(() => {
    return productoBaseEnPresupuesto || servicioBaseActual;
  }, [productoBaseEnPresupuesto, servicioBaseActual]);

  // Detección de Producto a Medida (Costo $0)
  const esProductoCostoCero = useMemo(() => {
    if (servicioBaseActivo) {
      return servicioBaseActivo.precioBase === 0;
    }
    const itemBase = formConstructor.items.find((i) => i.tipoItem === 1);
    return itemBase ? itemBase.precioUnitario === 0 : false;
  }, [servicioBaseActivo, formConstructor.items]);

  // Agregar Producto Principal del Catálogo Explícitamente al Presupuesto
  const agregarProductoPrincipalAlPresupuesto = () => {
    if (!servicioBaseSeleccionadoId || !servicioBaseActual) {
      mostrarFeedback("Por favor seleccioná un producto del catálogo primero.");
      return;
    }

    const nuevoItemBase: PresupuestoItemManualDto = {
      tipoItem: 1, // ServicioBase
      concepto: servicioBaseActual.nombre,
      precioUnitario: servicioBaseActual.precioBase,
      cantidad: 1,
      diasAdicionales: 0,
      detalle: servicioBaseActual.descripcionPresupuesto || servicioBaseActual.descripcionComercial,
    };

    setFormConstructor((prev) => {
      const nuevoServicioPrincipal = servicioBaseActual.nombre;
      const nuevoTiempo = servicioBaseActual.diasEntregaBase || 15;

      const itemsSinBase = prev.items.filter((i) => i.tipoItem !== 1);

      return {
        ...prev,
        servicioPrincipal: nuevoServicioPrincipal,
        tiempoEntregaDias: nuevoTiempo,
        items: [nuevoItemBase, ...itemsSinBase],
      };
    });

    const esCero = servicioBaseActual.precioBase === 0;
    mostrarFeedback(
      esCero
        ? `Producto a medida "${servicioBaseActual.nombre}" agregado. Fijá el importe acordado en la grilla de ítems.`
        : `Producto "${servicioBaseActual.nombre}" agregado con éxito al presupuesto.`
    );

    // Ocultar la ficha reseteando el selector
    setServicioBaseSeleccionadoId("");
  };

  // Agregar Secciones Adicionales asociadas al producto
  const agregarSeccionesExtraAlPresupuesto = () => {
    if (!servicioBaseActivo) return;
    const cant = Math.max(1, cantidadSeccionesExtra);
    const diasSumar = cant * (servicioBaseActivo.diasPorSeccionExtra || 1);

    const nuevoItemSeccion: PresupuestoItemManualDto = {
      tipoItem: 2, // SeccionExtra
      concepto: `${cant} Secciones Adicionales (${servicioBaseActivo.nombre})`,
      precioUnitario: servicioBaseActivo.precioSeccionExtra,
      cantidad: cant,
      diasAdicionales: diasSumar,
      detalle: `Ampliación de ${cant} sección(es) sobre las ${servicioBaseActivo.seccionesIncluidas} incluidas`,
    };

    setFormConstructor((prev) => ({
      ...prev,
      tiempoEntregaDias: prev.tiempoEntregaDias + diasSumar,
      items: [...prev.items, nuevoItemSeccion],
    }));

    mostrarFeedback(`${cant} secciones adicionales sumadas (+${diasSumar} días).`);
  };

  // Lista de Adicionales Filtrados por Compatibilidad
  const adicionalesCompatiblesDisponibles = useMemo(() => {
    if (mostrarTodosLosAdicionales || idsCompatiblesSeleccionados.length === 0) {
      return catalogoAdicionales;
    }
    return catalogoAdicionales.filter((a) => idsCompatiblesSeleccionados.includes(a.id));
  }, [catalogoAdicionales, idsCompatiblesSeleccionados, mostrarTodosLosAdicionales]);

  // Agregar Adicional Seleccionado
  const agregarAdicionalSeleccionado = () => {
    if (!adicionalSeleccionadoId) {
      mostrarFeedback("Por favor seleccioná un agregado para sumar.");
      return;
    }
    const adicional = catalogoAdicionales.find((a) => a.id === adicionalSeleccionadoId);
    if (!adicional) return;

    const nuevoItemAdicional: PresupuestoItemManualDto = {
      tipoItem: 3, // Adicional
      concepto: adicional.nombre,
      precioUnitario: adicional.precio,
      cantidad: 1,
      diasAdicionales: adicional.diasEntregaExtra || 0,
      detalle: adicional.descripcionComercial,
    };

    setFormConstructor((prev) => ({
      ...prev,
      tiempoEntregaDias: prev.tiempoEntregaDias + (adicional.diasEntregaExtra || 0),
      items: [...prev.items, nuevoItemAdicional],
    }));

    mostrarFeedback(`Agregado "${adicional.nombre}" sumado al presupuesto (+${adicional.diasEntregaExtra || 0} días).`);
    setAdicionalSeleccionadoId("");
  };

  // Agregar Módulo Manual Libre
  const agregarModuloManual = () => {
    setFormConstructor((prev) => ({
      ...prev,
      tiempoEntregaDias: prev.tiempoEntregaDias + 2,
      items: [
        ...prev.items,
        {
          tipoItem: 3, // Adicional
          concepto: "Módulo o Característica Personalizada",
          precioUnitario: 50000,
          cantidad: 1,
          diasAdicionales: 2,
          detalle: "Desarrollo a medida según requerimiento pactado",
        },
      ],
    }));
    mostrarFeedback("Fila de módulo manual agregada. Podés editar su nombre, precio y días.");
  };

  // Abrir Constructor en Modo Reajuste (clona ítems y cancelará el viejo al emitir)
  const abrirModalReajustar = async (id: string, citaId?: string) => {
    try {
      setCargandoDetalle(true);
      const detalle = await servicioPresupuestos.obtenerPorId(id);
      setEsReajuste(true);
      setPresupuestoOriginalId(id);
      setPresupuestoOriginalCodigo(detalle.codigo);
      setCitaIdVinculada(citaId || null);
      setServicioBaseSeleccionadoId("");
      cargarCatalogo();

      setFormConstructor({
        clienteId: detalle.cliente.id || null,
        clienteNombre: detalle.cliente.nombreCompleto,
        clienteEmail: detalle.cliente.email,
        clienteTelefonoWhatsApp: detalle.cliente.telefonoWhatsApp,
        clienteEmpresa: detalle.cliente.empresa || "",
        clienteRubro: detalle.cliente.rubro || "",
        servicioPrincipal: `Reajuste de Cotización #${detalle.codigo}`,
        tiempoEntregaDias: detalle.tiempoEntregaDias,
        descripcionNecesidad: detalle.descripcionNecesidad || "",
        porcentajeDescuento: 0,
        montoDescuentoFijo: 0,
        items: detalle.items.map((i) => ({
          tipoItem: i.tipoItem,
          concepto: i.concepto,
          precioUnitario: i.precioUnitario,
          cantidad: i.cantidad,
          diasAdicionales: i.diasAdicionales,
          detalle: i.detalle || "",
        })),
      });

      setPresupuestoSeleccionado(null);
      setModalConstructorAbierto(true);
    } catch (err) {
      console.error("Error al cargar presupuesto para reajustar:", err);
      mostrarFeedback("No se pudo cargar la cotización para reajuste.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Detección de Parámetros URL (reajustar o nuevaCitaId)
  useEffect(() => {
    const reajustarId = searchParams.get("reajustar");
    const paramCitaId = searchParams.get("citaId");
    const nuevaCitaId = searchParams.get("nuevaCitaId");

    if (reajustarId) {
      abrirModalReajustar(reajustarId, paramCitaId || undefined);
    } else if (nuevaCitaId) {
      setEsReajuste(false);
      setPresupuestoOriginalId(null);
      setPresupuestoOriginalCodigo(null);
      setCitaIdVinculada(nuevaCitaId);
      setServicioBaseSeleccionadoId("");
      cargarCatalogo();
      setFormConstructor((prev) => ({
        ...prev,
        clienteNombre: searchParams.get("clienteNombre") || "",
        clienteEmail: searchParams.get("clienteEmail") || "",
        clienteTelefonoWhatsApp: searchParams.get("clienteTelefono") || "",
        clienteEmpresa: searchParams.get("empresa") || "",
        descripcionNecesidad: searchParams.get("necesidad") || "",
        servicioPrincipal: "Desarrollo de Solución a Medida",
      }));
      setModalConstructorAbierto(true);
    }
  }, [searchParams]);

  // Manejo de Ítems en el Constructor
  const agregarFilaItem = () => {
    setFormConstructor((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          tipoItem: 3, // Adicional
          concepto: "Módulo o Característica Adicional",
          precioUnitario: 50000,
          cantidad: 1,
          diasAdicionales: 2,
          detalle: "",
        },
      ],
    }));
  };

  const eliminarFilaItem = (indice: number) => {
    const itemAEliminar = formConstructor.items[indice];
    const diasARestar = itemAEliminar.diasAdicionales || 0;

    setFormConstructor((prev) => ({
      ...prev,
      tiempoEntregaDias: Math.max(1, prev.tiempoEntregaDias - diasARestar),
      items: prev.items.filter((_, idx) => idx !== indice),
    }));
  };

  const actualizarFilaItem = (
    indice: number,
    campo: keyof PresupuestoItemManualDto,
    valor: string | number
  ) => {
    setFormConstructor((prev) => {
      const nuevosItems = [...prev.items];
      nuevosItems[indice] = {
        ...nuevosItems[indice],
        [campo]: valor,
      };
      return { ...prev, items: nuevosItems };
    });
  };

  // Cálculos reactivos de montos y descuentos
  const subtotalCalculado = useMemo(() => {
    return formConstructor.items.reduce(
      (acc, item) => acc + (item.precioUnitario || 0) * (item.cantidad || 1),
      0
    );
  }, [formConstructor.items]);

  const montoDescuentoCalculado = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      const porcentaje = Math.max(0, Math.min(100, formConstructor.porcentajeDescuento || 0));
      return Math.round(subtotalCalculado * (porcentaje / 100));
    }
    const montoFijo = Math.max(0, formConstructor.montoDescuentoFijo || 0);
    return Math.min(subtotalCalculado, montoFijo);
  }, [subtotalCalculado, modoDescuento, formConstructor.porcentajeDescuento, formConstructor.montoDescuentoFijo]);

  const totalFinalCalculado = useMemo(() => {
    return Math.max(0, subtotalCalculado - montoDescuentoCalculado);
  }, [subtotalCalculado, montoDescuentoCalculado]);

  const montoSenaCalculada = useMemo(() => {
    return Math.round(totalFinalCalculado * 0.5);
  }, [totalFinalCalculado]);

  // Validación estricta para habilitar la confirmación del presupuesto
  const formularioConstructorInvalido = useMemo(() => {
    if (!formConstructor.clienteNombre.trim()) {
      return "Completá el nombre completo del cliente";
    }
    if (!formConstructor.clienteEmail.trim()) {
      return "Completá el correo electrónico del cliente";
    }
    if (!formConstructor.clienteTelefonoWhatsApp.trim()) {
      return "Completá el teléfono WhatsApp del cliente";
    }
    if (formConstructor.items.length === 0) {
      return "Agregá al menos un producto al presupuesto";
    }
    const tieneItemConPrecioCero = formConstructor.items.some(
      (i) => (i.precioUnitario || 0) <= 0
    );
    if (tieneItemConPrecioCero) {
      return "Hay ítems con precio $0; definí el importe en la grilla";
    }
    if (totalFinalCalculado <= 0) {
      return "El total del presupuesto debe ser mayor a $0";
    }
    return null;
  }, [formConstructor, totalFinalCalculado]);

  // Guardar Presupuesto (Manual o Reajuste)
  const guardarPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConstructor.clienteNombre.trim()) {
      mostrarFeedback("El nombre completo del cliente es requerido.");
      return;
    }
    if (!formConstructor.clienteEmail.trim()) {
      mostrarFeedback("El correo electrónico del cliente es requerido.");
      return;
    }
    if (!formConstructor.clienteTelefonoWhatsApp.trim()) {
      mostrarFeedback("El teléfono WhatsApp del cliente es requerido.");
      return;
    }
    if (formConstructor.items.length === 0) {
      mostrarFeedback("Debés agregar al menos un ítem al presupuesto seleccionando un producto del catálogo.");
      return;
    }
    const tieneItemConPrecioCero = formConstructor.items.some((i) => (i.precioUnitario || 0) <= 0);
    if (tieneItemConPrecioCero) {
      mostrarFeedback("Hay ítems con precio $0. Ingresá el importe acordado en la grilla antes de emitir.");
      return;
    }
    if (totalFinalCalculado <= 0) {
      mostrarFeedback("El presupuesto no puede emitirse con un total de $0. Verificá los precios de los ítems.");
      return;
    }

    try {
      setGuardando(true);
      const porcentajeFinal = modoDescuento === "porcentaje" ? formConstructor.porcentajeDescuento : 0;
      const montoFijoFinal =
        modoDescuento === "montoFijo"
          ? Math.min(subtotalCalculado, formConstructor.montoDescuentoFijo || 0)
          : 0;

      if (esReajuste && presupuestoOriginalId) {
        const nuevoPres = await servicioPresupuestos.reajustar(presupuestoOriginalId, {
          tiempoEntregaDias: formConstructor.tiempoEntregaDias,
          descripcionNecesidad: formConstructor.descripcionNecesidad,
          porcentajeDescuento: porcentajeFinal,
          montoDescuentoFijo: montoFijoFinal,
          items: formConstructor.items,
          citaId: citaIdVinculada || undefined,
        });
        mostrarFeedback(
          `Presupuesto reajustado emitido con éxito: #${nuevoPres.codigo}. El presupuesto previo #${presupuestoOriginalCodigo} quedó cancelado.`
        );
      } else {
        const datosEnvio: CrearPresupuestoManualDto = {
          ...formConstructor,
          porcentajeDescuento: porcentajeFinal,
          montoDescuentoFijo: montoFijoFinal,
        };
        const nuevoPres = await servicioPresupuestos.crearManual(datosEnvio);
        mostrarFeedback(
          `Presupuesto formal #${nuevoPres.codigo} emitido exitosamente con snapshot y PDF firmado.`
        );
      }

      setModalConstructorAbierto(false);
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar presupuesto:", err);
      mostrarFeedback("No se pudo emitir el presupuesto.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificación Feedback flotante */}
      {mensajeFeedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-sky-950/95 border border-sky-500/40 text-sky-200 text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{mensajeFeedback}</span>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            Bandeja de Presupuestos & Cotizaciones
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Gestión inmutable, reajustes con versión nueva, descuentos en porcentaje y emisión de PDFs formales.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={abrirModalConstructorNuevo}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Presupuesto</span>
          </button>

          <button
            type="button"
            onClick={() => cargarDatos()}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-sky-400" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 4 Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Total Emitidos</span>
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {estadisticas ? estadisticas.totalPresupuestos : "—"}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Histórico de propuestas</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Volumen Cotizado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono truncate">
            ${estadisticas ? estadisticas.montoTotalCotizado.toLocaleString("es-AR") : "—"}{" "}
            <span className="text-xs font-normal text-neutral-400">ARS</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Monto bruto presupuestado</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Aprobadas / Conversión</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {estadisticas ? estadisticas.presupuestosAprobados : "—"}
            <span className="text-xs font-normal text-neutral-400 ml-2">
              ({estadisticas ? estadisticas.tasaConversionAprobados : 0}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Tasa de cierre de proyectos</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121F] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Pendientes / Vencidos</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300 font-mono">
            {estadisticas ? estadisticas.presupuestosPendientes : "—"}
            <span className="text-xs font-normal text-neutral-500 ml-2">
              / {estadisticas ? estadisticas.presupuestosVencidos : 0} venc.
            </span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">En seguimiento comercial</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0D121F] border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar por código, cliente, empresa o email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFiltroEstado(undefined)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === undefined
                ? "bg-white/10 text-white font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(2)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 2
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Enviados
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(4)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 4
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Aprobados
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado(5)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filtroEstado === 5
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Rechazados
          </button>
        </div>
      </div>

      {/* Tabla de Presupuestos (Estilo Cebra) */}
      <div className="rounded-2xl bg-[#0D121F] border border-white/10 overflow-hidden shadow-xl">
        {cargando ? (
          <div className="p-12 text-center text-neutral-400 text-sm flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs">Cargando propuestas comerciales...</span>
          </div>
        ) : errorCarga ? (
          <div className="p-12 text-center text-rose-400 text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>{errorCarga}</span>
          </div>
        ) : presupuestos.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            No se encontraron presupuestos registrados con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/10 text-neutral-300 font-mono">
                <tr>
                  <th className="py-3 px-4">Código & Fecha</th>
                  <th className="py-3 px-4">Cliente / Empresa</th>
                  <th className="py-3 px-4">Servicio Principal</th>
                  <th className="py-3 px-4">Total Cotizado</th>
                  <th className="py-3 px-4 text-center">Vigencia</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {presupuestos.map((p) => {
                  const estadoInfo = ESTADOS_MAPA[p.estado] || {
                    etiqueta: "Desconocido",
                    color: "neutral",
                    badgeClase: "bg-neutral-800 text-neutral-400 border-neutral-700",
                  };

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-white/[0.08] odd:bg-white/[0.015] even:bg-white/[0.045] hover:bg-sky-500/[0.08] transition-colors duration-150"
                    >
                      {/* Código & Fecha */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-mono font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                          <span>#{p.codigo}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {new Date(p.fechaCreacion).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Cliente / Empresa */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-semibold text-white">{p.clienteNombre}</div>
                        {p.clienteEmpresa && (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-neutral-500" />
                            <span>{p.clienteEmpresa}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[180px]">
                          {p.clienteEmail}
                        </div>
                      </td>

                      {/* Servicio Principal */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-medium text-neutral-200">{p.servicioPrincipal}</div>
                        {p.promocionAplicada && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            <Tag className="w-2.5 h-2.5" />
                            {p.promocionAplicada}
                          </span>
                        )}
                      </td>

                      {/* Total Presupuestado */}
                      <td className="py-4 px-4 align-middle font-mono">
                        <div className="font-bold text-white text-sm">
                          ${p.totalPresupuestado.toLocaleString("es-AR")}
                        </div>
                        {p.montoDescuento > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            Desc. -${p.montoDescuento.toLocaleString("es-AR")}
                          </div>
                        )}
                        <div className="text-[10px] text-neutral-400">
                          Seña: ${p.montoSenaSugerida.toLocaleString("es-AR")}
                        </div>
                      </td>

                      {/* Vigencia */}
                      <td className="py-4 px-4 text-center align-middle font-mono text-xs">
                        {p.estaVencido ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]">
                            Vencido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-white/10 text-[10px]">
                            <Clock className="w-2.5 h-2.5 text-sky-400" />
                            {p.diasRestantes === 1 ? "1 día rest." : `${p.diasRestantes} días rest.`}
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4 text-center align-middle">
                        <span
                          className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold border ${estadoInfo.badgeClase}`}
                        >
                          {estadoInfo.etiqueta}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ver Ficha Detalle */}
                          <button
                            type="button"
                            onClick={() => abrirDetalle(p.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Reajustar Cotización */}
                          <button
                            type="button"
                            onClick={() => abrirModalReajustar(p.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Reajustar presupuesto (cancela el actual y emite nueva versión)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Descargar PDF */}
                          <button
                            type="button"
                            onClick={() => descargarPdf(p.id, p.codigo)}
                            disabled={descargandoPdfId === p.id}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Descargar presupuesto PDF (QuestPDF)"
                          >
                            <Download
                              className={`w-4 h-4 ${
                                descargandoPdfId === p.id ? "animate-bounce text-sky-400" : ""
                              }`}
                            />
                          </button>

                          {/* WhatsApp Directo */}
                          <button
                            type="button"
                            onClick={() => abrirWhatsApp(p.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Contactar al cliente por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FICHA DE DETALLE DEL PRESUPUESTO                                 */}
      {/* ========================================================================= */}
      {presupuestoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Presupuesto #{presupuestoSeleccionado.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPresupuestoSeleccionado(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Información del Cliente */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white text-sm">
                    {presupuestoSeleccionado.cliente.nombreCompleto}
                  </div>
                  {presupuestoSeleccionado.cliente.empresa && (
                    <span className="text-neutral-400">
                      {presupuestoSeleccionado.cliente.empresa}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-400 font-mono">
                  <div>Email: {presupuestoSeleccionado.cliente.email}</div>
                  <div>WhatsApp: {presupuestoSeleccionado.cliente.telefonoWhatsApp}</div>
                </div>
              </div>

              {/* Necesidad / Objetivos */}
              {presupuestoSeleccionado.descripcionNecesidad && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono text-neutral-400">
                    Necesidad planteada por el cliente:
                  </div>
                  <div className="text-neutral-200">
                    {presupuestoSeleccionado.descripcionNecesidad}
                  </div>
                </div>
              )}

              {/* Tabla de Ítems */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 font-mono text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Concepto</th>
                      <th className="p-2.5 text-center">Cant.</th>
                      <th className="p-2.5 text-right">Precio Unit.</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {presupuestoSeleccionado.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5">
                          <div className="font-sans font-medium text-white">{item.concepto}</div>
                          {item.detalle && (
                            <div className="text-[11px] text-neutral-400 font-sans">{item.detalle}</div>
                          )}
                        </td>
                        <td className="p-2.5 text-center text-neutral-300">{item.cantidad}</td>
                        <td className="p-2.5 text-right text-neutral-300">
                          ${item.precioUnitario.toLocaleString("es-AR")}
                        </td>
                        <td className="p-2.5 text-right font-bold text-white">
                          ${item.subtotal.toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales y Descuentos */}
              <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-1.5 font-mono">
                {presupuestoSeleccionado.montoDescuento > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Descuento aplicado:</span>
                    <span>-${presupuestoSeleccionado.montoDescuento.toLocaleString("es-AR")} ARS</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-sky-500/20">
                  <span>Total Final Presupuestado:</span>
                  <span className="text-sky-400 text-base">
                    ${presupuestoSeleccionado.totalPresupuestado.toLocaleString("es-AR")} ARS
                  </span>
                </div>

                <div className="flex justify-between text-xs text-neutral-300 pt-1">
                  <span className="text-neutral-400">Seña sugerida para inicio (50%):</span>
                  <span className="font-semibold text-emerald-400">
                    ${presupuestoSeleccionado.montoSenaSugerida.toLocaleString("es-AR")} ARS
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
                  <span>Plazo estimado de entrega:</span>
                  <span className="text-white">{presupuestoSeleccionado.tiempoEntregaDias} días hábiles</span>
                </div>
              </div>
            </div>

            {/* Acciones en el Pie del Modal */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Botón Descargar PDF */}
                <button
                  type="button"
                  onClick={() =>
                    descargarPdf(presupuestoSeleccionado.id, presupuestoSeleccionado.codigo)
                  }
                  disabled={descargandoPdfId === presupuestoSeleccionado.id}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Descargar PDF</span>
                </button>

                {/* Botón WhatsApp */}
                <button
                  type="button"
                  onClick={() => abrirWhatsApp(presupuestoSeleccionado.id)}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>

                {/* Botón Reajustar Cotización */}
                <button
                  type="button"
                  onClick={() => {
                    const id = presupuestoSeleccionado.id;
                    abrirModalReajustar(id);
                  }}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Emitir nueva versión con modificaciones o descuento"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Reajustar</span>
                </button>
              </div>

              {/* Botón para cambiar estado */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {presupuestoSeleccionado.estado !== 4 && (
                  <button
                    type="button"
                    onClick={() => cambiarEstado(presupuestoSeleccionado.id, 4)}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar Presupuesto</span>
                  </button>
                )}

                {presupuestoSeleccionado.estado !== 5 && presupuestoSeleccionado.estado !== 4 && (
                  <button
                    type="button"
                    onClick={() => cambiarEstado(presupuestoSeleccionado.id, 5)}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONSTRUCTOR Y REAJUSTE DE PRESUPUESTOS (NUEVA VERSIÓN)          */}
      {/* ========================================================================= */}
      {modalConstructorAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0D121F] border border-white/10 shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  {esReajuste
                    ? `Reajustar Presupuesto #${presupuestoOriginalCodigo} (Nueva Versión)`
                    : "Emisión de Nuevo Presupuesto Formal"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalConstructorAbierto(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarPresupuesto} className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
              {/* Alerta de Inmutabilidad al Reajustar */}
              {esReajuste && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-white">Regla Estricta de Inmutabilidad Comercial</div>
                    <p className="text-[11px] leading-relaxed text-amber-300/90">
                      Al confirmar este reajuste, el presupuesto original #{presupuestoOriginalCodigo} quedará formalmente cancelado/rechazado en auditoría, y se emitirá una nueva cotización correlativa con sus propios cálculos, snapshot y PDF.
                    </p>
                  </div>
                </div>
              )}

              {/* Sección 1: Datos del Cliente */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5 uppercase tracking-wide">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. Datos del Cliente / Destinatario</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={formConstructor.clienteNombre}
                      onChange={(e) =>
                        setFormConstructor({ ...formConstructor, clienteNombre: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="juan@empresa.com"
                      value={formConstructor.clienteEmail}
                      onChange={(e) =>
                        setFormConstructor({ ...formConstructor, clienteEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Teléfono WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+54 9 381 ..."
                      value={formConstructor.clienteTelefonoWhatsApp}
                      onChange={(e) =>
                        setFormConstructor({
                          ...formConstructor,
                          clienteTelefonoWhatsApp: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Empresa / Negocio</label>
                    <input
                      type="text"
                      placeholder="Nombre de la empresa"
                      value={formConstructor.clienteEmpresa || ""}
                      onChange={(e) =>
                        setFormConstructor({ ...formConstructor, clienteEmpresa: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PASO 2: PRODUCTO PRINCIPAL DEL CATÁLOGO                                   */}
              {/* ========================================================================= */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>2. Producto Principal Cotizado</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Elegí el producto del catálogo y sumalo a la cotización con el botón de agregar.
                  </p>
                </div>

                {/* Selector de Catálogo y Preview */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#090D16] border border-white/10">
                  <label className="block text-sky-300 font-semibold text-xs">
                    Seleccionar Producto del Catálogo:
                  </label>
                  <select
                    value={servicioBaseSeleccionadoId}
                    onChange={(e) => seleccionarProductoCatalogo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D121F] border border-sky-500/40 text-white font-medium text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="" className="bg-[#0D121F] text-neutral-400">
                      -- Seleccionar Producto del Catálogo (Landing, Web, E-commerce, A Medida...) --
                    </option>
                    {catalogoServicios.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0D121F] text-white py-1.5">
                        {s.nombre} {s.precioBase === 0 ? "— A Medida / A Convenir" : `— $${s.precioBase.toLocaleString("es-AR")} ARS`} ({s.diasEntregaBase} días hábiles)
                      </option>
                    ))}
                  </select>

                  {/* Preview del Producto Seleccionado con Botón de Agregar Explícito */}
                  {servicioBaseActual && !formConstructor.items.some((i) => i.tipoItem === 1 && i.concepto === servicioBaseActual.nombre) && (
                    <div className="p-3.5 rounded-xl bg-[#0D121F] border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{servicioBaseActual.nombre}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                            {servicioBaseActual.diasEntregaBase} días hábiles base
                          </span>
                          {servicioBaseActual.precioBase === 0 ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                              Desarrollo a Medida / Personalizado
                            </span>
                          ) : (
                            servicioBaseActual.seccionesIncluidas > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 font-mono">
                                {servicioBaseActual.seccionesIncluidas} secciones incluidas
                              </span>
                            )
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          {servicioBaseActual.descripcionPresupuesto || servicioBaseActual.descripcionComercial}
                        </p>
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {servicioBaseActual.precioBase === 0
                            ? "Costo Base: A Convenir (se define libremente en la grilla de ítems)"
                            : `Precio Oficial: $${servicioBaseActual.precioBase.toLocaleString("es-AR")} ARS`}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={agregarProductoPrincipalAlPresupuesto}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-sky-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Producto Principal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PASO 3: DESCRIPCIÓN & ALCANCE DEL PROYECTO                                */}
              {/* ========================================================================= */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. Descripción & Alcance del Proyecto</span>
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Detallá los requerimientos técnicos, objetivos acordados y notas del proyecto.
                </p>

                <textarea
                  rows={3}
                  placeholder="Objetivos pactados en la reunión, requerimientos técnicos, integraciones contempladas..."
                  value={formConstructor.descripcionNecesidad || ""}
                  onChange={(e) =>
                    setFormConstructor({
                      ...formConstructor,
                      descripcionNecesidad: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500 leading-relaxed text-xs"
                />
              </div>

              {/* ========================================================================= */}
              {/* PASO 4: AGREGADOS Y SECCIONES ADICIONALES                                 */}
              {/* ========================================================================= */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                  <div>
                    <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5 uppercase tracking-wide">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>4. Agregados y Secciones Adicionales</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {esProductoCostoCero
                        ? "Desarrollo a medida / personalizado (costo $0)."
                        : "Sumá secciones adicionales o agregados compatibles con el producto principal seleccionado."}
                    </p>
                  </div>

                  {!esProductoCostoCero && (
                    <button
                      type="button"
                      onClick={agregarModuloManual}
                      className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      <span>+ Agregar Módulo Manual</span>
                    </button>
                  )}
                </div>

                {esProductoCostoCero ? (
                  <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/20 text-sky-200 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      El producto cotizado es un desarrollo a medida / personalizado (costo base $0). No aplican agregados de catálogo; el alcance técnico se define en la descripción superior y el importe convenido se fija directamente en la grilla de ítems a continuación.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sub-bloque A: Secciones Adicionales si el producto lo permite */}
                    {servicioBaseActivo && servicioBaseActivo.permiteSeccionesExtra && (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-300 text-xs">
                              Secciones Extra para {servicioBaseActivo.nombre}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 font-mono">
                              {servicioBaseActivo.seccionesIncluidas} base incluidas
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-300">
                            Precio oficial: ${servicioBaseActivo.precioSeccionExtra.toLocaleString("es-AR")} (+{servicioBaseActivo.diasPorSeccionExtra} días c/u).
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-400 text-[11px]">Cantidad:</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={cantidadSeccionesExtra}
                              onChange={(e) => setCantidadSeccionesExtra(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-14 px-2 py-1.5 rounded-xl bg-[#0D121F] border border-emerald-500/40 text-emerald-300 font-mono font-bold text-center text-xs focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={agregarSeccionesExtraAlPresupuesto}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Sumar (+${(cantidadSeccionesExtra * servicioBaseActivo.precioSeccionExtra).toLocaleString("es-AR")})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sub-bloque B: Agregados Compatibles del Catálogo */}
                    <div className="p-3.5 rounded-2xl bg-[#090D16] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-indigo-300 font-semibold text-xs">
                          Agregados del Catálogo:
                        </label>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                          {servicioBaseActivo && !mostrarTodosLosAdicionales && idsCompatiblesSeleccionados.length > 0 && (
                            <span>Compatibles con {servicioBaseActivo.nombre}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setMostrarTodosLosAdicionales(!mostrarTodosLosAdicionales)}
                            className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                          >
                            {mostrarTodosLosAdicionales ? "Ver solo compatibles" : "Ver todos los agregados"}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <select
                          value={adicionalSeleccionadoId}
                          onChange={(e) => setAdicionalSeleccionadoId(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-[#0D121F] border border-indigo-500/40 text-white font-medium text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                        >
                          <option value="" className="bg-[#0D121F] text-neutral-400">
                            -- Seleccionar Agregado para Sumar --
                          </option>
                          {adicionalesCompatiblesDisponibles.map((ad) => (
                            <option key={ad.id} value={ad.id} className="bg-[#0D121F] text-white py-1.5">
                              + {ad.nombre} (+${ad.precio.toLocaleString("es-AR")} ARS | +{ad.diasEntregaExtra} días)
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={agregarAdicionalSeleccionado}
                          disabled={!adicionalSeleccionadoId}
                          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Sumar Agregado</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ========================================================================= */}
              {/* PASO 5: LISTA ORDENADA Y DESPEJADA DE ÍTEMS COTIZADOS                     */}
              {/* ========================================================================= */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h4 className="font-bold text-white text-xs font-mono flex items-center gap-1.5 uppercase tracking-wide">
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>5. Ítems Cotizados en el Presupuesto ({formConstructor.items.length})</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Valores modificables en vivo
                  </span>
                </div>

                {formConstructor.items.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-neutral-500 mx-auto" />
                    <p className="text-neutral-300 font-medium text-xs">
                      Aún no sumaste ítems a la cotización.
                    </p>
                    <p className="text-neutral-500 text-[11px]">
                      Elegí un producto del catálogo en el Paso 2 y hacé clic en &quot;+ Agregar Producto Principal&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {formConstructor.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#090D16] border border-white/10 hover:border-white/20 transition-all space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* 1. Concepto y Días Abajo */}
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              required
                              placeholder="Nombre o concepto del ítem..."
                              value={item.concepto}
                              onChange={(e) =>
                                actualizarFilaItem(idx, "concepto", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs focus:outline-none focus:border-sky-500"
                            />
                            <div className="flex items-center gap-2 mt-1 px-1">
                              <span className="flex items-center gap-1 text-[11px] font-mono text-sky-400">
                                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                                {item.tipoItem === 1 ? (
                                  <span>Plazo base ({formConstructor.tiempoEntregaDias} días)</span>
                                ) : (
                                  <span>+{item.diasAdicionales || 0} días adicionales</span>
                                )}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-400 font-mono">
                                {item.tipoItem === 1
                                  ? "Producto Principal"
                                  : item.tipoItem === 2
                                  ? "Sección Extra"
                                  : "Agregado"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* 2. Precio Unitario Modificable */}
                            <div className="w-28 sm:w-32">
                              <div className="text-[10px] text-neutral-400 font-mono mb-1">Precio Unit. ($)</div>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  required
                                  value={item.precioUnitario}
                                  onChange={(e) =>
                                    actualizarFilaItem(
                                      idx,
                                      "precioUnitario",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 text-right"
                                />
                              </div>
                            </div>

                            {/* 3. Cantidad */}
                            <div className="w-16">
                              <div className="text-[10px] text-neutral-400 font-mono mb-1 text-center">Cant.</div>
                              <input
                                type="number"
                                min="1"
                                required
                                value={item.cantidad}
                                onChange={(e) =>
                                  actualizarFilaItem(
                                    idx,
                                    "cantidad",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs text-center focus:outline-none focus:border-sky-500"
                              />
                            </div>

                            {/* 4. Total del Ítem */}
                            <div className="w-24 text-right">
                              <div className="text-[10px] text-neutral-400 font-mono mb-1">Total Ítem</div>
                              <div className="text-sm font-bold font-mono text-white py-1">
                                ${((item.precioUnitario || 0) * (item.cantidad || 1)).toLocaleString("es-AR")}
                              </div>
                            </div>

                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              onClick={() => eliminarFilaItem(idx)}
                              className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer mt-3 sm:mt-0"
                              title="Eliminar este ítem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Detalle o notas opcionales colapsables */}
                        <div className="pt-0.5">
                          {item.detalle ? (
                            <div className="flex items-center justify-between text-[11px] text-neutral-400 bg-black/30 rounded-lg px-2.5 py-1">
                              <span className="truncate max-w-xl">{item.detalle}</span>
                              <button
                                type="button"
                                onClick={() => actualizarFilaItem(idx, "detalle", "")}
                                className="text-neutral-500 hover:text-neutral-300 ml-2 cursor-pointer"
                                title="Quitar nota"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const texto = prompt("Ingresá una nota o detalle técnico para este ítem:", "");
                                if (texto !== null) actualizarFilaItem(idx, "detalle", texto.trim());
                              }}
                              className="text-[10px] text-neutral-500 hover:text-neutral-300 font-sans transition-colors cursor-pointer"
                            >
                              + Agregar nota técnica opcional
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 4: Descuento & Resumen Financiero en Vivo */}
              <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-500/20">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white text-xs">Descuento Especial</span>
                      <p className="text-[11px] text-neutral-400">
                        Elegí modalidad: porcentaje (%) o monto fijo ($ ARS). Mutuamente excluyentes.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
                    {/* Selector de Modo de Descuento (Excluyente) */}
                    <div className="flex items-center bg-black/40 p-1 rounded-xl border border-sky-500/30">
                      <button
                        type="button"
                        onClick={() => {
                          setModoDescuento("porcentaje");
                          setFormConstructor((prev) => ({ ...prev, montoDescuentoFijo: 0 }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          modoDescuento === "porcentaje"
                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        % Porcentaje
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModoDescuento("montoFijo");
                          setFormConstructor((prev) => ({ ...prev, porcentajeDescuento: 0 }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          modoDescuento === "montoFijo"
                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        $ Monto Fijo
                      </button>
                    </div>

                    {/* Input según modo seleccionado */}
                    {modoDescuento === "porcentaje" ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={formConstructor.porcentajeDescuento || 0}
                          onChange={(e) =>
                            setFormConstructor({
                              ...formConstructor,
                              porcentajeDescuento: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                              montoDescuentoFijo: 0,
                            })
                          }
                          className="w-20 px-3 py-1.5 rounded-xl bg-white/5 border border-sky-500/40 text-emerald-400 text-sm font-bold font-mono text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="font-mono text-emerald-400 font-bold text-xs">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          max={subtotalCalculado}
                          step="1000"
                          value={formConstructor.montoDescuentoFijo || 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            setFormConstructor({
                              ...formConstructor,
                              montoDescuentoFijo: Math.min(subtotalCalculado, val),
                              porcentajeDescuento: 0,
                            });
                          }}
                          className="w-28 px-3 py-1.5 rounded-xl bg-white/5 border border-sky-500/40 text-emerald-400 text-sm font-bold font-mono text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="font-mono text-emerald-400 font-bold text-xs">ARS</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen Calculado */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-neutral-400 uppercase">Subtotal Bruto</div>
                    <div className="text-sm font-bold text-white mt-1">
                      ${subtotalCalculado.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-300 uppercase">
                      {modoDescuento === "porcentaje"
                        ? `Descuento (${formConstructor.porcentajeDescuento}%)`
                        : "Descuento (Fijo ARS)"}
                    </div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      -${montoDescuentoCalculado.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30">
                    <div className="text-[10px] text-sky-300 uppercase font-bold">Total Final</div>
                    <div className="text-base font-bold text-sky-400 mt-0.5">
                      ${totalFinalCalculado.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-neutral-400 uppercase">Seña Sugerida (50%)</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      ${montoSenaCalculada.toLocaleString("es-AR")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Envío */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  {formularioConstructorInvalido && (
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{formularioConstructorInvalido}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalConstructorAbierto(false)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando || !!formularioConstructorInvalido}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:pointer-events-none text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {guardando
                        ? "Emitiendo..."
                        : esReajuste
                        ? "Confirmar Reajuste y Emitir Nueva Cotización"
                        : "Emitir Presupuesto Formal"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
