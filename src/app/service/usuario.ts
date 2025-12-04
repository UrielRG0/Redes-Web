import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private baseUrl = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios';
  constructor(private http: HttpClient) { }
  registrar(usuario: any, archivo: File|undefined): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', usuario.nombre);
    formData.append('correo', usuario.correo);
    formData.append('password', usuario.password);
    if (usuario.idUsuario) {
        formData.append('idUsuario', usuario.idUsuario.toString());
    }
    formData.append('rol',usuario.rol);
    formData.append('isAdmin', String(usuario.isAdmin));
    
    if (archivo) {
      formData.append('foto', archivo);
    }
    return this.http.post(`${this.baseUrl}/registro`, formData, { responseType: 'text' });
  }
}
