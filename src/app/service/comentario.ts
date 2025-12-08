import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Comentario {
  private API_URL = 'https://172.25.124.29:8443/socialNetUAA/api/comentarios';

  constructor(private http: HttpClient) {}

  obtenerPorPost(idPublicacion: number): Observable<any[]> {
    // Asumiendo que tu método GET sigue igual
    return this.http.get<any[]>(`${this.API_URL}?idPublicacion=${idPublicacion}`);
  }

  // --- CAMBIO AQUÍ ---
  crear(formData: FormData): Observable<any> {
    // Apuntamos a /crear como definiste en Java
    return this.http.post(`${this.API_URL}/crear`, formData);
  }
}
