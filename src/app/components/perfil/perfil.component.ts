import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../service/usuario'; // Ajusta la ruta a tu servicio
import { PostCard } from '../post-card/post-card';
import { Publicacion } from '../../service/publicacion';
import { PublicacionInterface } from '../../models/PublicacionInterface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, PostCard],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  usuario: any = null;
  nombreEntidadAcademica: string = 'Cargando...'; // Guardará el nombre de la carrera o depto
  avatarUrl: string = 'assets/img/default-user.png'; // Imagen por defecto
  loading: boolean = true;

  // Variables para las publicaciones
  misPublicaciones: PublicacionInterface[] = [];
  loadingPosts: boolean = false;

  // Endpoint de fotos según tu Postman: .../api/usuarios/fotos/{nombre}
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(private usuarioService: Usuario,private publicacionService: Publicacion) {}

  ngOnInit(): void {
    this.cargarDatosSesion();
  }

  cargarDatosSesion() {
    const usuarioJson = sessionStorage.getItem('usuario');
    
    if (usuarioJson) {
      this.usuario = JSON.parse(usuarioJson);
      this.procesarImagen();
      this.cargarDetallesAcademicos();
      
      // Una vez tenemos el usuario, cargamos sus publicaciones
      this.cargarMisPosts(); 

      this.loading = false;
    } else {
      this.loading = false;
    }
  }

  // --- MÉTODO CORREGIDO ---
  cargarMisPosts() {
    if (!this.usuario || !this.usuario.idUsuario) return;

    this.loadingPosts = true;

    // Convertimos a número por seguridad, ya que session storage devuelve strings
    const miId = Number(this.usuario.idUsuario); 

    // Llamada al servicio
    this.publicacionService.obtenerPublicaciones(undefined, undefined, miId)
      .subscribe({
        next: (data) => {
          // --- AQUÍ ESTÁ EL TRUCO ---
          // Si el backend no filtra, filtramos nosotros manualmente en el cliente.
          // Comparamos que el idAutor de la publicación sea igual a miId.
          this.misPublicaciones = data.filter(post => post.idAutor === miId);
          
          this.loadingPosts = false;
          console.log("Posts filtrados:", this.misPublicaciones.length);
        },
        error: (err) => {
          console.error("Error cargando publicaciones del perfil", err);
          this.loadingPosts = false;
        }
      });
  }

  cargarDetallesAcademicos() {
    // Si es Alumno (tiene idCarrera)
    if (this.usuario.idCarrera) {
      this.usuarioService.obtenerCarreraPorId(this.usuario.idCarrera).subscribe({
        next: (res: any) => this.nombreEntidadAcademica = res.nombre, // Asumiendo que el JSON devuelve { "nombre": "..." }
        error: () => this.nombreEntidadAcademica = 'Carrera no identificada'
      });
    } 
    // Si es Maestro/Admin (tiene idDepartamento)
    else if (this.usuario.idDepartamento) {
      this.usuarioService.obtenerDepartamentoPorId(this.usuario.idDepartamento).subscribe({
        next: (res: any) => this.nombreEntidadAcademica = res.nombre,
        error: () => this.nombreEntidadAcademica = 'Departamento no identificado'
      });
    } else {
      this.nombreEntidadAcademica = 'Sin asignación académica';
    }
  }

  procesarImagen() {
    // Lógica idéntica al Navbar para consistencia
    const ruta = this.usuario.fotoUrl || this.usuario.fotoRuta;

    if (ruta) {
      if (ruta.startsWith('http')) {
        // Login con Google
        this.avatarUrl = ruta;
      } else {
        // Login Local: Limpiamos la ruta local (C:/Users/...) y dejamos solo el nombre archivo
        // Ejemplo Postman: "1765033316239_UPD_3.jpeg"
        const nombreArchivo = ruta.split(/[/\\]/).pop(); // Soporta slashes de Linux y Windows
        this.avatarUrl = `${this.API_USER_FOTOS}/${nombreArchivo}`;
      }
    }
  }
}