import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../service/usuario'; // Asegúrate que este servicio tenga los nuevos métodos
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


declare const google: any;

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn implements OnInit {

  // --- VARIABLES PARA EL FLUJO DE 3 PASOS ---
  paso: number = 1; // 1: Correo, 2: Código, 3: Datos Finales
  codigoVerificacion: string = '';

  datos = { 
    nombre: '', 
    correo: '', 
    password: '', 
    rol: 'alumno', 
    isAdmin: false, 
    idUsuario: 0  
  };
  foto: File | null = null;
  mensaje = '';
  constructor(private usuarioService: Usuario, private router: Router) {}

  ngOnInit(): void {
    // ... Tu lógica de Google se queda igual ...
    google.accounts.id.initialize({
      client_id: '153169391588-786ejor6s4bch4jdloqrtnffki8kts9m.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'filled_black', size: 'large', shape: 'pill' }
    );
  }

  onFotoSeleccionada(event: any) {
    this.foto = event.target.files[0];
  }

  // --- PASO 1: Enviar correo para pedir código ---
// En tu archivo log-in.ts, busca la función solicitarCodigo()
  solicitarCodigo() {
    // Limpiamos espacios y convertimos a minúsculas para validar
    const correoLimpio = this.datos.correo.trim().toLowerCase();

    if (!correoLimpio) {
      alert("Por favor escribe tu correo universitario");
      return;
    }

    // --- AQUÍ ESTÁ TU VALIDACIÓN ---
    if (!correoLimpio.endsWith('@edu.uaa.mx')) {
      this.mensaje = 'Error: Solo se permiten correos institucionales (@edu.uaa.mx)';
      return; // Detenemos la función aquí
    }
    // ------------------------------

    this.mensaje = 'Enviando código...';
    
    // Usamos la variable limpia
    this.usuarioService.iniciarRegistro(this.datos.correo).subscribe({
        next: (res) => {
          this.mensaje = ''; 
          this.paso = 2; 
        },
        error: (err) => {
          console.log(err); // Muestra el error completo en la consola F12

          // --- CORRECCIÓN PARA EL ERROR [object Object] ---
          if (err.error && typeof err.error === 'object') {
            // Si el servidor manda un objeto JSON, intentamos leer sus propiedades comunes
            // Ajusta 'message' o 'error' según lo que veas en el paso 1
            this.mensaje = 'Error: ' + (err.error.message || err.error.error || JSON.stringify(err.error));
          } else {
            // Si es texto plano
            this.mensaje = 'Error: ' + (err.error || err.message);
          }
        }
      });
  }


  // --- PASO 2: Validar el código ingresado ---
  validarCodigo() {
    if (!this.codigoVerificacion) {
      alert("Ingresa el código recibido");
      return;
    }
    this.mensaje = 'Verificando...';

    // Llamada al backend (endpoint /verificar-codigo)
    this.usuarioService.verificarCodigo(this.datos.correo, this.codigoVerificacion).subscribe({
      next: (res) => {
        this.mensaje = '';
        this.paso = 3; // Avanzar al llenado de datos
      },
      error: (err) => {
        this.mensaje = 'Código incorrecto';
      }
    });
  }

  // --- PASO 3: Enviar todos los datos (nombre, pass, foto) ---
  enviarRegistroFinal() {
    if (!this.datos.nombre || !this.datos.password) {
      alert("Llena nombre y contraseña");
      return;
    }

    this.mensaje = 'Guardando datos...';
    const formData = new FormData();
    formData.append('nombre', this.datos.nombre);
    formData.append('correo', this.datos.correo);
    formData.append('password', this.datos.password);
    
    // Solo agregar la foto si existe
    if (this.foto) {
      formData.append('foto', this.foto);
    }
    this.usuarioService.registroFinal(formData).subscribe({
      next: (resp) => {
        this.mensaje = '¡Registro Exitoso!';
        console.log('Respuesta Java:', resp);
        
        // Reiniciar formulario y cerrar modal (o cerrarlo manualmente con JS)
        this.resetFormulario();
        
        // Opcional: Cerrar modal programáticamente si usas Bootstrap JS nativo,
        // o dejar que el usuario use el botón "Cerrar".
      },
      error: (err) => {
        this.mensaje = 'Error al guardar: ' + err.message;
        console.error(err);
      }
    });
  }
  iniciarSesion() {
    this.usuarioService.login(this.datos.correo, this.datos.password).subscribe({
        next: (usuario: any) => {
            console.log("Login exitoso:", usuario);
            
            sessionStorage.setItem('usuario', JSON.stringify(usuario));
            if(usuario.rol === 'admin') {
            } else {
                this.router.navigate(['/feed'])
            }
            alert("Bienvenido " + usuario.nombre);
        },
        error: (err) => {
            alert("Error: Credenciales incorrectas");
        }
    });
}
  resetFormulario() {
    this.datos = { nombre: '', correo: '', password: '' ,rol:'invitado',isAdmin:false, idUsuario:0};
    this.foto = null;
    this.codigoVerificacion = '';
    this.paso = 1; // Volver al inicio por si abre el modal de nuevo
  }
  handleCredentialResponse(response: any) {
    const idToken = response.credential;
    console.log("Token Google: ", idToken);
  }
}