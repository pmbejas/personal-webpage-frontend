"use client";

import React, { useEffect, useState } from "react";
import { X, Save, UserPlus, Edit3, ExternalLink, LocateFixed, Loader2 } from "lucide-react";
import {
  ActualizarClienteRequest,
  ClienteDetalleResponse,
  CrearClienteRequest,
  RubroClienteResponse,
} from "@/types";
import { servicioMantenimiento } from "@/services/mantenimiento.service";
import { construirUrlGoogleMaps } from "@/utils/formatosClientes";

interface ModalFormularioClienteProps {
  abierto: boolean;
  clienteEditando: ClienteDetalleResponse | null;
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (datos: CrearClienteRequest | ActualizarClienteRequest) => Promise<void>;
}

interface EstadoFormularioCliente {
  apellido: string;
  nombre: string;
  email: string;
  telefonoWhatsApp: string;
  empresa: string;
  rubroId: string;
  rubro: string;
  cuitCuil: string;
  domicilioCalle1: string;
  domicilioCalle2: string;
  localidad: string;
  ubicacion: string;
  notasInternas: string;
}

const ESTADO_INICIAL: EstadoFormularioCliente = {
  apellido: "",
  nombre: "",
  email: "",
  telefonoWhatsApp: "",
  empresa: "",
  rubroId: "",
  rubro: "",
  cuitCuil: "",
  domicilioCalle1: "",
  domicilioCalle2: "",
  localidad: "",
  ubicacion: "",
  notasInternas: "",
};

const CLASE_INPUT =
  "w-full bg-[#07090E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors";

