const FORMATEADOR_MONEDA_ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const FORMATEADOR_FECHA_CORTA = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const FORMATEADOR_FECHA_HORA = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatearMontoArs(monto: number): string {
  return FORMATEADOR_MONEDA_ARS.format(Number.isFinite(monto) ? monto : 0);
}

export function formatearFechaCorta(fechaIso?: string | null): string {
  if (!fechaIso) {
    return "Sin fecha";
  }

  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  return FORMATEADOR_FECHA_CORTA.format(fecha);
}

export function formatearFechaHora(fechaIso?: string | null): string {
  if (!fechaIso) {
    return "A coordinar";
  }

  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return "A coordinar";
  }

  return FORMATEADOR_FECHA_HORA.format(fecha);
}

export function formatearNombreCliente(cliente: {
  nombre?: string | null;
  apellido?: string | null;
  nombreCompleto?: string | null;
}): string {
  const apellido = cliente.apellido?.trim() ?? "";
  const nombre = cliente.nombre?.trim() ?? "";

  if (apellido && nombre) {
    return `${apellido}, ${nombre}`;
  }
  if (nombre) {
    return nombre;
  }
  if (apellido) {
    return apellido;
  }
  return cliente.nombreCompleto?.trim() || "Sin nombre";
}

export function obtenerIniciales(nombreCompleto: string): string {
  const partes = nombreCompleto
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return "CL";
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function extraerMensajeError(error: unknown, respaldo: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return respaldo;
}
