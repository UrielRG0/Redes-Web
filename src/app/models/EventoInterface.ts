// src/app/models/EventoInterface.ts
export interface EventoInterface {
    id: number;
    titulo: string;
    description: string;
    fechaInicio: string;
    fechaFin: string;
    horaInicio:string;
    horaFin: string;     // LocalDateTime viene como string
    lugar: string;
    imagenes?: string[]; // Nombre del archivo (ej: "evento1.jpg")
}