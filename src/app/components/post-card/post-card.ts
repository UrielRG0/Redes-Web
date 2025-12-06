import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { PublicacionInterface } from '../../models/PublicacionInterface';
import { Usuario } from '../../service/usuario'; // <--- Importar

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnInit { 
  @Input() post!: PublicacionInterface; 

  // Variables para mostrar en el HTML
  nombreAutor: string = 'Cargando...';
  avatarUrl: string = 'assets/person.png'; // Imagen por defecto

  // URLs Base (Ajusta si cambiaste de servidor)
  private API_POST_IMGS = 'https://172.25.124.29:8443/socialNetUAA/api/publicaciones/imagenes';
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(private usuarioService: Usuario) {}

  ngOnInit() {
    // Al iniciar, buscamos quién es el autor
    this.cargarDatosAutor();
  }

  cargarDatosAutor() {
    if (!this.post.idAutor) return;

    // Llamamos al endpoint GET /usuarios/buscar/{id}
    this.usuarioService.obtenerDatosUsuario(this.post.idAutor).subscribe({
      next: (usuario: any) => {
        // 1. Asignamos el nombre real
        this.nombreAutor = usuario.nombre;

        // 2. Procesamos la foto (Google vs Local)
        if (usuario.fotoRuta) {
            this.construirUrlAvatar(usuario.fotoRuta);
        }
      },
      error: () => {
        this.nombreAutor = 'Usuario Desconocido';
      }
    });
  }

  construirUrlAvatar(ruta: string) {
      if (ruta.startsWith('http')) {
          this.avatarUrl = ruta; // Es de Google
      } else {
          // Es local: limpiamos la ruta y concatenamos con la API
          const nombreLimpio = ruta.split('/').pop() || ruta;
          this.avatarUrl = `${this.API_USER_FOTOS}/${nombreLimpio}`;
      }
  }

  // Helper para las imágenes del POST (ya lo tenías)
  getPostImageUrl(ruta: string): string {
      if (!ruta) return '';
      if (ruta.startsWith('http')) return ruta;
      const nombre = ruta.split('/').pop() || ruta;
      return `${this.API_POST_IMGS}/${nombre}`;
  }
}