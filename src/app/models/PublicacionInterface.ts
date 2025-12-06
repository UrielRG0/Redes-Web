

export interface PublicacionInterface {
    /**
     * Identificador único de la publicación. (Autoincrementable en el backend)
     */
    idPublicacion?: number;

    /**
     * Título de la publicación.
     */
    titulo: string;
    
    /**
     * Autor de la publicación (generalmente el correo o ID del usuario).
     */
    idAutor: number;

    /**
     * Descripción o contenido del post.
     */
    description: string;

    /**
     * FK: ID del evento al que está asociada la publicación (puede ser nulo).
     */
    idEvento?: number | null; 

    /**
     * Lista de IDs de los intereses relacionados (Ej: [1, 5, 8]).
     */
    intereses?: number[];

    /**
     * Rutas de las imágenes guardadas en el servidor.
     */
    imagePaths?: string[];

    /**
     * Lista de IDs de comentarios asociados.
     */
    idComentarios?: number[];

    /**
     * Fecha y hora de creación. (Se recibe como string, pero TypeScript lo tipa como string).
     * Formato: "YYYY-MM-DD HH:mm:ss"
     */
    createdAt: string;

    /**
     * Fecha y hora de última modificación.
     */
    updateAt: string;
}