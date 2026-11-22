export interface UsuarioAdmin {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  ultimoAccesoUtc?: string | null;
}

export interface LoginAdminRequest {
  email: string;
  password: string;
}

export interface LoginAdminResponse {
  tokenAcceso: string;
  expiraEnSegundos: number;
  usuario: UsuarioAdmin;
}

export interface RespuestaApi<T> {
  exito: boolean;
  datos: T;
  mensaje?: string | null;
  errores?: string[] | null;
}
