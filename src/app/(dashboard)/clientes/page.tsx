"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { TablaClientes } from "@/components/clientes/TablaClientes";
import { ModalFormularioCliente } from "@/components/clientes/ModalFormularioCliente";
import { PanelDetalleCliente } from "@/components/clientes/PanelDetalleCliente";
import { ModalConfirmarEliminacionCliente } from "@/components/clientes/ModalConfirmarEliminacionCliente";
import { CabeceraPaginaAdmin } from "@/components/layout/CabeceraPaginaAdmin";
import {
  EstadoRegistroClienteFiltro,
  OrdenClientesFiltro,
} from "@/types";

export default function ClientesPage() {
  const router = useRouter();
  const {
    clientes,
    cargando,
    errorCarga,
    busqueda,
    setBusqueda,
    estadoRegistro,
    cambiarEstadoRegistro,
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
    alternarEstadoActivo,
    abrirWhatsApp,
    clienteParaEliminar,
    setClienteParaEliminar,
    confirmarEliminacion,
    procesandoAccionId,
    recargar,
  } = useClientes();

  const abrirNuevoProyectoParaCliente = (clienteId: string) => {
    router.push(`/proyectos?nuevoProyecto=1&clienteId=${encodeURIComponent(clienteId)}`);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado compacto en barra superior */}
      <CabeceraPaginaAdmin
        titulo="Clientes & CRM"
        subtitulo="Cartera comercial, datos fiscales e historial 360° de operaciones."
        icono={<Users className="w-4 h-4" />}
        acciones={
          <>
            <button
              type="button"
              onClick={recargar}
              disabled={cargando}
              aria-label="Actualizar listado de clientes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={abrirModalCrear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_16px_rgba(2,132,199,0.25)] transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo cliente</span>
            </button>
          </>
        }
      />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono, empresa, rubro, CUIT/CUIL o ubicación..."
            aria-label="Buscar clientes"
            className="w-full bg-[#07090E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:w-auto">
          <select
            value={estadoRegistro}
            onChange={(e) => cambiarEstadoRegistro(e.target.value as EstadoRegistroClienteFiltro)}
            aria-label="Filtrar por estado"
            className="bg-[#07090E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
          >
            <option value="activos">Activos</option>
            <option value="archivados">Archivados</option>
            <option value="todos">Todos</option>
          </select>

          <select
            value={ordenarPor}
            onChange={(e) => cambiarOrden(e.target.value as OrdenClientesFiltro)}
            aria-label="Ordenar clientes"
            className="bg-[#07090E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
          >
            <option value="recientes">Más recientes</option>
            <option value="ultima_actividad">Última actividad</option>
            <option value="mayor_facturacion">Mayor facturación</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Tabla / Tarjetas */}
      <TablaClientes
        clientes={clientes}
        cargando={cargando}
        errorCarga={errorCarga}
        procesandoAccionId={procesandoAccionId}
        onVerDetalle={abrirDetalle}
        onCrearProyecto={abrirNuevoProyectoParaCliente}
        onWhatsApp={abrirWhatsApp}
        onEditar={abrirModalEditarDesdeListado}
        onAlternarEstado={alternarEstadoActivo}
        onSolicitarEliminar={setClienteParaEliminar}
        onCrearPrimero={abrirModalCrear}
        onReintentar={recargar}
      />

      {/* Paginación */}
      {!cargando && totalRegistros > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-neutral-400">
          <span className="font-mono">
            Mostrando {clientes.length} de {totalRegistros} registro(s) · Página {paginaActual} de{" "}
            {totalPaginas}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaginaActual((actual) => Math.max(1, actual - 1))}
              disabled={paginaActual <= 1}
              aria-label="Página anterior"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              onClick={() => setPaginaActual((actual) => Math.min(totalPaginas, actual + 1))}
              disabled={paginaActual >= totalPaginas}
              aria-label="Página siguiente"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 transition-colors disabled:opacity-40"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modales y Panel Lateral 360° */}
      <ModalFormularioCliente
        abierto={modalFormularioAbierto}
        clienteEditando={clienteEditando}
        guardando={guardandoFormulario}
        onCerrar={cerrarModalFormulario}
        onGuardar={guardarCliente}
      />

      <PanelDetalleCliente
        cliente={clienteDetalle}
        cargando={cargandoDetalle}
        guardandoNotas={guardandoNotas}
        procesandoEstado={Boolean(clienteDetalle && procesandoAccionId === clienteDetalle.id)}
        onCerrar={cerrarDetalle}
        onCrearProyecto={abrirNuevoProyectoParaCliente}
        onEditar={abrirModalEditarDesdeDetalle}
        onAlternarEstado={alternarEstadoActivo}
        onGuardarNotas={guardarNotasRapidas}
      />

      <ModalConfirmarEliminacionCliente
        cliente={clienteParaEliminar}
        procesando={Boolean(clienteParaEliminar && procesandoAccionId === clienteParaEliminar.id)}
        onCerrar={() => setClienteParaEliminar(null)}
        onConfirmarEliminar={confirmarEliminacion}
        onArchivarEnSuLugar={alternarEstadoActivo}
      />
    </div>
  );
}
