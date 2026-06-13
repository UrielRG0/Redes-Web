

export interface PublicacionInterface {
id?: string; // <-- CRÍTICO: Cambiar de 'number' a 'string'
  idPublicacion: number; // Tu ID original de MySQL se queda como number
  idEvento?: number;
  titulo: string;
  idAutor: number;
  createdAt: string | Date; // <-- Puede llegar como string ISO, Angular lo maneja bien
  updateAt?: string;
  intereses?: number[];
  description: string;
  imagePaths?: string[];
  idComentarios?: number[];
}