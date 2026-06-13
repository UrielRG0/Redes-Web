import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../service/usuario';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Publicacion } from '../../service/publicacion'; // Ajusta si se llama Publicacion o PublicacionService
import { Catalogo } from '../../service/catalogos';
import { EventoService } from '../../service/evento';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css'
})
export class CreatePost implements OnInit {

  @Output() postCreado = new EventEmitter<void>(); // Para avisar al Feed
  @Output() eventoCreado = new EventEmitter<void>();
  @ViewChild('selectEvento') selectEvento!: ElementRef;
  usuario: any = {};
  avatarUrl: string = 'person.png';
  mostrarModalPost: boolean = false;
  mostrarModalEvento:boolean=false;
  isLoading: boolean = false;
    previewImagen: SafeUrl | null = null; // Cambia el tipo
    previewEvento: SafeUrl | null = null; // Cambia el tipo
  // Datos del Formulario
  tituloPublicacion:string='';
  textoPublicacion: string = '';
  archivoSeleccionado: File | null = null;
  
  // Intereses
  listaIntereses: any[] = [];
  interesesSeleccionados: number[] = [];
  listaEventos: any[] = [];
  idEventoSeleccionado: number | null = null;
  archivoEvento: File | null = null;
  nuevoEvento = {
      titulo: '',
      descripcion: '',
      lugar: '',
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '',
      horaFin: ''
  };

  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(
    private usuarioService: Usuario,
    private catalogoService: Catalogo,
    private pubService: Publicacion, // Tu servicio para crear posts
    private eventoService: EventoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.cargarUsuario();
    this.cargarIntereses();
    this.cargarEventos();
  }
  cargarEventos() {
    this.eventoService.obtenerTodos().subscribe({
        next: (data) => {
            this.listaEventos = data;
        },
        error: (e) => console.error("Error cargando eventos", e)
    });
  }
  cargarUsuario() {
    const sessionUser = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    
    if (sessionUser && sessionUser.idUsuario) {
        // Pedimos el perfil real al backend
        this.usuarioService.obtenerPerfilUsuario(sessionUser.idUsuario).subscribe({
            next: (perfilFresco) => {
                this.usuario = perfilFresco; // Guardamos el usuario real
                
                if (this.usuario.fotoRuta) {
                    if (this.usuario.fotoRuta.startsWith('data:image')) {
                        // Sanitizamos base64
                        this.avatarUrl = this.usuario.fotoRuta; 
                    } else if (this.usuario.fotoRuta.startsWith('http')) {
                        this.avatarUrl = this.usuario.fotoRuta;
                    } else {
                        const nombre = this.usuario.fotoRuta.split('/').pop();
                        this.avatarUrl = `${this.API_USER_FOTOS}/${nombre}`;
                    }
                }
            },
            error: (err) => {
                console.error("Error cargando perfil en CreatePost", err);
            }
        });
    }
  }

  cargarIntereses() {
    this.catalogoService.obtenerIntereses().subscribe(data => {
        this.listaIntereses = data;
    });
  }

  abrirModalPost() { this.mostrarModalPost = true; }
  
  cerrarModalPost() { 
      this.mostrarModalPost = false; 
      this.limpiarFormularioPost();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
        this.archivoSeleccionado = file;
        const reader = new FileReader();
        reader.onload = () => { 
            // Sanitiza la URL antes de asignarla
            this.previewImagen = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
}

  toggleInteres(id: number) {
    if (this.interesesSeleccionados.includes(id)) {
        this.interesesSeleccionados = this.interesesSeleccionados.filter(x => x !== id);
    } else {
        this.interesesSeleccionados.push(id);
    }
  }

  publicar() {
    if (!this.textoPublicacion && !this.archivoSeleccionado) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('titulo', this.tituloPublicacion);
    formData.append('description', this.textoPublicacion);
    formData.append('idAutor', this.usuario.idUsuario);
    
    this.interesesSeleccionados.forEach(id => formData.append('intereses', id.toString()));

    if (this.idEventoSeleccionado) {
        formData.append('idEvento', this.idEventoSeleccionado.toString());
    }
    if (this.archivoSeleccionado) {
        formData.append('imagen', this.archivoSeleccionado);
    }

    this.pubService.crear(formData).subscribe({
        next: () => {
            this.isLoading = false;
            this.postCreado.emit();
            this.cerrarModalPost();
        },
        error: (e) => {
            this.isLoading = false;
            alert("Error al publicar");
        }
    });
  }

  limpiarFormularioPost() {
      this.tituloPublicacion = '';
      this.textoPublicacion = '';
      this.archivoSeleccionado = null;
      this.previewImagen = null;
      this.interesesSeleccionados = [];
      this.idEventoSeleccionado = null;
  }

  // ==========================================
  // 2. LÓGICA MODAL EVENTO (NUEVO)
  // ==========================================
  abrirModalEvento() { this.mostrarModalEvento = true; }
  
  cerrarModalEvento() { 
      this.mostrarModalEvento = false; 
      this.limpiarFormularioEvento();
  }

  onFileEventoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
        this.archivoEvento = file;
        const reader = new FileReader();
        reader.onload = () => { this.previewEvento = reader.result as string; };
        reader.readAsDataURL(file);
    }
  }

  crearEvento() {
      // Validaciones simples
      if (!this.nuevoEvento.titulo || !this.nuevoEvento.fechaInicio) {
          alert("Faltan datos del evento");
          return;
      }

      this.isLoading = true;
      const formData = new FormData();
      formData.append('titulo', this.nuevoEvento.titulo);
      formData.append('descripcion', this.nuevoEvento.descripcion);
      formData.append('lugar', this.nuevoEvento.lugar);
      formData.append('fechaInicio', this.nuevoEvento.fechaInicio);
      formData.append('fechaFin', this.nuevoEvento.fechaFin);
      formData.append('horaInicio', this.nuevoEvento.horaInicio);
      formData.append('horaFin', this.nuevoEvento.horaFin);
      formData.append('idCreador', this.usuario.idUsuario);

      if (this.archivoEvento) {
          formData.append('imagenes', this.archivoEvento);
      }

      this.eventoService.crear(formData).subscribe({
          next: () => {
              this.isLoading = false;
              alert("Evento Creado");
              this.eventoCreado.emit(); // Avisar para recargar barra de eventos
              this.cargarEventos(); // Recargar lista local
              this.cerrarModalEvento();
          },
          error: (e) => {
              this.isLoading = false;
              alert("Error al crear evento");
          }
      });
  }

  limpiarFormularioEvento() {
      this.nuevoEvento = { titulo: '', descripcion: '', lugar: '', fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '' };
      this.archivoEvento = null;
      this.previewEvento = null;
  }
}