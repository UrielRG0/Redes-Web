import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../service/usuario'; // Asegúrate que este servicio tenga los nuevos métodos
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { Catalogo } from '../../service/catalogos';

declare const google: any;
declare global {
  interface Window {
    onHCaptchaResolved: (token: string) => void;
  }
}
@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})

export class LogIn implements OnInit {
 
  captchaToken: string | null = null;
  // --- VARIABLES PARA EL FLUJO DE 3 PASOS ---
  
  paso: number = 1;
  codigoVerificacion: string = '';
  listaIntereses: any[] = []; 
  interesesSeleccionados: number[] = [];
  listaCarreras: any[] = [];
  listaDepartamentos: any[] = [];

  // Actualizamos el objeto datos para incluir las selecciones
  datos: {
  nombre: string;
  correo: string;
  password: string;
  rol: string;
  isAdmin: boolean;
  idUsuario: number;
  idCarrera: number | null;
  idDepartamento: number | null;
} = {
  nombre: '',
  correo: '',
  password: '',
  rol: '',
  isAdmin: false,
  idUsuario: 0,
  idCarrera: null,
  idDepartamento: null
};
  foto: File | null = null;
  mensaje = '';
  constructor(private usuarioService: Usuario, private router: Router, private catalogoService: Catalogo) {}

  ngOnInit(): void {
     window.onHCaptchaResolved = (token: string) => {
        console.log("hCaptcha token:", token);
        this.captchaToken = token;
      };
      const modal = document.getElementById('registroModal');

    modal?.addEventListener('shown.bs.modal', () => {
      if ((window as any).hcaptcha) {
        (window as any).hcaptcha.render('hcaptcha-container', {
          sitekey: '6f6aa020-8a12-426a-8e1a-2e743a5c1730',
          callback: (token: string) => {
            console.log('hCaptcha token:', token);
            this.captchaToken = token;
          }
        });
      }
    });

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
    // Limpiamos espacios y convertimos a minúsculas para validar'
    const correoLimpio = this.datos.correo.trim().toLowerCase();
    if (!this.captchaToken) {
          alert("Por favor confirma que no eres un robot.");
          return;
      }
    if (!correoLimpio) {
      alert("Por favor escribe tu correo universitario");
      return;
    }

    
    if (!correoLimpio.endsWith('@edu.uaa.mx')) {
      this.mensaje = 'Error: Solo se permiten correos institucionales (@edu.uaa.mx)';
      return; // Detenemos la función aquí
    }
    // ------------------------------

    this.mensaje = 'Enviando código...';
    
    // Usamos la variable limpia
    this.usuarioService.iniciarRegistro(this.datos.correo, this.captchaToken).subscribe({
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

validarCodigo() {
    if (!this.codigoVerificacion) { return; }
    
    this.usuarioService.verificarCodigo(this.datos.correo, this.codigoVerificacion).subscribe({
      next: (res) => {
        this.mensaje = '';
        
        // 1. DETERMINAR ROL AUTOMÁTICAMENTE
        this.determinarRolYTraerDatos();

        this.paso = 3; 
        
        // Cargar intereses (ya lo tenías)
        this.cargarInteresesDelSistema();
      },
      error: (err) => { 
        this.mensaje = 'Código incorrecto';
      }
    });
  }
  determinarRolYTraerDatos() {
    const correo = this.datos.correo.toLowerCase().trim();

    // Lógica solicitada:
    // Si empieza con "al" Y termina en "@edu.uaa.mx" -> Alumno
    if (correo.startsWith('al') && correo.endsWith('@edu.uaa.mx')) {
        this.datos.rol = 'alumno';
        this.cargarCarreras();
    } 
    // Si NO empieza con "al" pero es "@edu.uaa.mx" -> Profesor
    else if (correo.endsWith('@edu.uaa.mx')) {
        this.datos.rol = 'profesor';
        this.cargarDepartamentos();
    } 
    else {
        // Caso de error o correo externo (si permitieras externos)
        this.datos.rol = 'invitado'; 
    }

    console.log("Rol detectado:", this.datos.rol);
  }

  cargarCarreras() {
    this.catalogoService.obtenerCarreras().subscribe({
        next: (data) => this.listaCarreras = data,
        error: (e) => console.error("Error carreras", e)
    });
  }

  cargarDepartamentos() {
    this.catalogoService.obtenerDepartamentos().subscribe({
        next: (data) => this.listaDepartamentos = data,
        error: (e) => console.error("Error departamentos", e)
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

    // Validación extra: Que hayan seleccionado su carrera/depto
    if (this.datos.rol === 'alumno' && !this.datos.idCarrera) {
        alert("Por favor selecciona tu Carrera.");
        return;
    }
    if (this.datos.rol === 'profesor' && !this.datos.idDepartamento) {
        alert("Por favor selecciona tu Departamento.");
        return;
    }

    this.mensaje = 'Guardando datos...';
    const formData = new FormData();
    formData.append('nombre', this.datos.nombre);
    formData.append('correo', this.datos.correo);
    formData.append('password', this.datos.password);
    formData.append('rol', this.datos.rol); // Enviamos el rol calculado

    // Agregamos el ID correspondiente
    if (this.datos.rol === 'alumno' && this.datos.idCarrera) {
        formData.append('idCarrera', this.datos.idCarrera.toString());
    } else if (this.datos.rol === 'profesor' && this.datos.idDepartamento) {
        formData.append('idDepartamento', this.datos.idDepartamento.toString());
    }

    // Intereses
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
        
        // --- 1. CERRAR EL MODAL AUTOMÁTICAMENTE ---
        const btnClose = document.getElementById('btnCloseRegistro');
        if (btnClose) {
            btnClose.click(); // Simula el clic para que Bootstrap cierre el modal
        }
        // ------------------------------------------

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
    this.datos = { nombre: '', correo: '', password: '' ,rol:'invitado',isAdmin:false, idUsuario:0,idCarrera:null,idDepartamento:null};
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