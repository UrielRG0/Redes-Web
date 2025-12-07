import { Component } from '@angular/core';
import { EventoInterface } from '../../models/EventoInterface';
import { EventoService } from '../../service/evento';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-bar',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './event-bar.html',
  styleUrl: './event-bar.css',
})
export class EventBar {
  eventos: EventoInterface[] = [];
  
  // URL base para imágenes de eventos (Ajusta la ruta de tu API)
  private API_EVENTO_IMG = 'https://172.25.124.29:8443/socialNetUAA/api/eventos/imagenes'; 

  constructor(private eventoService: EventoService ) {}

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    // Asumiendo que tu servicio tiene un método obtenerTodos()
    this.eventoService.obtenerTodos().subscribe({
      next: (data) => {
        // Ordenamos por fecha (opcional, los más recientes primero)
        this.eventos = data.reverse(); 
      },
      error: (e) => console.error(e)
    });
  }

  getImagenUrl(ruta: string | undefined): string {
    if (!ruta) return 'assets/event-placeholder.jpg'; // Imagen por defecto
    if (ruta.startsWith('http')) return ruta;
    return `${this.API_EVENTO_IMG}/${ruta}`;
  }

  verDetalleEvento(id: number) {
    console.log("Ir al evento", id);
    // Aquí puedes redirigir: this.router.navigate(['/eventos', id]);
  }
}
