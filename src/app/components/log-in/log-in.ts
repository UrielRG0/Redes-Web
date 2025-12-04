import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../service/usuario';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare const google: any;
@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn implements OnInit {
  datos = { 
    nombre: '', 
    correo: '', 
    password: '', 
    rol: 'invitado', 
    isAdmin: false, 
    idUsuario: 281466  
  };
  foto: File | null = null;
  mensaje = '';

  constructor(private usuarioService: Usuario) {}
  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '153169391588-786ejor6s4bch4jdloqrtnffki8kts9m.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill'
      }
    );
  }
  onFotoSeleccionada(event: any) {
    this.foto = event.target.files[0];
  }

  enviarRegistro() {
    if (!this.datos.nombre || !this.datos.correo || !this.datos.password) {
      alert("Llena todos los campos");
      return;
    }

    this.mensaje = 'Enviando...';
    
    // Usamos el operador ! en this.foto! para decir que confiamos que no es null (o validalo antes)
    this.usuarioService.registrar(this.datos, this.foto!)
      .subscribe({
        next: (resp) => {
          this.mensaje = '¡Guardado en Servidor!';
          console.log('Respuesta Java:', resp);
          // Limpiar formulario si quieres
          this.datos = { nombre: '', correo: '', password: '' ,rol:'invitado',isAdmin:false, idUsuario:281466};
          this.foto = null;
        },
        error: (err) => {
          this.mensaje = 'Error: ' + err.message;
          console.error(err);
        }
      });
  }   
   handleCredentialResponse(response: any) {
    // Google te devuelve un JWT compactado (id_token)
    const idToken = response.credential;
    console.log("Token Google: ", idToken);
  }
}
