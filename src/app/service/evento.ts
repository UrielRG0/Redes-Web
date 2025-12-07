import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoInterface } from '../models/EventoInterface';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  // Ajusta la IP y el puerto según tu configuración actual
  private API_URL = 'https://172.25.124.29:8443/socialNetUAA/api/eventos';

  constructor(private http: HttpClient) { }
  obtenerTodos(): Observable<EventoInterface[]> {
    return this.http.get<EventoInterface[]>(`${this.API_URL}`);
  }
  obtenerPorId(id: number): Observable<EventoInterface> {
    return this.http.get<EventoInterface>(`${this.API_URL}/${id}`);
  }
  crear(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/crear`, formData);
  }
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
  asistir(idEvento: number, idUsuario: number): Observable<any> {
    return this.http.post(`${this.API_URL}/asistir`, { idEvento, idUsuario });
  }
}

