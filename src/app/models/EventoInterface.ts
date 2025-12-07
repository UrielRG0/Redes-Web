// src/app/models/EventoInterface.ts
export interface EventoInterface {
    id: number;
    titulo: string;
    description: string;
    fecha: string;      // LocalDateTime viene como string
    lugar: string;
    imagenRuta?: string; // Nombre del archivo (ej: "evento1.jpg")
}