export function ModalFormularioCliente({
  abierto,
  clienteEditando,
  guardando,
  onCerrar,
  onGuardar,
}: ModalFormularioClienteProps) {
  const [formulario, setFormulario] = useState<EstadoFormularioCliente>(ESTADO_INICIAL);
  const [rubrosDisponibles, setRubrosDisponibles] = useState<RubroClienteResponse[]>([]);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState<boolean>(false);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    let activo = true;
    servicioMantenimiento
      .obtenerRubros(true)
      .then((lista) => {
        if (activo) {
          const ordenados = [...(lista || [])].sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
          );
          setRubrosDisponibles(ordenados);
        }
      })
      .catch(() => {
        if (activo) {
          setRubrosDisponibles([]);
        }
      });

    return () => {
      activo = false;
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    setErrorLocal(null);
    if (clienteEditando) {
      setFormulario({
        apellido: clienteEditando.apellido ?? "",
        nombre: clienteEditando.nombre || clienteEditando.nombreCompleto || "",
        email: clienteEditando.email,
        telefonoWhatsApp: clienteEditando.telefonoWhatsApp,
        empresa: clienteEditando.empresa ?? "",
        rubroId: clienteEditando.rubroId ?? "",
        rubro: clienteEditando.rubro ?? "",
        cuitCuil: clienteEditando.cuitCuil ?? "",
        domicilioCalle1: clienteEditando.domicilioCalle1 ?? "",
        domicilioCalle2: clienteEditando.domicilioCalle2 ?? "",
        localidad: clienteEditando.localidad ?? "",
        ubicacion: clienteEditando.ubicacion ?? "",
        notasInternas: clienteEditando.notasInternas ?? "",
      });
    } else {
      setFormulario(ESTADO_INICIAL);
    }
  }, [abierto, clienteEditando]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !guardando) {
        onCerrar();
      }
    };

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, guardando, onCerrar]);

  if (!abierto) {
    return null;
  }

  const actualizarCampo = (campo: keyof EstadoFormularioCliente, valor: string) => {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
  };

  const capturarUbicacionActual = () => {
    setErrorLocal(null);

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setErrorLocal("Tu navegador no soporta la obtención automática de ubicación.");
      return;
    }

    setObteniendoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const latitud = posicion.coords.latitude.toFixed(6);
        const longitud = posicion.coords.longitude.toFixed(6);
        actualizarCampo("ubicacion", `${latitud}, ${longitud}`);
        setObteniendoUbicacion(false);
      },
      (errorGeo) => {
        setObteniendoUbicacion(false);
        if (errorGeo.code === errorGeo.PERMISSION_DENIED) {
          setErrorLocal("Permiso de ubicación denegado. Habilitalo en tu navegador para capturar las coordenadas.");
        } else if (errorGeo.code === errorGeo.POSITION_UNAVAILABLE) {
          setErrorLocal("No se pudo determinar la ubicación actual del dispositivo.");
        } else if (errorGeo.code === errorGeo.TIMEOUT) {
          setErrorLocal("Se agotó el tiempo de espera al obtener la ubicación. Intentá nuevamente.");
        } else {
          setErrorLocal("No se pudo obtener la ubicación actual del dispositivo.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const manejarEnvio = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorLocal(null);

    if (!formulario.apellido.trim()) {
      setErrorLocal("El apellido es obligatorio.");
      return;
    }
    if (!formulario.nombre.trim()) {
      setErrorLocal("El nombre es obligatorio.");
      return;
    }
    if (!formulario.email.trim() || !formulario.email.includes("@")) {
      setErrorLocal("Ingresá un correo electrónico válido.");
      return;
    }
    if (!formulario.telefonoWhatsApp.trim()) {
      setErrorLocal("El teléfono de WhatsApp es obligatorio.");
      return;
    }

    const nombreLimpio = formulario.nombre.trim();
    const apellidoLimpio = formulario.apellido.trim();

    const cargaUtil: CrearClienteRequest = {
      apellido: apellidoLimpio,
      nombre: nombreLimpio,
      nombreCompleto: `${nombreLimpio} ${apellidoLimpio}`.trim(),
      email: formulario.email.trim(),
      telefonoWhatsApp: formulario.telefonoWhatsApp.trim(),
      empresa: formulario.empresa.trim() || null,
      rubroId: formulario.rubroId || null,
      rubro: formulario.rubro.trim() || null,
      cuitCuil: formulario.cuitCuil.trim() || null,
      domicilioCalle1: formulario.domicilioCalle1.trim() || null,
      domicilioCalle2: formulario.domicilioCalle2.trim() || null,
      localidad: formulario.localidad.trim() || null,
      ubicacion: formulario.ubicacion.trim() || null,
      notasInternas: formulario.notasInternas.trim() || null,
    };

    await onGuardar(cargaUtil);
  };

  const esEdicion = Boolean(clienteEditando);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-cliente"
    >
      <div className="bg-[#0B0F17] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              {esEdicion ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="titulo-modal-cliente" className="text-base font-semibold text-white">
                {esEdicion ? "Editar ficha de cliente" : "Registrar nuevo cliente"}
              </h2>
              <p className="text-xs text-neutral-400">
                Completá los datos de contacto, información fiscal y notas internas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar formulario de cliente"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="p-6 space-y-4 overflow-y-auto">
          {errorLocal && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorLocal}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Apellido *
              </label>
              <input
                type="text"
                value={formulario.apellido}
                onChange={(e) => actualizarCampo("apellido", e.target.value)}
                placeholder="Ej: González"
                maxLength={100}
                required
                aria-label="Apellido del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => actualizarCampo("nombre", e.target.value)}
                placeholder="Ej: Martín"
                maxLength={100}
                required
                aria-label="Nombre del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={formulario.email}
                onChange={(e) => actualizarCampo("email", e.target.value)}
                placeholder="martin@empresa.com"
                maxLength={150}
                required
                aria-label="Correo electrónico del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Teléfono WhatsApp *
              </label>
              <input
                type="tel"
                value={formulario.telefonoWhatsApp}
                onChange={(e) => actualizarCampo("telefonoWhatsApp", e.target.value)}
                placeholder="+54 9 381 400 0000"
                maxLength={50}
                required
                aria-label="Teléfono de WhatsApp del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Empresa / Marca
              </label>
              <input
                type="text"
                value={formulario.empresa}
                onChange={(e) => actualizarCampo("empresa", e.target.value)}
                placeholder="Ej: Estudio Norte S.A."
                maxLength={150}
                aria-label="Empresa o marca del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Rubro
              </label>
              <select
                value={
                  formulario.rubroId ||
                  rubrosDisponibles.find(
                    (r) => r.nombre.toLowerCase() === formulario.rubro.trim().toLowerCase()
                  )?.id ||
                  (formulario.rubro ? "__actual__" : "")
                }
                onChange={(e) => {
                  const idSeleccionado = e.target.value;
                  if (!idSeleccionado) {
                    setFormulario((previo) => ({ ...previo, rubroId: "", rubro: "" }));
                    return;
                  }
                  if (idSeleccionado === "__actual__") {
                    return;
                  }
                  const rubroEncontrado = rubrosDisponibles.find((r) => r.id === idSeleccionado);
                  setFormulario((previo) => ({
                    ...previo,
                    rubroId: idSeleccionado,
                    rubro: rubroEncontrado?.nombre ?? previo.rubro,
                  }));
                }}
                aria-label="Rubro comercial del cliente"
                className={CLASE_INPUT}
              >
                <option value="">-- Sin rubro asignado --</option>
                {formulario.rubro &&
                  !rubrosDisponibles.some(
                    (r) => r.nombre.toLowerCase() === formulario.rubro.trim().toLowerCase()
                  ) && (
                    <option value="__actual__">{formulario.rubro} (actual)</option>
                  )}
                {rubrosDisponibles.map((rubro) => (
                  <option key={rubro.id} value={rubro.id}>
                    {rubro.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                CUIT / CUIL o ID Fiscal
              </label>
              <input
                type="text"
                value={formulario.cuitCuil}
                onChange={(e) => actualizarCampo("cuitCuil", e.target.value)}
                placeholder="Ej: 20-34567890-1"
                maxLength={20}
                aria-label="CUIT, CUIL o documento fiscal del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Domicilio — Calle (Línea 1)
              </label>
              <input
                type="text"
                value={formulario.domicilioCalle1}
                onChange={(e) => actualizarCampo("domicilioCalle1", e.target.value)}
                placeholder="Ej: Av. Aconquija 1450"
                maxLength={150}
                aria-label="Domicilio calle línea 1"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Domicilio — Calle / Piso / Ref. (Línea 2)
              </label>
              <input
                type="text"
                value={formulario.domicilioCalle2}
                onChange={(e) => actualizarCampo("domicilioCalle2", e.target.value)}
                placeholder="Ej: Piso 3, Oficina B (entre Perú y Belgrano)"
                maxLength={150}
                aria-label="Domicilio calle línea 2"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Localidad
              </label>
              <input
                type="text"
                value={formulario.localidad}
                onChange={(e) => actualizarCampo("localidad", e.target.value)}
                placeholder="Ej: Yerba Buena, Tucumán"
                maxLength={120}
                aria-label="Localidad del cliente"
                className={CLASE_INPUT}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Ubicación Geodésica (Google Maps)
                </label>
                {construirUrlGoogleMaps(formulario.ubicacion) && (
                  <a
                    href={construirUrlGoogleMaps(formulario.ubicacion)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                  >
                    <span>Probar en Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formulario.ubicacion}
                  onChange={(e) => actualizarCampo("ubicacion", e.target.value)}
                  placeholder="Ej: -26.824140, -65.222600"
                  maxLength={250}
                  aria-label="Ubicación geodésica o enlace de Google Maps"
                  className={`${CLASE_INPUT} font-mono flex-1`}
                />
                <button
                  type="button"
                  onClick={capturarUbicacionActual}
                  disabled={obteniendoUbicacion || guardando}
                  title="Tomar coordenadas GPS actuales del dispositivo"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {obteniendoUbicacion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {obteniendoUbicacion ? "Obteniendo..." : "Usar ubicación actual"}
                  </span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Notas internas CRM
              </label>
              <textarea
                rows={3}
                value={formulario.notasInternas}
                onChange={(e) => actualizarCampo("notasInternas", e.target.value)}
                placeholder="Preferencias, contexto comercial, referido por..."
                maxLength={4000}
                aria-label="Notas internas del cliente"
                className={`${CLASE_INPUT} resize-none`}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear cliente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
