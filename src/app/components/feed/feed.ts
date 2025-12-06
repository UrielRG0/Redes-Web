import { Component, OnInit } from '@angular/core'; // IMPORTANTE: Agregamos OnInit
import { PublicacionInterface } from '../../models/PublicacionInterface';
// --- Imports de Módulos y Componentes ---
import { CommonModule } from '@angular/common'; // Para *ngFor, *ngIf, etc.
// Importar el componente PostCard (Asumo que está en la misma carpeta o ruta similar)
import { PostCard } from '../post-card/post-card';
import { InfiniteScrollModule } from 'ngx-infinite-scroll'; 
import { Publicacion } from '../../service/publicacion';
import { Navbar } from '../navbar/navbar';
// ----------------------------------------

@Component({
  selector: 'app-feed',
  // CORRECCIÓN: Los imports son esenciales para un componente Standalone
  standalone: true,
  imports: [
    CommonModule, 
    InfiniteScrollModule, 
    PostCard,
    Navbar// <--- CORRECCIÓN: Habilitar el uso de <app-post-card>
  ], 
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit { 
  
  // Variables
  publicaciones: PublicacionInterface[] = [];
  posts: PublicacionInterface[] = []; // Variable usada en *ngFor
  
  // ... (Tus variables de filtro y estado) ...
  currentPage: number = 1;
  isLoading: boolean = false;
  hasMorePosts: boolean = true; 
  filtroEvento: number | undefined = undefined; 
  filtrosIntereses: number[] = []; 


  constructor(private pubService: Publicacion) {} // Asumiendo PublicacionService es correcto

  ngOnInit() {
    this.cargarFeed();
  }

  cargarFeed() {
    this.posts = []; 
    this.currentPage = 1;
    this.hasMorePosts = true;
    this.loadMorePosts();
  }

  // CORRECCIÓN: Implementación del método llamado por (scrolled)
  loadMorePosts() {
    if (this.isLoading || !this.hasMorePosts) {
      return;
    }
    
    this.isLoading = true;
    
    // Asumiendo que el servicio ya maneja la paginación con query params (page, limit)
    // O que se trae toda la lista y la paginamos aquí temporalmente:
    this.pubService.obtenerPublicaciones(this.filtroEvento, this.filtrosIntereses) 
      .subscribe({
        next: (data) => {
          // Lógica de paginación para simular la carga (AJUSTAR ESTO AL SERVICIO REAL DE PAGINACIÓN)
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
          console.error("Error cargando más posts:", err)
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
