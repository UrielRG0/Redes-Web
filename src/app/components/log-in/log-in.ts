import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../service/usuario'; // Asegúrate que este servicio tenga los nuevos métodos
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { Catalogo } from '../../service/catalogos';

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
  paso: number = 1;
  codigoVerificacion: string = '';
  listaIntereses: any[] = []; 
  interesesSeleccionados: number[] = [];
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
  constructor(private usuarioService: Usuario, private router: Router, private catalogoService: Catalogo) {}

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

    //--- AQUÍ ESTÁ TU VALIDACIÓN ---
    //if (!correoLimpio.endsWith('@edu.uaa.mx')) {
      //this.mensaje = 'Error: Solo se permiten correos institucionales (@edu.uaa.mx)';
      //return; // Detenemos la función aquí
    //}
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
    if (!this.codigoVerificacion) { /* ... */ return; }
    
    this.usuarioService.verificarCodigo(this.datos.correo, this.codigoVerificacion).subscribe({
      next: (res) => {
        this.mensaje = '';
        this.paso = 3; 
        
        // --- NUEVO: CARGAR INTERESES AL LLEGAR AL PASO 3 ---
        this.cargarInteresesDelSistema();
        // ---------------------------------------------------
      },
      error: (err) => { /* ... */ }
    });
  }
cargarInteresesDelSistema() {
    this.catalogoService.obtenerIntereses().subscribe({
        next: (data) => {
            console.log("DATOS RECIBIDOS DEL BACKEND:", data); // <--- AGREGA ESTO
            this.listaIntereses = data;
        },
        error: (e) => console.error("Error cargando catálogo", e)
    });
  }
  toggleInteres(id: number) {
    if (this.interesesSeleccionados.includes(id)) {
        // Desmarcar
        this.interesesSeleccionados = this.interesesSeleccionados.filter(x => x !== id);
    } else {
        // Marcar
        this.interesesSeleccionados.push(id);
    }
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
    this.interesesSeleccionados.forEach(id => {
        formData.append('intereses', id.toString());
    });
    if (this.foto) {
      formData.append('foto', this.foto);
    }
    this.usuarioService.registroFinal(formData).subscribe({
      next: (resp) => {
        this.mensaje = '¡Registro Exitoso!';
        console.log('Respuesta Java:', resp);
        
        this.resetFormulario();
      },
      error: (err) => {
        this.mensaje = 'Error al guardar: ' + err.message;
        console.error(err);
      }
    });
  }
iniciarSesion() {
  // 1. Validaciones básicas antes de llamar al backend
  if (!this.datos.correo || !this.datos.password) {
    this.mensaje = 'Por favor ingresa correo y contraseña.';
    return;
  }

  this.mensaje = 'Iniciando sesión...';

  // 2. Llamada al servicio
  this.usuarioService.login(this.datos.correo, this.datos.password).subscribe({
    next: (usuario: any) => {
      console.log("Login exitoso:", usuario);
      
      // 3. Guardar sesión
      sessionStorage.setItem('usuario', JSON.stringify(usuario));

      // 4. Cerrar el modal programáticamente
      // (Truco simple: simular clic en el botón cancelar que tiene data-bs-dismiss)
      const btnClose = document.getElementById('btnCloseLogin');
      if (btnClose) btnClose.click();

      // 5. Redireccionar
      if (usuario.rol === 'admin') {
         // Ajusta la ruta de admin si la tienes
         this.router.navigate(['/admin-dashboard']); 
      } else {
         this.router.navigate(['/home']); // O '/home'
      }
      
      // Limpiar mensaje
      this.mensaje = '';
    },
    error: (err) => {
      console.error(err);
      // Manejo de errores más amigable
      if (err.status === 401 || err.status === 404) {
        this.mensaje = 'Correo o contraseña incorrectos.';
      } else {
        this.mensaje = 'Error de conexión. Intenta más tarde.';
      }
    }
  });
}
  resetFormulario() {
    this.datos = { nombre: '', correo: '', password: '' ,rol:'invitado',isAdmin:false, idUsuario:0};
    this.foto = null;
    this.codigoVerificacion = '';
    this.interesesSeleccionados = []; // <--- LIMPIAR SELECCIÓN
    this.paso = 1;
  }
  handleCredentialResponse(response: any) {
    const idToken = response.credential;
    
    // 1. Decodificar el token para sacar los datos
    const decoded: any = jwtDecode(idToken);
    
    // decoded contiene: email, name, picture, etc.
    const datosParaBackend = {
        correo: decoded.email,
        nombre: decoded.name,
        fotoUrl: decoded.picture
    };

    // 2. Llamar a TU backend
    this.usuarioService.loginGoogle(datosParaBackend).subscribe({
        next: (usuarioBackend) => {
            sessionStorage.setItem('usuario', JSON.stringify(usuarioBackend));
            this.router.navigate(['/home']);
        },
        error: (err) => alert("Error al iniciar con Google")
    });
}
}