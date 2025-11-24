export interface Empresa {
  id: string;
  nombre: string;
  pais_id: number;
  sector_id: number;
  descripcion?: string;
  sitio_web?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  logo_url?: string;
  presentacion_url?: string;
  aprobada: boolean;
  fecha_registro: string;
  updated_at: string;
  pais_nombre?: string;
  sector_nombre?: string;
  pais?: { id: number; nombre: string };
  sector?: { id: number; nombre: string };
  participantes?: Array<{
    id: string;
    nombre_completo: string;
    email: string;
    cargo?: string;
  }>;
}

export interface EmpresaCreate {
  nombre: string;
  pais_id: number;
  sector_id: number;
  descripcion?: string;
  sitio_web?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}
