import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- NECESARIO PARA ngModel
import { Router } from '@angular/router';
import { Usuario } from '../../service/usuario'; // Ajusta ruta
import { Busqueda } from '../../service/busqueda';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  
  terminoBusqueda: string = '';
  avatarUrl: string = 'Gallo2.png';
  
  // URL base para imágenes de usuarios (Igual que en PostCard)
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(
      private router: Router,
      private usuarioService: Usuario,
      private busquedaService: Busqueda // <--- INYECTAR
  ) {}

  ngOnInit() {
      this.cargarUsuarioLogueado();
  }

        cargarUsuarioLogueado() {

            const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');

            if (usuario && usuario.fotoRuta) {
                this.construirUrlAvatar(usuario.fotoRuta);
            }
        }


  construirUrlAvatar(ruta: string) {
      if (ruta.startsWith('http')) {
          this.avatarUrl = ruta;
      } else {
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