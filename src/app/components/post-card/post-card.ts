import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { PublicacionInterface } from '../../models/PublicacionInterface';
import { Usuario } from '../../service/usuario'; // <--- Importar
import { EventoService } from '../../service/evento'; // <--- IMPORTAR
import { Catalogo } from '../../service/catalogos';

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
  nombreEvento: string | null = null;
  esEventoVerificado: boolean = false;
  nombresIntereses: string[] = [];
  
  // URLs Base (Ajusta si cambiaste de servidor)
  private API_POST_IMGS = 'https://172.25.124.29:8443/socialNetUAA/api/publicaciones/imagenes';
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(private usuarioService: Usuario, private eventoService: EventoService, private catalogoService: Catalogo 
  ) {}

  ngOnInit() {
    // Al iniciar, buscamos quién es el autor
    this.cargarDatosAutor();
    if (this.post.idEvento) {
        this.cargarDatosEvento(this.post.idEvento);
    }

    // 2. Convertir IDs de intereses a Hashtags (Nombres)
    if (this.post.intereses && this.post.intereses.length > 0) {
        this.cargarNombresIntereses();
    }
  }
  cargarDatosEvento(id: number) {
      this.eventoService.obtenerPorId(id).subscribe({
          next: (evento: any) => {
              this.nombreEvento = evento.titulo;
              this.esEventoVerificado = evento.verificado; 
          },
          error: () => this.nombreEvento = 'Evento no disponible'
      });
  }

  cargarNombresIntereses() {
      this.catalogoService.obtenerIntereses().subscribe({
          next: (catalogo) => {

              this.nombresIntereses = catalogo
                  // CORRECCIÓN AQUÍ: Usar 'item.idInteres' en lugar de 'item.id'
                  .filter((item: any) => this.post.intereses?.includes(item.idInteres)) 
                  .map((item: any) => item.nombre);
          },
          error: (e) => console.error('Error cargando intereses', e)
      });
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