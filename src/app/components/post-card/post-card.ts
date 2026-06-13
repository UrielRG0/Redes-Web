import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { PublicacionInterface } from '../../models/PublicacionInterface';
import { Usuario } from '../../service/usuario'; // <--- Importar
import { EventoService } from '../../service/evento'; // <--- IMPORTAR
import { Catalogo } from '../../service/catalogos';
import { Comentario } from '../../service/comentario';
import { FormsModule } from '@angular/forms';
import { UsuarioPerfil } from '../../models/usuarioPerfil';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-post-card',
  standalone: true,
 imports: [CommonModule, FormsModule], 
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnInit { 
  @Input() post!: PublicacionInterface; 
  autor?: UsuarioPerfil;
  comentariosEstructurados: any[] = []; // Aquí guardaremos Padres con sus Hijos
  idComentarioEnRespuesta: number | null = null; // Para saber qué caja de respuesta abrir
  textoRespuesta: string = '';
  // Variables para mostrar en el HTML
  nombreAutor: string = 'Cargando...';
  avatarUrl: string = 'person.png'; // Imagen por defecto
  nombreEvento: string | null = null;
  esEventoVerificado: boolean = false;
  nombresIntereses: string[] = [];
  
  mostrarComentarios: boolean = false;
  listaComentarios: any[] = [];
  nuevoComentarioTexto: string = '';
  usuarioLogueado: any = {};
  // URLs Base (Ajusta si cambiaste de servidor)
  private API_POST_IMGS = 'https://172.25.124.29:8443/socialNetUAA/api/publicaciones/imagenes';
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(private usuarioService: Usuario, private eventoService: EventoService, private catalogoService: Catalogo,private comentarioService: Comentario, private sanitizer: DomSanitizer
  ) {}

 ngOnInit() {
    // CORRECCIÓN: Le pasamos el ID del autor que viene en el Post
    if (this.post.idAutor) {
        this.cargarDatosAutor(this.post.idAutor);
    }
    
    if (this.post.idEvento) {
        this.cargarDatosEvento(this.post.idEvento);
    }
    
    this.usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    
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
  cargarDatosAutor(idAutor: number) {
    this.usuarioService.obtenerPerfilUsuario(idAutor).subscribe({
      next: (perfil: UsuarioPerfil) => {
        // Guardamos el objeto completo por si lo ocupas después
        this.autor = perfil; 
        
        // Asignamos los datos a las variables que usa tu HTML
        this.nombreAutor = perfil.nombre;
        this.construirUrlAvatar(perfil.fotoRuta || '');
      },
      error: (error) => {
        console.error('Error al cargar el perfil del autor', error);
        this.nombreAutor = 'Usuario Desconocido';
        this.avatarUrl = '/person.png';
      }
    });
  }
  construirUrlAvatar(ruta: string) {
      if (!ruta) {
          this.avatarUrl = '/person.png';
          return;
      }

      if (ruta.startsWith('data:image') || ruta.startsWith('http')) {
          this.avatarUrl = ruta; 
      } else {
          const nombreLimpio = ruta.split('/').pop() || ruta;
          this.avatarUrl = `${this.API_USER_FOTOS}/${nombreLimpio}`;
      }
  }

 getPostImageUrl(ruta: string): SafeUrl | string {
      if (!ruta) return '';

      // 1. Si es un enlace web (Unsplash, Google, etc.), devuélvelo directo
      if (ruta.startsWith('http')) {
          return ruta;
      }
      if (ruta.startsWith('data:image')) {
          return this.sanitizer.bypassSecurityTrustUrl(ruta);
      }

      // 3. Si es una ruta de archivo local (ej: "assets/foto.jpg")
      // Aquí agregamos el prefijo si es necesario o simplemente lo devolvemos
      return ruta; 
  }
  toggleComentarios() {
    this.mostrarComentarios = !this.mostrarComentarios;
    if (this.mostrarComentarios) {
        this.cargarComentarios();
    }
  }

 cargarComentarios() {
    if (!this.post.idPublicacion) return;
    
    this.comentarioService.obtenerPorPost(this.post.idPublicacion).subscribe(lista => {
        // 1. Primero convertimos la lista plana en Árbol (Padres e Hijos)
        this.organizarComentarios(lista);

        // 2. AHORA RECORREMOS EL ÁRBOL PARA BUSCAR LOS NOMBRES Y FOTOS
        this.comentariosEstructurados.forEach(padre => {
            // Buscamos datos del Papá
            this.hidratarUsuario(padre);

            // Si tiene hijos, buscamos datos de los hijos
            if (padre.respuestas) {
                padre.respuestas.forEach((hijo: any) => {
                    this.hidratarUsuario(hijo);
                });
            }
        });
    });
  }

  organizarComentarios(lista: any[]) {
      const padres = lista.filter((c: any) => !c.idComentarioPadre);
      this.comentariosEstructurados = padres.map((padre: any) => {
          return {
              ...padre,
              respuestas: lista.filter((c: any) => c.idComentarioPadre === padre.idComentario)
          };
      });
  }

  // --- NUEVA FUNCIÓN AUXILIAR PARA OBTENER FOTO Y NOMBRE ---
 hidratarUsuario(comentario: any) {
      comentario.nombreUsuario = 'Cargando...';
      comentario.fotoUsuarioUrl = '/person.png'; 

      // CORRECCIÓN: Usar obtenerPerfilUsuario en lugar de obtenerDatosUsuario
      this.usuarioService.obtenerPerfilUsuario(comentario.idUsuario).subscribe({
          next: (perfil: UsuarioPerfil) => {
              comentario.nombreUsuario = perfil.nombre;

              if (perfil.fotoRuta) {
                  if (perfil.fotoRuta.startsWith('data:image') || perfil.fotoRuta.startsWith('http')) {
                      comentario.fotoUsuarioUrl = perfil.fotoRuta;
                  } else {
                      const nombre = perfil.fotoRuta.split('/').pop();
                      comentario.fotoUsuarioUrl = `${this.API_USER_FOTOS}/${nombre}`;
                  }
              }
          },
          error: () => {
              comentario.nombreUsuario = 'Usuario Desconocido';
          }
      });
  }
  activarResponder(idComentario: number) {
      if (this.idComentarioEnRespuesta === idComentario) {
          this.idComentarioEnRespuesta = null; // Si ya estaba abierto, lo cierra
      } else {
          this.idComentarioEnRespuesta = idComentario;
          this.textoRespuesta = ''; // Limpiar texto
      }
  }
  enviarRespuesta(idPadre: number) {
      if (!this.textoRespuesta.trim()) return;
      if(!this.post.idPublicacion) return;

      const formData = new FormData();
      formData.append('idUsuario', this.usuarioLogueado.idUsuario);
      formData.append('idPublicacion', this.post.idPublicacion.toString());
      formData.append('descripcion', this.textoRespuesta);
      
      // LA CLAVE: Enviamos el ID del padre
      formData.append('idComentarioPadre', idPadre.toString());

      this.comentarioService.crear(formData).subscribe({
          next: (res) => {
              this.cargarComentarios(); 
              this.idComentarioEnRespuesta = null; 
          }
      });
  }
  enviarComentario() {
    if (!this.nuevoComentarioTexto.trim()) return;
    if (!this.post.idPublicacion) {
        console.error("No se puede comentar: El post no tiene ID");
        return;
    }
    if (!this.nuevoComentarioTexto.trim()) return;

    // 1. CREAR FORMDATA
    const formData = new FormData();
    formData.append('idUsuario', this.usuarioLogueado.idUsuario); 
    formData.append('idPublicacion', this.post.idPublicacion.toString());
    formData.append('descripcion', this.nuevoComentarioTexto); 
    formData.append('idComentarioPadre', '0'); 

    // 2. ENVIAR
    this.comentarioService.crear(formData).subscribe({
        next: (res) => {
            console.log("Comentario creado", res);
            const comentarioVisual = {
                ...res, 
                nombreUsuario: this.usuarioLogueado.nombre 
            };
            
            this.listaComentarios.push(comentarioVisual);
            this.nuevoComentarioTexto = ''; // Limpiar input
            this.cargarComentarios();
        },
        error: (e) => {
            console.error("Error al comentar:", e);
        }
    });
  }
}