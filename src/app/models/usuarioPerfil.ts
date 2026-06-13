export interface UsuarioPerfil {
    idUsuario: number;
    nombre: string;
    fotoRuta?: string;
    idCarrera?: number;
    idDepartamento?: number;
    rol?: string;
}