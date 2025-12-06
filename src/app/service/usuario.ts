import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private baseUrl = 'https://172.25.124.29:8443/socialNetUAA/api/usuarios';
  constructor(private http: HttpClient) { }


  iniciarRegistro(correo: string) {
    const body = new URLSearchParams();
    body.set('correo', correo);
    
    return this.http.post(`${this.baseUrl}/iniciar-registro`, body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'text' // <--- AGREGA ESTA LÍNEA
    });
  }

  verificarCodigo(correo: string, codigo: string) {
    const body = new URLSearchParams();
    body.set('correo', correo);
    body.set('codigo', codigo);

    return this.http.post(`${this.baseUrl}/verificar-codigo`, body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'text' // <--- AGREGA ESTA LÍNEA TAMBIÉN
    });
  }


  registroFinal(formData: FormData) {
    return this.http.post(`${this.baseUrl}/registro-final`, formData, {
        responseType: 'text'
    });
  }
  login(correo: string, password: string) {
    const body = new URLSearchParams();
    body.set('correo', correo);
    body.set('password', password);

    return this.http.post(`${this.baseUrl}/login`, body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    });
  }
}
