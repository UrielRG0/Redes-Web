import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- NECESARIO PARA ngModel
import { Router } from '@angular/router';
import { Usuario } from '../../service/usuario'; // Ajusta ruta
import { Busqueda } from '../../service/busqueda';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  terminoBusqueda: string = '';
 
  
  // URL base para imágenes de usuarios (Igual que en PostCard)
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';
  avatarUrl: SafeUrl | string | null = null;
  constructor(
      private router: Router,
      private usuarioService: Usuario,
      private busquedaService: Busqueda, // <--- INYECTAR\
      private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
      this.cargarUsuarioLogueado();
  }

   cargarUsuarioLogueado() {
    const usuarioString = sessionStorage.getItem('usuario');

    if (usuarioString) {
      const sessionUser = JSON.parse(usuarioString);
      
      // Consultamos el perfil FRESCO a la base de datos
      this.usuarioService.obtenerPerfilUsuario(sessionUser.idUsuario).subscribe({
        next: (perfilFresco) => {
            // Actualizamos la foto con la información más reciente
            if (perfilFresco && perfilFresco.fotoRuta) {
                this.construirUrlAvatar(perfilFresco.fotoRuta);
            } else {
                this.avatarUrl = 'assets/person.png'; 
            }
        },
        error: (err) => {
            console.error("Error cargando el perfil fresco en Navbar", err);
            this.avatarUrl = 'assets/person.png';
        }
      });
    }
  }

  construirUrlAvatar(ruta: string) {
        if (ruta.startsWith('data:image')) {
            // "Sanitizamos" la cadena para que Angular permita mostrarla
            this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(ruta);
        } 
        else if (ruta.startsWith('http')) {
            this.avatarUrl = ruta;
        } 
        else {
            const nombre = ruta.split('/').pop() || ruta;
            this.avatarUrl = `${this.API_USER_FOTOS}/${nombre}`;
        }
    }

  irAPerfil() {
      this.router.navigate(['/perfil']); 
  }
  
  irAHome() {
      this.router.navigate(['/home']);
  }

  buscar() {
        if (this.router.url !== '/home') {
            this.router.navigate(['/home']);
        }
        this.busquedaService.enviarBusqueda(this.terminoBusqueda);
  }
}