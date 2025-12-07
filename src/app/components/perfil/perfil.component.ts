import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../service/usuario'; // Ajusta la ruta a tu servicio
import { PostCard } from '../post-card/post-card';
import { Publicacion } from '../../service/publicacion';
import { PublicacionInterface } from '../../models/PublicacionInterface';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, PostCard,FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  usuario: any = null;

  // Variables para Edición
  usuarioEdit: any = {}; // Copia temporal para editar
  editando: boolean = false;
  archivoSeleccionado: File | null = null;

  // --- NUEVAS VARIABLES PARA LA CONTRASEÑA ---
  passwordActual: string = '';
  passwordNueva: string = '';

  previewUrl: string | null = null; // Para previsualizar la nueva foto

  nombreEntidadAcademica: string = 'Cargando...'; // Guardará el nombre de la carrera o depto
  avatarUrl: string = 'assets/img/default-user.png'; // Imagen por defecto
  loading: boolean = true;

  // Variables para las publicaciones
  misPublicaciones: PublicacionInterface[] = [];
  loadingPosts: boolean = false;

  // Endpoint de fotos según tu Postman: .../api/usuarios/fotos/{nombre}
  private API_USER_FOTOS = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios/fotos';

  constructor(private usuarioService: Usuario,
    private publicacionService: Publicacion,
    private router: Router) {}

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


  // --- LÓGICA DE EDICIÓN ---

  activarEdicion() {
    // Creamos una copia para no modificar el objeto original hasta guardar
    this.usuarioEdit = { ...this.usuario };
    // Reseteamos los campos de contraseña al abrir edición
    this.passwordActual = '';
    this.passwordNueva = '';
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.archivoSeleccionado = null;
    this.previewUrl = null;
    this.usuarioEdit = {};
    this.passwordActual = '';
    this.passwordNueva = '';
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (!confirm('¿Estás seguro de guardar los cambios?')) return;

    // VALIDACIÓN DE CONTRASEÑA
    // Si el usuario escribió una nueva contraseña, es OBLIGATORIO validar la actual
    if (this.passwordNueva.trim() !== '') {
        
        if (this.passwordActual.trim() === '') {
            alert('⚠️ Para cambiar tu contraseña, debes ingresar tu contraseña actual.');
            return;
        }

        // Verificamos la contraseña actual con el servicio de Login
        this.usuarioService.login(this.usuario.correo, this.passwordActual).subscribe({
            next: () => {
                // Si el login es exitoso, la contraseña actual es correcta.
                // Procedemos a guardar todo.
                this.enviarDatosAlBackend();
            },
            error: () => {
                alert('⛔ La contraseña actual es incorrecta. No se pueden guardar los cambios.');
            }
        });

    } else {
        // Si NO quiere cambiar la contraseña (campo nuevo vacío), guardamos directo.
        this.enviarDatosAlBackend();
    }
  }

  // Separamos la lógica de envío para poder llamarla desde los dos casos anteriores
  enviarDatosAlBackend() {
    const formData = new FormData();
    formData.append('idSolicitante', this.usuario.idUsuario.toString());
    formData.append('nombre', this.usuarioEdit.nombre);

    // Si hay contraseña nueva (ya validada), la agregamos
    if (this.passwordNueva.trim() !== '') {
        formData.append('password', this.passwordNueva);
    }

    if (this.archivoSeleccionado) {
      formData.append('foto', this.archivoSeleccionado);
    } 

    this.usuarioService.actualizarUsuario(this.usuario.idUsuario, formData).subscribe({
      next: (res) => {
        alert('Perfil actualizado correctamente');
        
        if (res && typeof res === 'object') {
             this.usuario = res;
        } else {
             this.usuario.nombre = this.usuarioEdit.nombre;
        }
        
        sessionStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.procesarImagen(); 

        if (this.archivoSeleccionado) {
            const timestamp = new Date().getTime();
            const separador = this.avatarUrl.includes('?') ? '&' : '?';
            this.avatarUrl = `${this.avatarUrl}${separador}t=${timestamp}`;
        }

        this.cancelarEdicion();
      },
      error: (err) => {
        console.error("Error backend:", err);
        alert('Error al actualizar. Revisa la consola.');
      }
    });
  }

  // --- LÓGICA DE ELIMINACIÓN ---

  eliminarCuenta() {
    // CASO 1: Usuarios de Google (No tienen contraseña local)
    if (this.usuario.esGoogle) {
      if (confirm('Tu cuenta está vinculada con Google. ¿Estás seguro de que deseas eliminarla permanentemente?')) {
        this.realizarEliminacion();
      }
      return;
    }

    // CASO 2: Usuarios con contraseña (UAA)
    const passwordConfirmacion = prompt('POR SEGURIDAD: Ingresa tu contraseña para confirmar la eliminación de tu cuenta:');
    
    // Si el usuario da Cancelar o lo deja vacío
    if (!passwordConfirmacion) return;

    // Verificamos la contraseña intentando hacer login
    this.usuarioService.login(this.usuario.correo, passwordConfirmacion).subscribe({
      next: () => {
        // Si entra aquí, la contraseña es CORRECTA
        this.realizarEliminacion();
      },
      error: () => {
        // Si falla, la contraseña es INCORRECTA
        alert('⛔ Contraseña incorrecta. No se ha eliminado la cuenta.');
      }
    });
  }

  // Método auxiliar para no repetir código
  // Método auxiliar para no repetir código
  realizarEliminacion() {
    // Pasamos el ID del usuario DOS veces: 
    // 1. El ID a eliminar
    // 2. El ID del solicitante (que es él mismo)
    this.usuarioService.eliminarUsuario(this.usuario.idUsuario, this.usuario.idUsuario).subscribe({
      next: (res) => {
        alert('✅ Tu cuenta y tus datos han sido eliminados.');
        sessionStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Error al eliminar:", err);
        
        if (err.status === 500 || err.status === 409 || err.status === 400) {
           alert('⚠️ No se puede eliminar: Tienes publicaciones activas. Debes borrarlas primero.');
        } else if (err.status === 401 || err.status === 403) {
            // Ahora que enviamos el ID, este error solo debería salir si hay un bug real de sesión
            alert('⛔ Permiso denegado por el servidor.');
        } else {
           alert(`❌ Error inesperado (${err.status}).`);
        }
      }
    });
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