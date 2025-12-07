import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PostCard } from '../post-card/post-card';
import { Navbar } from '../navbar/navbar';
import { PublicacionInterface } from '../../models/PublicacionInterface';

// SERVICIOS
import { Publicacion } from '../../service/publicacion'; // Tu servicio de API
import { Busqueda } from '../../service/busqueda'; // <--- EL NUEVO SERVICIO

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, PostCard, Navbar],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit { 
  
  posts: PublicacionInterface[] = [];
  
  // Variables de Estado
  currentPage: number = 1;
  isLoading: boolean = false;
  hasMorePosts: boolean = true; 
  
  // Variables de Filtros
  filtroEvento: number | undefined = undefined; 
  filtrosIntereses: number[] = []; 
  terminoBusqueda: string = ''; // <--- NUEVA VARIABLE

  constructor(
      private pubService: Publicacion,
      private busquedaService: Busqueda // <--- INYECTARLO
  ) {}

  ngOnInit() {
    // 1. Nos suscribimos al Buscador del Navbar
    this.busquedaService.terminoBusqueda$.subscribe(termino => {
        this.terminoBusqueda = termino;
        // Cada vez que escriban algo, recargamos el feed desde cero
        this.cargarFeed();
    });
  }

  cargarFeed() {
    this.posts = []; 
    this.currentPage = 1;
    this.hasMorePosts = true;
    this.loadMorePosts();
  }

  loadMorePosts() {
    if (this.isLoading || !this.hasMorePosts) return;
    
    this.isLoading = true;
    
    // 2. ENVIAMOS TODOS LOS FILTROS AL SERVICIO (Evento, Intereses y Búsqueda)
    this.pubService.obtenerPublicaciones(
        this.filtroEvento, 
        this.filtrosIntereses, 
        this.terminoBusqueda // <--- PASAMOS EL TÉRMINO
    ).subscribe({
        next: (data) => {
          // Tu lógica de paginación (slice) está bien para simulación, 
          // pero idealmente el backend debería paginar.
          const startIndex = (this.currentPage - 1) * 10;
          const nuevosPosts = data.slice(startIndex, startIndex + 10);
          
          this.posts = [...this.posts, ...nuevosPosts]; 
          this.isLoading = false;

          if (nuevosPosts.length === 0) {
              this.hasMorePosts = false;
          } else {
              this.currentPage++;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Error:", err);
        }
      });
  }
  // Función para cuando el usuario marca/desmarca un checkbox de interés
  toggleInteres(idInteres: number) {
    const index = this.filtrosIntereses.indexOf(idInteres);
    
    if (index === -1) {
      // Si no estaba, lo agregamos
      this.filtrosIntereses.push(idInteres);
    } else {
      // Si ya estaba, lo quitamos
      this.filtrosIntereses.splice(index, 1);
    }

    // Recargamos la lista automáticamente
    this.cargarFeed();
  }
}
