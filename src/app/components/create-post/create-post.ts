import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../service/usuario';

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
  @ViewChild('selectEvento') selectEvento!: ElementRef;
  usuario: any = {};
  avatarUrl: string = 'assets/person.png';
  mostrarModal: boolean = false;
  isLoading: boolean = false;

  // Datos del Formulario
  tituloPublicacion:string='';
  textoPublicacion: string = '';
  archivoSeleccionado: File | null = null;
  previewImagen: string | null = null;
  
  // Intereses
  listaIntereses: any[] = [];
  interesesSeleccionados: number[] = [];
  listaEventos: any[] = [];
  idEventoSeleccionado: number | null = null;

  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(
    private usuarioService: Usuario,
    private catalogoService: Catalogo,
    private pubService: Publicacion, // Tu servicio para crear posts
    private eventoService: EventoService
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
    this.usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    if (this.usuario && this.usuario.fotoRuta) {
        // Lógica de avatar que ya usamos antes
        if (this.usuario.fotoRuta.startsWith('http')) {
            this.avatarUrl = this.usuario.fotoRuta;
        } else {
            const nombre = this.usuario.fotoRuta.split('/').pop();
            this.avatarUrl = `${this.API_USER_FOTOS}/${nombre}`;
        }
    }
  }

  cargarIntereses() {
    this.catalogoService.obtenerIntereses().subscribe(data => {
        this.listaIntereses = data;
    });
  }

  // --- MODAL ---
  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { 
      this.mostrarModal = false; 
      this.limpiarFormulario();
  }

  // --- SELECCIÓN DE IMAGEN ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
        this.archivoSeleccionado = file;
        const reader = new FileReader();
        reader.onload = () => { this.previewImagen = reader.result as string; };
        reader.readAsDataURL(file);
    }
  }

  // --- SELECCIÓN DE INTERESES ---
  toggleInteres(id: number) {
    if (this.interesesSeleccionados.includes(id)) {
        this.interesesSeleccionados = this.interesesSeleccionados.filter(x => x !== id);
    } else {
        this.interesesSeleccionados.push(id);
    }
  }
  focusEvento() {
    // Esto hace que el navegador haga scroll y ponga el cursor en el select
    if (this.selectEvento) {
        this.selectEvento.nativeElement.focus();
        // Opcional: Intenta abrirlo (funciona en algunos navegadores)
        this.selectEvento.nativeElement.click(); 
    }
  }
  publicar() {
    if (!this.textoPublicacion && !this.archivoSeleccionado) {
        return; 
    }

    this.isLoading = true;
    const formData = new FormData();
    formData.append('description', this.textoPublicacion);
    formData.append('titulo',this.tituloPublicacion)
    formData.append('idAutor', this.usuario.idUsuario);
    
    // Intereses
    this.interesesSeleccionados.forEach(id => {
        formData.append('intereses', id.toString());
    });

    // --- 4. AGREGAR EVENTO SI SE SELECCIONÓ ---
    if (this.idEventoSeleccionado) {
        formData.append('idEvento', this.idEventoSeleccionado.toString());
    }
    // ------------------------------------------

    if (this.archivoSeleccionado) {
        formData.append('imagen', this.archivoSeleccionado);
    }
    this.pubService.crear(formData).subscribe({
        next: () => {
            this.isLoading = false;
            this.postCreado.emit(); // ¡Avisamos al Feed!
            this.cerrarModal();
        },
        error: (e) => {
            console.error(e);
            this.isLoading = false;
            alert("Error al publicar");
        }
    });
  }

  limpiarFormulario() {
      this.textoPublicacion = '';
      this.archivoSeleccionado = null;
      this.previewImagen = null;
      this.interesesSeleccionados = [];
      this.idEventoSeleccionado = null;
  }
}