import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // IMPORTANTE: Estos nombres deben ser idénticos a los nombres de tus archivos en la carpeta
  templateUrl: './navbar.html', 
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit { 
  usuarioLogueado: any = null;
  avatarUrl: string = '';
  
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  ngOnInit() {
    this.leerUsuarioSesion();
  }

  leerUsuarioSesion() {
    const usuarioJson = sessionStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        this.usuarioLogueado = JSON.parse(usuarioJson);
        const ruta = this.usuarioLogueado.fotoUrl || this.usuarioLogueado.fotoRuta;
          
        if (ruta) {
            if (ruta.startsWith('http')) {
                this.avatarUrl = ruta;
            } else {
                const nombreLimpio = ruta.split('/').pop();
                this.avatarUrl = `${this.API_USER_FOTOS}/${nombreLimpio}`;
            }
        }
      } catch (e) {
        console.error("Error parsing usuario", e);
      }
    }
  }
}