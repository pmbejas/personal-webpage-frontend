"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { servicioClientes } from "@/services/clientes.service";
import { RegistrarPagoRequest, servicioProyectos } from "@/services/proyectos.service";
import {
  ActualizarClienteRequest,
  ClienteDetalleResponse,
  ClienteListadoResponse,
  CrearClienteRequest,
  EstadoRegistroClienteFiltro,
  FiltrosClientesRequest,
  OrdenClientesFiltro,
} from "@/types";
import { extraerMensajeError } from "@/utils/formatosClientes";
import { ClienteConfirmacionEstado } from "@/components/clientes/ModalConfirmarEstadoCliente";

const TAMANIO_PAGINA_CLIENTES = 12;
const RETARDO_DEBOUNCE_MS = 320;

function resolverFiltroActivo(estado: EstadoRegistroClienteFiltro): boolean | undefined {
  if (estado === "activos") {
    return true;
  }
  if (estado === "archivados") {
    return false;
  }
  return undefined;
}

/**
 * Custom hook que centraliza todo el estado, filtros, paginación y acciones CRUD del módulo Clientes.
 */
export function useClientes() {
  const [clientes, setClientes] = useState<ClienteListadoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros y paginación (por defecto solo activos)
  const [busqueda, setBusqueda] = useState<string>("");
  const [busquedaAplicada, setBusquedaAplicada] = useState<string>("");
  const [estadoRegistro, setEstadoRegistro] = useState<EstadoRegistroClienteFiltro>("activos");
  const [soloConSaldoPendiente, setSoloConSaldoPendiente] = useState<boolean>(false);
  const [ordenarPor, setOrdenarPor] = useState<OrdenClientesFiltro>("recientes");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);

  // Ficha 360°
  const [clienteDetalle, setClienteDetalle] = useState<ClienteDetalleResponse | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);

  // Modales y acciones en curso
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState<boolean>(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteDetalleResponse | null>(null);
  const [clienteParaCambiarEstado, setClienteParaCambiarEstado] =
    useState<ClienteConfirmacionEstado | null>(null);
  const [clienteParaEliminar, setClienteParaEliminar] = useState<ClienteListadoResponse | null>(null);
  const [guardandoFormulario, setGuardandoFormulario] = useState<boolean>(false);
  const [guardandoNotas, setGuardandoNotas] = useState<boolean>(false);
  const [modalPagoAbierto, setModalPagoAbierto] = useState<boolean>(false);
  const [guardandoPago, setGuardandoPago] = useState<boolean>(false);
  const [descargandoPdfCuentaCorriente, setDescargandoPdfCuentaCorriente] = useState<boolean>(false);
  const [procesandoAccionId, setProcesandoAccionId] = useState<string | null>(null);

  // Debounce de búsqueda textual
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setPaginaActual(1);
    }, RETARDO_DEBOUNCE_MS);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const filtros: FiltrosClientesRequest = {
        terminoBusqueda: busquedaAplicada || undefined,
        activo: resolverFiltroActivo(estadoRegistro),
        soloConSaldoPendiente: soloConSaldoPendiente || undefined,
        ordenarPor,
        pagina: paginaActual,
        tamanioPagina: TAMANIO_PAGINA_CLIENTES,
      };

      const resultadoPaginado = await servicioClientes.listar(filtros);

      setClientes(resultadoPaginado.elementos);
      setTotalRegistros(resultadoPaginado.totalRegistros);
      setTotalPaginas(Math.max(1, resultadoPaginado.totalPaginas));
    } catch (error: unknown) {
      const mensaje = extraerMensajeError(
        error,
        "No se pudieron cargar los clientes. Verificá la conexión con la API."
      );
      setErrorCarga(mensaje);
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  }, [busquedaAplicada, estadoRegistro, soloConSaldoPendiente, ordenarPor, paginaActual]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cambiarEstadoRegistro = (nuevoEstado: EstadoRegistroClienteFiltro) => {
    setEstadoRegistro(nuevoEstado);
    setPaginaActual(1);
  };

  const cambiarSoloConSaldoPendiente = (activoFiltro: boolean) => {
    setSoloConSaldoPendiente(activoFiltro);
    setPaginaActual(1);
  };

  const cambiarOrden = (nuevoOrden: OrdenClientesFiltro) => {
    setOrdenarPor(nuevoOrden);
    setPaginaActual(1);
  };

  const abrirDetalle = async (id: string) => {
    try {
      setCargandoDetalle(true);
      const detalle = await servicioClientes.obtenerPorId(id);
      setClienteDetalle(detalle);
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo cargar la ficha del cliente."));
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    setClienteDetalle(null);
    setModalPagoAbierto(false);
  };

  const abrirModalRegistrarPago = () => {
    if (!clienteDetalle) return;
    setModalPagoAbierto(true);
  };

  const cerrarModalRegistrarPago = () => {
    setModalPagoAbierto(false);
  };

  const registrarPagoCliente = async (proyectoId: string, datos: RegistrarPagoRequest) => {
    const clienteIdActual = clienteDetalle?.id;
    try {
      setGuardandoPago(true);
      await servicioProyectos.agregarPago(proyectoId, datos);
      toast.success("Pago registrado e imputado al proyecto correctamente.");
      setModalPagoAbierto(false);

      if (clienteIdActual) {
        const detalleActualizado = await servicioClientes.obtenerPorId(clienteIdActual);
        setClienteDetalle(detalleActualizado);
      }
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo registrar el pago."));
    } finally {
      setGuardandoPago(false);
    }
  };

  const descargarCuentaCorrientePdf = async () => {
    if (!clienteDetalle || descargandoPdfCuentaCorriente) return;

    const nombreBase =
      clienteDetalle.apellido && clienteDetalle.nombre
        ? `${clienteDetalle.apellido}_${clienteDetalle.nombre}`
        : clienteDetalle.nombreCompleto;

    try {
      setDescargandoPdfCuentaCorriente(true);
      await servicioClientes.descargarCuentaCorrientePdf(clienteDetalle.id, nombreBase);
      toast.success("PDF de cuenta corriente descargado correctamente.");
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo generar el PDF de la cuenta corriente."));
    } finally {
      setDescargandoPdfCuentaCorriente(false);
    }
  };

  const abrirModalCrear = () => {
    setClienteEditando(null);
    setModalFormularioAbierto(true);
  };

  const abrirModalEditarDesdeListado = async (id: string) => {
    try {
      setProcesandoAccionId(id);
      const detalle = await servicioClientes.obtenerPorId(id);
      setClienteEditando(detalle);
      setModalFormularioAbierto(true);
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudieron cargar los datos para editar."));
    } finally {
      setProcesandoAccionId(null);
    }
  };

  const abrirModalEditarDesdeDetalle = (detalle: ClienteDetalleResponse) => {
    setClienteEditando(detalle);
    setModalFormularioAbierto(true);
  };

  const cerrarModalFormulario = () => {
    setModalFormularioAbierto(false);
    setClienteEditando(null);
  };

  const guardarCliente = async (datos: CrearClienteRequest | ActualizarClienteRequest) => {
    try {
      setGuardandoFormulario(true);
      if (clienteEditando) {
        const actualizado = await servicioClientes.actualizar(clienteEditando.id, datos);
        toast.success("Ficha del cliente actualizada correctamente.");
        if (clienteDetalle?.id === actualizado.id) {
          setClienteDetalle(actualizado);
        }
      } else {
        await servicioClientes.crear(datos);
        toast.success("Cliente registrado exitosamente.");
      }

      cerrarModalFormulario();
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo guardar el cliente."));
    } finally {
      setGuardandoFormulario(false);
    }
  };

  const guardarNotasRapidas = async (id: string, notasInternas: string) => {
    try {
      setGuardandoNotas(true);
      await servicioClientes.actualizarNotas(id, { notasInternas });
      setClienteDetalle((previo) =>
        previo && previo.id === id ? { ...previo, notasInternas } : previo
      );
      toast.success("Notas internas guardadas.");
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudieron guardar las notas internas."));
    } finally {
      setGuardandoNotas(false);
    }
  };

  const solicitarCambioEstado = (cliente: ClienteConfirmacionEstado) => {
    setClienteParaCambiarEstado(cliente);
  };

  const cerrarConfirmacionEstado = () => {
    setClienteParaCambiarEstado(null);
  };

  const alternarEstadoActivo = async (id: string) => {
    try {
      setProcesandoAccionId(id);
      const nuevoEstado = await servicioClientes.alternarEstadoActivo(id);
      toast.success(nuevoEstado ? "Cliente reactivado correctamente." : "Cliente archivado correctamente.");

      if (clienteDetalle?.id === id) {
        setClienteDetalle((previo) => (previo ? { ...previo, activo: nuevoEstado } : previo));
      }
      if (clienteParaEliminar?.id === id) {
        setClienteParaEliminar(null);
      }
      if (clienteParaCambiarEstado?.id === id) {
        setClienteParaCambiarEstado(null);
      }

      await cargarDatos();
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo cambiar el estado del cliente."));
    } finally {
      setProcesandoAccionId(null);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!clienteParaCambiarEstado) {
      return;
    }

    await alternarEstadoActivo(clienteParaCambiarEstado.id);
  };

  const abrirWhatsApp = async (id: string) => {
    try {
      setProcesandoAccionId(id);
      const urlWhatsApp = await servicioClientes.obtenerEnlaceWhatsApp(id);
      if (urlWhatsApp) {
        window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
      }
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo generar el enlace de WhatsApp."));
    } finally {
      setProcesandoAccionId(null);
    }
  };

  const confirmarEliminacion = async () => {
    if (!clienteParaEliminar) {
      return;
    }

    const clienteId = clienteParaEliminar.id;
    try {
      setProcesandoAccionId(clienteId);
      await servicioClientes.eliminar(clienteId);
      toast.success("Cliente eliminado definitivamente.");

      if (clienteDetalle?.id === clienteId) {
        setClienteDetalle(null);
      }
      setClienteParaEliminar(null);
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(extraerMensajeError(error, "No se pudo eliminar el cliente."));
    } finally {
      setProcesandoAccionId(null);
    }
  };

  return {
    clientes,
    cargando,
    errorCarga,
    busqueda,
    setBusqueda,
    estadoRegistro,
    cambiarEstadoRegistro,
    soloConSaldoPendiente,
    cambiarSoloConSaldoPendiente,
    ordenarPor,
    cambiarOrden,
    paginaActual,
    setPaginaActual,
    totalRegistros,
    totalPaginas,
    clienteDetalle,
    cargandoDetalle,
    abrirDetalle,
    cerrarDetalle,
    modalFormularioAbierto,
    clienteEditando,
    abrirModalCrear,
    abrirModalEditarDesdeListado,
    abrirModalEditarDesdeDetalle,
    cerrarModalFormulario,
    guardarCliente,
    guardandoFormulario,
    guardarNotasRapidas,
    guardandoNotas,
    modalPagoAbierto,
    guardandoPago,
    abrirModalRegistrarPago,
    cerrarModalRegistrarPago,
    registrarPagoCliente,
    descargandoPdfCuentaCorriente,
    descargarCuentaCorrientePdf,
    alternarEstadoActivo,
    clienteParaCambiarEstado,
    solicitarCambioEstado,
    cerrarConfirmacionEstado,
    confirmarCambioEstado,
    abrirWhatsApp,
    clienteParaEliminar,
    setClienteParaEliminar,
    confirmarEliminacion,
    procesandoAccionId,
    recargar: cargarDatos,
  };
}
