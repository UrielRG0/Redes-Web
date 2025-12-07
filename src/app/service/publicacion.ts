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
  obtenerPublicaciones(idEvento?: number, listaIntereses?: number[], idUsuario?: number): Observable<PublicacionInterface[]> {
    
    let params = new HttpParams();

    // 1. Filtro por Evento (Valor único -> usamos set)
    if (idEvento) {
      params = params.set('idEvento', idEvento.toString());
    }

    // 2. Filtro por Intereses (Lista -> usamos append en bucle)
    // Esto genera una URL tipo: ...?idInteres=1&idInteres=5&idInteres=8
    if (listaIntereses && listaIntereses.length > 0) {
      listaIntereses.forEach(id => {
        params = params.append('idInteres', id.toString());
      });
    }
    // --- NUEVO: Filtro por Usuario ---
    if (idUsuario) {
      params = params.set('idUsuario', idUsuario.toString());
    }
    return this.http.get<PublicacionInterface[]>(this.baseUrl, { params });
  }
}
