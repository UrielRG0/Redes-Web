import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Catalogo {
  private API_URL = 'https://172.25.124.29:8443/socialNetUAA/api/catalogos';

  constructor(private http: HttpClient) {}

  obtenerIntereses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/intereses`);
  }
}