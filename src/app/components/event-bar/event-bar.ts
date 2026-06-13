import { Component, OnInit } from '@angular/core';
import { EventoInterface } from '../../models/EventoInterface';
import { EventoService } from '../../service/evento';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-bar.html',
  styleUrl: './event-bar.css',
})
export class EventBar implements OnInit {
  eventosActivos: EventoInterface[] = [];
  eventosPasados: EventoInterface[] = [];
  
  // Agrega esta variable para el botón
  mostrarArchivo: boolean = false; 

  eventoSeleccionado: EventoInterface | null = null;
  // ... resto de tus variables ...

  // Agrega este método para el botón
  toggleArchivo() {
    this.mostrarArchivo = !this.mostrarArchivo;
  }
  private API_EVENTO_IMG = 'https://172.25.124.29:8443/socialNetUAA/api/eventos/imagenes'; 

  constructor(private eventoService: EventoService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.cargarEventos();
  }

  // 3. Cargamos ambos fragmentos desde el servicio
  cargarEventos() {
    this.eventoService.obtenerEventosActivos().subscribe({
      next: (data) => this.eventosActivos = data.reverse(),
      error: (e) => console.error("Error eventos activos", e)
    });

    this.eventoService.obtenerEventosPasados().subscribe({
      next: (data) => this.eventosPasados = data.reverse(),
      error: (e) => console.error("Error eventos pasados", e)
    });
  }

  // --- MODIFICACIÓN CLAVE AQUÍ ---
  // Ahora recibimos el array completo (o undefined)
  getImagenUrl(imagenes: string[] | undefined): string {
    
    // 1. Validación: Si el array es nulo o está vacío
    if (!imagenes || imagenes.length === 0) {
        return 'event-placeholder.jpg'; // Imagen por defecto
    }

    // 2. Tomamos la PRIMERA imagen como portada
    const rutaPrimeraImagen = imagenes[0];

    // 3. Verificar si es URL completa (Google/Externa) o local
    if (rutaPrimeraImagen.startsWith('http')) {
        return rutaPrimeraImagen;
    }

    // 4. Retornar ruta completa a tu API
    return `${this.API_EVENTO_IMG}/${rutaPrimeraImagen}`;
  }

  // Actualizamos el tipo de dato en el parámetro
  obtenerEstiloBackground(imagenes: string[] | undefined): SafeStyle {
      // Pasamos el array a la función de arriba
      const url = this.getImagenUrl(imagenes);
      return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }
  // 1. Abrir: Recibe el objeto entero, no solo el ID
  abrirModal(evento: EventoInterface) {
    this.eventoSeleccionado = evento;
    // Opcional: Bloquear el scroll de la página de fondo
    document.body.style.overflow = 'hidden'; 
  }

  // 2. Cerrar
  cerrarModal() {
    this.eventoSeleccionado = null;
    document.body.style.overflow = 'auto'; // Reactivar scroll
  }

  // 3. Evitar que el clic dentro de la tarjeta cierre el modal
  detenerPropagacion(event: Event) {
    event.stopPropagation();
  }
  
}