import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublicacionInterface } from '../models/PublicacionInterface';
@Injectable({
  providedIn: 'root',
})
export class Publicacion {
   private baseUrl = 'https://172.25.124.29:8443/socialNetUAA/api/publicaciones';
  constructor(private http: HttpClient) { }

  /**
   * Obtiene las publicaciones con filtros opcionales.
   * @param idEvento (Opcional) ID del evento para filtrar.
   * @param listaIntereses (Opcional) Array de IDs de intereses para filtrar.
   */
// En service/publicacion.ts

  obtenerPublicaciones(
      idEvento?: number, 
      intereses?: number[], 
      busqueda?: string // <--- Nuevo parámetro opcional
  ): Observable<PublicacionInterface[]> {

      let params = new HttpParams();

      if (idEvento) params = params.set('idEvento', idEvento);
      
      if (intereses && intereses.length > 0) {
          intereses.forEach(id => params = params.append('idInteres', id));
      }

      // Agregamos la búsqueda si existe
      if (busqueda) params = params.set('busqueda', busqueda);

      return this.http.get<PublicacionInterface[]>(this.baseUrl, { params });
  }
}
